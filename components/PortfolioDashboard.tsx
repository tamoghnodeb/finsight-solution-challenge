'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Activity, Database, Cpu, Lock, ChevronRight, AlertTriangle } from 'lucide-react';
import PerformanceChart from '@/components/PerformanceChart';
import HoldingCard from '@/components/HoldingCard';
import InsightPanel from '@/components/InsightPanel';
import LoadingPulse from '@/components/LoadingPulse';
import TerminalClock from '@/components/TerminalClock';
import { PortfolioHolding, PortfolioSummary, PortfolioChartPoint, InsightResponse } from '@/lib/types';

export default function PortfolioDashboard() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [chartData, setChartData] = useState<PortfolioChartPoint[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [insight, setInsight] = useState<InsightResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const res = await fetch('/api/portfolio');
        const data = await res.json();
        setHoldings(data.holdings);
        setSummary(data.summary);
        setChartData(data.chartData);
      } catch (err) {
        console.error('Failed to fetch portfolio:', err);
      } finally {
        setPageLoading(false);
      }
    }
    fetchPortfolio();
  }, []);

  const handleHoldingClick = useCallback(async (ticker: string) => {
    if (selectedTicker === ticker && insight) {
      setSelectedTicker(null);
      setInsight(null);
      return;
    }

    setSelectedTicker(ticker);
    setInsight(null);
    setLoading(true);

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker }),
      });
      const data = await res.json();
      setInsight(data);
    } catch (err) {
      console.error('Failed to fetch insight:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedTicker, insight]);

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono">
        <motion.div
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-emerald-500 text-sm mb-4"
        >
          &gt; INITIALIZING_SYSTEM_CORE...
        </motion.div>
        <div className="w-48 h-1 bg-zinc-900 overflow-hidden">
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-full h-full bg-emerald-500"
          />
        </div>
      </div>
    );
  }

  const isPositiveDay = summary && summary.dailyChangePct >= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-mono">
      {/* ============================
          SYSTEM HEADER
         ============================ */}
      <div className="mb-8 border-b border-zinc-800 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 mb-1">
            <Terminal className="w-5 h-5" />
            <span className="text-xl font-black tracking-tighter">FINSIGHT_OS_v1.0</span>
          </div>
          <div className="text-[10px] text-zinc-500 flex items-center gap-4">
            <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> SYS_STABLE</span>
            <span className="flex items-center gap-1"><Database className="w-3 h-3" /> DB_CONNECTED</span>
            <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> AI_READY</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-[10px] text-zinc-600 uppercase mb-1">Local Time</div>
          <TerminalClock />
        </div>
      </div>

      {/* ============================
          SUMMARY TERMINAL
         ============================ */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <SummaryTerminal 
          label="NET_LIQUIDITY" 
          value={`$${summary?.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          sub="TOTAL_PORTFOLIO_VALUE"
        />
        <SummaryTerminal 
          label="DAILY_DELTA" 
          value={`${isPositiveDay ? '+' : ''}${summary?.dailyChangePct.toFixed(2)}%`}
          sub={`$${summary?.dailyChange.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          variant={isPositiveDay ? 'success' : 'error'}
        />
        <SummaryTerminal 
          label="TOTAL_YIELD" 
          value={`${summary?.totalReturnPct >= 0 ? '+' : ''}${summary?.totalReturnPct.toFixed(2)}%`}
          sub={`$${summary?.totalReturn.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          variant={summary?.totalReturnPct >= 0 ? 'success' : 'error'}
        />
        <SummaryTerminal 
          label="ASSET_COUNT" 
          value={`${holdings.length}`}
          sub="ACTIVE_POSITIONS"
        />
      </div>

      {/* ============================
          MAIN WORKSPACE
         ============================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Analysis & Data */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Visualizer */}
          {insight && insight.chartData ? (
            <PerformanceChart 
              data={insight.chartData} 
              title={`DATAFEED_${insight.ticker}`}
              subtitle="TICK_HISTORY_30D"
              dataKey="close"
              yAxisFormatter={(v) => `$${v.toFixed(0)}`}
            />
          ) : (
            chartData.length > 0 && <PerformanceChart data={chartData} />
          )}

          {/* Positions Table */}
          <div className="terminal-box">
            <div className="terminal-header">
              <span>ACTIVE_POSITIONS</span>
              <span>COUNT: {holdings.length}</span>
            </div>
            <div className="terminal-content p-0">
              <div className="grid grid-cols-1 sm:grid-cols-2">
                {holdings.map((holding, index) => (
                  <HoldingTerminal 
                    key={holding.ticker}
                    holding={holding}
                    isSelected={selectedTicker === holding.ticker}
                    onClick={() => handleHoldingClick(holding.ticker)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Core */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-8">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div key="loading">
                  <LoadingPulse />
                </motion.div>
              )}
              {!loading && insight && (
                <motion.div key="insight">
                  <InsightPanel
                    insight={insight}
                    onClose={() => {
                      setSelectedTicker(null);
                      setInsight(null);
                    }}
                  />
                </motion.div>
              )}
              {!loading && !insight && (
                <div className="terminal-box border-dashed border-zinc-800 p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 border border-zinc-800 mb-6 bg-zinc-900/30">
                    <Lock className="w-6 h-6 text-zinc-700" />
                  </div>
                  <h3 className="text-zinc-400 font-bold mb-2 uppercase text-sm tracking-widest">Core_Locked</h3>
                  <p className="text-zinc-600 text-[10px] uppercase leading-relaxed max-w-[240px] mx-auto">
                    Awaiting input signal. Select an asset from the datastream to initialize the Gemini Analysis Engine.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer System Log */}
      <div className="mt-12 pt-4 border-t border-zinc-900 text-[10px] text-zinc-700 flex justify-between">
        <span>LOG_TRACE: {new Date().toISOString()} | SYSTEM_ID: 0x4AE861F5</span>
        <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> NO_ADVICE_POLICY_ENFORCED</span>
      </div>
    </div>
  );
}

function SummaryTerminal({ label, value, sub, variant = 'neutral' }: { 
  label: string; 
  value: string; 
  sub: string;
  variant?: 'neutral' | 'success' | 'error';
}) {
  const color = variant === 'success' ? 'text-emerald-500' : variant === 'error' ? 'text-red-500' : 'text-emerald-500';
  const border = variant === 'success' ? 'border-emerald-900/30' : variant === 'error' ? 'border-red-900/30' : 'border-zinc-800';

  return (
    <div className={`terminal-box ${border} p-4`}>
      <div className="text-[10px] text-zinc-600 mb-1 uppercase tracking-widest">{label}</div>
      <div className={`text-xl font-black ${color} mb-1 tracking-tighter`}>{value}</div>
      <div className="text-[10px] text-zinc-700 font-bold">{sub}</div>
    </div>
  );
}

function HoldingTerminal({ holding, isSelected, onClick }: { 
  holding: PortfolioHolding; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  const isPositive = holding.dailyChangePct >= 0;
  
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-between p-4 border-b border-zinc-900 hover:bg-emerald-500/5 transition-all text-left group
        ${isSelected ? 'bg-emerald-500/10 border-l-2 border-l-emerald-500' : 'border-l-2 border-l-transparent'}
      `}
    >
      <div className="flex items-center gap-3">
        <div className="text-xs font-black text-zinc-400 w-12">{holding.ticker}</div>
        <div>
          <div className="text-[10px] text-zinc-600 uppercase mb-0.5">{holding.name}</div>
          <div className="text-[9px] text-zinc-700">{holding.sector}</div>
        </div>
      </div>
      <div className="text-right flex items-center gap-4">
        <div>
          <div className="text-xs font-bold text-zinc-300">${holding.currentPrice.toFixed(2)}</div>
          <div className={`text-[10px] font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(holding.dailyChangePct).toFixed(2)}%
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 transition-all ${isSelected ? 'text-emerald-500 translate-x-1' : 'text-zinc-800 group-hover:text-zinc-600'}`} />
      </div>
    </button>
  );
}
