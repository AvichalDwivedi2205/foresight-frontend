"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion  } from '@/components/motion';
import LeaderboardBadge from './LeaderboardBadge';

interface LeaderboardUser {
  rank: number;
  walletAddress: string;
  accuracy: number;
  predictionsMade: number;
  winnings: number;
}

interface LeaderboardTableProps {
  data: LeaderboardUser[];
  isLoading: boolean;
  currentUserRank: number | null;
}

export default function LeaderboardTable({ 
  data, 
  isLoading,
  currentUserRank 
}: LeaderboardTableProps) {
  const [displayCount, setDisplayCount] = useState(20);
  
  // Shorten wallet address for display
  const shortenAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Show more results
  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 20, data.length));
  };
  
  // Is this row the current user?
  const isCurrentUser = (rank: number) => {
    return rank === currentUserRank;
  };
  
  // Create loading skeleton
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-[#1C1C22] rounded-lg overflow-hidden">
        <div className="py-4 px-6 border-b border-white/5 grid grid-cols-12 gap-4">
          <div className="col-span-1 h-6 bg-[#151518] rounded"></div>
          <div className="col-span-3 h-6 bg-[#151518] rounded"></div>
          <div className="col-span-2 h-6 bg-[#151518] rounded"></div>
          <div className="col-span-3 h-6 bg-[#151518] rounded"></div>
          <div className="col-span-3 h-6 bg-[#151518] rounded"></div>
        </div>
        
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={`skeleton-${i}`} 
            className="py-4 px-6 border-b border-white/5 grid grid-cols-12 gap-4"
          >
            <div className="col-span-1 h-6 bg-[#151518] rounded"></div>
            <div className="col-span-3 h-6 bg-[#151518] rounded"></div>
            <div className="col-span-2 h-6 bg-[#151518] rounded"></div>
            <div className="col-span-3 h-6 bg-[#151518] rounded"></div>
            <div className="col-span-3 h-6 bg-[#151518] rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <motion.div
      className="bg-[#151518] rounded-lg overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Table header */}
      <div className="py-4 px-6 border-b border-white/5 grid grid-cols-12 gap-4 bg-[#1C1C22] text-[#B0B0B0]">
        <div className="col-span-1 font-medium">Rank</div>
        <div className="col-span-3 font-medium">Predictor</div>
        <div className="col-span-2 font-medium">Accuracy</div>
        <div className="col-span-3 font-medium">Predictions</div>
        <div className="col-span-3 font-medium">Winnings</div>
      </div>
      
      {/* Table body */}
      <div>
        {data.slice(0, displayCount).map((user, index) => (
          <motion.div
            key={`${user.walletAddress}-${user.rank}`}
            className={`py-4 px-6 border-b border-white/5 grid grid-cols-12 gap-4 ${
              isCurrentUser(user.rank) ? 'bg-[#5F6FFF]/10' : 
              index % 2 === 0 ? 'bg-[#1C1C22]/30' : ''
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            whileHover={{ backgroundColor: isCurrentUser(user.rank) ? 'rgba(95, 111, 255, 0.15)' : 'rgba(28, 28, 34, 0.5)' }}
          >
            {/* Rank column */}
            <div className="col-span-1 flex items-center">
              {user.rank <= 3 ? (
                <LeaderboardBadge rank={user.rank} />
              ) : (
                <span className="font-mono">{user.rank}</span>
              )}
            </div>
            
            {/* Predictor column */}
            <div className="col-span-3 flex items-center">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 text-xs
                  ${user.rank <= 10 ? 'bg-gradient-to-br from-[#5F6FFF] to-[#13ADC7]' : 'bg-[#1C1C22]'}`}>
                  {user.walletAddress.substring(0, 2).toUpperCase()}
                </div>
                <Link 
                  href={`/profile/${user.walletAddress}`}
                  className={`hover:text-[#5F6FFF] transition-colors ${
                    isCurrentUser(user.rank) ? 'text-[#5F6FFF]' : ''
                  }`}
                >
                  {shortenAddress(user.walletAddress)}
                </Link>
                {isCurrentUser(user.rank) && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-[#5F6FFF]/20 text-[#5F6FFF] rounded-full">You</span>
                )}
              </div>
            </div>
            
            {/* Accuracy column */}
            <div className="col-span-2">
              <div className="flex flex-col">
                <span className="font-medium">{user.accuracy.toFixed(1)}%</span>
                <div className="w-full h-1.5 bg-[#0E0E10] rounded-full mt-1 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7]"
                    initial={{ width: 0 }}
                    animate={{ width: `${user.accuracy}%` }}
                    transition={{ duration: 1, delay: index * 0.05 }}
                  />
                </div>
              </div>
            </div>
            
            {/* Predictions column */}
            <div className="col-span-3 flex items-center">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-[#B0B0B0] mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <span>{user.predictionsMade}</span>
              </div>
            </div>
            
            {/* Winnings column */}
            <div className="col-span-3 flex items-center font-medium">
              <span className={user.rank <= 3 ? 'text-[#13ADC7]' : ''}>
                {user.winnings} SOL
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Load more button */}
      {displayCount < data.length && (
        <div className="p-4 flex justify-center">
          <motion.button
            className="px-6 py-2 border border-white/10 rounded-lg text-[#B0B0B0] hover:text-white hover:border-[#5F6FFF]/30 transition-colors"
            onClick={loadMore}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Load More
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}