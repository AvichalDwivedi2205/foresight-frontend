"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import PredictionRow from './PredictionRow';

interface Prediction {
  id: string;
  marketId: string;
  marketQuestion: string;
  chosenOutcome: string;
  stake: number;
  createdAt: string;
  status: 'pending' | 'won' | 'lost';
  potentialReward?: number;
  reward?: number;
}

interface MyPredictionsSectionProps {
  predictions: Prediction[];
}

export default function MyPredictionsSection({ predictions }: MyPredictionsSectionProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'resolved'>('all');
  
  // Filter predictions based on active tab
  const filteredPredictions = predictions.filter(prediction => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return prediction.status === 'pending';
    if (activeTab === 'resolved') return prediction.status === 'won' || prediction.status === 'lost';
    return true;
  });
  
  // Count predictions by status
  const counts = {
    all: predictions.length,
    pending: predictions.filter(p => p.status === 'pending').length,
    resolved: predictions.filter(p => p.status === 'won' || p.status === 'lost').length
  };
  
  return (
    <motion.div
      className="bg-[#151518] rounded-lg border border-white/10 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <h2 className="text-xl font-semibold mb-6">My Predictions</h2>
      
      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-6 overflow-x-auto hide-scrollbar">
        {[
          { id: 'all', label: 'All Predictions' },
          { id: 'pending', label: 'Pending' },
          { id: 'resolved', label: 'Resolved' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-[#5F6FFF] border-b-2 border-[#5F6FFF]'
                : 'text-[#B0B0B0] hover:text-white'
            }`}
            onClick={() => setActiveTab(tab.id as 'all' | 'pending' | 'resolved')}
          >
            {tab.label}
            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-[#1C1C22]">
              {counts[tab.id as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>
      
      {/* Predictions list */}
      {filteredPredictions.length === 0 ? (
        <div className="text-center py-10 text-[#B0B0B0]">
          <svg className="w-16 h-16 mx-auto mb-4 text-[#1C1C22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p>No {activeTab !== 'all' ? activeTab : ''} predictions found.</p>
          <Link
            href="/markets"
            className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7] rounded-lg text-white"
          >
            Explore Markets
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {filteredPredictions.map((prediction, index) => (
                <PredictionRow
                  key={prediction.id}
                  prediction={prediction}
                  index={index}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}