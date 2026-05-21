import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';
import { logger } from './logger.js';
import { takeScreenshot } from './helpers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Use regular Claude chat — does NOT clone repo, does NOT use Claude Code quota
const CLAUDE_URL  = process.env.CLAUDE_URL || 'https://claude.ai/new';
const PROFILE_DIR = join(__dirname, '..', '..', '.browser-profile', 'claude');

const SEL = {
  // Regular Claude chat uses a contenteditable div
  inputBox: [
    'div[contenteditable="true"].ProseMirror',
    'div[contenteditable="true"][data-placeholder]',
    'div[contenteditable="true"]',
  ].join(', '),
  // Send button — enabled when typing, disabled/hidden while Claude is responding
  sendButton:  'button[aria-label="Send Message"], button[aria-label="Send message"], button[data-testid="send-button"]',
  // Stop button appears while Claude is generating
  stopButton:  'button[aria-label="Stop"], button[aria-label="Stop response"], button[data-testid="stop-button"]',
  cookieAccept:'button:has-text("Accept All Cookies"), button:has-text("Accept all")',
  copyButton:  [
    'button[aria-label="Copy"]',
    'button[aria-label="Copy code"]',
    'button[data-testid="copy-code-button"]',
    // Claude Code: small copy icon button inside each code block
    'pre button',
    '[class*="codeBlock"] button',
    '[class*="code-block"] button',
  ].join(', '),
};

// ── Browser launched ONCE — never closed ─────────────────────────────────────
let _context = null;

export async function getBrowserContext() {
  if (_context) return _context;

  mkdirSync(PROFILE_DIR, { recursive: true });
  logger.info('Launching browser…');

  _context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chrome',
    headless: false,
    viewport: null,
    slowMo: 200,
    permissions: ['clipboard-read', 'clipboard-write'],
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-session-crashed-bubble',
      '--disable-infobars',
    ],
  });

  await _context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  logger.success('Browser launched');
  return _context;
}

