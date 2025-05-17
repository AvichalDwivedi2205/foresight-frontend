import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/lib/wallet-provider';
import { useIndexer, Prediction } from '@/lib/indexer';
import { useToast } from './useToast';

interface UseUserPredictionsReturn {
  predictions: Prediction[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  hasPrediction: (marketId: string) => boolean;
  getPrediction: (marketId: string) => Prediction | null;
  getWinningPredictions: () => Prediction[];
  getClaimablePredictions: () => Prediction[];
}

export function useUserPredictions(): UseUserPredictionsReturn {
  const { connected, publicKey } = useWallet();
  const { useUserPredictions } = useIndexer();
  const { showToast } = useToast();
  
  // Fetch user predictions
  const { 
    data: predictionsData, 
    isLoading, 
    error,
    refetch 
  } = useUserPredictions(connected && publicKey ? publicKey.toString() : '');
  
  // Check if user has a prediction for a specific market
  const hasPrediction = useCallback((marketId: string): boolean => {
    if (!predictionsData) return false;
    return predictionsData.some(p => p.market === marketId);
  }, [predictionsData]);
  
  // Get a user's prediction for a specific market
  const getPrediction = useCallback((marketId: string): Prediction | null => {
    if (!predictionsData) return null;
    return predictionsData.find(p => p.market === marketId) || null;
  }, [predictionsData]);
  
  // Get all winning predictions (that matched the winning outcome)
  const getWinningPredictions = useCallback((): Prediction[] => {
    if (!predictionsData) return [];
    return predictionsData.filter(p => {
      // This would need to fetch the market data to check if prediction matches winning outcome
      // For now, we'll assume the market data is accessible via a cache/context
      const market = window.__MARKET_CACHE__?.[p.market];
      if (!market || !market.resolved || market.winning_outcome === undefined) return false;
      return p.outcome_index === market.winning_outcome;
    });
  }, [predictionsData]);
  
  // Get all predictions that can be claimed (winning and not yet claimed)
  const getClaimablePredictions = useCallback((): Prediction[] => {
    if (!predictionsData) return [];
    return predictionsData.filter(p => {
      // Check if prediction is winning and not yet claimed
      const market = window.__MARKET_CACHE__?.[p.market];
      if (!market || !market.resolved || market.winning_outcome === undefined) return false;
      return p.outcome_index === market.winning_outcome && !p.claimed;
    });
  }, [predictionsData]);
  
  // Provide a mock window object for TypeScript
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.__MARKET_CACHE__) {
      window.__MARKET_CACHE__ = {};
    }
  }, []);
  
  return {
    predictions: predictionsData || [],
    isLoading,
    error: error || null,
    refetch,
    hasPrediction,
    getPrediction,
    getWinningPredictions,
    getClaimablePredictions
  };
}

// Add this to make TypeScript happy
declare global {
  interface Window {
    __MARKET_CACHE__?: Record<string, any>;
  }
} 