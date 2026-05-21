import { logger } from './logger.js';
import { takeScreenshot } from './helpers.js';

import {
  getBrowserContext,
  copyScriptAt,
  countScripts,
  getScriptTitle
} from './claudeAutomation.js';

const TESTRIGOR_URL =
  process.env.TESTRIGOR_URL ||
  'https://app.testrigor.com/test-suites/W7WigX2qz5vbrBJ2Y/test-cases';

const SEL = {
  newTestCaseBtn:
    'button:has-text("Add Test Case"), button:has-text("+ Add Test Case")',

  descriptionInput:
    '#newHookDescription',

  codeMirror:
    '.CodeMirror',

  addAndRunBtn:
    'button:has-text("Add and Run")',

  cookieAccept:
    'button:has-text("Accept"), button:has-text("OK")',
};

let _testrigorPage = null;

// ─────────────────────────────────────────────
// OPEN TESTRIGOR TAB ONLY ONCE
// ─────────────────────────────────────────────
async function getTestRigorPage() {

  if (
    _testrigorPage &&
    !_testrigorPage.isClosed()
  ) {
    return _testrigorPage;
  }

  const context =
    await getBrowserContext();

  logger.info(
    'Opening TestRigor...'
  );

  _testrigorPage =
    await context.newPage();

  await _testrigorPage.goto(
    TESTRIGOR_URL,
    {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    }
  );

  await _testrigorPage.waitForTimeout(3000);

  // ── Wait for login if needed (session saved to profile after first login) ──
  const url = _testrigorPage.url();
  if (url.includes('/login') || url.includes('/signin') || url.includes('auth')) {
    logger.warn('═══════════════════════════════════════════════════');
    logger.warn('  TESTRIGOR LOGIN REQUIRED — log in manually');
    logger.warn('  Waiting forever — browser will NOT close');
    logger.warn('═══════════════════════════════════════════════════');
    await _testrigorPage.waitForFunction(
      () => !location.href.includes('/login') && !location.href.includes('/signin') && !location.href.includes('auth'),
      { timeout: 0 }
    );
    logger.success('TestRigor login detected — session saved to profile');
    await _testrigorPage.waitForTimeout(3000);
    await _testrigorPage.goto(TESTRIGOR_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await _testrigorPage.waitForTimeout(3000);
  }

  try {
    await _testrigorPage.locator(SEL.cookieAccept).first().click({ timeout: 4000 });
  } catch {}

  logger.success('TestRigor opened');
  return _testrigorPage;
}

// ─────────────────────────────────────────────
// CREATE + RUN SINGLE TEST CASE (UPDATED)
// ─────────────────────────────────────────────
async function createAndRun(
  trPage,
  claudePage,
  index
) {
  logger.info(`Processing sequence ${index + 1}`);

  // --- Get title AND script from Claude FIRST (stay on Claude) ---
  const description = await getScriptTitle(claudePage, index);
  logger.info(`TITLE: ${description}`);

  const scriptContent = await copyScriptAt(claudePage, index);
  if (!scriptContent) {
    logger.warn(`Script ${index + 1} is empty`);
    return;
  }
  logger.info(`LINES: ${scriptContent.split('\n').length}`);

  // --- Switch to TestRigor ONCE ---
  await trPage.bringToFront();
  try { await trPage.keyboard.press('Escape'); } catch {}

  const addBtn = trPage.locator(SEL.newTestCaseBtn).first();
  await addBtn.waitFor({ state: 'visible', timeout: 10000 });
  await addBtn.click();
  await trPage.waitForTimeout(2000);

  // STEP 1: Fill description box
  const descInput = trPage.locator(SEL.descriptionInput);
  await descInput.waitFor({ state: 'attached' });
  await trPage.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) { el.click(); el.focus(); }
  }, SEL.descriptionInput);
  await trPage.keyboard.press('Control+a');
  await trPage.keyboard.press('Delete');
  await trPage.keyboard.type(description || `Script ${index + 1}`, { delay: 20 });
  logger.success('Description filled');

  // STEP 2: Click the CodeMirror editor using actual screen coordinates, then paste
  await trPage.waitForTimeout(500);
  await trPage.evaluate(async (code) => navigator.clipboard.writeText(code), scriptContent);

  // Get the editor's actual screen position — find the cm-content with non-zero size (visible one)
  const editorRect = await trPage.evaluate(() => {
    // Try all cm-content elements, pick the one with a visible bounding rect
    const all = Array.from(document.querySelectorAll('.cm-content'));
    for (const editor of all) {
      const rect = editor.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, w: rect.width, h: rect.height };
      }
    }
    return null;
  });

  logger.info(`Editor screen coords: ${JSON.stringify(editorRect)}`);

  if (editorRect && editorRect.w > 0) {
    await trPage.mouse.click(editorRect.x, editorRect.y);
  } else {
    logger.warn('No visible editor found, using Tab fallback');
    await trPage.keyboard.press('Tab');
  }

  await trPage.waitForTimeout(400);
  await trPage.keyboard.press('Control+a');
  await trPage.waitForTimeout(200);
  await trPage.keyboard.press('Control+v');
  await trPage.waitForTimeout(600);

  logger.success('Script pasted into Box 2');

  // --- STEP 3: log values for debugging ---
  const currentDesc = await descInput.inputValue();
  const currentScript = await trPage.evaluate(() => {
    const all = Array.from(document.querySelectorAll('.cm-content'));
    for (const ed of all) {
      const rect = ed.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) return ed.textContent || '';
    }
    return '';
  });

  logger.info(`DESC value: "${currentDesc.substring(0, 50)}" (${currentDesc.length} chars)`);
  logger.info(`SCRIPT value: "${currentScript.substring(0, 80)}" (${currentScript.length} chars)`);

  await takeScreenshot(trPage, `ready-to-run-${index + 1}`);

  const runBtn = trPage.locator(SEL.addAndRunBtn).first();
  await runBtn.click();

  logger.success(`DONE: Script ${index + 1} submitted and running.`);

  // Wait for modal to close and page to fully settle before next script
  await trPage.waitForTimeout(6000);

  // Ensure the "Add Test Case" button is visible again (page settled)
  try {
    await trPage.locator(SEL.newTestCaseBtn).first().waitFor({ state: 'visible', timeout: 15000 });
  } catch {}

  await takeScreenshot(
    trPage,
    `script-${index + 1}-running`
  );
}

// ─────────────────────────────────────────────
// MAIN LOOP
// ─────────────────────────────────────────────
export async function runAllScriptsInTestRigor(
  claudePage
) {

  const total =
    await countScripts(
      claudePage
    );

  if (total === 0) {

    logger.warn(
      'No scripts found'
    );

    return;
  }

  logger.info(
    `TOTAL SCRIPTS: ${total}`
  );

  const trPage =
    await getTestRigorPage();

  for (
    let i = 0;
    i < total;
    i++
  ) {

    logger.info(`
═══════════════════════════════
SCRIPT ${i + 1} / ${total}
═══════════════════════════════
`);

    try {

      await createAndRun(
        trPage,
        claudePage,
        i
      );

    } catch (err) {

      logger.error(
        `Script ${
          i + 1
        } failed: ${
          err.message
        }`
      );

      try {

        await trPage.keyboard.press(
          'Escape'
        );

        await trPage.waitForTimeout(
          1000
        );

      } catch {}

      continue;
    }
  }

  logger.success(
    'ALL SCRIPTS COMPLETED'
  );
}
