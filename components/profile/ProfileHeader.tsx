"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ProfileHeaderProps {
  walletAddress: string;
  joinDate: string;
  rank?: number;  // Optional rank if user is in top leaderboard
}

export default function ProfileHeader({ walletAddress, joinDate, rank }: ProfileHeaderProps) {
  const [isCopied, setIsCopied] = useState(false);
  
  // Format join date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
  };
  
  // Handle wallet address copy
  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  // Shorten wallet address for display
  const shortenAddress = (address: string) => {
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };
  
  return (
    <motion.div 
      className="bg-[#151518] rounded-lg border border-white/10 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between">
        <div className="flex flex-col sm:flex-row items-center">
          {/* Profile avatar - using a gradient placeholder */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#5F6FFF] to-[#13ADC7] flex items-center justify-center text-2xl font-bold mb-4 sm:mb-0">
            {walletAddress.substring(0, 2)}
          </div>
          
          <div className="sm:ml-5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start">
              <h2 className="text-xl font-bold">
                {shortenAddress(walletAddress)}
              </h2>
              
              <motion.button
                onClick={copyAddress}
                className="ml-2 text-[#B0B0B0] hover:text-[#5F6FFF] transition-colors p-1"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isCopied ? (
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                )}
              </motion.button>
            </div>
            
            <p className="text-[#B0B0B0] mt-1">Member since {formatDate(joinDate)}</p>
          </div>
        </div>
        
        {/* Display badge for top leaderboard users */}
        {rank && rank <= 10 && (
          <motion.div 
            className="mt-4 sm:mt-0 bg-[#1C1C22] rounded-full px-4 py-2 flex items-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="relative">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7]">
                #{rank}
              </span>
              <motion.div 
                className="absolute -inset-2 rounded-full z-[-1] opacity-20 bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7]"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            </div>
            
            <div className="ml-2 font-medium">Top Predictor</div>
            
            {rank <= 3 && (
              <motion.div 
                className="ml-2 text-2xl"
                animate={{ 
                  rotate: [-5, 5, -5],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}