"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MarketGrid from "@/components/MarketGrid";
import FilterTabs from "@/components/FilterTabs";
import { useMarketData } from "@/lib/hooks/useMarketData";

export default function MarketsPage() {
  const [activeTab, setActiveTab] = useState<string>("active");
  const { markets, isLoading, refetch } = useMarketData({ filter: activeTab });
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#F5F5F5]">
      <Navbar />
      
      <main className="container mx-auto px-4 py-24 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Prediction Markets
          </h1>
          <p className="text-[#B0B0B0] mb-8">
            Browse and participate in prediction markets about future events
          </p>
          
          <FilterTabs 
            tabs={[
              { id: "active", label: "Active" },
              { id: "resolved", label: "Resolved" },
              { id: "expired", label: "Expired" }
            ]}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          
          <MarketGrid 
            markets={markets} 
            isLoading={isLoading} 
          />
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}