import { StockDataPoint, StockAnalysis } from '@/lib/types';

// ============================
// TICKER-SPECIFIC PARAMETERS
// Realistic baseline behaviors per stock
// ============================
const TICKER_PARAMS: Record<string, {
  basePrice: number;
  dailyVol: number;    // daily volatility (std dev)
  drift: number;       // daily drift (mean return)
  beta: number;
  avgVolume: number;
}> = {
  AAPL: { basePrice: 227.50, dailyVol: 0.014, drift: 0.0004, beta: 1.18, avgVolume: 54_200_000 },
  GOOGL: { basePrice: 176.30, dailyVol: 0.016, drift: 0.0003, beta: 1.08, avgVolume: 26_800_000 },
  TSLA: { basePrice: 248.40, dailyVol: 0.032, drift: 0.0006, beta: 1.95, avgVolume: 98_500_000 },
  MSFT: { basePrice: 435.20, dailyVol: 0.013, drift: 0.0004, beta: 0.92, avgVolume: 21_100_000 },
  AMZN: { basePrice: 198.60, dailyVol: 0.018, drift: 0.0005, beta: 1.22, avgVolume: 45_300_000 },
  NVDA: { basePrice: 117.80, dailyVol: 0.028, drift: 0.0008, beta: 1.72, avgVolume: 312_000_000 },
};

const SP500_PARAMS = { basePrice: 5850, dailyVol: 0.009, drift: 0.0003 };

// ============================
// SEEDED RANDOM (deterministic per ticker + date)
// ============================
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Box-Muller transform for normal distribution
function normalRandom(seed1: number, seed2: number): number {
  const u1 = seededRandom(seed1) || 0.001;
  const u2 = seededRandom(seed2);
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// ============================
// GENERATE SIMULATED PRICE HISTORY
// Uses Geometric Brownian Motion
// ============================
function generatePriceHistory(
  ticker: string,
  days: number = 30
): StockDataPoint[] {
  const params = TICKER_PARAMS[ticker] || {
    basePrice: 100,
    dailyVol: 0.02,
    drift: 0.0003,
    beta: 1.0,
    avgVolume: 10_000_000,
  };

  const baseSeed = hashString(ticker);
  // Use a date-based component so data shifts slightly each day
  const dateSeed = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const combinedSeed = baseSeed + dateSeed;

  const history: StockDataPoint[] = [];
  let price = params.basePrice;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Skip weekends
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const seed = combinedSeed + i * 137;
    const z = normalRandom(seed, seed + 7919);

    // GBM: S(t+1) = S(t) * exp((μ - σ²/2)Δt + σ√Δt * Z)
    const dailyReturn = params.drift - (params.dailyVol ** 2) / 2 + params.dailyVol * z;
    price = price * Math.exp(dailyReturn);

    // Generate OHLCV
    const intraVol = params.dailyVol * 0.4;
    const open = price * (1 + intraVol * normalRandom(seed + 1, seed + 2) * 0.3);
    const high = Math.max(price, open) * (1 + Math.abs(normalRandom(seed + 3, seed + 4)) * intraVol * 0.5);
    const low = Math.min(price, open) * (1 - Math.abs(normalRandom(seed + 5, seed + 6)) * intraVol * 0.5);
    const volumeMultiplier = 0.7 + seededRandom(seed + 7) * 0.6;

    history.push({
      date: date.toISOString().split('T')[0],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(price.toFixed(2)),
      volume: Math.round(params.avgVolume * volumeMultiplier),
    });
  }

  return history;
}

// ============================
// GENERATE S&P 500 BENCHMARK DATA
// ============================
function generateSP500History(days: number = 30): StockDataPoint[] {
  const baseSeed = hashString('SP500');
  const dateSeed = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const combinedSeed = baseSeed + dateSeed;

  const history: StockDataPoint[] = [];
  let price = SP500_PARAMS.basePrice;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const seed = combinedSeed + i * 137;
    const z = normalRandom(seed, seed + 7919);
    const dailyReturn = SP500_PARAMS.drift - (SP500_PARAMS.dailyVol ** 2) / 2 + SP500_PARAMS.dailyVol * z;
    price = price * Math.exp(dailyReturn);

    history.push({
      date: date.toISOString().split('T')[0],
      open: Number(price.toFixed(2)),
      high: Number((price * 1.003).toFixed(2)),
      low: Number((price * 0.997).toFixed(2)),
      close: Number(price.toFixed(2)),
      volume: Math.round(3_500_000_000 * (0.8 + seededRandom(seed + 10) * 0.4)),
    });
  }

  return history;
}

