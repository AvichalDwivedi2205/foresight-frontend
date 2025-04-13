"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MarketDetailsHeader from "@/components/market/MarketDetailsHeader";
import OutcomeOptions from "@/components/market/OutcomeOptions";
import StakeBox from "@/components/market/StakeBox";
import AISummaryPanel from "@/components/market/AISummaryPanel";
import StatsPanel from "@/components/market/StatsPanel";
import StakersList from "@/components/market/StakersList";
import ClaimRewardBox from "@/components/market/ClaimRewardBox";
import MarketSkeleton from "@/components/market/MarketSkeleton";

// Mock market data - would come from an API in production
const MOCK_MARKET_DETAILS = {
  id: "market-1",
  title: "Will ETH reach $5,000 before May 2025?",
  description: "This market predicts whether Ethereum (ETH) will reach a price of $5,000 USD on major exchanges like Binance, Coinbase, or Kraken at any point before May 1st, 2025.",
  category: "Crypto",
  status: "active" as const,
  createdBy: "0x7Fc...A2E1",
  createdAt: "February 12, 2025",
  endDate: "May 1, 2025",
  poolSize: "342.5K SOL",
  timeLeft: "3d 8h",
  outcomes: { yes: 72, no: 28 },
  stakerCount: 1204,
  topStakers: [
    { address: "0x3Fb...B6a2", amount: "12.4K SOL", outcome: "Yes" },
    { address: "0x8Dc...9F3e", amount: "8.6K SOL", outcome: "No" },
    { address: "0x2Ab...7D4f", amount: "6.2K SOL", outcome: "Yes" },
    { address: "0x5Eg...C9a1", amount: "5.8K SOL", outcome: "Yes" },
    { address: "0x9Hj...E2b3", amount: "4.5K SOL", outcome: "No" },
  ],
  userHasVoted: false,
  aiSummary: "Based on current market trends and expert analysis, Ethereum is showing strong bullish momentum with increasing adoption in DeFi and NFT markets. Recent network upgrades have improved scalability, potentially supporting higher valuations. However, macroeconomic factors including potential regulatory changes present significant uncertainties. Current price trajectory suggests reaching $5,000 is possible but not guaranteed within the timeframe.",
};

export default function MarketDetailPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [market, setMarket] = useState<any>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>("");
  
  // Simulate API loading
  useEffect(() => {
    // In production, fetch actual market data based on params.id
    const timer = setTimeout(() => {
      setMarket(MOCK_MARKET_DETAILS);
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [params.id]);
  
  // Handle outcome selection
  const handleOutcomeChange = (outcome: string) => {
    setSelectedOutcome(outcome);
  };
  
  // Handle stake amount change
  const handleStakeAmountChange = (amount: string) => {
    setStakeAmount(amount);
  };
  
  // Handle stake submission
  const handleStakeSubmit = () => {
    if (!selectedOutcome || !stakeAmount) return;
    
    // In production, this would make an API call to submit the stake
    console.log(`Staking ${stakeAmount} SOL on ${selectedOutcome} for market ${params.id}`);
    
    // Reset form and show confirmation
    setTimeout(() => {
      setSelectedOutcome(null);
      setStakeAmount("");
      // Show success notification
    }, 2000);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E0E10] text-[#F5F5F5]">
        <Navbar />
        <MarketSkeleton />
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#F5F5F5]">
      <Navbar />
      
      <motion.div 
        className="container mx-auto px-4 max-w-7xl py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <MarketDetailsHeader 
          title={market.title}
          description={market.description}
          creator={market.createdBy}
          createdAt={market.createdAt}
          endDate={market.endDate}
          category={market.category}
          status={market.status}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <StatsPanel 
              poolSize={market.poolSize}
              stakerCount={market.stakerCount}
              timeLeft={market.timeLeft}
              outcomes={market.outcomes}
            />
            
            <AISummaryPanel summary={market.aiSummary} />
            
            <StakersList stakers={market.topStakers} />
          </div>
          
          <div className="lg:col-span-1 space-y-8">
            {market.status === "active" && (
              <>
                <OutcomeOptions 
                  outcomes={market.outcomes}
                  selectedOutcome={selectedOutcome}
                  onOutcomeChange={handleOutcomeChange}
                />
                
                <StakeBox
                  stakeAmount={stakeAmount}
                  onStakeAmountChange={handleStakeAmountChange}
                  onSubmit={handleStakeSubmit}
                  isSubmitDisabled={!selectedOutcome || !stakeAmount}
                />
              </>
            )}
            
            {market.status === "resolved" && (
              <ClaimRewardBox
                userHasWon={true}  // This would be determined based on actual user vote
                winningOutcome="Yes"
                rewardAmount="42.5 SOL"
              />
            )}
          </div>
        </div>
      </motion.div>
      
      <Footer />
    </div>
  );
}