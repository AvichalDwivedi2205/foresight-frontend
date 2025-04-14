"use client";

import { motion } from 'framer-motion';

interface LeaderboardHeaderProps {
  timeFrame: 'all' | 'weekly' | 'monthly';
  userRank: number | null;
}

export default function LeaderboardHeader({ timeFrame, userRank }: LeaderboardHeaderProps) {
  // Get title based on the timeframe
  const getTitle = () => {
    switch(timeFrame) {
      case 'weekly':
        return "Weekly Leaderboard";
      case 'monthly':
        return "Monthly Leaderboard";
      default:
        return "All-Time Leaderboard";
    }
  };

  // Get subtitle based on the timeframe
  const getSubtitle = () => {
    switch(timeFrame) {
      case 'weekly':
        return "Top predictors of the current week";
      case 'monthly':
        return "Top predictors of the month";
      default:
        return "The most accurate predictors on Foresight Protocol";
    }
  };

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7]"
        layout="position"
        key={timeFrame + "-title"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {getTitle()}
      </motion.h1>
      
      <motion.p
        className="text-[#B0B0B0] mb-6"
        layout="position"
        key={timeFrame + "-subtitle"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {getSubtitle()}
      </motion.p>
      
      {userRank !== null && (
        <motion.div
          className="bg-[#151518] border border-white/10 p-4 rounded-lg flex items-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="bg-[#1C1C22] rounded-full h-10 w-10 flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-[#5F6FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          
          <div>
            <p className="text-sm text-[#B0B0B0]">Your Current Rank</p>
            <p className="font-medium flex items-center">
              <span>You're </span>
              <span className="mx-1 font-bold text-[#5F6FFF]">#{userRank}</span>
              <span> on the {timeFrame === 'weekly' ? 'weekly' : timeFrame === 'monthly' ? 'monthly' : 'all-time'} leaderboard</span>
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}