/**
 * Opens an existing Claude Code session that already has scripts generated.
 * Copies each script one by one to TestRigor — no prompt, no generation.
 *
 * Set SESSION_URL in .env to the Claude Code session URL.
 * Run: npx playwright test tests/testrigor-copy-only.spec.js --headed
 */

import { test } from '@playwright/test';
import 'dotenv/config';

import { getBrowserContext, copyScriptAt } from '../utils/claudeAutomation.js';
import { runScriptArray } from '../utils/testrigorAutomation.js';
import { logger } from '../utils/logger.js';
import { takeScreenshot } from '../utils/helpers.js';

const COPY_BTN_SEL = [
  'button[aria-label="Copy"]',
  'button[aria-label="Copy code"]',
  'button:has-text("Copy code")',
  '[data-testid="copy-code-button"]',
].join(', ');

test('Copy scripts from existing Claude session → TestRigor', async () => {
  const sessionUrl = process.env.SESSION_URL;
  if (!sessionUrl) throw new Error('SESSION_URL not set in .env');

  const context = await getBrowserContext();
  const page = await context.newPage();

  // ── Open the existing session ─────────────────────────────────────────────
  logger.info(`Opening session: ${sessionUrl}`);
  await page.goto(sessionUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForTimeout(5000);

  // ── Scroll all the way down to load all code blocks ───────────────────────
  logger.info('Scrolling to load all content…');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);

  // ── Count copy buttons ────────────────────────────────────────────────────
  let total = await page.locator(COPY_BTN_SEL).count();
  logger.info(`Found ${total} copy buttons`);
  await takeScreenshot(page, 'claude-session-loaded');

  if (total === 0) {
    logger.warn('No copy buttons found on this session.');
    logger.warn('The session may have expired. Open the session manually in the browser,');
    logger.warn('then update SESSION_URL in .env and run again.');
    return;
  }

  // ── Collect all scripts ───────────────────────────────────────────────────
  logger.info(`Collecting ${total} scripts…`);
  const scripts = [];

  for (let i = 0; i < total; i++) {
    const btn = page.locator(COPY_BTN_SEL).nth(i);
    await btn.click();
    await page.waitForTimeout(600);
    const text = await page.evaluate(async () => navigator.clipboard.readText());
    if (text && text.trim().length > 10) {
      scripts.push(text.trim());
      logger.info(`Script ${scripts.length} copied (${text.split('\n').length} lines)`);
    }
  }

  logger.success(`Collected ${scripts.length} scripts — now going to TestRigor`);

  if (scripts.length === 0) {
    logger.warn('Scripts found but clipboard was empty — clipboard permission may be blocked');
    return;
  }

  // ── Run all in TestRigor ──────────────────────────────────────────────────
  await runScriptArray(scripts);
});