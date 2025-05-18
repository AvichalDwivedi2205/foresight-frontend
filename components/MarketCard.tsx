"use client";

import { useState } from "react";
import { motion  } from '@/components/motion';
import { useRouter } from "next/navigation";

// Define market type
interface MarketData {
  id: string;
  title: string;
  category: string;
  status: "active" | "resolved" | "pending";
  poolSize: string;
  timeLeft?: string; // Optional for resolved markets
  outcomes: {
    yes: number;
    no: number;
  };
  userVoted?: boolean;
}

interface MarketCardProps {
  market: MarketData;
}

export default function MarketCard({ market }: MarketCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  
  // Status badge color mapping
  const statusColors = {
    active: {
      bg: "bg-green-500/20",
      text: "text-green-400",
      border: "border-green-500/30",
    },
    resolved: {
      bg: "bg-blue-500/20",
      text: "text-blue-400",
      border: "border-blue-500/30",
    },
    pending: {
      bg: "bg-yellow-500/20",
      text: "text-yellow-400",
      border: "border-yellow-500/30",
    },
  };
  
  // Get appropriate color
  const statusColor = statusColors[market.status];
  
  // Handle card click
  const handleCardClick = () => {
    router.push(`/market/${market.id}`);
  };
  
  return (
    <motion.div
      className={`bg-[#1C1C22] p-5 rounded-xl border transition-all cursor-pointer ${
        isHovered ? "border-[#5F6FFF] shadow-lg shadow-[#5F6FFF]/10" : "border-white/5"
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ 
        scale: 1.03,
        transition: { duration: 0.2 }
      }}
      onClick={handleCardClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Card header */}
      <div className="flex justify-between mb-2">
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}>
          {market.status.charAt(0).toUpperCase() + market.status.slice(1)}
        </span>
        
        <span className="text-xs text-[#B0B0B0] flex items-center">
          {market.timeLeft && (
            <>
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {market.timeLeft}
            </>
          )}
          
          {!market.timeLeft && (
            <span className="px-2 py-0.5 text-xs bg-[#5F6FFF]/20 text-[#5F6FFF] rounded-full">
              Completed
            </span>
          )}
        </span>
      </div>
      
      {/* Title with truncation */}
      <h3 className="font-bold text-lg mb-3 line-clamp-2 min-h-[3.5rem]">
        {market.title}
      </h3>
      
      {/* Stats info */}
      <div className="flex justify-between mb-3 text-sm text-[#B0B0B0]">
        <div>
          Pool size <span className="text-[#F5F5F5] font-medium ml-1">{market.poolSize}</span>
        </div>
        <div>
          <span className="text-[#F5F5F5] font-medium">{market.category}</span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 w-full bg-white/5 rounded-full mb-4 overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${market.outcomes.yes}%` }}
          transition={{ duration: 1, delay: 0.2 }}
        ></motion.div>
      </div>
      <div className="flex justify-between text-xs mb-4">
        <span>Yes: {market.outcomes.yes}%</span>
        <span>No: {market.outcomes.no}%</span>
      </div>
      
      {/* Action button */}
      <motion.button
        className={`w-full py-2.5 rounded-full font-medium text-white ${
          isHovered
            ? "bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7]"
            : "bg-[#5F6FFF]"
        }`}
        whileHover={{ boxShadow: "0 0 15px rgba(95, 111, 255, 0.5)" }}
        whileTap={{ scale: 0.98 }}
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/market/${market.id}`);
        }}
      >
        {market.status === "active" ? "Stake Now" : "View Details"}
      </motion.button>
      
      {/* User voted indicator */}
      {market.userVoted && (
        <div className="mt-3 text-center text-xs text-[#13ADC7]">
          You participated in this market
        </div>
      )}
    </motion.div>
  );
}