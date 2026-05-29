const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('presenceApi', {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  connect: () => ipcRenderer.invoke('presence:connect'),
  update: () => ipcRenderer.invoke('presence:update'),
  clear: () => ipcRenderer.invoke('presence:clear'),
  openExternal: (url) => ipcRenderer.invoke('app:openExternal', url),
  onStatus: (callback) => ipcRenderer.on('presence:status', (_event, payload) => callback(payload))
});
