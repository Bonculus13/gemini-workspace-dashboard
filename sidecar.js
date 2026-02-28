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

// Auto-Triage Watcher (Zero Token Logic)
const triageFiles = () => {
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
