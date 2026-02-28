import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [theme, setTheme] = useState<'wiki' | 'command'>('wiki');
  const [viewDepth, setViewDepth] = useState<'summary' | 'live'>('summary');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Mocking the "Live Microscope" stream
    if (viewDepth === 'live') {
      const mockStream = [
        '[2026-02-28 15:45:12] CALL: run_shell_command("mkdir dashboard")',
        '[2026-02-28 15:45:14] STDOUT: Success.',
        '[2026-02-28 15:45:15] CALL: save_memory("Dashboard Preference: Vanilla CSS")',
        '[2026-02-28 15:45:16] MEMORY_WRITE: Committed to Shared Memory.',
        '[2026-02-28 15:45:20] PHASE: Building UI Architecture...'
      ];
      setLogs(mockStream);
    }
  }, [viewDepth]);

  return (
    <div className="dashboard-container" data-theme={theme}>
      <div className="sidebar">
        <h2>Workspace</h2>
        <div className="nav-item">🏛️ Architecture</div>
        <div className="nav-item">📁 Inventory</div>
        <div className="nav-item">🤖 Agents</div>
        <div className="nav-item">🕒 History</div>
      </div>

      <div className="main-content">
        <div className="controls">
          <button onClick={() => setTheme(theme === 'wiki' ? 'command' : 'wiki')}>
            MODE: {theme.toUpperCase()}
          </button>
          <button onClick={() => setViewDepth(viewDepth === 'summary' ? 'live' : 'summary')}>
            DEPTH: {viewDepth.toUpperCase()}
          </button>
        </div>

        {viewDepth === 'summary' ? (
          <div className="wiki-view">
            <h1>Gemini Workspace Architecture</h1>
            <p>Welcome to the Omniscient Mission Control. You are viewing the high-level summary of your environment.</p>
            <h3>Operational Status</h3>
            <ul>
              <li><strong>Controller Agent:</strong> Active</li>
              <li><strong>Sync-Bot:</strong> Running</li>
              <li><strong>Security Layer:</strong> Verified</li>
            </ul>
          </div>
        ) : (
          <div className="live-view">
            <h1>The Microscope (Live Stream)</h1>
            <div className="terminal-view">
              {logs.map((log, i) => (
                <div key={i} className="log-entry">{log}</div>
              ))}
              <div className="cursor">_</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