// ── Open Claude Code tab — stays open forever ─────────────────────────────────
export async function openClaudeTab() {
  const context = await getBrowserContext();
  const page = await context.newPage();

  logger.info('Opening Claude Code…');
  await page.goto(CLAUDE_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForTimeout(3000);

  // ── Wait indefinitely for login if needed ────────────────────────────────────
  // NO timeout — browser stays open as long as login takes
  if (page.url().includes('/login') || page.url().includes('from=logout')) {
    logger.warn('═══════════════════════════════════════════════════');
    logger.warn('  LOGIN REQUIRED — log in manually in the browser');
    logger.warn('  Waiting forever — browser will NOT close');
    logger.warn('═══════════════════════════════════════════════════');

    // Wait with NO timeout (0 = infinite in Playwright)
    await page.waitForFunction(
      () => !location.href.includes('/login') && !location.href.includes('from=logout'),
      { timeout: 0 }
    );

    logger.success('Login detected — session saved permanently to profile');
    await page.waitForTimeout(3000);

    // Navigate to Claude Code after login
    await page.goto(CLAUDE_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForTimeout(3000);
  }

  // Cookie popup
  try {
    await page.locator(SEL.cookieAccept).first().click({ timeout: 4_000 });
    logger.info('Cookie popup dismissed');
  } catch { /* no popup */ }

  // ── Wait indefinitely for input box ─────────────────────────────────────────
  // If git repo not connected yet, user connects it — we wait forever
  logger.info('Waiting for Claude Code input box (connect git repo if prompted)…');
  await page.waitForSelector(SEL.inputBox, { state: 'visible', timeout: 0 });
  logger.success('Claude Code ready');

  return page;
}

// ── Paste prompt and wait for ALL scripts to finish ───────────────────────────
export async function pasteAndWait(page, promptFile = 'playwrightPrompt.txt') {
  const promptPath = join(__dirname, '..', 'prompts', promptFile);
  const promptText = readFileSync(promptPath, 'utf-8').trim();
  logger.info(`Pasting prompt (${promptText.length} chars)…`);

  const input = page.locator(SEL.inputBox).first();
  await input.click();
  await page.evaluate(async (t) => navigator.clipboard.writeText(t), promptText);
  await page.keyboard.press('Control+v');
  await page.waitForTimeout(1000);
  await takeScreenshot(page, 'prompt-entered');

  // Submit
  try {
    await page.locator(SEL.sendButton).first().click({ timeout: 5_000 });
    logger.info('Submitted via send button');
  } catch {
    await page.keyboard.press('Enter');
    logger.info('Submitted via Enter');
  }

  logger.info('Prompt submitted — waiting for Claude to generate all scripts…');

  // Wait 30s for Claude to start writing
  await page.waitForTimeout(30_000);

  // ── Wait for copy buttons to appear (= scripts written) ─────────────────────
  // Works for both claude.ai/new and claude.ai/code
  // timeout: 0 = wait forever, browser never closes
  logger.info('Waiting for first copy button to appear…');
  await page.waitForSelector(SEL.copyButton, { state: 'visible', timeout: 0 });
  logger.info('Scripts started appearing…');

  // Now wait until copy button count stops increasing (all scripts written)
  logger.info('Waiting for all scripts to finish…');
  let lastCount = 0;
  let stableCount = 0;
  for (let i = 0; i < 300; i++) {
    await page.waitForTimeout(8000);
    const count = await page.locator(SEL.copyButton).count();
    if (count === lastCount && count > 0) {
      stableCount++;
      logger.info(`Copy buttons stable: ${count} (check ${stableCount}/4)`);
      if (stableCount >= 4) break;
    } else {
      stableCount = 0;
      lastCount = count;
      logger.info(`Copy buttons: ${count} (still writing…)`);
    }
  }

  // Extra buffer for final render
  await page.waitForTimeout(5000);

  logger.success('Claude finished generating all scripts');
  await takeScreenshot(page, 'scripts-done');
}

// ── Get title text for the Nth script ────────────────────────────────────────
// Claude Code format: "TC-001 — Title text" as heading above each code block
export async function getScriptTitle(page, index) {
  await page.bringToFront();
  const title = await page.evaluate((idx) => {
    const candidates = Array.from(
      document.querySelectorAll('h1, h2, h3, h4, strong, b, p, [class*="heading"], [class*="title"]')
    );

    const titles = candidates
      .map(el => el.innerText?.trim())
      .filter(t => t && t.length > 3 && (
        /^TC-\d+/i.test(t) ||
        /^\d+[a-z]?\s*[—\-]/i.test(t) ||
        /^Script\s+\d+/i.test(t)
      ));

    return titles[idx] || null;
  }, index);

  return title || `Script_${index + 1}_bug-bash-day3`;
}

// ── Copy the Nth script code from Claude tab ──────────────────────────────────
export async function copyScriptAt(page, index) {
  await page.bringToFront();
  const btns = page.locator(SEL.copyButton);
  const count = await btns.count();
  if (index >= count) return null;

  await btns.nth(index).click();
  await page.waitForTimeout(600);
  const text = await page.evaluate(async () => navigator.clipboard.readText());
  if (text && text.trim().length > 10) {
    logger.info(`Script ${index + 1} copied (${text.split('\n').length} lines)`);
    return text.trim();
  }
  return null;
}

// ── Count copy buttons = number of scripts ────────────────────────────────────
export async function countScripts(page) {
  await page.bringToFront();
  // Scroll to bottom so all lazy-loaded content is visible
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  // Scroll back to top for copy button iteration
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  const count = await page.locator(SEL.copyButton).count();
  logger.info(`Total scripts available: ${count}`);
  return count;
}

// ── Full Claude flow: open tab → paste → wait → return page ──────────────────
export async function runClaudeFlow(promptFile = 'playwrightPrompt.txt') {
  const claudePage = await openClaudeTab();
  await pasteAndWait(claudePage, promptFile);
  return claudePage;
}
