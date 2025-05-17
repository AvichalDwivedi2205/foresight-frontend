"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { Connection, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { useToast } from "./hooks/useToast";
import { getRpcEndpoint } from "./config";

// Import wallet adapter libraries
import { WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider, useWallet as useWalletAdapter, useConnection as useSolanaConnection } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";

// Need to import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

// Define our wallet context interface
interface WalletContextType {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>;
  signAllTransactions: (transactions: (Transaction | VersionedTransaction)[]) => Promise<(Transaction | VersionedTransaction)[]>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  sendTransaction: (transaction: Transaction | VersionedTransaction) => Promise<string>;
  WalletButton: () => React.JSX.Element;
  balance: number;
}

// Create the wallet context
const WalletContext = createContext<WalletContextType | null>(null);

// Provider component that wraps the app
export function WalletProviderRoot({ children }: { children: ReactNode }) {
  // You can pass in any custom network
  const network = WalletAdapterNetwork.Devnet;
  // Get the RPC endpoint directly from config instead of using useConnection
  const endpoint = getRpcEndpoint();

  // Define the wallets we want to support
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContextWrapper>{children}</WalletContextWrapper>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

// Wrapper component that provides our custom wallet API
function WalletContextWrapper({ children }: { children: ReactNode }) {
  const adapter = useWalletAdapter();
  // Use the connection from the Solana connection provider
  const { connection } = useSolanaConnection();
  const { showToast } = useToast();

  const [balance, setBalance] = useState<number>(0);

  // Fetch wallet balance when connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (adapter.publicKey && connection) {
        try {
          const balanceInLamports = await connection.getBalance(adapter.publicKey);
          setBalance(balanceInLamports / 1_000_000_000); // Convert lamports to SOL
        } catch (error) {
          console.error("Error fetching balance:", error);
          setBalance(0);
        }
      } else {
        setBalance(0);
      }
    };

    fetchBalance();

    // Set up a refresh interval when connected
    let intervalId: NodeJS.Timeout | null = null;
    if (adapter.connected && adapter.publicKey) {
      intervalId = setInterval(fetchBalance, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [adapter.publicKey, adapter.connected, connection]);

  // Handle wallet connection & disconnection
  const connectWallet = async () => {
    if (adapter.connected) {
      return;
    }

    try {
      await adapter.connect();
      showToast("Wallet connected successfully", "success");
    } catch (error: any) {
      showToast(`Failed to connect wallet: ${error.message || "Unknown error"}`, "error");
    }
  };

  const disconnectWallet = async () => {
    if (!adapter.connected) {
      return;
    }

    try {
      await adapter.disconnect();
      showToast("Wallet disconnected", "info");
    } catch (error: any) {
      showToast(`Failed to disconnect wallet: ${error.message || "Unknown error"}`, "error");
    }
  };

  // Custom wallet button component
  const WalletButton = () => {
    return <WalletMultiButton />;
  };

  // Define transaction signing methods
  const signTransaction = async (transaction: Transaction | VersionedTransaction) => {
    if (!adapter.signTransaction) {
      throw new Error("Wallet does not support transaction signing");
    }
    return await adapter.signTransaction(transaction);
  };

  const signAllTransactions = async (transactions: (Transaction | VersionedTransaction)[]) => {
    if (!adapter.signAllTransactions) {
      throw new Error("Wallet does not support signing multiple transactions");
    }
    return await adapter.signAllTransactions(transactions);
  };

  const signMessage = async (message: Uint8Array) => {
    if (!adapter.signMessage) {
      throw new Error("Wallet does not support message signing");
    }
    return await adapter.signMessage(message);
  };

  // Send transaction helper
  const sendTransaction = async (transaction: Transaction | VersionedTransaction) => {
    if (!adapter.signTransaction || !adapter.publicKey || !connection) {
      throw new Error("Wallet not connected or does not support transaction signing");
    }

    try {
      // Add a recent blockhash if transaction is not versioned
      if (transaction instanceof Transaction) {
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        transaction.feePayer = adapter.publicKey;
      }

      // Sign and send the transaction
      const signedTransaction = await adapter.signTransaction(transaction);
      
      // Send the transaction
      const signature = await connection.sendRawTransaction(
        signedTransaction instanceof Transaction 
          ? signedTransaction.serialize() 
          : signedTransaction.serialize()
      );

      // Confirm transaction
      await connection.confirmTransaction(signature, "confirmed");

      return signature;
    } catch (error) {
      console.error("Error sending transaction:", error);
      throw error;
    }
  };

  // Create the wallet context value
  const walletContextValue: WalletContextType = {
    publicKey: adapter.publicKey,
    connected: adapter.connected,
    connecting: adapter.connecting,
    connectWallet,
    disconnectWallet,
    signTransaction,
    signAllTransactions,
    signMessage,
    sendTransaction,
    WalletButton,
    balance,
  };

  return <WalletContext.Provider value={walletContextValue}>{children}</WalletContext.Provider>;
}

// Custom hook for using the wallet context
export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}