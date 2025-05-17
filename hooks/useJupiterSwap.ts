"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { JupiterService } from "@/services/contracts/jupiterService";
import { TransactionService } from "@/services/contracts/transactionService";
import { TokenInfo } from "@/services/contracts/models";

export const useJupiterSwap = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize the Jupiter service
  const jupiterService = useMemo(() => {
    return new JupiterService(connection);
  }, [connection]);
  
  // Initialize the transaction service
  const transactionService = useMemo(() => {
    return new TransactionService(connection);
  }, [connection]);
  
  // Get all supported tokens
  const getSupportedTokens = useCallback(async (): Promise<TokenInfo[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const tokens = await jupiterService.getSupportedTokens();
      return tokens;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to fetch tokens: ${errorMessage}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [jupiterService]);
  
  // Get a quote for swapping tokens
  const getQuote = useCallback(
    async (
      inputMint: string,
      outputMint: string,
      amount: number,
      slippageBps: number = 100
    ) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const quote = await jupiterService.getQuote(
          inputMint,
          outputMint,
          amount,
          slippageBps
        );
        return quote;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to get quote: ${errorMessage}`);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [jupiterService]
  );
  
  // Swap tokens
  const swapTokens = useCallback(
    async (
      inputMint: string,
      outputMint: string,
      amount: number,
      slippageBps: number = 100
    ) => {
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected");
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Create the swap transaction
        const transaction = await jupiterService.createSwapTransaction(
          publicKey,
          inputMint,
          outputMint,
          amount,
          slippageBps
        );
        
        // Sign and send the transaction
        const signature = await transactionService.signSendAndConfirmTransaction(
          transaction,
          signTransaction,
          publicKey
        );
        
        return signature;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to swap tokens: ${errorMessage}`);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [jupiterService, transactionService, publicKey, signTransaction]
  );
  
  // Get token price
  const getTokenPrice = useCallback(
    async (inputMint: string, outputMint: string) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const prices = await jupiterService.getPrices(inputMint, outputMint);
        return prices;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to get prices: ${errorMessage}`);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [jupiterService]
  );
  
  return {
    getSupportedTokens,
    getQuote,
    swapTokens,
    getTokenPrice,
    isLoading,
    error,
  };
};

export default useJupiterSwap; 