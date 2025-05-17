"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type ClaimRewardBoxProps = {
  userHasWon: boolean;
  winningOutcome: string;
  rewardAmount: string;
  onClaim: () => void;
  isLoading?: boolean;
};

export default function ClaimRewardBox({
  userHasWon,
  winningOutcome,
  rewardAmount,
  onClaim,
  isLoading = false
}: ClaimRewardBoxProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  
  // Disable confetti effect after 5 seconds
  if (showConfetti) {
    setTimeout(() => setShowConfetti(false), 5000);
  }

  return (
    <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700 relative overflow-hidden">
      {/* Confetti effect for winners */}
      {userHasWon && showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: getRandomColor(),
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              initial={{ y: -20, opacity: 0 }}
              animate={{ 
                y: Math.random() * 400,
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                rotate: Math.random() * 360
              }}
              transition={{ 
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatDelay: Math.random() * 2
              }}
            />
          ))}
        </div>
      )}
      
      <h3 className="text-xl font-semibold mb-3">
        {userHasWon ? "Congratulations! 🎉" : "Market Resolved"}
      </h3>
      
      <div className="mb-4">
        <p className="text-white/80 mb-2">
          {userHasWon 
            ? "Your prediction was correct! You can now claim your reward."
            : "This market has been resolved. You did not predict the winning outcome."
          }
        </p>
        <p className="font-medium text-lg">
          Winning outcome: <span className="text-green-400">{winningOutcome}</span>
        </p>
      </div>
      
      {userHasWon && (
        <>
          <div className="p-4 bg-green-900/30 border border-green-700/30 rounded-lg mb-5">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Your reward:</span>
              <span className="text-2xl font-bold text-green-400">{rewardAmount}</span>
            </div>
          </div>
          
          <button
            onClick={onClaim}
            disabled={isLoading}
            className={`w-full py-3 rounded-lg flex items-center justify-center font-medium transition-colors ${
              isLoading
                ? "bg-green-700/50 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Claiming Reward...
              </div>
            ) : (
              "Claim Reward"
            )}
          </button>
          
          <p className="mt-3 text-xs text-white/50 text-center">
            Claimed rewards will be sent to your connected wallet
          </p>
        </>
      )}
    </div>
  );
}

function getRandomColor() {
  const colors = [
    "#FF5E5B", // Red
    "#38B000", // Green
    "#3A86FF", // Blue
    "#FFBE0B", // Yellow
    "#FB5607", // Orange
    "#8338EC", // Purple
    "#FF006E", // Pink
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}