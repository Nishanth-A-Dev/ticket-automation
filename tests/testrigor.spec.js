import { test } from '@playwright/test';
import 'dotenv/config';

import { getBrowserContext, runClaudeFlow, countScripts } from '../utils/claudeAutomation.js';
import { runAllScriptsInTestRigor } from '../utils/testrigorAutomation.js';
import { logger } from '../utils/logger.js';

test('Claude → TestRigor: full end-to-end', async () => {
  // ── OPEN_NEW_CLAUDE=false → use existing session (scripts already there)
  // ── OPEN_NEW_CLAUDE=true  → open new Claude, paste prompt, wait
  const openNew = process.env.OPEN_NEW_CLAUDE !== 'false';

  let claudePage;

  if (!openNew) {
    // ── Use existing Claude tab ───────────────────────────────────────────
    const sessionUrl = process.env.SESSION_URL;
    if (!sessionUrl) throw new Error('SESSION_URL not set in .env');

    logger.info(`OPEN_NEW_CLAUDE=false → Opening existing session: ${sessionUrl}`);
    const context = await getBrowserContext();
    claudePage = await context.newPage();
    await claudePage.goto(sessionUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await claudePage.waitForTimeout(4000);

    // Scroll to load all code blocks
    await claudePage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await claudePage.waitForTimeout(1500);
    await claudePage.evaluate(() => window.scrollTo(0, 0));
    await claudePage.waitForTimeout(500);

    const total = await countScripts(claudePage);
    logger.info(`Found ${total} scripts in existing session`);
    if (total === 0) throw new Error('No scripts found — check SESSION_URL or scroll the page manually');

  } else {
    // ── Open new Claude, paste prompt, wait for all scripts ───────────────
    logger.info('OPEN_NEW_CLAUDE=true → Opening new Claude and pasting prompt');
    claudePage = await runClaudeFlow('playwrightPrompt.txt');
  }

  // ── Copy each script → TestRigor → Add and Run ───────────────────────────
  logger.info('Starting TestRigor loop…');
  await runAllScriptsInTestRigor(claudePage);

  logger.success('All done!');
});