const { contextBridge, ipcRenderer } = require('electron');

// Bridge: lets index.html receive realtime TradingView prices pushed from
// the main process (which talks to TradingView's live data feed via
// @mathieuc/tradingview — no manual setup, fully automatic).
contextBridge.exposeInMainWorld('tvAPI', {
  onPrice: (callback) => {
    ipcRenderer.on('tv-price', (_event, payload) => callback(payload));
  },
  onStatus: (callback) => {
    ipcRenderer.on('tv-status', (_event, payload) => callback(payload));
  },
  onUpdate: (callback) => {
    ipcRenderer.on('update-available', (_event, payload) => callback(payload));
  }
});
