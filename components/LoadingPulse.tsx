'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingPulse() {
  return (
    <div className="terminal-box p-8 space-y-6">
      <div className="flex items-center gap-3">
        <span className="w-2 h-2 bg-emerald-500 animate-ping rounded-full" />
        <span className="text-[10px] font-bold text-emerald-500 tracking-[0.2em] uppercase">
          Synthesizing_Intelligence
        </span>
      </div>

      <div className="space-y-4 font-mono">
        <motion.div 
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="text-[10px] text-zinc-600"
        >
          &gt; ACCESSING_GEN_AI_CLUSTER... OK<br/>
          &gt; PARSING_MARKET_VECTORS... OK<br/>
          &gt; CALIBRATING_EDUCATIONAL_NARRATIVE... <span className="cursor-blink" />
        </motion.div>
        
        <div className="space-y-2 pt-4">
          <div className="h-2 bg-zinc-900 overflow-hidden">
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              transition={{ duration: 3, ease: "easeOut" }}
              className="w-full h-full bg-emerald-900/50"
            />
          </div>
          <div className="flex justify-between text-[8px] text-zinc-700 uppercase font-black">
            <span>Core_Sync</span>
            <span>94.2%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
