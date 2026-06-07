const { app, BrowserWindow, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const https = require('https');

const CURRENT_VERSION = '1.0.0';

// ── Ye URL aap GitHub Gist mein version.json banane ke baad update karo ──────
// Gist mein content: {"version":"1.0.1","download":"https://your-link.com/setup.exe","notes":"Kya naya hai"}
const VERSION_CHECK_URL = 'https://gist.githubusercontent.com/kumarankit22-cpu/af916fb65db573dfd7d82ac3de1e2674/raw/version.json';

// ── Install counter — CounterAPI (free, no signup) ──────────────────────────
const COUNTER_URL = 'https://api.counterapi.dev/v1/stockwithai-alert/installs/up';

function trackInstall() {
  try {
    https.get(COUNTER_URL, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('Install count:', json.count);
        } catch(e) {}
      });
    }).on('error', () => {});
  } catch(e) {}
}

function checkForUpdates(win) {
  if (VERSION_CHECK_URL.includes('YOUR_GITHUB')) return; // URL set nahi ki
  try {
    https.get(VERSION_CHECK_URL, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          const info = JSON.parse(data);
          if (info.version && info.version !== CURRENT_VERSION) {
            if (!win || win.isDestroyed()) return;
            win.webContents.send('update-available', {
              version: info.version,
              download: info.download || '',
              notes: info.notes || ''
            });
          }
        } catch(e) {}
      });
    }).on('error', () => {});
  } catch(e) {}
}

let mainWindow;
let tray;

const TV_SYMBOLS = {
  SPX500:  'OANDA:SPX500USD',
  NAS100:  'OANDA:NAS100USD',
  DOW30:   'OANDA:US30USD',
  DAX40:   'OANDA:DE30EUR',
  FTSE100: 'OANDA:UK100GBP',
  NKY225:  'OANDA:JP225USD',
  NIFTY50: 'FOREXCOM:NSXUSD',
  SENSEX:  'BSE:SENSEX',
  HSI:     'OANDA:HK33HKD',
  ASX200:  'OANDA:AU200AUD',
  CAC40:   'OANDA:FR40EUR',
  STOXX50: 'OANDA:EU50EUR',
  // Forex — OANDA (TradingView chart se exactly match)
  EURUSD:'OANDA:EURUSD', GBPUSD:'OANDA:GBPUSD', USDJPY:'OANDA:USDJPY',
  USDCHF:'OANDA:USDCHF', USDCAD:'OANDA:USDCAD', AUDUSD:'OANDA:AUDUSD',
  NZDUSD:'OANDA:NZDUSD', EURGBP:'OANDA:EURGBP', EURJPY:'OANDA:EURJPY',
  EURAUD:'OANDA:EURAUD', EURCAD:'OANDA:EURCAD', EURCHF:'OANDA:EURCHF',
  EURNZD:'OANDA:EURNZD', GBPJPY:'OANDA:GBPJPY', GBPAUD:'OANDA:GBPAUD',
  GBPCAD:'OANDA:GBPCAD', GBPCHF:'OANDA:GBPCHF', GBPNZD:'OANDA:GBPNZD',
  AUDCAD:'OANDA:AUDCAD', AUDCHF:'OANDA:AUDCHF', AUDJPY:'OANDA:AUDJPY',
  AUDNZD:'OANDA:AUDNZD', NZDCAD:'OANDA:NZDCAD', NZDCHF:'OANDA:NZDCHF',
  NZDJPY:'OANDA:NZDJPY', CADCHF:'OANDA:CADCHF', CADJPY:'OANDA:CADJPY',
  CHFJPY:'OANDA:CHFJPY',
  // Crypto — Coinbase (TradingView chart se exactly match)
  BTCUSD:'COINBASE:BTCUSD', ETHUSD:'COINBASE:ETHUSD', BNBUSD:'BINANCE:BNBUSDT',
  XRPUSD:'COINBASE:XRPUSD', SOLUSD:'COINBASE:SOLUSD', ADAUSD:'COINBASE:ADAUSD',
  DOGEUSD:'COINBASE:DOGEUSD', AVAXUSD:'COINBASE:AVAXUSD', DOTUSD:'COINBASE:DOTUSD',
  LINKUSD:'COINBASE:LINKUSD', LTCUSD:'COINBASE:LTCUSD', UNIUSD:'COINBASE:UNIUSD',
  ATOMUSD:'COINBASE:ATOMUSD', NEARUSD:'COINBASE:NEARUSD', MATICUSD:'COINBASE:MATICUSD',
  APTUSD:'COINBASE:APTUSD', SUIUSD:'COINBASE:SUIUSD', OPUSD:'COINBASE:OPUSD',
  ARBUSD:'COINBASE:ARBUSD', INJUSD:'COINBASE:INJUSD', TRXUSD:'BINANCE:TRXUSDT',
  SHIBUSDT:'BINANCE:SHIBUSDT',
  XAUUSD:'TVC:GOLD', XAGUSD:'TVC:SILVER', XPTUSD:'TVC:PLATINUM',
  WTIUSD:'TVC:USOIL', BRENTUSD:'TVC:UKOIL'
};

let tvClient = null;
const tvMarkets = [];

function startTradingViewFeed(win) {
  let TradingView;
  try {
    TradingView = require('@mathieuc/tradingview');
  } catch (e) {
    win.webContents.send('tv-status', { ok: false, msg: 'TradingView-API library load nahi hui - npm install dobara chalao.' });
    return;
  }

  try {
    tvClient = new TradingView.Client();
    const quoteSession = new tvClient.Session.Quote();

    Object.entries(TV_SYMBOLS).forEach(([ourSymbol, tvTicker]) => {
      try {
        const market = new quoteSession.Market(tvTicker);
        market.onData((data) => {
          if (!win || win.isDestroyed()) return;
          const price = data && (data.lp !== undefined ? data.lp : (data.last_price !== undefined ? data.last_price : data.price));
          if (price !== undefined && price !== null && !isNaN(price)) {
            try { win.webContents.send('tv-price', { symbol: ourSymbol, price: parseFloat(price) }); } catch(e) {}
          }
        });
        market.onError((...err) => {});
        tvMarkets.push(market);
      } catch (e) {}
    });

    win.webContents.send('tv-status', { ok: true, msg: 'Live feed connected - ' + tvMarkets.length + ' symbols streaming in real-time' });
  } catch (e) {
    win.webContents.send('tv-status', { ok: false, msg: 'TradingView feed error: ' + e.message });
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Forex & Index Price Alert',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: true,
    backgroundColor: '#1a1f2e'
  });

  mainWindow.loadFile('index.html');

  mainWindow.webContents.once('did-finish-load', () => {
    startTradingViewFeed(mainWindow);
    trackInstall();
    setTimeout(() => checkForUpdates(mainWindow), 5000);
  });

  try {
    tray = new Tray(path.join(__dirname, 'icon.ico'));
  } catch(e) {
    tray = new Tray(nativeImage.createEmpty());
  }

  tray.setToolTip('Forex Price Alert - Running');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Show App',  click: () => { mainWindow.show(); mainWindow.focus(); } },
    { type: 'separator' },
    { label: 'Quit',      click: () => { app.isQuitting = true; app.quit(); } }
  ]));
  tray.on('double-click', () => { mainWindow.show(); mainWindow.focus(); });

  mainWindow.on('close', (e) => {
    app.isQuitting = true;
    try { if (tvClient) tvClient.end(); } catch(e) {}
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('before-quit', () => { app.isQuitting = true; });
