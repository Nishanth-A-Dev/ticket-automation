import { logger } from './logger.js';

/**
 * Read text from the system clipboard via the browser context.
 * Requires clipboard-read permission granted on the browser context.
 */
export async function readClipboard(page) {
  const text = await page.evaluate(async () => {
    return await navigator.clipboard.readText();
  });
  logger.info(`Clipboard read: ${text.slice(0, 80)}${text.length > 80 ? '…' : ''}`);
  return text;
}

/**
 * Write text to the system clipboard via the browser context.
 */
export async function writeClipboard(page, text) {
  await page.evaluate(async (t) => {
    await navigator.clipboard.writeText(t);
  }, text);
  logger.info(`Clipboard written: ${text.slice(0, 80)}${text.length > 80 ? '…' : ''}`);
}

/**
 * Paste clipboard content into a focused element using Ctrl+V.
 */
export async function pasteFromClipboard(page) {
  await page.keyboard.press('Control+v');
  logger.info('Ctrl+V pasted clipboard content');
}

/**
 * Select all text in the focused element and copy to clipboard.
 */
export async function copyAllFromElement(page) {
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Control+c');
  logger.info('Ctrl+A → Ctrl+C copied element content');
}
