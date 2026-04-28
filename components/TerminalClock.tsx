'use client';

import React, { useState, useEffect } from 'react';

export default function TerminalClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    // Set initial time on mount to avoid hydration mismatch
    const updateTime = () => {
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0];
      setTime(`${date} ${timeStr}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  // Return a placeholder or null during SSR to match server rendering
  if (!time) return <div className="text-xs text-zinc-800 animate-pulse">0000-00-00 00:00:00</div>;

  return (
    <div className="text-xs text-zinc-400 tabular-nums">
      {time}
    </div>
  );
}
