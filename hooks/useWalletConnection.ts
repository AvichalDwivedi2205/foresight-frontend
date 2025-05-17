"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, SendOptions } from "@solana/web3.js";
import { useCallback } from "react";

export const useWalletConnection = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction, sendTransaction, connected, connecting, disconnect } = useWallet();

  // Format a wallet address for display
  const formatWalletAddress = useCallback((address: string | null): string => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }, []);

  // Get the wallet address
  const getWalletAddress = useCallback((): string | null => {
    if (!publicKey) return null;
    return publicKey.toBase58();
  }, [publicKey]);

  // Get the formatted wallet address
  const getFormattedWalletAddress = useCallback((): string => {
    if (!publicKey) return "";
    return formatWalletAddress(publicKey.toBase58());
  }, [publicKey, formatWalletAddress]);

  // Sign and send a transaction
  const signAndSendTransaction = useCallback(
    async (transaction: Transaction, signers?: any[], options?: SendOptions) => {
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected");
      }

      try {
        transaction.feePayer = publicKey;
        transaction.recentBlockhash = (
          await connection.getLatestBlockhash()
        ).blockhash;

        if (signers?.length) {
          transaction.partialSign(...signers);
        }

        const signedTransaction = await signTransaction(transaction);
        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize(),
          options
        );

        return signature;
      } catch (error) {
        console.error("Transaction error:", error);
        throw error;
      }
    },
    [publicKey, signTransaction, connection]
  );

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    if (disconnect) {
      disconnect();
    }
  }, [disconnect]);

  return {
    publicKey,
    connected,
    connecting,
    getWalletAddress,
    getFormattedWalletAddress,
    signAndSendTransaction,
    disconnectWallet,
  };
};

export default useWalletConnection; 