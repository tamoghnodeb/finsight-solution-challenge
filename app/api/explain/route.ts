import { getStockAnalysis } from '@/lib/stockData';
import { generateInsight } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticker } = body;

    if (!ticker || typeof ticker !== 'string') {
      return Response.json(
        { error: 'Missing or invalid ticker parameter' },
        { status: 400 }
      );
    }

    // Step 1: Fetch/simulate stock data (backend computes the math)
    const analysis = await getStockAnalysis(ticker);

    // Step 2: Pass pre-computed data to Gemini (it only synthesizes narrative)
    const insight = await generateInsight(analysis);

    return Response.json({
      ...insight,
      chartData: analysis.priceHistory
    });
  } catch (error) {
    console.error('[FinSight] /api/explain error:', error);
    return Response.json(
      { error: 'Failed to generate insight' },
      { status: 500 }
    );
  }
}
