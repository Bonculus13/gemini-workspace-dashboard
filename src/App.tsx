import React, { useState, useEffect } from 'react';
import './App.css';

type Theme = 'wiki' | 'command' | 'blueprint' | 'modern';
type Depth = 'summary' | 'inventory' | 'live' | 'atomic' | 'economics' | 'comms';
type FocusMode = 'idle' | 'debugging' | 'documentation' | 'building' | 'optimizing' | 'triage';

interface TokenMetric {
  timestamp: string;
  action: string;
  tokens_used: number;
  context_percent: number;
  cost_estimate: number;
}

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
  const [selectedAgent, setSelectedAgent] = useState<string>('session');
  const [tokenLogs, setTokenLogs] = useState<TokenMetric[]>([]);
  const [metrics, setMetrics] = useState({ tokens: 42500, cost: 0.12, context: 15 });
  const [systemState, setSystemState] = useState<SystemState>({
    focus: 'idle', active_mission: 'Loading...', system_health: '100%', active_agents: []
  });

  // The Context Engine & Log Streamer
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Logs based on selected agent
        const logRes = await fetch(`/streams/${selectedAgent}.log`);
        if (logRes.ok) {
          const text = await logRes.text();
          setLogs(text.split('\n').filter(l => l.trim()));
        }

        // Fetch System State (The Predictive Engine)
        const stateRes = await fetch('/state.json');
        const stateData: SystemState = await stateRes.json();
        setSystemState(stateData);
        
        // Fetch Token Usage Telemetry
        try {
          const tokenRes = await fetch('/telemetry/token-usage.jsonl');
          if (tokenRes.ok) {
            const tokenText = await tokenRes.text();
            const parsedTokens = tokenText.split('\n')
              .filter(line => line.trim())
              .map(line => JSON.parse(line) as TokenMetric);
            setTokenLogs(parsedTokens);
            
            if (parsedTokens.length > 0) {
              const totalTokens = parsedTokens.reduce((sum, t) => sum + t.tokens_used, 0);
              const totalCost = parsedTokens.reduce((sum, t) => sum + t.cost_estimate, 0);
              setMetrics({ tokens: totalTokens, cost: totalCost, context: parsedTokens[parsedTokens.length - 1].context_percent });
            }
          }
        } catch (e) { /* No logs yet */ }

        // Predictive Layout Overrides based on Focus
        if (stateData.focus === 'debugging' && depth !== 'live') setDepth('live');
        if (stateData.focus === 'documentation' && depth !== 'inventory') setDepth('inventory');
        if (stateData.focus === 'optimizing' && depth !== 'economics') setDepth('economics');

      } catch (err) {
        console.error("Context Engine Error: ", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [depth]);

  const themes: Theme[] = ['wiki', 'command', 'blueprint', 'modern'];
  const depths: Depth[] = ['summary', 'inventory', 'live', 'atomic', 'economics', 'comms'];

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

        {depth === 'economics' && (
          <div className={`view-layer ${theme === 'modern' ? 'bento-grid' : ''}`}>
            {theme !== 'modern' && <h1>Token Economics</h1>}
            
            <div className={getBentoClass('span-12', 'optimizing')}>
              <h3 style={{marginTop: 0}}>Efficiency & Resource Allocation</h3>
              <div className="resource-monitor" style={{marginBottom: 0, border: 'none', background: 'transparent'}}>
                 <div className="metric">
                    <span className="metric-label">Efficiency Score</span>
                    <span className="metric-value">92%</span>
                 </div>
                 <div className="metric">
                    <span className="metric-label">Tokens Saved (Masking)</span>
                    <span className="metric-value">1.4M</span>
                 </div>
                 <div className="metric">
                    <span className="metric-label">Est. Monthly Savings</span>
                    <span className="metric-value">$42.50</span>
                 </div>
              </div>
            </div>

            <div className={`bento-card ${theme === 'modern' ? 'span-8' : ''}`}>
              <h3 style={{marginTop: 0}}>Consumption Breakdown</h3>
              <div style={{maxHeight: '300px', overflowY: 'auto'}}>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                  <thead>
                    <tr style={{textAlign: 'left', color: 'var(--text-secondary)', fontSize: '12px'}}>
                      <th>Action</th>
                      <th>Tokens</th>
                      <th>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokenLogs.slice().reverse().map((t, i) => (
                      <tr key={i} style={{borderBottom: '1px solid var(--border)'}}>
                        <td style={{padding: '8px 0'}}>{t.action}</td>
                        <td style={{padding: '8px 0'}}>{t.tokens_used.toLocaleString()}</td>
                        <td style={{padding: '8px 0'}}>${t.cost_estimate.toFixed(4)}</td>
                      </tr>
                    ))}
                    {tokenLogs.length === 0 && <tr><td colSpan={3}>No telemetry data available.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={`bento-card ${theme === 'modern' ? 'span-4' : ''}`}>
              <h3 style={{marginTop: 0}}>Architect Recommendations</h3>
              <ul style={{listStyle: 'none', padding: 0, fontSize: '14px'}}>
                <li style={{marginBottom: '12px'}}>
                  <strong>⚠️ Bloat Detected:</strong> <code>package-lock.json</code> is consuming 12% of total tokens. 
                  <button style={{display: 'block', marginTop: '4px', fontSize: '10px'}} onClick={() => alert('Adding to .geminiignore...')}>IGNORE FILE</button>
                </li>
                <li>
                  <strong>🛡️ Masking Optimization:</strong> Current threshold is safe. Consider reducing to 30k tokens for "idle" tasks.
                </li>
              </ul>
            </div>
          </div>
        )}

        {depth === 'comms' && (
          <div className={`view-layer ${theme === 'modern' ? 'bento-grid' : ''}`}>
            {theme !== 'modern' && <h1>Comms & Intake</h1>}
            
            <div className={getBentoClass('span-8 row-span-3', 'triage')}>
              <h3 style={{marginTop: 0}}>Controller Chat</h3>
              <div className="terminal-view" style={{height: '400px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)'}}>
                <div className="log-entry"><span style={{color: 'var(--accent)'}}>[System]</span> Controller Agent online.</div>
                <div className="log-entry"><span style={{color: 'var(--text-secondary)'}}>[User]</span> Let's start building the authentication feature.</div>
                <div className="log-entry"><span style={{color: 'var(--accent)'}}>[Controller]</span> Acknowledged. Branching 'feature/auth'. Spawning Dev-Agent...</div>
              </div>
            </div>

            <div className={`bento-card ${theme === 'modern' ? 'span-4 row-span-2' : ''}`}>
              <h3 style={{marginTop: 0}}>Intake Dropzone</h3>
              <div style={{
                border: '2px dashed var(--border)', 
                borderRadius: '12px', 
                padding: '40px 20px', 
                textAlign: 'center',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}>
                <div style={{fontSize: '32px', marginBottom: '10px'}}>📥</div>
                Drop files here for Triage<br/>
                <small>(or save to C:\Users\local-admin\Downloads\_intake)</small>
              </div>
            </div>

            <div className={`bento-card ${theme === 'modern' ? 'span-4' : ''}`}>
              <h3 style={{marginTop: 0}}>Active Branches (Git-Flow)</h3>
              <ul style={{listStyle: 'none', padding: 0, fontSize: '14px'}}>
                <li style={{padding: '4px 0'}}>🌿 master <span style={{float: 'right', color: 'var(--text-secondary)'}}>idle</span></li>
                <li style={{padding: '4px 0'}}>🌿 feature/dashboard-ui <span style={{float: 'right', color: 'var(--accent)'}}>dev-agent</span></li>
              </ul>
            </div>
          </div>
        )}

        {(depth === 'live' || depth === 'atomic') && (
          <div className={`view-layer ${theme === 'modern' ? 'bento-grid' : ''}`}>
            <div className={getBentoClass('span-12 row-span-3', 'debugging')}>
              <h3 style={{marginTop: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  {depth === 'live' ? 'Live Microscope' : 'Quantum Trace'}
                  <select 
                    style={{fontSize: '12px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', color: 'inherit', border: '1px solid var(--border)'}}
                    value={selectedAgent} 
                    onChange={(e) => setSelectedAgent(e.target.value)}
                  >
                    <option value="session">Global Session</option>
                    {systemState.active_agents.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
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
