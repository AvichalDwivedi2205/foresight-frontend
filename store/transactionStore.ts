"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type TransactionType = 
  | 'createMarket'
  | 'makePrediction'
  | 'claimRewards'
  | 'transfer'
  | 'swap'
  | 'other';

export type TransactionStatus = 
  | 'pending'
  | 'confirmed'
  | 'failed';

export interface Transaction {
  id: string;
  signature: string;
  type: TransactionType;
  status: TransactionStatus;
  timestamp: number;
  amount?: number;
  token?: string;
  marketAddress?: string;
  message?: string;
  error?: string;
}

export interface TransactionState {
  // Transaction data
  pendingTransactions: Transaction[];
  recentTransactions: Transaction[];
  currentTransaction: Transaction | null;
  
  // UI state
  isProcessing: boolean;
  error: string | null;

  // Actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => string;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  clearAllTransactions: () => void;
  setCurrentTransaction: (transaction: Transaction | null) => void;
  setProcessingState: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
}

// Create transaction store with persistence
export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      // Initial state
      pendingTransactions: [],
      recentTransactions: [],
      currentTransaction: null,
      isProcessing: false,
      error: null,

      // Actions
      addTransaction: (transaction) => {
        const id = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const newTransaction: Transaction = {
          id,
          timestamp: Date.now(),
          ...transaction,
        };
        
        set((state) => ({
          pendingTransactions: [newTransaction, ...state.pendingTransactions],
          currentTransaction: newTransaction,
        }));
        
        return id;
      },
      
      updateTransaction: (id, updates) => {
        set((state) => {
          // Check if the transaction is in pending
          const pendingIndex = state.pendingTransactions.findIndex(tx => tx.id === id);
          
          if (pendingIndex >= 0) {
            const updatedPending = [...state.pendingTransactions];
            const updatedTx = { ...updatedPending[pendingIndex], ...updates };
            updatedPending[pendingIndex] = updatedTx;
            
            // If status changed to confirmed or failed, move to recent
            let updatedRecent = [...state.recentTransactions];
            if (updates.status && (updates.status === 'confirmed' || updates.status === 'failed')) {
              updatedRecent = [updatedTx, ...updatedRecent].slice(0, 10); // Keep only recent 10
              updatedPending.splice(pendingIndex, 1);
            }
            
            return {
              pendingTransactions: updatedPending,
              recentTransactions: updatedRecent,
              currentTransaction: state.currentTransaction?.id === id 
                ? updatedTx 
                : state.currentTransaction,
            };
          }
          
          // Check if in recent transactions
          const recentIndex = state.recentTransactions.findIndex(tx => tx.id === id);
          if (recentIndex >= 0) {
            const updatedRecent = [...state.recentTransactions];
            updatedRecent[recentIndex] = { ...updatedRecent[recentIndex], ...updates };
            
            return {
              recentTransactions: updatedRecent,
              currentTransaction: state.currentTransaction?.id === id 
                ? updatedRecent[recentIndex] 
                : state.currentTransaction,
            };
          }
          
          return state;
        });
      },
      
      removeTransaction: (id) => {
        set((state) => ({
          pendingTransactions: state.pendingTransactions.filter(tx => tx.id !== id),
          recentTransactions: state.recentTransactions.filter(tx => tx.id !== id),
          currentTransaction: state.currentTransaction?.id === id 
            ? null 
            : state.currentTransaction,
        }));
      },
      
      clearAllTransactions: () => {
        set({
          pendingTransactions: [],
          recentTransactions: [],
          currentTransaction: null,
        });
      },
      
      setCurrentTransaction: (transaction) => {
        set({ currentTransaction: transaction });
      },
      
      setProcessingState: (isProcessing) => {
        set({ isProcessing });
      },
      
      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: "foresight-transactions-storage", // Name for localStorage
      storage: createJSONStorage(() => localStorage),
      // Only store the recent transactions
      partialize: (state) => ({
        recentTransactions: state.recentTransactions,
      }),
    }
  )
);

export default useTransactionStore; 