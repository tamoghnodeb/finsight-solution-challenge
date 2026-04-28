'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Cpu, BookOpen, Terminal, Share2, Activity, Info } from 'lucide-react';
import { InsightResponse } from '@/lib/types';

interface InsightPanelProps {
  insight: InsightResponse;
  onClose: () => void;
}

export default function InsightPanel({ insight, onClose }: InsightPanelProps) {
  const isPositive = insight.metrics.returnPct >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="terminal-box"
    >
      <div className="terminal-header">
        <span className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-500" />
          ANALYSIS_CORE :: {insight.ticker}
        </span>
        <button 
          onClick={onClose}
          className="hover:text-red-500 transition-colors"
        >
          [ESC]
        </button>
      </div>

      <div className="terminal-content p-6 space-y-6">
        {/* Status Line */}
        <div className="flex items-center gap-4 text-[10px] text-zinc-600 border-b border-zinc-900 pb-4">
          <span className="flex items-center gap-1"><Terminal className="w-3 h-3" /> GEN_ID: {Math.random().toString(16).slice(2, 10).toUpperCase()}</span>
          <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> CONFIDENCE: 98.4%</span>
          <span className="flex items-center gap-1"><Share2 className="w-3 h-3" /> FEED: LIVE</span>
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Processing_Result</div>
          <h3 className="text-emerald-500 font-black text-xl leading-tight uppercase tracking-tighter">
            {insight.headline}
          </h3>
        </div>

        {/* Technical Data Table */}
        <div className="grid grid-cols-2 gap-px bg-zinc-900 border border-zinc-900">
          <TechnicalPill label="30D_RET" value={`${isPositive ? '+' : ''}${insight.metrics.returnPct}%`} variant={isPositive ? 'success' : 'error'} />
          <TechnicalPill label="VOL_ANN" value={`${insight.metrics.volatility}%`} />
          <TechnicalPill label="BETA_IDX" value={`${insight.metrics.beta}`} />
          <TechnicalPill label="MAX_DD" value={`${insight.metrics.maxDrawdown}%`} variant="error" />
        </div>

        {/* Narrative Stream */}
        <div className="space-y-4">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Narrative_Stream</div>
          <div className="font-mono text-xs leading-relaxed text-zinc-400 space-y-4">
            {insight.explanation.split('\n').filter(Boolean).map((paragraph, i) => (
              <p key={i}>
                <span className="text-emerald-900 mr-2">&gt;</span>
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Literacy Module */}
        <div className="p-4 bg-zinc-950 border border-zinc-900">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-3 h-3 text-emerald-600" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Education_Module: {insight.literacyCard.title}</span>
          </div>
          <p className="text-[10px] text-zinc-500 leading-relaxed uppercase">
            {insight.literacyCard.content}
          </p>
        </div>

        {/* Disclaimer Block */}
        <div className="flex items-start gap-2 pt-4 border-t border-zinc-900">
          <Info className="w-3 h-3 text-zinc-700 shrink-0 mt-0.5" />
          <p className="text-[9px] text-zinc-700 leading-tight uppercase">
            Warning: The information provided is for educational purposes only. This system does not issue buy, sell, or hold commands. consult a certified biological advisor for fiscal strategy.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function TechnicalPill({ label, value, variant = 'neutral' }: { 
  label: string; 
  value: string; 
  variant?: 'neutral' | 'success' | 'error';
}) {
  const color = variant === 'success' ? 'text-emerald-500' : variant === 'error' ? 'text-red-500' : 'text-zinc-400';
  
  return (
    <div className="bg-black p-3">
      <div className="text-[9px] text-zinc-600 mb-0.5 uppercase">{label}</div>
      <div className={`text-sm font-bold ${color}`}>{value}</div>
    </div>
  );
}
