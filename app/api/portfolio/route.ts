import { DEMO_HOLDINGS, getPortfolioSummary, getPortfolioChartData } from '@/lib/data/portfolio';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const holdings = DEMO_HOLDINGS;
    const summary = getPortfolioSummary();
    const chartData = getPortfolioChartData();

    return Response.json({
      holdings,
      summary,
      chartData,
    });
  } catch (error) {
    console.error('[FinSight] /api/portfolio error:', error);
    return Response.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    );
  }
}
