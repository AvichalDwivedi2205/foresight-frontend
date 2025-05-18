"use client";

import { create } from "zustand";
import { Market, MarketStats } from "@/services/contracts/models";
import { PublicKey } from "@solana/web3.js";

export type Category = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
};

export type MarketWithStats = Market & {
  stats: MarketStats;
};

export type MarketFilters = {
  category?: string;
  creator?: PublicKey | string;
  search?: string;
  resolved?: boolean;
  orderBy?: 'newest' | 'endingSoon' | 'mostLiquidity' | 'mostPopular';
};

export interface MarketsState {
  // Markets data
  markets: MarketWithStats[];
  featuredMarkets: MarketWithStats[];
  currentMarket: MarketWithStats | null;
  userMarkets: MarketWithStats[];
  categories: Category[];
  
  // UI state
  isLoading: boolean;
  selectedCategory: string | null;
  filters: MarketFilters;
  hasNextPage: boolean;
  currentPage: number;
  error: string | null;

  // Actions
  setMarkets: (markets: MarketWithStats[]) => void;
  setFeaturedMarkets: (markets: MarketWithStats[]) => void;
  setCurrentMarket: (market: MarketWithStats | null) => void;
  setUserMarkets: (markets: MarketWithStats[]) => void;
  setCategories: (categories: Category[]) => void;
  setSelectedCategory: (category: string | null) => void;
  setFilters: (filters: Partial<MarketFilters>) => void;
  resetFilters: () => void;
  setLoadingState: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (currentPage: number, hasNextPage: boolean) => void;
  resetMarketsStore: () => void;
}

const defaultFilters: MarketFilters = {
  orderBy: 'newest',
};

// Create markets store
export const useMarketsStore = create<MarketsState>()((set) => ({
  // Initial state
  markets: [],
  featuredMarkets: [],
  currentMarket: null,
  userMarkets: [],
  categories: [
    { id: 'crypto', name: 'Crypto' },
    { id: 'politics', name: 'Politics' },
    { id: 'sports', name: 'Sports' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'finance', name: 'Finance' },
    { id: 'technology', name: 'Technology' },
    { id: 'science', name: 'Science' },
    { id: 'other', name: 'Other' },
  ],
  isLoading: false,
  selectedCategory: null,
  filters: defaultFilters,
  hasNextPage: false,
  currentPage: 1,
  error: null,

  // Actions
  setMarkets: (markets) => set({ markets }),
  
  setFeaturedMarkets: (markets) => set({ featuredMarkets: markets }),
  
  setCurrentMarket: (market) => set({ currentMarket: market }),
  
  setUserMarkets: (markets) => set({ userMarkets: markets }),
  
  setCategories: (categories) => set({ categories }),
  
  setSelectedCategory: (category) => set({ 
    selectedCategory: category,
    filters: {
      ...defaultFilters,
      category: category || undefined,
    },
    currentPage: 1
  }),
  
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters },
    currentPage: 1
  })),
  
  resetFilters: () => set({ 
    filters: defaultFilters,
    selectedCategory: null,
    currentPage: 1
  }),
  
  setLoadingState: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  setPagination: (currentPage, hasNextPage) => set({ currentPage, hasNextPage }),
  
  resetMarketsStore: () => set({
    markets: [],
    featuredMarkets: [],
    currentMarket: null,
    userMarkets: [],
    isLoading: false,
    selectedCategory: null,
    filters: defaultFilters,
    hasNextPage: false,
    currentPage: 1,
    error: null,
  }),
}));

export default useMarketsStore; 