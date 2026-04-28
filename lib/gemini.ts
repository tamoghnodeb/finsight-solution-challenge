import { GoogleGenAI } from '@google/genai';
import { StockAnalysis, InsightResponse } from '@/lib/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let genAI: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  if (!GEMINI_API_KEY) return null;
  if (!genAI) genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  return genAI;
}

const SYSTEM_PROMPT = `You are FinSight AI — a financial literacy educator for retail investors.

ABSOLUTE RULES:
1. NEVER recommend buying, selling, or holding any security.
2. NEVER give investment advice of any kind.
3. NEVER predict future price movements.
4. ONLY explain what the data shows and teach financial concepts.
5. Always remind users to consult a licensed financial advisor.

Respond with valid JSON only:
{
  "headline": "8-15 word summary of 30-day performance",
  "explanation": "3-4 paragraph plain-language explanation. No advice. Focus on education.",
  "literacyCard": {
    "title": "Name of one relevant financial concept",
    "content": "2-3 sentence educational explanation using the stock's data as example."
  }
}

Return ONLY the JSON object. No markdown, no code fences.`;

export async function generateInsight(analysis: StockAnalysis): Promise<InsightResponse> {
  const client = getClient();
  if (!client) {
    console.log('[FinSight] No GEMINI_API_KEY — using mock insight.');
    return generateMockInsight(analysis);
  }

  try {
    const userPrompt = `Analyze 30-day data for ${analysis.name} (${analysis.ticker}):
- Current Price: $${analysis.currentPrice.toFixed(2)}
- 30-Day Return: ${analysis.metrics.returnPct}%
- Volatility: ${analysis.metrics.volatility}%
- Beta: ${analysis.metrics.beta}
- Max Drawdown: ${analysis.metrics.maxDrawdown}%
- Sharpe Ratio: ${analysis.metrics.sharpeApprox}
- Range: $${analysis.metrics.priceRange.low.toFixed(2)} — $${analysis.metrics.priceRange.high.toFixed(2)}
- Avg Volume: ${(analysis.metrics.avgVolume / 1e6).toFixed(1)}M

Market: S&P 500 returned ${analysis.marketContext.sp500ReturnPct}%, volatility ${analysis.marketContext.sp500Volatility}%, trend: ${analysis.marketContext.marketTrend}.

Explain educationally. NO investment advice.`;

    const response = await client.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    let text = (response.text ?? '').trim();
    if (text.startsWith('```json')) text = text.slice(7);
    if (text.startsWith('```')) text = text.slice(3);
    if (text.endsWith('```')) text = text.slice(0, -3);
    text = text.trim();

    const parsed = JSON.parse(text);
    return {
      headline: parsed.headline || 'Market Analysis Complete',
      explanation: parsed.explanation || 'Analysis processed.',
      literacyCard: {
        title: parsed.literacyCard?.title || 'Financial Concept',
        content: parsed.literacyCard?.content || 'Understanding metrics helps investors.',
      },
      ticker: analysis.ticker,
      generatedAt: new Date().toISOString(),
      metrics: {
        returnPct: analysis.metrics.returnPct,
        volatility: analysis.metrics.volatility,
        beta: analysis.metrics.beta,
        maxDrawdown: analysis.metrics.maxDrawdown,
      },
    };
  } catch (error) {
    console.error('[FinSight] Gemini error:', error);
    return generateMockInsight(analysis);
  }
}

function generateMockInsight(analysis: StockAnalysis): InsightResponse {
  const { ticker, name, metrics, marketContext } = analysis;
  const dir = metrics.returnPct >= 0 ? 'gained' : 'declined';
  const abs = Math.abs(metrics.returnPct);
  const vs = metrics.returnPct > marketContext.sp500ReturnPct ? 'outperformed' : 'underperformed';

  let litTitle: string, litContent: string;
  if (metrics.beta > 1.5) {
    litTitle = 'Understanding Beta';
    litContent = `Beta measures how much a stock moves relative to the market. ${ticker} has a beta of ${metrics.beta}, meaning it moves ~${(metrics.beta * 100 - 100).toFixed(0)}% more than the S&P 500. Higher beta = higher potential returns but also higher risk.`;
  } else if (metrics.volatility > 30) {
    litTitle = 'What is Volatility?';
    litContent = `Volatility measures price variation over time. ${ticker}'s annualized volatility of ${metrics.volatility}% vs the S&P 500's ${marketContext.sp500Volatility}% means more price uncertainty. Higher volatility doesn't always mean more risk — it means more short-term unpredictability.`;
  } else if (metrics.maxDrawdown > 5) {
    litTitle = 'What is Maximum Drawdown?';
    litContent = `Maximum drawdown is the largest peak-to-trough decline. ${ticker} saw a ${metrics.maxDrawdown}% drawdown over 30 days. This helps investors understand the worst-case scenario and is a key measure of downside risk.`;
  } else {
    litTitle = 'The Sharpe Ratio Explained';
    litContent = `The Sharpe ratio measures risk-adjusted returns. ${ticker}'s ratio of ${metrics.sharpeApprox} ${metrics.sharpeApprox > 1 ? 'suggests strong' : metrics.sharpeApprox > 0 ? 'suggests positive' : 'reflects negative'} risk-adjusted performance. Above 1 is good, above 2 is excellent.`;
  }

  return {
    headline: `${name} ${dir} ${abs.toFixed(1)}% over 30 days amid ${marketContext.marketTrend} markets`,
    explanation: `Over the past 30 trading days, ${name} (${ticker}) has ${dir} by ${abs.toFixed(2)}%, ${dir === 'gained' ? 'rising' : 'falling'} to $${analysis.currentPrice.toFixed(2)}. The S&P 500 returned ${marketContext.sp500ReturnPct}%, so ${ticker} ${vs} the broader market.\n\nThe stock showed ${metrics.volatility}% annualized volatility (${metrics.volatility > marketContext.sp500Volatility ? 'above' : 'below'} the S&P 500's ${marketContext.sp500Volatility}%). Maximum drawdown was ${metrics.maxDrawdown}%, and beta of ${metrics.beta} indicates ${metrics.beta > 1 ? 'amplified' : 'dampened'} market sensitivity.\n\nAverage volume was ${(metrics.avgVolume / 1e6).toFixed(1)}M shares/day, trading between $${metrics.priceRange.low.toFixed(2)} and $${metrics.priceRange.high.toFixed(2)}. The Sharpe ratio of ${metrics.sharpeApprox} reflects ${metrics.sharpeApprox > 0 ? 'positive' : 'negative'} risk-adjusted returns.\n\nThis is educational only. Past performance doesn't guarantee future results. Consult a licensed financial advisor for investment decisions.`,
    literacyCard: { title: litTitle, content: litContent },
    ticker,
    generatedAt: new Date().toISOString(),
    metrics: {
      returnPct: metrics.returnPct,
      volatility: metrics.volatility,
      beta: metrics.beta,
      maxDrawdown: metrics.maxDrawdown,
    },
  };
}
