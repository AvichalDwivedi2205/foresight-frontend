"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface StatsPanelProps {
  poolSize: string;
  stakerCount: number;
  timeLeft?: string; // Optional for resolved markets
  outcomes: {
    yes: number;
    no: number;
  };
}

export default function StatsPanel({ poolSize, stakerCount, timeLeft, outcomes }: StatsPanelProps) {
  // For animated countdown timer
  const [countdown, setCountdown] = useState(timeLeft || "");
  
  // Simulate a counting timer if timeLeft is present
  useEffect(() => {
    if (!timeLeft) return;
    
    const interval = setInterval(() => {
      // This is just for effect - in real app we'd actually compute time difference
      if (timeLeft.includes("3d 8h")) {
        setCountdown("3d 7h 59m");
      } else if (timeLeft.includes("3d 7h")) {
        setCountdown("3d 7h 58m");
      } else {
        setCountdown(timeLeft);
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [timeLeft]);
  
  return (
    <motion.div 
      className="bg-[#1C1C22] p-6 rounded-xl border border-white/5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Market Stats</h3>
        
        {timeLeft && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-[#5F6FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <motion.span 
              key={countdown}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-medium text-[#F5F5F5]"
            >
              {countdown} remaining
            </motion.span>
          </div>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <div>Yes: {outcomes.yes}%</div>
          <div>No: {outcomes.no}%</div>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full mb-1 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${outcomes.yes}%` }}
            transition={{ duration: 1, delay: 0.2 }}
          ></motion.div>
        </div>
      </div>
      
      {/* Key stats in grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0E0E10] p-4 rounded-lg">
          <div className="text-sm text-[#B0B0B0] mb-1">Pool Size</div>
          <div className="text-xl font-bold">{poolSize}</div>
        </div>
        
        <div className="bg-[#0E0E10] p-4 rounded-lg">
          <div className="text-sm text-[#B0B0B0] mb-1">Participants</div>
          <div className="text-xl font-bold">{stakerCount.toLocaleString()}</div>
        </div>
        
        <div className="bg-[#0E0E10] p-4 rounded-lg">
          <div className="text-sm text-[#B0B0B0] mb-1">Average Stake</div>
          <div className="text-xl font-bold">
            {/* This would be calculated from actual data */}
            {(parseInt(poolSize.replace(/[^0-9]/g, '')) / stakerCount).toFixed(1)}K SOL
          </div>
        </div>
      </div>
    </motion.div>
  );
}