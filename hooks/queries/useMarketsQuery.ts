"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMarketContract } from "@/hooks/useMarketContract";
import { useMarketsStore, MarketFilters, MarketWithStats } from "@/store/marketsStore";
import { Market, MarketParams, MarketStats } from "@/services/contracts/models";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useTransactionStore } from "@/store/transactionStore";

// Helper function to convert Market to MarketWithStats
function convertToMarketWithStats(market: Market): MarketWithStats {
  const totalAmount = market.yesAmount.add(market.noAmount);
  
  let yesPercentage = 0;
  let noPercentage = 0;
  
  if (!totalAmount.isZero()) {
    yesPercentage = (market.yesAmount.toNumber() / totalAmount.toNumber()) * 100;
    noPercentage = (market.noAmount.toNumber() / totalAmount.toNumber()) * 100;
  }
  
  const stats: MarketStats = {
    totalPredictions: 0, // This would need data from the contract
    yesPercentage,
    noPercentage,
    endTimestamp: new Date(market.endTimestamp.toNumber() * 1000),
    resolvedTimestamp: market.resolvedTimestamp 
      ? new Date(market.resolvedTimestamp.toNumber() * 1000) 
      : undefined,
    outcome: market.outcome,
    liquidity: totalAmount.toNumber() / LAMPORTS_PER_SOL,
  };
  
  return {
    ...market,
    stats
  };
}

// Query keys for caching
export const marketsQueryKeys = {
  all: ['markets'] as const,
  lists: () => [...marketsQueryKeys.all, 'list'] as const,
  list: (filters: MarketFilters) => [...marketsQueryKeys.lists(), filters] as const,
  details: () => [...marketsQueryKeys.all, 'detail'] as const,
  detail: (address: string) => [...marketsQueryKeys.details(), address] as const,
  userMarkets: (userAddress: string) => [...marketsQueryKeys.all, 'user', userAddress] as const,
};

// Fetch markets with optional filtering
export function useMarketsQuery(filters: MarketFilters = {}) {
  const { getAllMarkets } = useMarketContract();
  const { setMarkets, setLoadingState, setError } = useMarketsStore();
  
  return useQuery({
    queryKey: marketsQueryKeys.list(filters),
    queryFn: async () => {
      setLoadingState(true);
      try {
        const allMarkets = await getAllMarkets();
        
        // Apply filters
        let filteredMarkets = [...allMarkets];
        
        if (filters.category) {
          filteredMarkets = filteredMarkets.filter(m => m.category === filters.category);
        }
        
        if (filters.creator) {
          const creatorStr = typeof filters.creator === 'string' 
            ? filters.creator 
            : filters.creator.toBase58();
          filteredMarkets = filteredMarkets.filter(m => 
            m.creator.toBase58() === creatorStr
          );
        }
        
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredMarkets = filteredMarkets.filter(m => 
            m.question.toLowerCase().includes(searchTerm) || 
            m.description.toLowerCase().includes(searchTerm)
          );
        }
        
        if (filters.resolved !== undefined) {
          filteredMarkets = filteredMarkets.filter(m => 
            (m.outcome !== 0) === filters.resolved
          );
        }
        
        // Sort
        if (filters.orderBy) {
          switch (filters.orderBy) {
            case 'newest':
              // Assuming markets have a creation timestamp
              filteredMarkets.sort((a, b) => b.endTimestamp.toNumber() - a.endTimestamp.toNumber());
              break;
            case 'endingSoon':
              filteredMarkets.sort((a, b) => a.endTimestamp.toNumber() - b.endTimestamp.toNumber());
              break;
            case 'mostLiquidity':
              filteredMarkets.sort((a, b) => b.totalLiquidity.toNumber() - a.totalLiquidity.toNumber());
              break;
            case 'mostPopular':
              // We would need some kind of popularity metric
              filteredMarkets.sort((a, b) => 
                (b.yesAmount.toNumber() + b.noAmount.toNumber()) - 
                (a.yesAmount.toNumber() + a.noAmount.toNumber())
              );
              break;
          }
        }
        
        // Convert markets to MarketWithStats
        const marketsWithStats = filteredMarkets.map(market => convertToMarketWithStats(market));
        
        // Update state in the store
        setMarkets(marketsWithStats);
        setError(null);
        return marketsWithStats;
      } catch (error) {
        console.error("Error fetching markets:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        setError(`Failed to fetch markets: ${errorMessage}`);
        throw error;
      } finally {
        setLoadingState(false);
      }
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

// Fetch single market by address
export function useMarketQuery(address: string | null) {
  const { getMarket } = useMarketContract();
  const { setCurrentMarket, setLoadingState, setError } = useMarketsStore();
  
  return useQuery({
    queryKey: marketsQueryKeys.detail(address || 'null'),
    queryFn: async () => {
      if (!address) return null;
      
      setLoadingState(true);
      try {
        const marketPk = new PublicKey(address);
        const market = await getMarket(marketPk);
        
        if (market) {
          // Convert to MarketWithStats
          const marketWithStats = convertToMarketWithStats(market);
          setCurrentMarket(marketWithStats);
          setError(null);
        }
        
        return market;
      } catch (error) {
        console.error("Error fetching market:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        setError(`Failed to fetch market: ${errorMessage}`);
        throw error;
      } finally {
        setLoadingState(false);
      }
    },
    enabled: !!address,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Fetch markets created by a specific user
export function useUserMarketsQuery(userAddress: string | null) {
  const { getAllMarkets } = useMarketContract();
  const { setUserMarkets, setLoadingState, setError } = useMarketsStore();
  
  return useQuery({
    queryKey: marketsQueryKeys.userMarkets(userAddress || 'null'),
    queryFn: async () => {
      if (!userAddress) return [];
      
      setLoadingState(true);
      try {
        const allMarkets = await getAllMarkets();
        const userPk = new PublicKey(userAddress);
        
        const userMarkets = allMarkets.filter(m => 
          m.creator.equals(userPk)
        );
        
        // Convert to MarketWithStats
        const userMarketsWithStats = userMarkets.map(market => convertToMarketWithStats(market));
        
        setUserMarkets(userMarketsWithStats);
        setError(null);
        return userMarketsWithStats;
      } catch (error) {
        console.error("Error fetching user markets:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        setError(`Failed to fetch user markets: ${errorMessage}`);
        throw error;
      } finally {
        setLoadingState(false);
      }
    },
    enabled: !!userAddress,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Create market mutation
export function useCreateMarketMutation() {
  const { createMarket } = useMarketContract();
  const queryClient = useQueryClient();
  const { addTransaction, updateTransaction } = useTransactionStore();
  
  return useMutation({
    mutationFn: async (params: MarketParams) => {
      // Add transaction to store
      const txId = addTransaction({
        signature: 'pending',
        type: 'createMarket',
        status: 'pending',
        message: `Creating market: ${params.question}`,
      });
      
      try {
        // Call contract function to create the market
        const signature = await createMarket(params);
        
        // Update transaction status
        updateTransaction(txId, {
          signature,
          status: 'confirmed',
          message: `Market created: ${params.question}`,
        });
        
        return signature;
      } catch (error) {
        console.error("Error creating market:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        
        // Update transaction status
        updateTransaction(txId, {
          status: 'failed',
          error: errorMessage,
        });
        
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: marketsQueryKeys.lists() });
    },
  });
} 