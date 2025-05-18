"use client";

import Link from 'next/link';
import { motion  } from '@/components/motion';

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

interface PredictionRowProps {
  prediction: Prediction;
  index: number;
}

export default function PredictionRow({ prediction, index }: PredictionRowProps) {
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
      className="border border-white/10 rounded-lg p-4 hover:border-[#5F6FFF]/30 transition-all"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.01, backgroundColor: 'rgba(28, 28, 34, 0.3)' }}
    >
      <Link href={`/market/${prediction.marketId}`} className="block">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="mb-3 sm:mb-0 sm:mr-4 flex-grow">
            <h3 className="text-base font-medium">{prediction.marketQuestion}</h3>
            
            <div className="flex flex-wrap items-center mt-1 text-sm">
              <span className="text-[#B0B0B0] mr-2">
                Prediction: 
              </span>
              <span className={`px-2 py-0.5 rounded-full ${
                prediction.status === 'won' 
                  ? 'bg-green-500/20 text-green-400'
                  : prediction.status === 'lost'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {prediction.chosenOutcome}
              </span>
              
              <span className="text-[#B0B0B0] mx-2">•</span>
              <span className="text-[#B0B0B0]">
                {formatDate(prediction.createdAt)}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className={`px-3 py-1 rounded-lg flex items-center mb-1 ${
              prediction.status === 'pending'
                ? 'bg-[#1C1C22]'
                : prediction.status === 'won'
                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20'
                : 'bg-gradient-to-r from-red-500/20 to-rose-500/20'
            }`}>
              {prediction.status === 'pending' ? (
                <>
                  <svg className="w-4 h-4 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="font-medium text-sm">Pending</span>
                </>
              ) : prediction.status === 'won' ? (
                <>
                  <svg className="w-4 h-4 mr-1 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="font-medium text-sm text-green-400">Won</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="font-medium text-sm text-red-400">Lost</span>
                </>
              )}
            </div>
            
            <div className="flex items-center">
              <div className="flex flex-col items-end mr-3">
                <span className="text-xs text-[#B0B0B0]">Staked</span>
                <span className="font-medium">{prediction.stake} SOL</span>
              </div>
              
              <div className="flex flex-col items-end">
                <span className="text-xs text-[#B0B0B0]">
                  {prediction.status === 'pending' ? 'Potential' : 'Reward'}
                </span>
                <span className={`font-medium ${
                  prediction.status === 'won' ? 'text-green-400' : ''
                }`}>
                  {prediction.status === 'pending'
                    ? `${prediction.potentialReward} SOL`
                    : prediction.status === 'won'
                    ? `${prediction.reward} SOL`
                    : '0 SOL'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}