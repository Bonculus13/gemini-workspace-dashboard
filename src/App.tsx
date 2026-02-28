import React, { useState, useEffect } from 'react';
import './App.css';

type Theme = 'wiki' | 'command' | 'blueprint' | 'modern';
type Depth = 'summary' | 'inventory' | 'live' | 'atomic';

const App = () => {
  const [theme, setTheme] = useState<Theme>('wiki');
  const [depth, setDepth] = useState<Depth>('summary');
  const [logs, setLogs] = useState<string[]>([]);
  const [metrics, setMetrics] = useState({ tokens: 42500, cost: 0.12, context: 15 });

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/streams/session.log');
        const text = await response.text();
        setLogs(text.split('\n').filter(l => l.trim()));
      } catch (err) {
        console.error("Microscope Error: ", err);
      }
    };

    if (depth === 'live' || depth === 'atomic') {
      fetchLogs();
      const interval = setInterval(fetchLogs, 2000);
      return () => clearInterval(interval);
    }
  }, [depth]);

  const themes: Theme[] = ['wiki', 'command', 'blueprint', 'modern'];
  const depths: Depth[] = ['summary', 'inventory', 'live', 'atomic'];

  return (
    <div className="dashboard-container" data-theme={theme}>
      <div className="sidebar">
        <h2>Mission Control</h2>
        {depths.map(d => (
          <div 
            key={d} 
            className={`nav-item ${depth === d ? 'active' : ''}`}
            onClick={() => setDepth(d)}
          >
            {d.toUpperCase()}
          </div>
        ))}
        
        <div style={{marginTop: 'auto'}}>
          <h2>Aesthetic</h2>
          <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
            {themes.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      <div className="main-content">
        <div className="resource-monitor">
          <div className="metric">
            <span className="metric-label">Tokens Used</span>
            <span className="metric-value">{metrics.tokens.toLocaleString()}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Context Load</span>
            <span className="metric-value">{metrics.context}%</span>
          </div>
          <div className="metric">
            <span className="metric-label">Session Cost</span>
            <span className="metric-value">${metrics.cost.toFixed(2)}</span>
          </div>
        </div>

        {depth === 'summary' && (
          <div className={`view-layer ${theme === 'modern' ? 'bento-grid' : ''}`}>
            {theme !== 'modern' && <h1>Executive Summary</h1>}
            
            <div className={`bento-card ${theme === 'modern' ? 'span-8 row-span-2' : ''}`}>
              <h2 style={{marginTop: 0}}>Current Mission: Dashboard Expansion</h2>
              <p>Status: <span style={{color: 'var(--accent)'}}>Operational</span></p>
              <p style={{color: 'var(--text-secondary)'}}>Building the 2026 Spatial Bento interface. Context Engine is active.</p>
            </div>

            <div className={`bento-card ${theme === 'modern' ? 'span-4' : ''}`}>
              <h3 style={{marginTop: 0}}>Active Agent</h3>
              <div style={{fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)'}}>Controller</div>
            </div>

            <div className={`bento-card ${theme === 'modern' ? 'span-4' : ''}`}>
              <h3 style={{marginTop: 0}}>Next Action</h3>
              <p style={{fontSize: '14px'}}>Awaiting user directive for next phase implementation.</p>
            </div>
          </div>
        )}

        {depth === 'inventory' && (
          <div className={`view-layer ${theme === 'modern' ? 'bento-grid' : ''}`}>
            {theme !== 'modern' && <h1>Logic Graph (Inventory)</h1>}
            
            <div className={`bento-card ${theme === 'modern' ? 'span-12' : ''}`}>
              <h3 style={{marginTop: 0}}>Node Topology</h3>
              <div className="logic-graph">
                <div className="node">CONTROLLER<br/><small>Root</small></div>
                <div className="node">DOC-AGENT<br/><small>Sync Engine</small></div>
                <div className="node">DASHBOARD<br/><small>UI Layer</small></div>
              </div>
            </div>

            <div className={`bento-card ${theme === 'modern' ? 'span-6' : ''}`}>
              <h3 style={{marginTop: 0}}>File Integrity</h3>
              <ul style={{listStyle: 'none', padding: 0}}>
                <li style={{padding: '8px 0', borderBottom: '1px solid var(--border)'}}>🟢 ARCHITECTURE.md</li>
                <li style={{padding: '8px 0'}}>🟢 MANIFEST.md</li>
              </ul>
            </div>
            
            <div className={`bento-card ${theme === 'modern' ? 'span-6' : ''}`}>
              <h3 style={{marginTop: 0}}>Memory Clusters</h3>
              <ul style={{listStyle: 'none', padding: 0}}>
                <li style={{padding: '8px 0', borderBottom: '1px solid var(--border)'}}>🧠 Token Efficiency Rules</li>
                <li style={{padding: '8px 0'}}>🧠 UI Theme Preferences</li>
              </ul>
            </div>
          </div>
        )}

        {(depth === 'live' || depth === 'atomic') && (
          <div className="view-layer">
            <h1>{depth === 'live' ? 'Microscope (Live Stream)' : 'Quantum Trace (Atomic)'}</h1>
            <div className="terminal-view">
              {logs.map((log, i) => (
                <div key={i} className="log-entry">
                  {depth === 'atomic' ? JSON.stringify({log, traceId: i, level: 'DEBUG'}) : log}
                </div>
              ))}
              <div className="cursor">_</div>
            </div>
          </div>
        )}

        <div className="command-bar">
          <span className="accent-text">&gt;</span>
          <input 
            className="command-input" 
            placeholder="Issue a command to the Controller..." 
            onKeyDown={(e) => e.key === 'Enter' && alert('Command Received: ' + (e.target as HTMLInputElement).value)}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
