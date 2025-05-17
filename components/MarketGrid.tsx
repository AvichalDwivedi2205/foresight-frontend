"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import MarketCard from "./MarketCard";
import SkeletonCard from "./SkeletonCard";
import { Market } from "@/lib/indexer";

interface MarketGridProps {
  markets: Market[];
  isLoading: boolean;
  filter?: string; // Keep for backward compatibility
}

export default function MarketGrid({ markets, isLoading, filter }: MarketGridProps) {
  // Container animation for the grid
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  return (
    <div className="container mx-auto px-4 max-w-7xl py-8">
      {isLoading ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Show 8 skeleton cards while loading */}
          {[...Array(8)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </motion.div>
      ) : markets.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {markets.map((market) => (
            <MarketCard 
              key={market.pubkey} 
              market={{
                id: market.pubkey,
                title: market.question,
                category: market.market_type === 0 ? "Time-bound" : "Open-ended",
                status: market.resolved ? "resolved" : (market.deadline < Date.now() ? "pending" : "active"),
                poolSize: `${(market.total_pool / 1e9).toFixed(1)}K SOL`,
                timeLeft: getTimeLeft(market.deadline),
                outcomes: formatOutcomesForMarketCard(market),
              }} 
            />
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">🔮</div>
          <h3 className="text-xl font-medium mb-2">No markets found</h3>
          <p className="text-[#B0B0B0] text-center max-w-md">
            {filter === "my" 
              ? "You haven't participated in any prediction markets yet."
              : "There are no markets matching your current filter."}
          </p>
        </div>
      )}
    </div>
  );
}

// Helper function to format time left
function getTimeLeft(deadline: number): string {
  if (deadline <= Date.now()) return "Ended";
  
  const diff = deadline - Date.now();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return `${days}d ${hours}h`;
}

// Helper function to format outcomes for the MarketCard component
function formatOutcomesForMarketCard(market: Market) {
  // Initialize with default values
  const yesPercentage = market.stakes_per_outcome[0] / market.total_pool * 100 || 0;
  const noPercentage = market.stakes_per_outcome[1] / market.total_pool * 100 || 0;
  
  return {
    yes: yesPercentage,
    no: noPercentage
  };
}

// Original helper function (kept for reference if needed elsewhere)
function getFormattedOutcomes(market: Market) {
  const outcomes: Record<string, number> = {};
  
  if (market.outcomes.length >= 2) {
    // For binary markets, use yes/no
    if (market.outcomes.length === 2 && 
        (market.outcomes[0].toLowerCase() === "yes" || market.outcomes[0].toLowerCase() === "no")) {
      outcomes.yes = market.stakes_per_outcome[0] / market.total_pool * 100 || 0;
      outcomes.no = market.stakes_per_outcome[1] / market.total_pool * 100 || 0;
    } else {
      // For multi-outcome markets
      market.outcomes.forEach((outcome, index) => {
        outcomes[outcome] = market.stakes_per_outcome[index] / market.total_pool * 100 || 0;
      });
    }
  }
  
  return outcomes;
}