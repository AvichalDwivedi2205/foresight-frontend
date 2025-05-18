"use client";

import { motion  } from '@/components/motion';

interface WeeklyLeaderboardToggleProps {
  activeTab: 'all' | 'weekly' | 'monthly';
  onTabChange: (tab: 'all' | 'weekly' | 'monthly') => void;
}

export default function WeeklyLeaderboardToggle({ 
  activeTab, 
  onTabChange 
}: WeeklyLeaderboardToggleProps) {
  const tabs = [
    { id: 'all', label: 'All Time' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'weekly', label: 'Weekly' }
  ];

  return (
    <motion.div
      className="bg-[#151518] p-1 rounded-lg flex mb-6 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.4 }}
    >
      {tabs.map((tab) => (
        <div key={tab.id} className="flex-1 relative">
          {activeTab === tab.id && (
            <motion.div
              className="absolute inset-0 bg-[#1C1C22] rounded-md z-0"
              layoutId="activeTabBackground"
              initial={false}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <button
            onClick={() => onTabChange(tab.id as 'all' | 'weekly' | 'monthly')}
            className={`w-full py-2 px-4 z-10 relative transition-colors text-sm font-medium ${
              activeTab === tab.id ? 'text-[#5F6FFF]' : 'text-[#B0B0B0]'
            }`}
          >
            {tab.label}
          </button>
        </div>
      ))}
    </motion.div>
  );
}