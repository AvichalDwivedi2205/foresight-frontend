"use client";

import { useState, useEffect } from 'react';
import { motion  } from '@/components/motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileStats from '../../components/profile/ProfileStats';
import MyMarketsSection from '../../components/profile/MyMarketsSection';
import MyPredictionsSection from '../../components/profile/MyPredictionsSection';

export default function ProfilePage() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  // Simulate wallet connection and data loading
  useEffect(() => {
    // Check if wallet is connected (this would be handled by your actual wallet integration)
    const checkWalletConnection = () => {
      // Mock wallet connection status for demo
      setTimeout(() => {
        setIsWalletConnected(true);
      }, 1000);
    };

    // Fetch profile data if wallet is connected
    const fetchProfileData = async () => {
      // Mock API call
      setTimeout(() => {
        setProfileData({
          walletAddress: "8zJ4SuewgAwnU7Cc1jZTx3JeKhF4NeKTJqK2EiWU6nM3",
          joinDate: "2023-11-15",
          stats: {
            accuracy: 68,
            totalStaked: 125.5,
            totalEarned: 230.75,
            predictionsMade: 47,
            rank: 8,  // Top 10 user
          },
          markets: [
            {
              id: "market-123",
              question: "Will Ethereum reach $10,000 before the end of 2025?",
              endDate: "2025-12-31T00:00:00Z",
              outcomes: ["Yes", "No"],
              totalStaked: 1250,
              createdAt: "2024-01-15T08:30:00Z",
              status: "active"
            },
            {
              id: "market-456",
              question: "Will Apple release Apple Glass AR product in 2025?",
              endDate: "2025-06-30T00:00:00Z",
              outcomes: ["Yes", "No"],
              totalStaked: 875,
              createdAt: "2024-01-20T10:15:00Z",
              status: "active"
            }
          ],
          predictions: [
            {
              id: "pred-123",
              marketId: "market-789",
              marketQuestion: "Will Bitcoin surpass $100,000 in 2025?",
              chosenOutcome: "Yes",
              stake: 15.5,
              createdAt: "2024-02-05T14:20:00Z",
              status: "pending",
              potentialReward: 31.0
            },
            {
              id: "pred-456",
              marketId: "market-012",
              marketQuestion: "Will SpaceX successfully launch Starship to Mars by end of 2026?",
              chosenOutcome: "No",
              stake: 10,
              createdAt: "2024-01-10T11:45:00Z",
              status: "won",
              reward: 25
            },
            {
              id: "pred-789",
              marketId: "market-345",
              marketQuestion: "Will the Federal Reserve cut interest rates in Q2 2025?",
              chosenOutcome: "Yes",
              stake: 20,
              createdAt: "2024-01-25T09:30:00Z",
              status: "lost",
              reward: 0
            }
          ]
        });
        setIsLoading(false);
      }, 2000);
    };

    checkWalletConnection();
    fetchProfileData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#F5F5F5]">
      <Navbar />
      
      <motion.main
        className="container mx-auto px-4 py-10 max-w-5xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {!isWalletConnected ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <motion.div
              className="bg-[#151518] rounded-lg border border-white/10 p-10 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-[#B0B0B0] mb-6">
                Connect your wallet to view your dashboard, prediction history, and performance stats.
              </p>
              <motion.button
                className="bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7] text-white px-6 py-3 rounded-lg w-full font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Connect Wallet
              </motion.button>
            </motion.div>
          </div>
        ) : isLoading ? (
          <div className="space-y-8">
            {/* Profile skeleton loader */}
            <div className="bg-[#151518] rounded-lg border border-white/10 p-6 animate-pulse">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-[#1C1C22] rounded-full"></div>
                <div className="ml-4">
                  <div className="h-5 w-40 bg-[#1C1C22] rounded mb-2"></div>
                  <div className="h-4 w-24 bg-[#1C1C22] rounded"></div>
                </div>
              </div>
            </div>
            
            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#151518] rounded-lg border border-white/10 p-4 animate-pulse">
                  <div className="h-4 w-20 bg-[#1C1C22] rounded mb-2"></div>
                  <div className="h-6 w-16 bg-[#1C1C22] rounded"></div>
                </div>
              ))}
            </div>
            
            {/* Markets skeleton */}
            <div className="bg-[#151518] rounded-lg border border-white/10 p-6 animate-pulse">
              <div className="h-5 w-40 bg-[#1C1C22] rounded mb-4"></div>
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-24 bg-[#1C1C22] rounded"></div>
                ))}
              </div>
            </div>
            
            {/* Predictions skeleton */}
            <div className="bg-[#151518] rounded-lg border border-white/10 p-6 animate-pulse">
              <div className="h-5 w-40 bg-[#1C1C22] rounded mb-4"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-[#1C1C22] rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <ProfileHeader 
              walletAddress={profileData.walletAddress}
              joinDate={profileData.joinDate}
              rank={profileData.stats.rank}
            />
            
            <ProfileStats stats={profileData.stats} />
            
            <MyMarketsSection markets={profileData.markets} />
            
            <MyPredictionsSection predictions={profileData.predictions} />
          </div>
        )}
      </motion.main>
      
      <Footer />
    </div>
  );
}