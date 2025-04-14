"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LeaderboardHeader from '../../components/leaderboard/LeaderboardHeader';
import LeaderboardTable from '../../components/leaderboard/LeaderboardTable';
import WeeklyLeaderboardToggle from '../../components/leaderboard/WeeklyLeaderboardToggle';

export default function LeaderboardPage() {
  const [timeFrame, setTimeFrame] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  // Fetch leaderboard data based on selected timeframe
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call to fetch leaderboard data
    setTimeout(() => {
      // Generate mock data - in real app, this would come from API
      const mockData = generateMockLeaderboardData(timeFrame);
      setLeaderboardData(mockData);
      
      // Simulate finding the current user in the leaderboard (e.g. position 87)
      setCurrentUserRank(87);
      setIsLoading(false);
    }, 1000);
  }, [timeFrame]);

  // Generate mock leaderboard data for different timeframes
  const generateMockLeaderboardData = (timeFrame: string) => {
    const data = [];
    const baseAccuracy = timeFrame === 'weekly' ? 75 : timeFrame === 'monthly' ? 70 : 65;
    const basePredictions = timeFrame === 'weekly' ? 12 : timeFrame === 'monthly' ? 35 : 120;
    
    for (let i = 0; i < 100; i++) {
      // Add some randomness to the data
      const accuracyVariance = Math.random() * 15 - 5; // -5 to +10
      const predictionsVariance = Math.floor(Math.random() * 20) - 5; // -5 to +15
      const winningsMultiplier = (100 - i) / 30 + Math.random(); // Decreases as rank goes down

      data.push({
        rank: i + 1,
        walletAddress: `wallet_${(10000 + i).toString(16)}`,
        accuracy: Math.min(99, Math.max(50, baseAccuracy + accuracyVariance - (i * 0.2))),
        predictionsMade: Math.max(5, basePredictions + predictionsVariance - Math.floor(i / 5)),
        winnings: Number(((100 - i) * winningsMultiplier).toFixed(1))
      });
    }
    
    return data;
  };

  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#F5F5F5]">
      <Navbar />
      
      <motion.main
        className="container mx-auto px-4 py-10 max-w-5xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LeaderboardHeader 
          timeFrame={timeFrame}
          userRank={currentUserRank}
        />
        
        <WeeklyLeaderboardToggle 
          activeTab={timeFrame} 
          onTabChange={setTimeFrame} 
        />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <LeaderboardTable 
            data={leaderboardData} 
            isLoading={isLoading} 
            currentUserRank={currentUserRank}
          />
        </motion.div>
      </motion.main>
      
      <Footer />
    </div>
  );
}