import type { StockData } from '../types/stock';

const symbols = [
  "AMD", "GOOGL", "GOOG", "AMZN", "AMGN", "AAPL", "BRKB", "BKNG", "AVGO", "CSX",
  "LLY", "MAR", "MRVL", "META", "MSFT", "NVDA", "PYPL", "2330TW", "TSLA", "V"
];

const basePrices: Record<string, number> = {
  AMD: 162.34, GOOGL: 2789.12, GOOG: 2795.67, AMZN: 3450.23, AMGN: 245.89, AAPL: 150.25, BRKB: 420.50, BKNG: 2300.75, AVGO: 900.10, CSX: 32.45,
  LLY: 410.00, MAR: 180.20, MRVL: 65.30, META: 320.45, MSFT: 285.50, NVDA: 700.00, PYPL: 75.60, "2330TW": 120.00, TSLA: 900.00, V: 220.00
};

function generateTimeSeries(symbol: string, points = 20): StockData[] {
  let price = basePrices[symbol] || 100;
  const data: StockData[] = [];
  let lastTimestamp = Date.now() - (points - 1) * 60 * 1000;
  for (let i = 0; i < points; i++) {
    // Random walk for price
    const change = (Math.random() - 0.5) * 4; // -2 to +2
    price = Math.max(1, price + change);
    data.push({
      symbol,
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      timestamp: new Date(lastTimestamp + i * 60 * 1000).toISOString(),
    });
  }
  return data;
}

export const mockStockData: StockData[] = symbols.flatMap(symbol => generateTimeSeries(symbol, 20));
