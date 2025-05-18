"use client";

import { useState, useEffect } from "react";
import { motion  } from '@/components/motion';
import MarketCard from "./MarketCard";
import SkeletonCard from "./SkeletonCard";

interface MarketGridProps {
  filter: string;
}

// Mock data for now - would be replaced with API calls in production
const MOCK_MARKETS = [
  {
    id: "market-1",
    title: "Will ETH reach $5,000 before May 2025?",
    category: "Crypto",
    status: "active" as const,
    poolSize: "342.5K SOL",
    timeLeft: "3d 8h",
    outcomes: { yes: 72, no: 28 },
  },
  {
    id: "market-2",
    title: "Will Apple release AR glasses in 2025?",
    category: "Tech",
    status: "active" as const,
    poolSize: "187.2K SOL",
    timeLeft: "10d 4h",
    outcomes: { yes: 45, no: 55 },
  },
  {
    id: "market-3",
    title: "Will BTC reach $100K in 2025?",
    category: "Crypto",
    status: "active" as const,
    poolSize: "512.8K SOL",
    timeLeft: "23d 12h",
    outcomes: { yes: 85, no: 15 },
    userVoted: true,
  },
  {
    id: "market-4",
    title: "Will SpaceX reach Mars before 2030?",
    category: "Space",
    status: "active" as const,
    poolSize: "298.4K SOL",
    timeLeft: "60d 0h",
    outcomes: { yes: 63, no: 37 },
  },
  {
    id: "market-5",
    title: "Will Tesla release full autonomous driving globally in 2025?",
    category: "Tech",
    status: "resolved" as const,
    poolSize: "452.7K SOL",
    outcomes: { yes: 34, no: 66 },
  },
  {
    id: "market-6",
    title: "Will OpenAI release GPT-5 before the end of 2025?",
    category: "AI",
    status: "active" as const,
    poolSize: "732.1K SOL",
    timeLeft: "82d 5h",
    outcomes: { yes: 81, no: 19 },
  },
  {
    id: "market-7",
    title: "Will the US Federal Reserve cut rates at least twice in 2025?",
    category: "Economy",
    status: "resolved" as const,
    poolSize: "620.3K SOL",
    outcomes: { yes: 52, no: 48 },
    userVoted: true,
  },
  {
    id: "market-8",
    title: "Will Solana reach $500 by Q3 2025?",
    category: "Crypto",
    status: "active" as const,
    poolSize: "892.5K SOL",
    timeLeft: "45d 12h",
    outcomes: { yes: 76, no: 24 },
  },
];

export default function MarketGrid({ filter }: MarketGridProps) {
  const [markets, setMarkets] = useState(MOCK_MARKETS);
  const [loading, setLoading] = useState(true);
  const [filteredMarkets, setFilteredMarkets] = useState(markets);
  
  // Simulate API loading
  useEffect(() => {
    setLoading(true);
    
    // Simulate network request
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Apply filters when filter changes
  useEffect(() => {
    setLoading(true);
    
    // Filter logic
    let filtered = [...markets];
    if (filter === "active") {
      filtered = markets.filter(market => market.status === "active");
    } else if (filter === "resolved") {
      filtered = markets.filter(market => market.status === "resolved");
    } else if (filter === "my") {
      filtered = markets.filter(market => market.userVoted);
    }
    
    // Simulate filter delay
    const timer = setTimeout(() => {
      setFilteredMarkets(filtered);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [filter, markets]);
  
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
      {loading ? (
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
      ) : filteredMarkets.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
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