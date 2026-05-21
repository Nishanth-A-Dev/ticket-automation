import express from 'express';
import { spawn, execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(express.json());

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

// ── Main HTML page ───────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  const env = readEnv();
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Claude → TestRigor</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f2f5; min-height: 100vh; }
    .header { background: #1a1a2e; color: white; padding: 20px 32px; display: flex; align-items: center; gap: 12px; }
    .header h1 { font-size: 20px; font-weight: 600; }
    .header span { font-size: 22px; }
    .container { max-width: 860px; margin: 32px auto; padding: 0 16px; }
    .card { background: white; border-radius: 12px; padding: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 20px; }
    .card h2 { font-size: 15px; font-weight: 600; color: #555; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 20px; }
    label { display: block; font-size: 14px; font-weight: 500; color: #333; margin-bottom: 6px; }
    input[type="text"] { width: 100%; padding: 10px 14px; border: 1.5px solid #ddd; border-radius: 8px; font-size: 14px; outline: none; transition: border 0.2s; }
    input[type="text"]:focus { border-color: #6c63ff; }
    .row { display: flex; gap: 12px; margin-bottom: 16px; }
    .row .field { flex: 1; }
    .btn { padding: 11px 24px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-primary { background: #6c63ff; color: white; }
    .btn-primary:hover { background: #5a52d5; }
    .btn-primary:disabled { background: #b0aee8; cursor: not-allowed; }
    .btn-stop { background: #ff4d4f; color: white; display: none; }
    .btn-stop:hover { background: #d9363e; }
    .actions { display: flex; gap: 12px; margin-top: 8px; }
    .progress-wrap { margin-top: 8px; display: none; }
    .progress-label { font-size: 13px; color: #666; margin-bottom: 6px; }
    .progress-bar { height: 10px; background: #eee; border-radius: 99px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #6c63ff, #a78bfa); border-radius: 99px; width: 0%; transition: width 0.4s ease; }
    .scripts-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px; margin-top: 10px; }
    .script-dot { width: 100%; aspect-ratio: 1; border-radius: 6px; background: #eee; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: #999; }
    .script-dot.running { background: #fff3cd; color: #856404; animation: pulse 1s infinite; }
    .script-dot.done { background: #d4edda; color: #155724; }
    .script-dot.failed { background: #f8d7da; color: #721c24; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
    .log-box { background: #0d1117; color: #c9d1d9; border-radius: 10px; padding: 16px; font-family: 'Courier New', monospace; font-size: 12.5px; height: 340px; overflow-y: auto; line-height: 1.6; }
    .log-box .ok { color: #3fb950; }
    .log-box .err { color: #f85149; }
    .log-box .warn { color: #d29922; }
    .log-box .info { color: #79c0ff; }
    .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 600; }
    .status-idle { background: #eee; color: #666; }
    .status-running { background: #e8f4fd; color: #0969da; }
    .status-done { background: #d4edda; color: #155724; }
    .status-failed { background: #f8d7da; color: #721c24; }
    .top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <span>🤖</span>
    <h1>Claude → TestRigor Automation</h1>
  </div>

  <div class="container">
    <!-- Settings -->
    <div class="card">
      <h2>⚙️ Settings</h2>
      <div class="row">
        <div class="field">
          <label>Claude Session URL</label>
          <input type="text" id="sessionUrl" placeholder="https://claude.ai/code/session_..." value="${env.SESSION_URL || ''}" />
        </div>
      </div>
      <div class="row">
        <div class="field">
          <label>TestRigor URL</label>
          <input type="text" id="testrigorUrl" placeholder="https://app.testrigor.com/..." value="${env.TESTRIGOR_URL || ''}" />
        </div>
      </div>
      <div class="actions">
        <button class="btn btn-primary" id="runBtn" onclick="startRun()">▶ Run All Scripts</button>
        <button class="btn btn-stop" id="stopBtn" onclick="stopRun()">⏹ Stop</button>
      </div>
    </div>

    <!-- Progress -->
    <div class="card">
      <div class="top-row">
        <h2>📊 Progress</h2>
        <span class="status-badge status-idle" id="statusBadge">● Idle</span>
      </div>
      <div class="progress-wrap" id="progressWrap">
        <div class="progress-label" id="progressLabel">Script 0 / 0</div>
        <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>
      </div>
      <div class="scripts-grid" id="scriptsGrid"></div>
    </div>

    <!-- Live Logs -->
    <div class="card">
      <div class="top-row">
        <h2>📋 Live Output</h2>
        <button class="btn" style="padding:6px 12px;font-size:12px;background:#eee;color:#333;border-radius:6px" onclick="clearLogs()">Clear</button>
      </div>
      <div class="log-box" id="logBox"></div>
    </div>
  </div>

<script>
  let evtSource = null;
  let totalScripts = 0;
  let currentScript = 0;

  function setStatus(type, text) {
    const badge = document.getElementById('statusBadge');
    badge.className = 'status-badge status-' + type;
    badge.textContent = '● ' + text;
  }

  function initGrid(total) {
    totalScripts = total;
    const grid = document.getElementById('scriptsGrid');
    grid.innerHTML = '';
    for (let i = 1; i <= total; i++) {
      const dot = document.createElement('div');
      dot.className = 'script-dot';
      dot.id = 'dot-' + i;
      dot.textContent = i;
      grid.appendChild(dot);
    }
    document.getElementById('progressWrap').style.display = 'block';
    updateProgress(0);
  }

  function updateProgress(n) {
    currentScript = n;
    const pct = totalScripts > 0 ? (n / totalScripts) * 100 : 0;
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressLabel').textContent = 'Script ' + n + ' / ' + totalScripts;
  }

  function setDot(n, state) {
    const dot = document.getElementById('dot-' + n);
    if (dot) dot.className = 'script-dot ' + state;
  }

  function appendLog(line) {
    const box = document.getElementById('logBox');
    const div = document.createElement('div');
    let cls = '';
    if (line.includes('[✓ OK]')) cls = 'ok';
    else if (line.includes('[ERROR]')) cls = 'err';
    else if (line.includes('[WARN]')) cls = 'warn';
    else if (line.includes('[INFO]')) cls = 'info';
    if (cls) div.className = cls;
    div.textContent = line;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  function clearLogs() {
    document.getElementById('logBox').innerHTML = '';
  }

  async function startRun() {
    const sessionUrl = document.getElementById('sessionUrl').value.trim();
    const testrigorUrl = document.getElementById('testrigorUrl').value.trim();
    if (!sessionUrl) { alert('Please enter Claude Session URL'); return; }

    // Save settings
    await fetch('/save-env', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ SESSION_URL: sessionUrl, TESTRIGOR_URL: testrigorUrl, OPEN_NEW_CLAUDE: 'false' })
    });

    document.getElementById('runBtn').disabled = true;
    document.getElementById('stopBtn').style.display = 'inline-flex';
    setStatus('running', 'Running...');
    clearLogs();
    initGrid(16);

    evtSource = new EventSource('/run-stream');

    evtSource.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === 'log') {
        appendLog(data.line);

        // Detect script start
        const scriptMatch = data.line.match(/SCRIPT (\\d+) \\//);
        if (scriptMatch) {
          const n = parseInt(scriptMatch[1]);
          if (n > 1) setDot(n - 1, 'done');
          setDot(n, 'running');
          updateProgress(n - 1);
        }

        // Detect script failed
        const failMatch = data.line.match(/Script (\\d+) failed/);
        if (failMatch) setDot(parseInt(failMatch[1]), 'failed');

        // Detect script done
        if (data.line.includes('submitted and running')) {
          const m = data.line.match(/Script (\\d+) submitted/);
          if (m) { setDot(parseInt(m[1]), 'done'); updateProgress(parseInt(m[1])); }
        }

        // Total scripts
        const totalMatch = data.line.match(/TOTAL SCRIPTS: (\\d+)/);
        if (totalMatch) initGrid(parseInt(totalMatch[1]));
      }

      if (data.type === 'done') {
        setDot(totalScripts, 'done');
        updateProgress(totalScripts);
        setStatus('done', 'All Done!');
        document.getElementById('runBtn').disabled = false;
        document.getElementById('stopBtn').style.display = 'none';
        evtSource.close();
      }

      if (data.type === 'error') {
        setStatus('failed', 'Failed');
        document.getElementById('runBtn').disabled = false;
        document.getElementById('stopBtn').style.display = 'none';
        evtSource.close();
      }
    };

    evtSource.onerror = () => {
      setStatus('failed', 'Connection lost');
      document.getElementById('runBtn').disabled = false;
      document.getElementById('stopBtn').style.display = 'none';
    };
  }

  async function stopRun() {
    await fetch('/stop', { method: 'POST' });
    if (evtSource) evtSource.close();
    setStatus('idle', 'Stopped');
    document.getElementById('runBtn').disabled = false;
    document.getElementById('stopBtn').style.display = 'none';
  }
</script>
</body>
</html>`);
});

// ── Save .env ────────────────────────────────────────────────────────────────
app.post('/save-env', (req, res) => {
  writeEnv({ ...req.body, OPEN_NEW_CLAUDE: 'false' });
  res.json({ ok: true });
});

// ── SSE stream for running the test ─────────────────────────────────────────
let runningProcess = null;

app.get('/run-stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  const proc = spawn('npx', ['playwright', 'test', 'tests/testrigor.spec.js', '--timeout=600000'], {
    cwd: __dirname,
    shell: true,
    env: { ...process.env }
  });

  runningProcess = proc;

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
