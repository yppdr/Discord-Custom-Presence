chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type !== 'presence:media') return;

  const tab = sender.tab || {};
  const payload = {
    title: message.payload.title || tab.title || '',
    artist: message.payload.artist || '',
    album: message.payload.album || '',
    source: message.payload.source || new URL(tab.url || 'https://browser.local').hostname,
    url: tab.url || '',
    largeImageKey: message.payload.largeImageKey || ''
  };

  fetch('http://127.0.0.1:38432/now-playing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(() => {
    // The desktop app is probably closed.
  });
});