// ============================
// COMPUTE METRICS
// ============================
function computeMetrics(history: StockDataPoint[], sp500History: StockDataPoint[]): StockAnalysis['metrics'] {
  if (history.length < 2) {
    return {
      returnPct: 0,
      volatility: 0,
      beta: 1,
      maxDrawdown: 0,
      sharpeApprox: 0,
      avgVolume: 0,
      priceRange: { high: 0, low: 0 },
    };
  }

  // Daily returns
  const returns: number[] = [];
  for (let i = 1; i < history.length; i++) {
    returns.push((history[i].close - history[i - 1].close) / history[i - 1].close);
  }

  // S&P 500 returns
  const sp500Returns: number[] = [];
  for (let i = 1; i < sp500History.length; i++) {
    sp500Returns.push((sp500History[i].close - sp500History[i - 1].close) / sp500History[i - 1].close);
  }

  // 30-day return
  const firstPrice = history[0].close;
  const lastPrice = history[history.length - 1].close;
  const returnPct = ((lastPrice - firstPrice) / firstPrice) * 100;

  // Annualized volatility
  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + (r - meanReturn) ** 2, 0) / (returns.length - 1);
  const dailyVolatility = Math.sqrt(variance);
  const volatility = dailyVolatility * Math.sqrt(252) * 100; // Annualized percentage

  // Beta (covariance / variance of market)
  const minLen = Math.min(returns.length, sp500Returns.length);
  const stockR = returns.slice(0, minLen);
  const marketR = sp500Returns.slice(0, minLen);
  const marketMean = marketR.reduce((a, b) => a + b, 0) / marketR.length;
  const stockMean = stockR.reduce((a, b) => a + b, 0) / stockR.length;

  let covariance = 0;
  let marketVariance = 0;
  for (let i = 0; i < minLen; i++) {
    covariance += (stockR[i] - stockMean) * (marketR[i] - marketMean);
    marketVariance += (marketR[i] - marketMean) ** 2;
  }
  covariance /= minLen - 1;
  marketVariance /= minLen - 1;
  const beta = marketVariance > 0 ? covariance / marketVariance : 1;

  // Max drawdown
  let peak = history[0].close;
  let maxDrawdown = 0;
  for (const point of history) {
    if (point.close > peak) peak = point.close;
    const drawdown = ((peak - point.close) / peak) * 100;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  // Approximate Sharpe (using 5% risk-free rate)
  const annualizedReturn = meanReturn * 252;
  const annualizedVol = dailyVolatility * Math.sqrt(252);
  const sharpeApprox = annualizedVol > 0 ? (annualizedReturn - 0.05) / annualizedVol : 0;

  // Average volume
  const avgVolume = history.reduce((sum, p) => sum + p.volume, 0) / history.length;

  // Price range
  const highs = history.map(p => p.high);
  const lows = history.map(p => p.low);

  return {
    returnPct: Number(returnPct.toFixed(2)),
    volatility: Number(volatility.toFixed(2)),
    beta: Number(beta.toFixed(2)),
    maxDrawdown: Number(maxDrawdown.toFixed(2)),
    sharpeApprox: Number(sharpeApprox.toFixed(2)),
    avgVolume: Math.round(avgVolume),
    priceRange: {
      high: Math.max(...highs),
      low: Math.min(...lows),
    },
  };
}

// ============================
// MAIN: GET STOCK ANALYSIS
// ============================
export async function getStockAnalysis(ticker: string): Promise<StockAnalysis> {
  const upperTicker = ticker.toUpperCase();
  const params = TICKER_PARAMS[upperTicker];
  const name = TICKER_NAMES[upperTicker] || upperTicker;

  const priceHistory = generatePriceHistory(upperTicker, 30);
  const sp500History = generateSP500History(30);
  const metrics = computeMetrics(priceHistory, sp500History);

  // S&P 500 metrics for context
  const sp500Metrics = computeMetrics(sp500History, sp500History);

  return {
    ticker: upperTicker,
    name,
    currentPrice: priceHistory[priceHistory.length - 1]?.close || params?.basePrice || 100,
    priceHistory,
    metrics,
    marketContext: {
      sp500ReturnPct: sp500Metrics.returnPct,
      sp500Volatility: sp500Metrics.volatility,
      marketTrend: sp500Metrics.returnPct > 1 ? 'bullish' : sp500Metrics.returnPct < -1 ? 'bearish' : 'neutral',
    },
  };
}

// ============================
// TICKER DISPLAY NAMES
// ============================
const TICKER_NAMES: Record<string, string> = {
  AAPL: 'Apple Inc.',
  GOOGL: 'Alphabet Inc.',
  TSLA: 'Tesla Inc.',
  MSFT: 'Microsoft Corp.',
  AMZN: 'Amazon.com Inc.',
  NVDA: 'NVIDIA Corp.',
};

export { TICKER_PARAMS, TICKER_NAMES };
