import React, { useState, useEffect } from 'react';
import './App.css';

type Theme = 'wiki' | 'command' | 'blueprint' | 'modern';
type Depth = 'summary' | 'inventory' | 'live' | 'atomic';
type FocusMode = 'idle' | 'debugging' | 'documentation' | 'building';

interface AgentState {
  name: string;
  status: string;
  pid: string;
}

interface SystemState {
  focus: FocusMode;
  active_mission: string;
  system_health: string;
  active_agents: AgentState[];
}

const App = () => {
  const [theme, setTheme] = useState<Theme>('modern'); // Default to modern/spatial
  const [depth, setDepth] = useState<Depth>('summary');
  const [logs, setLogs] = useState<string[]>([]);
  const [metrics, setMetrics] = useState({ tokens: 42500, cost: 0.12, context: 15 });
  const [systemState, setSystemState] = useState<SystemState>({
    focus: 'idle', active_mission: 'Loading...', system_health: '100%', active_agents: []
  });

  // The Context Engine & Log Streamer
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Logs
        const logRes = await fetch('/streams/session.log');
        const text = await logRes.text();
        setLogs(text.split('\n').filter(l => l.trim()));

        // Fetch System State (The Predictive Engine)
        const stateRes = await fetch('/state.json');
        const stateData: SystemState = await stateRes.json();
        setSystemState(stateData);
        
        // Predictive Layout Overrides based on Focus
        if (stateData.focus === 'debugging' && depth !== 'live') setDepth('live');
        if (stateData.focus === 'documentation' && depth !== 'inventory') setDepth('inventory');

      } catch (err) {
        console.error("Context Engine Error: ", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [depth]);

  const themes: Theme[] = ['wiki', 'command', 'blueprint', 'modern'];
  const depths: Depth[] = ['summary', 'inventory', 'live', 'atomic'];

  // Predictive Grid Classes
  const getBentoClass = (defaultSpan: string, focusExpand: FocusMode) => {
    if (theme !== 'modern') return '';
    return `bento-card ${systemState.focus === focusExpand ? 'span-12 row-span-2' : defaultSpan}`;
  };

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
          <div className="system-status">
            <small>STATE: {systemState.focus.toUpperCase()}</small>
          </div>
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
            <span className="metric-label">Active Agents</span>
            <span className="metric-value">{systemState.active_agents.length}</span>
          </div>
        </div>

        {depth === 'summary' && (
          <div className={`view-layer ${theme === 'modern' ? 'bento-grid' : ''}`}>
            {theme !== 'modern' && <h1>Executive Summary</h1>}
            
            <div className={getBentoClass('span-8 row-span-2', 'building')}>
              <h2 style={{marginTop: 0}}>Current Mission: {systemState.active_mission}</h2>
              <p>Status: <span style={{color: 'var(--accent)'}}>{systemState.system_health}</span></p>
              <p style={{color: 'var(--text-secondary)'}}>
                The Predictive Context Engine is active. Layouts will auto-adjust based on AI focus state.
              </p>
            </div>

            <div className={getBentoClass('span-4', 'idle')}>
              <h3 style={{marginTop: 0}}>Agent Fleet</h3>
              <ul style={{listStyle: 'none', padding: 0}}>
                {systemState.active_agents.map(a => (
                  <li key={a.name} style={{padding: '4px 0'}}>
                    <span style={{color: 'var(--accent)'}}>●</span> {a.name} 
                    <small style={{display: 'block', color: 'var(--text-secondary)'}}>PID: {a.pid} | {a.status}</small>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {depth === 'inventory' && (
          <div className={`view-layer ${theme === 'modern' ? 'bento-grid' : ''}`}>
            {theme !== 'modern' && <h1>Logic Graph (Inventory)</h1>}
            
            <div className={getBentoClass('span-12', 'documentation')}>
              <h3 style={{marginTop: 0}}>Node Topology</h3>
              <div className="logic-graph">
                <div className="node">EVOLUTION-AGENT<br/><small>Innovator</small></div>
                <div className="node" style={{borderColor: 'var(--text-primary)'}}>CONTROLLER<br/><small>Root</small></div>
                <div className="node">DOC-AGENT<br/><small>Sync</small></div>
              </div>
            </div>

            <div className={`bento-card ${theme === 'modern' ? 'span-6' : ''}`}>
              <h3 style={{marginTop: 0}}>File Integrity</h3>
              <ul style={{listStyle: 'none', padding: 0}}>
                <li style={{padding: '8px 0', borderBottom: '1px solid var(--border)'}}>🟢 ARCHITECTURE.md</li>
                <li style={{padding: '8px 0'}}>🟢 MANIFEST.md</li>
              </ul>
            </div>
          </div>
        )}

        {(depth === 'live' || depth === 'atomic') && (
          <div className={`view-layer ${theme === 'modern' ? 'bento-grid' : ''}`}>
            <div className={getBentoClass('span-12 row-span-3', 'debugging')}>
              <h3 style={{marginTop: 0, display: 'flex', justifyContent: 'space-between'}}>
                {depth === 'live' ? 'Live Terminal (Microscope)' : 'Quantum Trace'}
                <span className="blinking-cursor" style={{color: 'var(--accent)'}}>REC</span>
              </h3>
              <div className="terminal-view">
                {logs.map((log, i) => (
                  <div key={i} className="log-entry">
                    {depth === 'atomic' ? JSON.stringify({log, traceId: i, level: 'DEBUG'}) : log}
                  </div>
                ))}
                <div className="cursor">_</div>
              </div>
            </div>
          </div>
        )}

        <div className="command-bar">
          <span className="accent-text">&gt;</span>
          <input 
            className="command-input" 
            placeholder="Issue a command to the Controller... (e.g. /deploy evolution-agent)" 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                alert('Command Sent to Controller: ' + target.value);
                target.value = '';
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
