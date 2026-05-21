import express from 'express';
import { spawn, execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(express.json());

// ── Serve React build if it exists ───────────────────────────────────────────
const distPath = join(__dirname, 'ui', 'dist');
console.log('distPath:', distPath);
if (existsSync(distPath)) {
  app.use(express.static(distPath));
}

// ── Read/write .env helpers ──────────────────────────────────────────────────
function readEnv() {
  const path = join(__dirname, '.env');
  if (!existsSync(path)) return {};
  const lines = readFileSync(path, 'utf-8').split('\n');
  const env = {};
  for (const line of lines) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) env[key.trim()] = rest.join('=').trim();
  }
  return env;
}

function writeEnv(updates) {
  const env = readEnv();
  Object.assign(env, updates);
  const content = Object.entries(env).map(([k, v]) => `${k}=${v}`).join('\n');
  writeFileSync(join(__dirname, '.env'), content);
}


// ── Get .env ─────────────────────────────────────────────────────────────────
app.get('/env', (req, res) => res.json(readEnv()));

// ── Save .env ────────────────────────────────────────────────────────────────
app.post('/save-env', (req, res) => {
  writeEnv(req.body);
  res.json({ ok: true });
});

// ── SSE stream for running the test ─────────────────────────────────────────
let runningProcess = null;

app.get('/run-stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  const proc = spawn('npx', ['playwright', 'test', '--config=automation/playwright.config.js', '--timeout=600000'], {
    cwd: __dirname,
    shell: true,
    env: { ...process.env }
  });

  runningProcess = proc;

  // After 4s, bring the automation Chrome window to front (Windows focus steal)
  setTimeout(() => {
    try {
      execSync(`powershell -Command "
        Add-Type @'
using System;
using System.Runtime.InteropServices;
public class WinFocus {
  [DllImport(\\"user32.dll\\")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport(\\"user32.dll\\")] public static extern bool ShowWindow(IntPtr h, int n);
}
'@
$chrome = Get-Process chrome -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Sort-Object StartTime -Descending | Select-Object -First 1
if ($chrome) {
  [WinFocus]::ShowWindow($chrome.MainWindowHandle, 9)
  [WinFocus]::SetForegroundWindow($chrome.MainWindowHandle)
}
"`, { stdio: 'ignore' });
    } catch {}
  }, 4000);

  proc.stdout.on('data', (chunk) => {
    chunk.toString().split('\n').filter(Boolean).forEach(line => send({ type: 'log', line }));
  });

  proc.stderr.on('data', (chunk) => {
    chunk.toString().split('\n').filter(Boolean).forEach(line => send({ type: 'log', line }));
  });

  proc.on('close', (code) => {
    runningProcess = null;
    send({ type: code === 0 ? 'done' : 'error', code });
    res.end();
  });

  req.on('close', () => killAll());
});

// ── Stop ─────────────────────────────────────────────────────────────────────
function killAll() {
  // Kill the node/playwright process tree
  if (runningProcess) {
    try { execSync(`taskkill /F /T /PID ${runningProcess.pid}`, { stdio: 'ignore' }); } catch {}
    runningProcess = null;
  }
  // Kill Chrome using the automation profile (won't affect user's normal Chrome)
  try {
    execSync(`wmic process where "CommandLine like '%browser-profile%claude%'" delete`, { stdio: 'ignore' });
  } catch {}
  // Also remove the SingletonLock so next run can start cleanly
  try {
    execSync(`del /F /Q "${__dirname}\\.browser-profile\\claude\\SingletonLock"`, { stdio: 'ignore', shell: true });
  } catch {}
}

app.post('/stop', (req, res) => {
  killAll();
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`\n✅ UI ready → open http://localhost:${PORT} in your browser\n`);
});
