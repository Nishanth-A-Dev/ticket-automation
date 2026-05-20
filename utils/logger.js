import { createWriteStream, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const logsDir = join(__dirname, '..', 'logs');

mkdirSync(logsDir, { recursive: true });

const logFile = createWriteStream(
  join(logsDir, `run-${new Date().toISOString().replace(/[:.]/g, '-')}.log`),
  { flags: 'a' }
);

const LEVELS = { INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR', SUCCESS: '✓ OK' };

function write(level, message) {
  const ts = new Date().toISOString();
  const line = `[${ts}] [${level}] ${message}`;
  console.log(line);
  logFile.write(line + '\n');
}

export const logger = {
  info: (msg) => write(LEVELS.INFO, msg),
  warn: (msg) => write(LEVELS.WARN, msg),
  error: (msg) => write(LEVELS.ERROR, msg),
  success: (msg) => write(LEVELS.SUCCESS, msg),
};
