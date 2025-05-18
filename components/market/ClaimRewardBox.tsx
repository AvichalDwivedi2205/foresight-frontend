"use client";

import { useState } from "react";
import { motion  } from '@/components/motion';

interface ClaimRewardBoxProps {
  userHasWon: boolean;
  winningOutcome: string;
  rewardAmount: string;
}

export default function ClaimRewardBox({
  userHasWon,
  winningOutcome,
  rewardAmount,
}: ClaimRewardBoxProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);

  const handleClaim = () => {
    if (isClaimed) return;
    
    setIsClaiming(true);
    
    // Simulate transaction processing
    setTimeout(() => {
      setIsClaiming(false);
      setIsClaimed(true);
    }, 2000);
  };

  return (
    <motion.div
      className="bg-[#1C1C22] p-6 rounded-xl border border-white/5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center mb-6">
        <h3 className="text-xl font-bold">Market Resolved</h3>
        <span className={`ml-auto px-3 py-1 text-sm font-medium rounded-full ${
          winningOutcome === "Yes"
            ? "bg-green-500/20 text-green-400"
            : "bg-red-500/20 text-red-400"
        }`}>
          {winningOutcome} Won
        </span>
      </div>
      
      {userHasWon ? (
        <motion.div
          className="bg-gradient-to-r from-[#5F6FFF]/20 to-[#13ADC7]/20 p-5 rounded-xl mb-6 border border-[#5F6FFF]/30"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 10
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7] flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm mb-1">Congratulations!</p>
              <p className="text-xl font-bold">You predicted correctly</p>
            </div>
          </div>
          
          <div className="text-center mb-4">
            <p className="text-sm text-[#B0B0B0] mb-1">Your reward</p>
            <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7]">
              {rewardAmount}
            </p>
          </div>
          
          <motion.button
            className={`w-full py-3 rounded-full font-medium text-white flex items-center justify-center ${
              isClaimed
                ? "bg-green-500"
                : "bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7]"
            }`}
            whileHover={!isClaimed ? { scale: 1.02, boxShadow: "0 0 15px rgba(95, 111, 255, 0.5)" } : {}}
            whileTap={!isClaimed ? { scale: 0.98 } : {}}
            onClick={handleClaim}
            disabled={isClaiming || isClaimed}
          >
            {isClaiming ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : isClaimed ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Claimed Successfully
              </>
            ) : (
              "Claim Reward"
            )}
          </motion.button>
        </motion.div>
      ) : (
        <div className="text-center py-6">
          <div className="text-5xl mb-4">😢</div>
          <h4 className="text-lg font-medium mb-2">Better luck next time</h4>
          <p className="text-[#B0B0B0] text-sm mb-6">
            Your prediction wasn't correct for this market.
            <br />Try exploring other active markets.
          </p>
          
          <motion.a
            href="/markets"
            className="inline-block px-6 py-2 rounded-full border border-[#5F6FFF] text-[#5F6FFF] font-medium"
            whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(95, 111, 255, 0.3)" }}
            whileTap={{ scale: 0.98 }}
          >
            Explore Markets
          </motion.a>
        </div>
      )}
      
      <div className="mt-4 text-xs text-[#B0B0B0] text-center">
        Market resolved on April 10, 2025 • Validated by AI & Consensus
      </div>
    </motion.div>
  );
}