"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useConnection as useSolanaConnection, useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { useToast } from "./hooks/useToast";

type WalletState = {
  connected: boolean;
  walletAddress: string | null;
  balance: number;
  loading: boolean;
};

type WalletContextType = {
  wallet: any;
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  sendTransaction: (transaction: Transaction) => Promise<string>;
  balance: number;
  getNativeBalance: () => Promise<number>;
  WalletButton: typeof WalletMultiButton;
};

const WalletContext = createContext<WalletContextType | null>(null);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

type WalletProviderProps = {
  children: React.ReactNode;
};

export function WalletProvider({ children }: WalletProviderProps) {
  // Use Solana wallet adapter hooks
  const { publicKey, connected, connecting, disconnect, signTransaction: walletSignTransaction, signAllTransactions: walletSignAllTransactions, sendTransaction: walletSendTransaction } = useSolanaWallet();
  const { connection } = useSolanaConnection();
  const { showToast } = useToast();
  
  // Replace Recoil with React useState
  const [walletState, setWalletState] = useState<WalletState>({
    connected: false,
    walletAddress: null,
    balance: 0,
    loading: false,
  });

  // Update wallet state when connected status changes
  useEffect(() => {
    if (connected && publicKey) {
      setWalletState(prev => ({
        ...prev,
        connected: true,
        walletAddress: publicKey.toString(),
      }));
    } else if (!connected) {
      setWalletState(prev => ({
        ...prev,
        connected: false,
        walletAddress: null,
        balance: 0,
      }));
    }
  }, [connected, publicKey]);

  // Update balance when connected
  useEffect(() => {
    if (connected && publicKey && connection) {
      const updateBalance = async () => {
        try {
          const balance = await getNativeBalance();
          setWalletState(prev => ({ ...prev, balance }));
        } catch (error) {
          console.error("Failed to fetch balance:", error);
        }
      };
      
      updateBalance();
      
      // Subscribe to account changes to keep balance updated
      const subscriptionId = connection.onAccountChange(
        publicKey,
        () => { updateBalance(); },
        'confirmed'
      );
      
      return () => {
        connection.removeAccountChangeListener(subscriptionId);
      };
    }
  }, [connected, publicKey, connection]);

  const connectWallet = async () => {
    try {
      // Clicking the WalletMultiButton will handle connection
      // This is kept for API compatibility with the previous implementation
      showToast("Please select a wallet from the modal", "info");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      showToast("Failed to connect wallet", "error");
    }
  };

  const disconnectWallet = async () => {
    try {
      await disconnect();
      setWalletState({
        connected: false,
        walletAddress: null,
        balance: 0,
        loading: false,
      });
      showToast("Wallet disconnected", "success");
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      showToast("Failed to disconnect wallet", "error");
    }
  };

  const getNativeBalance = async (): Promise<number> => {
    if (!connection || !publicKey) return 0;
    
    try {
      const balance = await connection.getBalance(publicKey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error("Failed to get balance:", error);
      return 0;
    }
  };

  // Create safe wrapper functions that handle undefined cases
  const signTransaction = async (transaction: Transaction): Promise<Transaction> => {
    if (!walletSignTransaction) throw new Error("Wallet does not support signing transactions");
    return walletSignTransaction(transaction);
  };

  const signAllTransactions = async (transactions: Transaction[]): Promise<Transaction[]> => {
    if (!walletSignAllTransactions) throw new Error("Wallet does not support signing multiple transactions");
    return walletSignAllTransactions(transactions) as Promise<Transaction[]>;
  };

  // Create a wrapper for sendTransaction that matches our interface
  const sendTransaction = async (transaction: Transaction): Promise<string> => {
    if (!walletSendTransaction) throw new Error("Wallet does not support sending transactions");
    if (!connection) throw new Error("Connection not available");
    
    // Call the actual sendTransaction with the required parameters
    return walletSendTransaction(transaction, connection);
  };

  return (
    <WalletContext.Provider
      value={{
        wallet: null, // Not needed with wallet adapter
        publicKey,
        connected,
        connecting,
        connectWallet,
        disconnectWallet,
        signTransaction,
        signAllTransactions,
        sendTransaction,
        balance: walletState.balance,
        getNativeBalance,
        WalletButton: WalletMultiButton,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}