import { useState, useEffect, useCallback } from 'react';
import { useIndexer, Market } from '@/lib/indexer';
import { useConnection } from '@/lib/connection';
import { useToast } from './useToast';

interface UseMarketDataParams {
  marketId?: string;
  filter?: string;
  creatorAddress?: string;
}

interface UseMarketDataReturn {
  markets: Market[];
  market: Market | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useMarketData({ marketId, filter, creatorAddress }: UseMarketDataParams = {}): UseMarketDataReturn {
  const { connection } = useConnection();
  const { useMarkets, useMarket, useCreatorMarkets } = useIndexer();
  const { showToast } = useToast();
  
  // Fetch multiple markets based on filter
  const { 
    data: marketsData, 
    isLoading: isMarketsLoading, 
    error: marketsError, 
    refetch: refetchMarkets 
  } = useMarkets(filter);
  
  // Fetch a single market by ID
  const {
    data: marketData,
    isLoading: isMarketLoading,
    error: marketError,
    refetch: refetchMarket
  } = useMarket(marketId || '');
  
  // Fetch markets by creator
  const {
    data: creatorMarketsData,
    isLoading: isCreatorMarketsLoading,
    error: creatorMarketsError,
    refetch: refetchCreatorMarkets
  } = useCreatorMarkets(creatorAddress || '');
  
  // Determine which data to return based on params
  const getReturnValues = useCallback((): UseMarketDataReturn => {
    if (marketId) {
      return {
        markets: [],
        market: marketData || null,
        isLoading: isMarketLoading,
        error: marketError || null,
        refetch: refetchMarket,
      };
    } else if (creatorAddress) {
      return {
        markets: creatorMarketsData || [],
        market: null,
        isLoading: isCreatorMarketsLoading,
        error: creatorMarketsError || null,
        refetch: refetchCreatorMarkets,
      };
    } else {
      return {
        markets: marketsData || [],
        market: null,
        isLoading: isMarketsLoading,
        error: marketsError || null,
        refetch: refetchMarkets,
      };
    }
  }, [
    marketId, creatorAddress,
    marketData, isMarketLoading, marketError, refetchMarket,
    creatorMarketsData, isCreatorMarketsLoading, creatorMarketsError, refetchCreatorMarkets,
    marketsData, isMarketsLoading, marketsError, refetchMarkets
  ]);
  
  return getReturnValues();
} 