import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logger } from './logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const screenshotsDir = join(__dirname, '..', 'screenshots');

mkdirSync(screenshotsDir, { recursive: true });

/**
 * Take a named screenshot and save to /screenshots.
 */
export async function takeScreenshot(page, name) {
  const filename = `${name}-${Date.now()}.png`;
  const filepath = join(screenshotsDir, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  logger.info(`Screenshot saved: screenshots/${filename}`);
  return filepath;
}

/**
 * Wait for a selector with a clear error message on timeout.
 */
export async function waitForSelector(page, selector, timeout = 30_000) {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    return page.locator(selector);
  } catch {
    await takeScreenshot(page, `timeout-${selector.replace(/[^a-z0-9]/gi, '_').slice(0, 40)}`);
    throw new Error(`Selector not found within ${timeout}ms: "${selector}"`);
  }
}

/**
 * Click an element safely — waits for it to be visible first.
 */
export async function safeClick(page, selector, timeout = 30_000) {
  const el = await waitForSelector(page, selector, timeout);
  await el.click();
  logger.info(`Clicked: ${selector}`);
}

/**
 * Type text into a selector, clearing existing content first.
 */
export async function safeFill(page, selector, text, timeout = 30_000) {
  const el = await waitForSelector(page, selector, timeout);
  await el.click({ clickCount: 3 });
  await el.fill(text);
  logger.info(`Filled "${selector}" with text (${text.length} chars)`);
}

/**
 * Wait for navigation to settle (networkidle or load).
 */
export async function waitForPageLoad(page, state = 'networkidle') {
  await page.waitForLoadState(state);
  logger.info(`Page load state reached: ${state}`);
}

/**
 * Retry an async fn up to `times` attempts with a delay between each.
 */
export async function retry(fn, times = 3, delayMs = 2000) {
  for (let attempt = 1; attempt <= times; attempt++) {
    try {
      return await fn();
    } catch (err) {
      logger.warn(`Attempt ${attempt}/${times} failed: ${err.message}`);
      if (attempt === times) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}
