"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { PublicKey } from "@solana/web3.js";
import { UserStats } from "@/services/contracts/models";

interface UserProfile {
  username?: string;
  avatarUrl?: string;
  bio?: string;
  social?: {
    twitter?: string;
    discord?: string;
    website?: string;
    telegram?: string;
  };
  isProfileComplete: boolean;
}

export interface UserState {
  // Wallet data
  publicKey: PublicKey | null;
  walletConnected: boolean;
  connecting: boolean;

  // User profile
  profile: UserProfile;
  stats: UserStats;
  recentPredictions: any[]; // Will be replaced with actual prediction type

  // Actions
  setWalletState: (publicKey: PublicKey | null, connected: boolean, connecting: boolean) => void;
  setUserStats: (stats: UserStats) => void;
  setRecentPredictions: (predictions: any[]) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  resetUserStore: () => void;
}

const initialUserStats: UserStats = {
  totalPredictions: 0,
  winningPredictions: 0,
  accuracy: 0,
  totalStaked: 0,
  totalEarnings: 0,
};

const initialProfile: UserProfile = {
  isProfileComplete: false,
};

// Create user store with persistence
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // Initial state
      publicKey: null,
      walletConnected: false,
      connecting: false,
      profile: initialProfile,
      stats: initialUserStats,
      recentPredictions: [],

      // Actions
      setWalletState: (publicKey, connected, connecting) => 
        set({ publicKey, walletConnected: connected, connecting }),
      
      setUserStats: (stats) => set({ stats }),
      
      setRecentPredictions: (predictions) => set({ recentPredictions: predictions }),
      
      updateProfile: (updates) => 
        set((state) => ({ 
          profile: { 
            ...state.profile, 
            ...updates, 
            isProfileComplete: true 
          } 
        })),
      
      resetUserStore: () => 
        set({ 
          publicKey: null, 
          walletConnected: false, 
          connecting: false,
          profile: initialProfile,
          stats: initialUserStats,
          recentPredictions: [],
        }),
    }),
    {
      name: "foresight-user-storage", // Name for localStorage
      storage: createJSONStorage(() => localStorage),
      // Don't persist the publicKey and connection states
      partialize: (state) => ({
        profile: state.profile,
      }),
    }
  )
);

export default useUserStore; 