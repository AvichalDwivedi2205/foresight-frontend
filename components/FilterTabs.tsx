"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TabItem {
  id: string;
  label: string;
}

interface FilterTabsProps {
  onFilterChange?: (filter: string) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  tabs?: TabItem[];
}

export default function FilterTabs({ 
  onFilterChange, 
  activeTab: externalActiveTab, 
  onTabChange,
  tabs
}: FilterTabsProps) {
  const [activeFilter, setActiveFilter] = useState(externalActiveTab || "all");
  
  // Use either provided tabs or default tabs
  const filterOptions = tabs || [
    { id: "all", label: "All Markets" },
    { id: "active", label: "Active" },
    { id: "resolved", label: "Resolved" },
    { id: "my", label: "My Markets" },
  ];
  
  // Update internal state when external activeTab changes
  useEffect(() => {
    if (externalActiveTab) {
      setActiveFilter(externalActiveTab);
    }
  }, [externalActiveTab]);
  
  const handleTabClick = (filterId: string) => {
    setActiveFilter(filterId);
    
    // Support both old and new APIs
    if (onFilterChange) onFilterChange(filterId);
    if (onTabChange) onTabChange(filterId);
  };
  
  return (
    <div className="container mx-auto px-4 max-w-7xl mb-8">
      <div className="flex flex-wrap justify-center gap-2 md:gap-8">
        {filterOptions.map((filter) => (
          <div key={filter.id} className="relative">
            <button
              onClick={() => handleTabClick(filter.id)}
              className={`px-4 py-2 text-lg font-medium transition-colors relative ${
                activeFilter === filter.id ? "text-[#F5F5F5]" : "text-[#B0B0B0] hover:text-[#F5F5F5]"
              }`}
            >
              {filter.label}
            </button>
            
            {/* Animated underline */}
            {activeFilter === filter.id && (
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7]"
                layoutId="activeFilterUnderline"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Mobile filter dropdown */}
      <div className="md:hidden mt-4">
        <select 
          className="w-full px-4 py-2 rounded-lg bg-[#1C1C22] text-[#F5F5F5] border border-[#5F6FFF]/20"
          value={activeFilter}
          onChange={(e) => handleTabClick(e.target.value)}
        >
          {filterOptions.map((filter) => (
            <option key={filter.id} value={filter.id}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}