const LEVELS = { INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR', SUCCESS: '✓ OK' };

function write(level, message) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [${level}] ${message}`);
}

export const logger = {
  info: (msg) => write(LEVELS.INFO, msg),
  warn: (msg) => write(LEVELS.WARN, msg),
  error: (msg) => write(LEVELS.ERROR, msg),
  success: (msg) => write(LEVELS.SUCCESS, msg),
};
