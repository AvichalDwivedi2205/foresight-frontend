"use client";

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { motion, AnimatePresence, LazyMotion } from '@/components/motion';
import { Prediction, Market } from '@/services/contracts/models';
import { MarketContract } from '@/services/contracts/marketContract';

interface TransactionHistoryProps {
  marketAddress?: string; // Optional - if provided, only shows transactions for this market
}

export default function TransactionHistory({ marketAddress }: TransactionHistoryProps) {
  // Wallet and connection
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  
  // Local state
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [markets, setMarkets] = useState<Map<string, Market>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [filter, setFilter] = useState<'all' | 'won' | 'lost' | 'pending'>('all');
  
  // Load user predictions and related markets
  useEffect(() => {
    if (!publicKey) {
      setIsLoading(false);
      return;
    }
    
    async function loadPredictions() {
      setIsLoading(true);
      setError(null);
      
      try {
        const marketContract = new MarketContract(connection, publicKey);
        
        // Get user predictions
        let userPredictions: Prediction[];
        if (marketAddress) {
          // Get predictions for specific market if marketAddress is provided
          userPredictions = await marketContract.getMarketPredictions(new PublicKey(marketAddress));
          // Filter to only include predictions from current user
          userPredictions = userPredictions.filter(p => p.userAddress.equals(publicKey!));
        } else {
          // Get all user predictions
          userPredictions = await marketContract.getUserPredictions(publicKey!);
        }
        
        setPredictions(userPredictions);
        
        // Get details for each market
        const marketMap = new Map<string, Market>();
        
        for (const prediction of userPredictions) {
          const marketKey = prediction.marketAddress.toString();
          
          if (!marketMap.has(marketKey)) {
            try {
              const marketDetails = await marketContract.getMarket(prediction.marketAddress);
              if (marketDetails) {
                marketMap.set(marketKey, marketDetails);
              }
            } catch (err) {
              console.error(`Error fetching market ${marketKey}:`, err);
            }
          }
        }
        
        setMarkets(marketMap);
      } catch (err) {
        console.error("Error loading predictions:", err);
        setError("Failed to load transaction history. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadPredictions();
  }, [publicKey, connection, marketAddress]);
  
  // Filter predictions
  const filteredPredictions = predictions.filter(prediction => {
    if (filter === 'all') return true;
    if (filter === 'won') return prediction.status === 'won';
    if (filter === 'lost') return prediction.status === 'lost';
    if (filter === 'pending') return prediction.status === 'pending';
    return true;
  });
  
  // Format date to readable string
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Get shortened address
  const shortenAddress = (address: string) => {
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };
  
  // Wallet not connected
  if (!publicKey) {
    return (
      <motion.div
        className="bg-[#151518] rounded-lg border border-white/10 p-5 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-[#B0B0B0] mb-4">
          Connect your wallet to view your transaction history.
        </p>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      className="bg-[#151518] rounded-lg border border-white/10 p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h3 className="text-xl font-medium text-[#F5F5F5] mb-4">Transaction History</h3>
      
      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {['all', 'won', 'lost', 'pending'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
              filter === f
                ? 'bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7] text-white'
                : 'bg-[#0E0E10] text-[#B0B0B0] hover:bg-[#1A1A1D]'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <motion.div
            className="w-10 h-10 border-t-2 border-[#5F6FFF] rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="mt-4 text-[#B0B0B0]">Loading transaction history...</p>
        </div>
      ) : error ? (
        // Error State
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
          <p className="text-red-300">{error}</p>
          <button
            className="mt-2 text-[#5F6FFF] hover:underline"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      ) : filteredPredictions.length === 0 ? (
        // Empty State
        <div className="text-center py-8 border border-dashed border-white/10 rounded-lg">
          <svg className="w-12 h-12 text-[#B0B0B0] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2 text-[#B0B0B0]">
            {filter === 'all' 
              ? "You don't have any transactions yet."
              : `No ${filter} predictions found.`}
          </p>
        </div>
      ) : (
        // Transaction List
        <div className="space-y-3">
          <LazyMotion>
            <AnimatePresence>
              {filteredPredictions.map((prediction, index) => {
              const market = markets.get(prediction.marketAddress.toString());
              
              return (
                <motion.div
                  key={`${prediction.marketAddress.toString()}-${index}`}
                  className="bg-[#0E0E10] rounded-lg p-4 hover:bg-[#1A1A1D] transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <div className="flex items-start justify-between">
                    {/* Market Info */}
                    <div className="flex-grow">
                      <div className="flex items-center mb-1">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          prediction.status === 'won' ? 'bg-green-500' : 
                          prediction.status === 'lost' ? 'bg-red-500' : 
                          'bg-amber-500'
                        }`} />
                        <h4 className="text-[#F5F5F5] font-medium truncate pr-4">
                          {market ? market.question : shortenAddress(prediction.marketAddress.toString())}
                        </h4>
                      </div>
                      
                      <p className="text-xs text-[#B0B0B0]">
                        {formatDate(prediction.timestamp)}
                      </p>
                      
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="bg-[#151518] text-xs px-2 py-1 rounded">
                          <span className="text-[#B0B0B0] mr-1">Stake:</span>
                          <span className="text-[#F5F5F5]">{prediction.amount} {market?.tokenMint ? shortenAddress(market.tokenMint.toString()) : 'tokens'}</span>
                        </span>
                        
                        <span className="bg-[#151518] text-xs px-2 py-1 rounded">
                          <span className="text-[#B0B0B0] mr-1">Outcome:</span>
                          <span className="text-[#F5F5F5]">
                            {market?.outcomes[prediction.outcomeIndex] || `Outcome ${prediction.outcomeIndex}`}
                          </span>
                        </span>
                        
                        <span className={`text-xs px-2 py-1 rounded ${
                          prediction.status === 'won' ? 'bg-green-500/20 text-green-400' :
                          prediction.status === 'lost' ? 'bg-red-500/20 text-red-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {prediction.status === 'won' ? 'Won' : 
                           prediction.status === 'lost' ? 'Lost' : 
                           'Pending'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Reward Info */}
                    {prediction.status === 'won' && (
                      <div className="text-right">
                        <p className="text-sm text-[#B0B0B0]">Reward</p>
                        <p className="text-lg font-medium text-green-400">
                          {prediction.potentialReward ?? '?'} {market?.tokenMint ? shortenAddress(market.tokenMint.toString()) : ''}
                        </p>
                        
                        <div className="mt-1 text-xs text-green-600">
                          {prediction.claimed ? (
                            <span className="flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              Claimed
                            </span>
                          ) : (
                            <span className="text-amber-500">Not Claimed</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
            </AnimatePresence>
          </LazyMotion>
        </div>
      )}
    </motion.div>
  );
}
