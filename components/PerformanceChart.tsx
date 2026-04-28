'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PerformanceChartProps {
  data: any[];
  title?: string;
  subtitle?: string;
  dataKey?: string;
  yAxisFormatter?: (v: number) => string;
}

function CustomTooltip({
  active,
  payload,
  label,
  dataKey = 'value',
  allData = [],
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  dataKey?: string;
  allData?: any[];
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  const firstVal = allData[0]?.[dataKey] || data.value;
  const periodReturn = ((data.value - firstVal) / firstVal) * 100;

  return (
    <div className="bg-black border border-zinc-800 p-2 font-mono text-[10px] uppercase">
      <p className="text-zinc-500 mb-1">[{label}]</p>
      <p className="text-emerald-400 font-bold">
        VAL: ${data.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
      <p className={periodReturn >= 0 ? 'text-emerald-500' : 'text-red-500'}>
        RET: {periodReturn >= 0 ? '+' : ''}{periodReturn.toFixed(2)}%
      </p>
    </div>
  );
}

export default function PerformanceChart({ 
  data, 
  title = "PORTFOLIO_PERFORMANCE", 
  subtitle = "SYSTEM_OVERVIEW",
  dataKey = "value",
  yAxisFormatter = (v: number) => `$${(v / 1000).toFixed(1)}K`
}: PerformanceChartProps) {
  const isPositive = data.length > 1 && data[data.length - 1][dataKey] >= data[0][dataKey];
  const accentColor = isPositive ? '#00ff41' : '#ff3e3e';

  const startVal = data[0]?.[dataKey] || 0;
  const endVal = data[data.length - 1]?.[dataKey] || 0;
  const totalChangePct = startVal !== 0 ? ((endVal - startVal) / startVal) * 100 : 0;

  return (
    <motion.div
      key={title}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="terminal-box border-zinc-800"
    >
      <div className="terminal-header bg-zinc-900/50">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 animate-pulse rounded-full" />
          {title}
        </span>
        <span className={totalChangePct >= 0 ? 'text-emerald-500' : 'text-red-500'}>
          {totalChangePct >= 0 ? 'STATUS: NOMINAL' : 'STATUS: DEGRADED'} [{totalChangePct >= 0 ? '+' : ''}{totalChangePct.toFixed(2)}%]
        </span>
      </div>

      <div className="terminal-content p-0">
        <div className="relative h-[300px] min-h-[300px] w-full pt-6 pr-4">
          <ResponsiveContainer width="99%" height="99%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="terminalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accentColor} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1a1a1a"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                axisLine={{ stroke: '#333' }}
                tickLine={{ stroke: '#333' }}
                tick={{ fontSize: 9, fill: '#666', fontFamily: 'var(--font-mono)' }}
                interval="preserveStartEnd"
                tickFormatter={(v) => {
                  if (v.includes('-')) {
                    const d = new Date(v);
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }
                  return v;
                }}
              />
              <YAxis
                axisLine={{ stroke: '#333' }}
                tickLine={{ stroke: '#333' }}
                tick={{ fontSize: 9, fill: '#666', fontFamily: 'var(--font-mono)' }}
                tickFormatter={yAxisFormatter}
                width={45}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                content={<CustomTooltip dataKey={dataKey} allData={data} />} 
                cursor={{ stroke: '#333', strokeWidth: 1 }}
              />
              <Area
                type="stepAfter"
                dataKey={dataKey}
                stroke={accentColor}
                strokeWidth={1}
                fill="url(#terminalGradient)"
                animationDuration={1000}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
