// ============================
// STOCK DATA TYPES
// ============================
export interface StockDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockAnalysis {
  ticker: string;
  name: string;
  currentPrice: number;
  priceHistory: StockDataPoint[];
  metrics: {
    returnPct: number;         // 30-day return percentage
    volatility: number;        // Annualized volatility
    beta: number;              // Beta vs S&P 500
    maxDrawdown: number;       // Maximum drawdown in period
    sharpeApprox: number;      // Approximate Sharpe ratio
    avgVolume: number;         // Average daily volume
    priceRange: {
      high: number;
      low: number;
    };
  };
  marketContext: {
    sp500ReturnPct: number;
    sp500Volatility: number;
    marketTrend: 'bullish' | 'bearish' | 'neutral';
  };
}

// ============================
// PORTFOLIO TYPES
// ============================
export interface PortfolioHolding {
  ticker: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  weight: number;
  beta: number;
  sector: string;
  dailyChange: number;
  dailyChangePct: number;
  totalReturn: number;
  totalReturnPct: number;
  color: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  dailyChange: number;
  dailyChangePct: number;
  totalReturn: number;
  totalReturnPct: number;
}

export interface PortfolioChartPoint {
  date: string;
  value: number;
  change: number;
}

// ============================
// INSIGHT TYPES
// ============================
export interface InsightResponse {
  headline: string;
  explanation: string;
  literacyCard: {
    title: string;
    content: string;
  };
  ticker: string;
  generatedAt: string;
  metrics: {
    returnPct: number;
    volatility: number;
    beta: number;
    maxDrawdown: number;
  };
  chartData: StockDataPoint[];
}
