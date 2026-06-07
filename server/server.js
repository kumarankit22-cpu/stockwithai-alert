const { WebSocketServer } = require('ws');
const http = require('http');

const PORT = process.env.PORT || 8080;

const TV_SYMBOLS = {
  SPX500:'OANDA:SPX500USD', NAS100:'OANDA:NAS100USD', DOW30:'OANDA:US30USD',
  DAX40:'OANDA:DE30EUR', FTSE100:'OANDA:UK100GBP', NKY225:'OANDA:JP225USD',
  NIFTY50:'FOREXCOM:NSXUSD', SENSEX:'BSE:SENSEX', HSI:'OANDA:HK33HKD',
  ASX200:'OANDA:AU200AUD', CAC40:'OANDA:FR40EUR', STOXX50:'OANDA:EU50EUR',
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

const liveRates = {};
let clients = new Set();

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', symbols: Object.keys(liveRates).length }));
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('Client connected. Total:', clients.size);
  Object.entries(liveRates).forEach(([symbol, price]) => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify({ symbol, price }));
  });
  ws.on('close', () => { clients.delete(ws); });
});

function broadcast(data) {
  const msg = JSON.stringify(data);
  clients.forEach(ws => { if (ws.readyState === ws.OPEN) ws.send(msg); });
}

function startTradingViewFeed() {
  let TradingView;
  try { TradingView = require('@mathieuc/tradingview'); } catch(e) {
    console.error('TradingView library not found'); return;
  }
  try {
    const tvClient = new TradingView.Client();
    const quoteSession = new tvClient.Session.Quote();
    Object.entries(TV_SYMBOLS).forEach(([ourSymbol, tvTicker]) => {
      try {
        const market = new quoteSession.Market(tvTicker);
        market.onData((data) => {
          const price = data && (data.lp !== undefined ? data.lp :
            (data.last_price !== undefined ? data.last_price : data.price));
          if (price !== undefined && price !== null && !isNaN(price)) {
            const p = parseFloat(price);
            liveRates[ourSymbol] = p;
            broadcast({ symbol: ourSymbol, price: p });
          }
        });
        market.onError(() => {});
      } catch(e) {}
    });
    console.log('TradingView feed started for', Object.keys(TV_SYMBOLS).length, 'symbols');
  } catch(e) { console.error('Feed error:', e.message); }
}

server.listen(PORT, () => {
  console.log('StockwithAi price server on port', PORT);
  startTradingViewFeed();
});
