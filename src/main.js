const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const RPC = require('discord-rpc');

const defaultSettings = {
  clientId: '',
  mode: 'custom',
  custom: {
    details: 'Using Discord Custom Presence',
    state: 'Editing my status',
    largeImageKey: '',
    largeImageText: '',
    smallImageKey: '',
    smallImageText: '',
    button1Label: '',
    button1Url: '',
    button2Label: '',
    button2Url: ''
  },
  browser: {
    enabled: true,
    fallbackDetails: 'Listening in the browser'
  }
};

let settings = structuredClone(defaultSettings);

let mainWindow;
let rpcClient;
let rpcReady = false;
let lastNowPlaying = null;
let localServer;

function settingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function mergeSettings(input) {
  return {
    ...defaultSettings,
    ...input,
    custom: { ...defaultSettings.custom, ...(input && input.custom) },
    browser: { ...defaultSettings.browser, ...(input && input.browser) }
  };
}

function loadSettings() {
  try {
    const raw = fs.readFileSync(settingsPath(), 'utf8');
    settings = mergeSettings(JSON.parse(raw));
  } catch {
    settings = structuredClone(defaultSettings);
  }
}

function saveSettings(nextSettings) {
  settings = mergeSettings(nextSettings);
  fs.mkdirSync(path.dirname(settingsPath()), { recursive: true });
  fs.writeFileSync(settingsPath(), JSON.stringify(settings, null, 2));
  return settings;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 980,
    height: 720,
    minWidth: 860,
    minHeight: 600,
    title: 'Discord Custom Presence',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer.html'));
}

function cleanText(value, maxLength = 128) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function buildActivity() {
  const now = lastNowPlaying;
  const useBrowser = settings.mode === 'browser' && settings.browser.enabled && now;

  const activity = useBrowser
    ? {
        details: cleanText(now.title || settings.browser.fallbackDetails),
        state: cleanText(now.artist || now.source || ''),
        largeImageKey: cleanText(now.largeImageKey || settings.custom.largeImageKey, 256),
        largeImageText: cleanText(now.album || now.url || '', 128),
        smallImageKey: cleanText(settings.custom.smallImageKey, 256),
        smallImageText: cleanText(now.source || settings.custom.smallImageText, 128)
      }
    : {
        details: cleanText(settings.custom.details),
        state: cleanText(settings.custom.state),
        largeImageKey: cleanText(settings.custom.largeImageKey, 256),
        largeImageText: cleanText(settings.custom.largeImageText, 128),
        smallImageKey: cleanText(settings.custom.smallImageKey, 256),
        smallImageText: cleanText(settings.custom.smallImageText, 128)
      };

  const buttons = [];
  if (settings.custom.button1Label && settings.custom.button1Url) {
    buttons.push({ label: settings.custom.button1Label, url: settings.custom.button1Url });
  }
  if (settings.custom.button2Label && settings.custom.button2Url) {
    buttons.push({ label: settings.custom.button2Label, url: settings.custom.button2Url });
  }
  if (buttons.length) activity.buttons = buttons;

  activity.startTimestamp = Date.now();
  activity.instance = false;

  Object.keys(activity).forEach((key) => {
    if (activity[key] === '') delete activity[key];
  });

  return activity;
}

async function connectRpc() {
  const clientId = cleanText(settings.clientId, 64);
  if (!clientId) {
    return { ok: false, message: 'Missing Discord application client ID.' };
  }

  if (rpcClient) {
    try {
      rpcClient.destroy();
    } catch {
      // Ignore stale RPC shutdown errors.
    }
  }

  RPC.register(clientId);
  rpcClient = new RPC.Client({ transport: 'ipc' });
  rpcReady = false;

  rpcClient.on('ready', async () => {
    rpcReady = true;
    await updatePresence();
    sendStatus('Connected to Discord.');
  });

  rpcClient.on('disconnected', () => {
    rpcReady = false;
    sendStatus('Disconnected from Discord.');
  });

  try {
    await rpcClient.login({ clientId });
    return { ok: true, message: 'Connecting to Discord.' };
  } catch (error) {
    rpcReady = false;
    return { ok: false, message: error.message };
  }
}

async function updatePresence() {
  if (!rpcClient || !rpcReady) return { ok: false, message: 'Discord RPC is not connected.' };

  try {
    await rpcClient.setActivity(buildActivity());
    sendStatus('Presence updated.');
    return { ok: true, message: 'Presence updated.' };
  } catch (error) {
    sendStatus(error.message);
    return { ok: false, message: error.message };
  }
}

function sendStatus(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('presence:status', {
      message,
      rpcReady,
      nowPlaying: lastNowPlaying
    });
  }
}

function startLocalServer() {
  localServer = http.createServer((req, res) => {
    const allowed = req.socket.remoteAddress === '127.0.0.1' || req.socket.remoteAddress === '::1';
    if (!allowed) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    if (req.method === 'POST' && req.url === '/now-playing') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
        if (body.length > 8192) req.destroy();
      });
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body);
          lastNowPlaying = {
            title: cleanText(payload.title),
            artist: cleanText(payload.artist),
            album: cleanText(payload.album),
            source: cleanText(payload.source),
            url: cleanText(payload.url, 256),
            largeImageKey: cleanText(payload.largeImageKey, 256),
            receivedAt: new Date().toISOString()
          };
          if (settings.mode === 'browser') await updatePresence();
          sendStatus('Browser media received.');
          res.writeHead(204);
          res.end();
        } catch (error) {
          res.writeHead(400);
          res.end(error.message);
        }
      });
      return;
    }

    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  });

  localServer.listen(38432, '127.0.0.1');
}

ipcMain.handle('settings:get', () => settings);

ipcMain.handle('settings:save', async (_event, nextSettings) => {
  const savedSettings = saveSettings(nextSettings);
  await updatePresence();
  return savedSettings;
});

ipcMain.handle('presence:connect', connectRpc);
ipcMain.handle('presence:update', updatePresence);
ipcMain.handle('presence:clear', async () => {
  if (!rpcClient || !rpcReady) return { ok: false, message: 'Discord RPC is not connected.' };
  await rpcClient.clearActivity();
  return { ok: true, message: 'Presence cleared.' };
});

ipcMain.handle('app:openExternal', (_event, url) => {
  shell.openExternal(url);
});

app.whenReady().then(() => {
  loadSettings();
  createWindow();
  startLocalServer();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (localServer) localServer.close();
  if (rpcClient) rpcClient.destroy();
});
