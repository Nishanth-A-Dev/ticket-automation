import { useState, useEffect, useRef } from 'react';
import './App.css';

export default function App() {
  const [openNew, setOpenNew] = useState(false);
  const [sessionUrl, setSessionUrl] = useState('');
  const [testrigorUrl, setTestrigorUrl] = useState('');
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | running | done | failed
  const [logs, setLogs] = useState([]);
  const [scripts, setScripts] = useState([]); // [{n, state}] state: pending|running|done|failed
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const logBoxRef = useRef(null);
  const evtRef = useRef(null);

  // Load saved env on mount
  useEffect(() => {
    fetch('/env')
      .then(r => r.json())
      .then(env => {
        if (env.SESSION_URL) setSessionUrl(env.SESSION_URL);
        if (env.TESTRIGOR_URL) setTestrigorUrl(env.TESTRIGOR_URL);
        if (env.OPEN_NEW_CLAUDE === 'true') setOpenNew(true);
      })
      .catch(() => {});
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs]);

  function initGrid(total) {
    setScripts(Array.from({ length: total }, (_, i) => ({ n: i + 1, state: 'pending' })));
    setProgress({ current: 0, total });
  }

  function setDot(n, state) {
    setScripts(prev => prev.map(s => s.n === n ? { ...s, state } : s));
  }

  function appendLog(line) {
    setLogs(prev => [...prev, line]);
  }

  function handleLine(line) {
    appendLog(line);

    // Detect total scripts
    const totalMatch = line.match(/TOTAL SCRIPTS: (\d+)/);
    if (totalMatch) {
      initGrid(parseInt(totalMatch[1]));
    }

    // Detect script start
    const scriptMatch = line.match(/SCRIPT (\d+) \//);
    if (scriptMatch) {
      const n = parseInt(scriptMatch[1]);
      if (n > 1) setDot(n - 1, 'done');
      setDot(n, 'running');
      setProgress(prev => ({ ...prev, current: n - 1 }));
    }

    // Script done
    if (line.includes('submitted and running')) {
      const m = line.match(/Script (\d+) submitted/);
      if (m) {
        const n = parseInt(m[1]);
        setDot(n, 'done');
        setProgress(prev => ({ ...prev, current: n }));
      }
    }

    // Script failed
    const failMatch = line.match(/Script (\d+) failed/);
    if (failMatch) setDot(parseInt(failMatch[1]), 'failed');
  }

  async function startRun() {
    if (!openNew && !sessionUrl.trim()) {
      alert('Please enter Claude Session URL');
      return;
    }

    await fetch('/save-env', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        SESSION_URL: sessionUrl,
        TESTRIGOR_URL: testrigorUrl,
        OPEN_NEW_CLAUDE: openNew ? 'true' : 'false',
      }),
    });

    setRunning(true);
    setStatus('running');
    setLogs([]);
    setScripts([]);
    setProgress({ current: 0, total: 0 });

    const es = new EventSource('/run-stream');
    evtRef.current = es;

    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'log') handleLine(data.line);
      if (data.type === 'done') {
        setScripts(prev => prev.map(s => ({ ...s, state: 'done' })));
        setProgress(prev => ({ ...prev, current: prev.total }));
        setStatus('done');
        setRunning(false);
        es.close();
      }
      if (data.type === 'error') {
        setStatus('failed');
        setRunning(false);
        es.close();
      }
    };

    es.onerror = () => {
      setStatus('failed');
      setRunning(false);
      es.close();
    };
  }

  async function stopRun() {
    await fetch('/stop', { method: 'POST' });
    if (evtRef.current) evtRef.current.close();
    setStatus('idle');
    setRunning(false);
  }

  const statusMap = {
    idle: { cls: 'badge-idle', label: 'Idle' },
    running: { cls: 'badge-running', label: 'Running...' },
    done: { cls: 'badge-done', label: 'All Done!' },
    failed: { cls: 'badge-failed', label: 'Failed' },
  };
  const { cls: badgeCls, label: badgeLabel } = statusMap[status];

  const pct = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div className="app">
      <header className="header">
        <span className="header-icon">🤖</span>
        <h1>Claude → TestRigor Automation</h1>
      </header>

      <div className="container">

        {/* Settings card */}
        <div className="card">
          <h2 className="card-title">⚙️ Settings</h2>

          {/* Mode toggle */}
          <div className="toggle-row">
            <button
              className={`toggle-btn${!openNew ? ' active' : ''}`}
              onClick={() => setOpenNew(false)}
            >
              📂 Use Existing Session
              <small>Open old Claude tab and copy scripts</small>
            </button>
            <button
              className={`toggle-btn${openNew ? ' active' : ''}`}
              onClick={() => setOpenNew(true)}
            >
              ✨ Open New Claude
              <small>Send prompt, wait for response, copy scripts</small>
            </button>
          </div>

          {/* Session URL — only when using existing */}
          {!openNew && (
            <div className="field">
              <label>Claude Session URL</label>
              <input
                type="text"
                value={sessionUrl}
                onChange={e => setSessionUrl(e.target.value)}
                placeholder="https://claude.ai/code/session_..."
              />
            </div>
          )}

          {/* TestRigor URL */}
          <div className="field" style={{ marginTop: 12 }}>
            <label>TestRigor URL</label>
            <input
              type="text"
              value={testrigorUrl}
              onChange={e => setTestrigorUrl(e.target.value)}
              placeholder="https://app.testrigor.com/..."
            />
          </div>

          <div className="actions">
            <button className="btn btn-primary" onClick={startRun} disabled={running}>
              ▶ Run All Scripts
            </button>
            {running && (
              <button className="btn btn-stop" onClick={stopRun}>
                ⏹ Stop
              </button>
            )}
          </div>
        </div>

        {/* Progress card */}
        <div className="card">
          <div className="top-row">
            <h2 className="card-title">📊 Progress</h2>
            <span className={`badge ${badgeCls}`}>● {badgeLabel}</span>
          </div>

          {progress.total > 0 && (
            <>
              <div className="progress-label">Script {progress.current} / {progress.total}</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: pct + '%' }} />
              </div>
            </>
          )}

          {scripts.length > 0 && (
            <div className="scripts-grid">
              {scripts.map(({ n, state }) => (
                <div key={n} className={`script-dot dot-${state}`}>{n}</div>
              ))}
            </div>
          )}
        </div>

        {/* Logs card */}
        <div className="card">
          <div className="top-row">
            <h2 className="card-title">📋 Live Output</h2>
            <button className="btn btn-clear" onClick={() => setLogs([])}>Clear</button>
          </div>
          <div className="log-box" ref={logBoxRef}>
            {logs.map((line, i) => {
              let cls = '';
              if (line.includes('[✓ OK]')) cls = 'ok';
              else if (line.includes('[ERROR]')) cls = 'err';
              else if (line.includes('[WARN]')) cls = 'warn';
              else if (line.includes('[INFO]')) cls = 'info';
              return <div key={i} className={cls}>{line}</div>;
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
