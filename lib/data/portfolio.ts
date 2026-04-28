import { PortfolioHolding, PortfolioSummary, PortfolioChartPoint } from '@/lib/types';

// ============================
// DEMO PORTFOLIO HOLDINGS
// ============================
export const DEMO_HOLDINGS: PortfolioHolding[] = [
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    shares: 45,
    avgCost: 198.50,
    currentPrice: 227.50,
    weight: 22.8,
    beta: 1.18,
    sector: 'Technology',
    dailyChange: 3.42,
    dailyChangePct: 1.53,
    totalReturn: 1305.00,
    totalReturnPct: 14.61,
    color: '#10b981',
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    shares: 30,
    avgCost: 155.20,
    currentPrice: 176.30,
    weight: 11.8,
    beta: 1.08,
    sector: 'Technology',
    dailyChange: -1.87,
    dailyChangePct: -1.05,
    totalReturn: 633.00,
    totalReturnPct: 13.59,
    color: '#3b82f6',
  },
  {
    ticker: 'TSLA',
    name: 'Tesla Inc.',
    shares: 20,
    avgCost: 215.80,
    currentPrice: 248.40,
    weight: 11.1,
    beta: 1.95,
    sector: 'Automotive',
    dailyChange: 7.65,
    dailyChangePct: 3.18,
    totalReturn: 652.00,
    totalReturnPct: 15.11,
    color: '#f43f5e',
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corp.',
    shares: 15,
    avgCost: 390.40,
    currentPrice: 435.20,
    weight: 14.5,
    beta: 0.92,
    sector: 'Technology',
    dailyChange: 2.15,
    dailyChangePct: 0.50,
    totalReturn: 672.00,
    totalReturnPct: 11.47,
    color: '#8b5cf6',
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.com Inc.',
    shares: 25,
    avgCost: 178.90,
    currentPrice: 198.60,
    weight: 11.1,
    beta: 1.22,
    sector: 'Consumer',
    dailyChange: -0.94,
    dailyChangePct: -0.47,
    totalReturn: 492.50,
    totalReturnPct: 11.01,
    color: '#f59e0b',
  },
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corp.',
    shares: 110,
    avgCost: 98.50,
    currentPrice: 117.80,
    weight: 28.8,
    beta: 1.72,
    sector: 'Semiconductors',
    dailyChange: 4.28,
    dailyChangePct: 3.77,
    totalReturn: 2123.00,
    totalReturnPct: 19.59,
    color: '#06b6d4',
  },
];

// ============================
// COMPUTE PORTFOLIO SUMMARY
// ============================
export function getPortfolioSummary(): PortfolioSummary {
  const totalValue = DEMO_HOLDINGS.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);
  const totalCost = DEMO_HOLDINGS.reduce((sum, h) => sum + h.avgCost * h.shares, 0);
  const dailyChange = DEMO_HOLDINGS.reduce((sum, h) => sum + h.dailyChange * h.shares, 0);
  return {
    totalValue,
    totalCost,
    dailyChange,
    dailyChangePct: (dailyChange / (totalValue - dailyChange)) * 100,
    totalReturn: totalValue - totalCost,
    totalReturnPct: ((totalValue - totalCost) / totalCost) * 100,
  };
}

// ============================
// GENERATE 30-DAY CHART DATA
// ============================
export function getPortfolioChartData(): PortfolioChartPoint[] {
  const summary = getPortfolioSummary();
  const baseValue = summary.totalValue;
  const points: PortfolioChartPoint[] = [];

  // Generate 30 days of simulated portfolio value
  // Work backward from current value
  let value = baseValue * 0.94; // Start ~6% lower 30 days ago

  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Gradually trend upward with some noise
    const progress = (30 - i) / 30;
    const noise = (Math.sin(i * 2.7) * 0.008 + Math.cos(i * 1.3) * 0.005);
    const trend = progress * 0.06; // ~6% total gain
    value = baseValue * (0.94 + trend + noise);

    points.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Number(value.toFixed(2)),
      change: Number(((value / (baseValue * 0.94) - 1) * 100).toFixed(2)),
    });
  }

  return points;
}
