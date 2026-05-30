const fields = [
  'clientId',
  'details',
  'state',
  'largeImageKey',
  'largeImageText',
  'smallImageKey',
  'smallImageText',
  'button1Label',
  'button1Url',
  'button2Label',
  'button2Url',
  'fallbackDetails'
];

let settings;

function byId(id) {
  return document.getElementById(id);
}

function setStatus(payload) {
  byId('statusText').textContent = payload.message || 'Waiting';
  if (typeof payload.rpcReady === 'boolean') {
    byId('connectionText').textContent = payload.rpcReady ? 'Connected' : 'Not connected';
    byId('statusDot').classList.toggle('ready', payload.rpcReady);
  }

  if (payload.nowPlaying) {
    const values = [
      payload.nowPlaying.title || '-',
      payload.nowPlaying.artist || '-',
      payload.nowPlaying.source || '-'
    ];
    document.querySelectorAll('#nowPlaying dd').forEach((node, index) => {
      node.textContent = values[index];
    });
  }
}

function readForm() {
  return {
    clientId: byId('clientId').value.trim(),
    mode: document.querySelector('input[name="mode"]:checked').value,
    custom: {
      details: byId('details').value,
      state: byId('state').value,
      largeImageKey: byId('largeImageKey').value,
      largeImageText: byId('largeImageText').value,
      smallImageKey: byId('smallImageKey').value,
      smallImageText: byId('smallImageText').value,
      button1Label: byId('button1Label').value,
      button1Url: byId('button1Url').value,
      button2Label: byId('button2Label').value,
      button2Url: byId('button2Url').value
    },
    browser: {
      enabled: true,
      fallbackDetails: byId('fallbackDetails').value
    }
  };
}

function writeForm(nextSettings) {
  settings = nextSettings;
  byId('clientId').value = settings.clientId || '';
  byId('details').value = settings.custom.details || '';
  byId('state').value = settings.custom.state || '';
  byId('largeImageKey').value = settings.custom.largeImageKey || '';
  byId('largeImageText').value = settings.custom.largeImageText || '';
  byId('smallImageKey').value = settings.custom.smallImageKey || '';
  byId('smallImageText').value = settings.custom.smallImageText || '';
  byId('button1Label').value = settings.custom.button1Label || '';
  byId('button1Url').value = settings.custom.button1Url || '';
  byId('button2Label').value = settings.custom.button2Label || '';
  byId('button2Url').value = settings.custom.button2Url || '';
  byId('fallbackDetails').value = settings.browser.fallbackDetails || '';
  document.querySelector(`input[name="mode"][value="${settings.mode || 'custom'}"]`).checked = true;
}

async function save() {
  settings = await window.presenceApi.saveSettings(readForm());
  writeForm(settings);
  setStatus({ message: 'Settings saved.' });
}

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((node) => node.classList.remove('active'));
    document.querySelectorAll('.panel').forEach((node) => node.classList.remove('active'));
    tab.classList.add('active');
    byId(`${tab.dataset.tab}Panel`).classList.add('active');
  });
});

byId('saveButton').addEventListener('click', save);
byId('connectButton').addEventListener('click', async () => {
  await save();
  const result = await window.presenceApi.connect();
  setStatus({ message: result.message, rpcReady: result.ok });
});
byId('clearButton').addEventListener('click', async () => {
  const result = await window.presenceApi.clear();
  setStatus({ message: result.message, rpcReady: result.ok });
});
byId('portalButton').addEventListener('click', () => {
  window.presenceApi.openExternal('https://discord.com/developers/applications');
});

fields.forEach((field) => {
  byId(field).addEventListener('change', save);
});

window.presenceApi.onStatus(setStatus);

window.presenceApi.getSettings().then(writeForm);
