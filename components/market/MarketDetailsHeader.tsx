"use client";

import { motion  } from '@/components/motion';
import Link from "next/link";

interface MarketDetailsHeaderProps {
  title: string;
  description: string;
  creator: string;
  createdAt: string;
  endDate: string;
  category: string;
  status: "active" | "resolved" | "pending";
}

export default function MarketDetailsHeader({
  title,
  description,
  creator,
  createdAt,
  endDate,
  category,
  status
}: MarketDetailsHeaderProps) {
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
  const statusColor = statusColors[status];

  return (
    <div>
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <Link href="/markets" className="text-[#B0B0B0] hover:text-[#F5F5F5] transition-colors">
          Markets
        </Link>
        <span className="text-[#B0B0B0]">
          <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </span>
        <span className="text-[#F5F5F5]">Market Details</span>
      </div>
      
      {/* Main header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Title and status */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
          
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-[#5F6FFF]/20 text-[#5F6FFF] border border-[#5F6FFF]/30">
              {category}
            </span>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-[#B0B0B0] mb-6">{description}</p>
        
        {/* Meta info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-[#1C1C22]/50 p-3 rounded-lg">
            <div className="text-[#B0B0B0]">Created by</div>
            <div className="font-medium flex items-center gap-1">
              <span className="bg-[#5F6FFF]/20 text-[#5F6FFF] w-2 h-2 rounded-full"></span>
              {creator}
            </div>
          </div>
          
          <div className="bg-[#1C1C22]/50 p-3 rounded-lg">
            <div className="text-[#B0B0B0]">Created on</div>
            <div className="font-medium">{createdAt}</div>
          </div>
          
          <div className="bg-[#1C1C22]/50 p-3 rounded-lg">
            <div className="text-[#B0B0B0]">End date</div>
            <div className="font-medium">{endDate}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}