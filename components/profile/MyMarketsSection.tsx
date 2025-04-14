"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

interface Market {
  id: string;
  question: string;
  endDate: string;
  outcomes: string[];
  totalStaked: number;
  createdAt: string;
  status: 'active' | 'ended' | 'resolved';
}

interface MyMarketsSectionProps {
  markets: Market[];
}

export default function MyMarketsSection({ markets }: MyMarketsSectionProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };
  
  return (
    <motion.div
      className="bg-[#151518] rounded-lg border border-white/10 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Markets You Created</h2>
        <Link
          href="/create"
          className="text-sm text-[#5F6FFF] hover:text-[#13ADC7] transition-colors flex items-center"
        >
          <span>Create New Market</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        </Link>
      </div>
      
      {markets.length === 0 ? (
        <div className="text-center py-10 text-[#B0B0B0]">
          <svg className="w-16 h-16 mx-auto mb-4 text-[#1C1C22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <p>You haven't created any markets yet.</p>
          <Link
            href="/create"
            className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7] rounded-lg text-white"
          >
            Create Your First Market
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {markets.map((market, index) => (
            <motion.div
              key={market.id}
              className="border border-white/10 rounded-lg p-4 hover:border-[#5F6FFF]/30 transition-all cursor-pointer"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.01, backgroundColor: 'rgba(28, 28, 34, 0.3)' }}
            >
              <Link href={`/market/${market.id}`} className="block">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium pr-4">{market.question}</h3>
                  <div className={`px-2 py-1 text-xs rounded-full ${
                    market.status === 'active'
                      ? 'bg-green-500/20 text-green-400'
                      : market.status === 'ended'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {market.status === 'active'
                      ? 'Active'
                      : market.status === 'ended'
                      ? 'Ended'
                      : 'Resolved'}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[#B0B0B0] text-sm mb-2">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span>Resolves: {formatDate(market.endDate)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
                    </svg>
                    <span>{market.totalStaked} SOL staked</span>
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>Created {formatDate(market.createdAt)}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {market.outcomes.map((outcome, i) => (
                    <div
                      key={`${market.id}-outcome-${i}`}
                      className="px-2 py-1 bg-[#1C1C22] rounded-md text-xs"
                    >
                      {outcome}
                    </div>
                  ))}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}