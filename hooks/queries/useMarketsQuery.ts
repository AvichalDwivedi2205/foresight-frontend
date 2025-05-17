"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMarketContract } from "@/hooks/useMarketContract";
import { useMarketsStore, MarketFilters } from "@/store/marketsStore";
import { MarketParams } from "@/services/contracts/models";
import { PublicKey } from "@solana/web3.js";
import { useTransactionStore } from "@/store/transactionStore";

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
        
        // Update state in the store
        setMarkets(filteredMarkets);
        setError(null);
        return filteredMarkets;
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
          setCurrentMarket(market);
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
        
        setUserMarkets(userMarkets);
        setError(null);
        return userMarkets;
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