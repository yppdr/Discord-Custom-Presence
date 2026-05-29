# Browser extension

This extension sends detected browser media to the desktop app at `http://127.0.0.1:38432/now-playing`.

## Chrome / Edge

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click "Load unpacked".
4. Select this `browser-extension` folder.

## Firefox

Firefox can load the extension temporarily from `about:debugging#/runtime/this-firefox`.

The extension currently includes adapters for Spotify Web, YouTube, YouTube Music, and SoundCloud. Other sites fall back to the page title when a playing audio or video element is detected.
