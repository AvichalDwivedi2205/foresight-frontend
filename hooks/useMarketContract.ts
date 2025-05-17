"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useMemo } from "react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { MarketContract } from "@/services/contracts/marketContract";
import { TransactionService } from "@/services/contracts/transactionService";
import { MarketParams, PredictionParams } from "@/services/contracts/models";

export const useMarketContract = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  
  // Initialize the market contract service
  const marketContract = useMemo(() => {
    return new MarketContract(connection, publicKey || null);
  }, [connection, publicKey]);
  
  // Initialize the transaction service
  const transactionService = useMemo(() => {
    return new TransactionService(connection);
  }, [connection]);
  
  // Create a new market
  const createMarket = useCallback(
    async (params: MarketParams) => {
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected");
      }
      
      const transaction = await marketContract.createMarket(params);
      return await transactionService.signSendAndConfirmTransaction(
        transaction,
        signTransaction,
        publicKey
      );
    },
    [marketContract, transactionService, publicKey, signTransaction]
  );
  
  // Make a prediction
  const makePrediction = useCallback(
    async (params: PredictionParams) => {
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected");
      }
      
      const transaction = await marketContract.makePrediction(params);
      return await transactionService.signSendAndConfirmTransaction(
        transaction,
        signTransaction,
        publicKey
      );
    },
    [marketContract, transactionService, publicKey, signTransaction]
  );
  
  // Claim rewards
  const claimRewards = useCallback(
    async (marketAddress: PublicKey) => {
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected");
      }
      
      const transaction = await marketContract.claimRewards(marketAddress);
      return await transactionService.signSendAndConfirmTransaction(
        transaction,
        signTransaction,
        publicKey
      );
    },
    [marketContract, transactionService, publicKey, signTransaction]
  );
  
  // Get all markets
  const getAllMarkets = useCallback(async () => {
    return await marketContract.getAllMarkets();
  }, [marketContract]);
  
  // Get market by address
  const getMarket = useCallback(
    async (marketAddress: PublicKey) => {
      return await marketContract.getMarket(marketAddress);
    },
    [marketContract]
  );
  
  // Get user predictions
  const getUserPredictions = useCallback(
    async (userAddress: PublicKey) => {
      return await marketContract.getUserPredictions(userAddress);
    },
    [marketContract]
  );
  
  // Get current user predictions
  const getCurrentUserPredictions = useCallback(async () => {
    if (!publicKey) {
      return [];
    }
    return await marketContract.getUserPredictions(publicKey);
  }, [marketContract, publicKey]);
  
  // Get user statistics
  const getUserStats = useCallback(
    async (userAddress: PublicKey) => {
      return await marketContract.getUserStats(userAddress);
    },
    [marketContract]
  );
  
  // Get current user statistics
  const getCurrentUserStats = useCallback(async () => {
    if (!publicKey) {
      throw new Error("Wallet not connected");
    }
    return await marketContract.getUserStats(publicKey);
  }, [marketContract, publicKey]);
  
  return {
    createMarket,
    makePrediction,
    claimRewards,
    getAllMarkets,
    getMarket,
    getUserPredictions,
    getCurrentUserPredictions,
    getUserStats,
    getCurrentUserStats,
  };
};

export default useMarketContract; 