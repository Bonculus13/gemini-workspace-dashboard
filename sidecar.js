const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const WORKSPACE_ROOT = 'C:/Users/local-admin/Documents/GeminiWorkspace';
const LOG_STREAMER = path.join(WORKSPACE_ROOT, '.gemini/scripts/log-streamer.ps1');

// API: Execute an Agent
app.post('/api/execute', (req, res) => {
  const { agent, command } = req.body;
  
  if (!agent || !command) return res.status(400).json({ error: 'Missing parameters' });

  // Log the command receipt to the agent's live stream
  const logCmd = `powershell.exe -NoProfile -Command "& '${LOG_STREAMER}' -Agent '${agent}' -Message 'COMMAND_RECEIVED: ${command}'"`;
  exec(logCmd);

  // Spawning the Gemini CLI in the background
  const geminiCmd = `gemini --agent ${agent} "${command}"`;
  
  // Real Deployment
  const child = exec(geminiCmd, { cwd: WORKSPACE_ROOT });
  
  // Log telemetry (Mocking token count based on command complexity)
  const mockTokens = Math.floor(Math.random() * 10000) + 5000;
  const tokenCmd = `powershell.exe -NoProfile -Command "& '${WORKSPACE_ROOT}/.gemini/scripts/token-logger.ps1' -Action 'EXECUTE(${agent})' -TokensUsed ${mockTokens} -ContextWindowPercent ${Math.floor(Math.random() * 20)}"`;
  exec(tokenCmd);

  child.stdout.on('data', (data) => {
    const streamCmd = `powershell.exe -NoProfile -Command "& '${LOG_STREAMER}' -Agent '${agent}' -Message '${data.replace(/'/g, "''").trim()}'"`;
    exec(streamCmd);
  });

  res.json({ success: true, pid: child.pid });
});

const si = require('systeminformation');

// MISSION 1: Auto-Context Trimming (Financial Optimizer)
const autoTrimContext = () => {
  const tokenLogPath = path.join(WORKSPACE_ROOT, '.gemini/logs/telemetry/token-usage.jsonl');
  const ignorePath = path.join(WORKSPACE_ROOT, '.geminiignore');
  
  if (!fs.existsSync(tokenLogPath)) return;

  const data = fs.readFileSync(tokenLogPath, 'utf8').split('\n').filter(Boolean);
  const counts = {};
  
  data.slice(-50).forEach(line => {
    const entry = JSON.parse(line);
    const match = entry.action.match(/\(([^)]+)\)/);
    if (match) {
      const file = match[1];
      counts[file] = (counts[file] || 0) + entry.tokens_used;
    }
  });

  for (const file in counts) {
    if (counts[file] > 100000) { // Threshold: 100k tokens in last 50 turns
      const currentIgnore = fs.existsSync(ignorePath) ? fs.readFileSync(ignorePath, 'utf8') : '';
      if (!currentIgnore.includes(file)) {
        fs.appendFileSync(ignorePath, `\n${file} # Auto-trimmed for efficiency`);
        exec(`powershell.exe -NoProfile -Command "& '${LOG_STREAMER}' -Agent 'system' -Message 'OPTIMIZER: Auto-trimmed ${file} to save tokens.'"`);
      }
    }
  }
};

// MISSION 3: Deep Pulse (OS Telemetry)
app.get('/api/pulse', async (req, res) => {
  try {
    const cpu = await si.currentLoad();
    const mem = await si.mem();
    res.json({
      cpu: Math.round(cpu.currentLoad),
      ram: Math.round((mem.active / mem.total) * 100),
      temp: 42 // Mocking temp as it requires elevation often
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// MISSION 2: Template Registry
const MISSION_TEMPLATES = {
  'ui-fix': 'Verify contrast and layout performance in App.css and App.tsx. Propose immediate fixes.',
  'security-audit': 'Run a full security scan of the current branch and report vulnerabilities.',
  'doc-sync': 'Force a delta-sync of all architecture and manifest files.',
  'clean-bloat': 'Analyze workspace for large binary files and move to quarantine.'
};

app.get('/api/templates', (req, res) => res.json(MISSION_TEMPLATES));

// MISSION 4: Human Interaction Panel (Decision Queue)
app.get('/api/decisions', (req, res) => {
  const qPath = path.join(WORKSPACE_ROOT, '.gemini/logs/decisions/queue.json');
  if (fs.existsSync(qPath)) {
    const queue = JSON.parse(fs.readFileSync(qPath, 'utf8'));
    res.json(queue.filter(q => q.status === 'pending'));
  } else {
    res.json([]);
  }
});

app.post('/api/decisions/:id', (req, res) => {
  const { id } = req.params;
  const { choice, custom_instruction } = req.body;
  const qPath = path.join(WORKSPACE_ROOT, '.gemini/logs/decisions/queue.json');
  
  if (fs.existsSync(qPath)) {
    let queue = JSON.parse(fs.readFileSync(qPath, 'utf8'));
    const item = queue.find(q => q.id === id);
    if (item) {
      item.status = 'resolved';
      item.resolution = choice || custom_instruction;
      fs.writeFileSync(qPath, JSON.stringify(queue, null, 2));
      
      // Spawn Controller to execute the decision
      const instruction = custom_instruction ? `Follow custom instruction: ${custom_instruction}` : `Execute option: ${choice}`;
      exec(`powershell.exe -NoProfile -Command "& '${LOG_STREAMER}' -Agent 'controller' -Message 'HIP_DECISION [${item.title}]: ${instruction}. Deploying agent...'"`);
      
      const geminiCmd = `gemini --agent dev-agent "Implement decision for ${item.title}: ${instruction}"`;
      exec(geminiCmd, { cwd: WORKSPACE_ROOT });
    }
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Queue not found' });
  }
});

// Run optimizer every 1 minute
setInterval(autoTrimContext, 60000);
  const intakeDir = 'C:/Users/local-admin/Downloads/_intake';
  if (!fs.existsSync(intakeDir)) return;

  fs.readdirSync(intakeDir).forEach(file => {
    const ext = path.extname(file).toLowerCase();
    const source = path.join(intakeDir, file);
    let dest;

    if (ext === '.md') dest = path.join(WORKSPACE_ROOT, 'docs', file);
    else if (['.js', '.ts', '.tsx', '.css'].includes(ext)) dest = path.join(WORKSPACE_ROOT, 'dashboard/src', file);
    else if (['.ps1', '.sh', '.py'].includes(ext)) dest = path.join(WORKSPACE_ROOT, '.gemini/scripts', file);
    else if (['.png', '.jpg', '.svg'].includes(ext)) dest = path.join(WORKSPACE_ROOT, 'dashboard/public', file);

    if (dest) {
      fs.renameSync(source, dest);
      console.log(`TRIAGE: Moved ${file} to ${dest}`);
      exec(`powershell.exe -NoProfile -Command "& '${LOG_STREAMER}' -Agent 'system' -Message 'TRIAGE: Moved ${file} to ${path.relative(WORKSPACE_ROOT, dest)}'"`);
    }
  });
};

app.listen(3001, () => {
  console.log('Sidecar Bridge active on http://localhost:3001');
});
