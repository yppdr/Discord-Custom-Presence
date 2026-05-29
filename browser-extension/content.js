const adapters = [
  {
    host: 'open.spotify.com',
    read() {
      const title =
        document.querySelector('[data-testid="context-item-info-title"]')?.textContent ||
        document.querySelector('[data-testid="now-playing-widget"] a')?.textContent;
      const artist =
        document.querySelector('[data-testid="context-item-info-subtitles"]')?.textContent ||
        document.querySelector('[data-testid="now-playing-widget"] [dir="auto"]')?.textContent;
      return { title, artist, source: 'Spotify' };
    }
  },
  {
    host: 'music.youtube.com',
    read() {
      const title = document.querySelector('.title.ytmusic-player-bar')?.textContent;
      const artist = document.querySelector('.byline.ytmusic-player-bar')?.textContent;
      return { title, artist, source: 'YouTube Music' };
    }
  },
  {
    host: 'youtube.com',
    read() {
      const title = document.querySelector('h1.ytd-watch-metadata')?.textContent || document.title;
      const artist = document.querySelector('#owner #channel-name a')?.textContent;
      return { title, artist, source: 'YouTube' };
    }
  },
  {
    host: 'soundcloud.com',
    read() {
      const title = document.querySelector('.playbackSoundBadge__titleLink')?.textContent;
      const artist = document.querySelector('.playbackSoundBadge__lightLink')?.textContent;
      return { title, artist, source: 'SoundCloud' };
    }
  }
];

function clean(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function fallbackRead() {
  const activeMedia = Array.from(document.querySelectorAll('audio, video')).find((media) => {
    return !media.paused && !media.ended && media.currentTime > 0;
  });

  if (!activeMedia) return null;

  return {
    title: document.title.replace(/\s*[-|]\s*(YouTube|Spotify|SoundCloud).*$/i, ''),
    artist: '',
    source: location.hostname.replace(/^www\./, '')
  };
}

function readMedia() {
  const adapter = adapters.find((item) => location.hostname.endsWith(item.host));
  const result = adapter ? adapter.read() : fallbackRead();
  if (!result || !clean(result.title)) return null;

  return {
    title: clean(result.title),
    artist: clean(result.artist),
    album: clean(result.album),
    source: clean(result.source || location.hostname.replace(/^www\./, '')),
    largeImageKey: clean(result.largeImageKey)
  };
}

let lastSignature = '';

function publish() {
  const media = readMedia();
  if (!media) return;

  const signature = JSON.stringify(media);
  if (signature === lastSignature) return;
  lastSignature = signature;

  chrome.runtime.sendMessage({
    type: 'presence:media',
    payload: media
  });
}

setInterval(publish, 5000);
publish();
