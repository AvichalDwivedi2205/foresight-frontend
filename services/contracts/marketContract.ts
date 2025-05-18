"use client";

import { 
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  VersionedTransaction,
  LAMPORTS_PER_SOL,
  Keypair,
  TransactionInstruction,
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createTransferInstruction,
} from "@solana/spl-token";
import BN from "bn.js";
import { 
  Market, 
  MarketOutcome, 
  MarketParams, 
  Prediction, 
  PredictionParams, 
  MarketStats, 
  UserStats,
  ClaimRewardResponse,
  MarketType
} from "./models";
import { 
  PROGRAM_ID,
  PROTOCOL_FEE_ACCOUNT,
  findCreatorProfilePda,
  findMarketPda,
  findMarketVaultPda,
  findPredictionPda,
  findUserProfilePda 
} from "./pda-utils";
import {
  createMarketInstruction,
  stakePredictionInstruction,
  claimRewardInstruction,
  createCreatorProfileInstruction,
  initializeUserProfileInstruction
} from "./contract-instructions";
import { TransactionService, TransactionCallbacks } from "./transactionService";
import { AccountFetch } from "./account-fetch";

export class MarketContract {
  private connection: Connection;
  private userWallet: PublicKey | null;
  private transactionService: TransactionService;
  private accountFetch: AccountFetch;

  constructor(connection: Connection, userWallet: PublicKey | null) {
    this.connection = connection;
    this.userWallet = userWallet;
    this.transactionService = new TransactionService(connection);
    this.accountFetch = new AccountFetch(connection);
  }

  // Create a new prediction market
  async createMarket(
    params: MarketParams, 
    signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>,
    callbacks?: TransactionCallbacks
  ): Promise<string> {
    if (!this.userWallet) {
      throw new Error("Wallet not connected");
    }

    const transaction = new Transaction();
    
    try {
      // First check if the creator profile exists, create if not
      const [creatorProfilePda] = await findCreatorProfilePda(this.userWallet);
      const creatorProfileAccount = await this.connection.getAccountInfo(creatorProfilePda);
      
      // If creator profile doesn't exist, add instruction to create it
      if (!creatorProfileAccount) {
        const createProfileIx = await createCreatorProfileInstruction(this.userWallet);
        transaction.add(createProfileIx);
      }

      // Get AI-related values with defaults
      const aiScore = params.aiScore || 75; // Default AI score
      const aiClassification = params.aiClassification || MarketType.TimeBound;
      
      // Calculate seconds until deadline
      const currentTime = new Date().getTime();
      const deadlineTime = params.deadline.getTime();
      const secondsUntilDeadline = Math.floor((deadlineTime - currentTime) / 1000);
      
      // Add create market instruction
      const createMarketIx = await createMarketInstruction(
        this.userWallet,
        params.tokenMint,
        params.question,
        params.outcomes,
        aiScore,
        secondsUntilDeadline,
        aiClassification,
        params.creatorMetadata || JSON.stringify({ description: params.description || "", category: params.category || "General" }),
        500, // Default creator fee of 5% (500 bps)
        true // Default to AI resolvable
      );
      
      transaction.add(createMarketIx);
      
      // Execute the transaction with the transaction service
      const receipt = await this.transactionService.executeTransaction(
        transaction,
        signTransaction,
        this.userWallet,
        callbacks
      );
      
      return receipt.signature;
    } catch (error) {
      console.error("Error creating market:", error);
      throw new Error(`Failed to create market: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Make a prediction on a market
  async makePrediction(params: PredictionParams): Promise<Transaction> {
    if (!this.userWallet) {
      throw new Error("Wallet not connected");
    }

    const transaction = new Transaction();
    
    try {
      // Get associated token account for the user
      const userTokenAccount = await getAssociatedTokenAddress(
        params.tokenMint,
        this.userWallet
      );

      // Check if user profile exists, create if not
      const [userProfilePda] = await findUserProfilePda(this.userWallet);
      const userProfileAccount = await this.connection.getAccountInfo(userProfilePda);
      
      // If user profile doesn't exist, add instruction to create it
      if (!userProfileAccount) {
        const initUserProfileIx = await initializeUserProfileInstruction(this.userWallet);
        transaction.add(initUserProfileIx);
      }
      
      // Create stake prediction instruction
      const stakePredictionIx = await stakePredictionInstruction(
        this.userWallet,
        params.marketAddress,
        userTokenAccount,
        params.outcomeIndex,
        params.amount
      );
      
      transaction.add(stakePredictionIx);
      
      return transaction;
    } catch (error) {
      console.error("Error making prediction:", error);
      throw new Error(`Failed to make prediction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Make a prediction on a market with transaction execution
  async makePredictionWithSigning(
    params: PredictionParams,
    signTransaction: (transaction: Transaction) => Promise<Transaction>,
    callbacks?: TransactionCallbacks
  ): Promise<string> {
    if (!this.userWallet) {
      throw new Error("Wallet not connected");
    }

    const transaction = new Transaction();
    
    try {
      // Get associated token account for the user
      const userTokenAccount = await getAssociatedTokenAddress(
        params.tokenMint,
        this.userWallet
      );

      // Check if user profile exists, create if not
      const [userProfilePda] = await findUserProfilePda(this.userWallet);
      const userProfileAccount = await this.connection.getAccountInfo(userProfilePda);
      
      // If user profile doesn't exist, add instruction to create it
      if (!userProfileAccount) {
        const initUserProfileIx = await initializeUserProfileInstruction(this.userWallet);
        transaction.add(initUserProfileIx);
      }
      
      // Create stake prediction instruction
      const stakePredictionIx = await stakePredictionInstruction(
        this.userWallet,
        params.marketAddress,
        userTokenAccount,
        params.outcomeIndex,
        params.amount
      );
      
      transaction.add(stakePredictionIx);
      
      // Execute the transaction with the transaction service
      const receipt = await this.transactionService.executeTransaction(
        transaction,
        signTransaction as any,
        this.userWallet,
        callbacks
      );
      
      return receipt.signature;
    } catch (error) {
      console.error("Error making prediction:", error);
      throw new Error(`Failed to make prediction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Claim rewards for a winning prediction
  async claimRewards(marketAddress: PublicKey, tokenMint: PublicKey): Promise<Transaction> {
    if (!this.userWallet) {
      throw new Error("Wallet not connected");
    }

    const transaction = new Transaction();
    
    try {
      // Get associated token account for the user
      const userTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        this.userWallet
      );
      
      // Get associated token account for the protocol fee account
      const protocolFeeTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        PROTOCOL_FEE_ACCOUNT
      );
      
      // Get market data to find the creator
      const marketAccountInfo = await this.connection.getAccountInfo(marketAddress);
      if (!marketAccountInfo) {
        throw new Error("Market not found");
      }
      
      // In a real implementation, we would properly deserialize the market account data
      // Here we'll use a placeholder until account deserialization is implemented
      const creatorPubkey = new PublicKey("4nQVUxfFaFjmz9esZxkBUUxgjDCyCcHMarHU8Ek7nGjy");
      
      // Get associated token account for the creator
      const creatorTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        creatorPubkey
      );

      // Create claim reward instruction
      const claimRewardIx = await claimRewardInstruction(
        this.userWallet,
        marketAddress,
        userTokenAccount,
        creatorTokenAccount,
        protocolFeeTokenAccount
      );
      
      transaction.add(claimRewardIx);
      
      return transaction;
    } catch (error) {
      console.error("Error claiming rewards:", error);
      throw new Error(`Failed to claim rewards: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Claim rewards for a winning prediction with transaction execution
  async claimRewardsWithSigning(
    marketAddress: PublicKey, 
    tokenMint: PublicKey,
    signTransaction: (transaction: Transaction) => Promise<Transaction>,
    callbacks?: TransactionCallbacks
  ): Promise<ClaimRewardResponse> {
    if (!this.userWallet) {
      throw new Error("Wallet not connected");
    }

    const transaction = new Transaction();
    
    try {
      // Get associated token account for the user
      const userTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        this.userWallet
      );
      
      // Get associated token account for the protocol fee account
      const protocolFeeTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        PROTOCOL_FEE_ACCOUNT
      );
      
      // Get market data to find the creator
      const market = await this.accountFetch.getMarket(marketAddress);
      if (!market) {
        throw new Error("Market not found");
      }
      
      // Get associated token account for the creator
      const creatorTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        market.creator
      );

      // Create claim reward instruction
      const claimRewardIx = await claimRewardInstruction(
        this.userWallet,
        marketAddress,
        userTokenAccount,
        creatorTokenAccount,
        protocolFeeTokenAccount
      );
      
      transaction.add(claimRewardIx);
      
      // Execute the transaction with the transaction service
      const receipt = await this.transactionService.executeTransaction(
        transaction,
        signTransaction as any,
        this.userWallet,
        callbacks
      );
      
      // Get user prediction to calculate reward amount
      const predictions = await this.getUserPredictions(this.userWallet);
      const prediction = predictions.find(p => 
        p.marketAddress.equals(marketAddress) && p.status === 'won'
      );
      
      return {
        signature: receipt.signature,
        rewardAmount: prediction?.potentialReward || 0,
        marketAddress
      };
    } catch (error) {
      console.error("Error claiming rewards:", error);
      throw new Error(`Failed to claim rewards: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Get all markets
  async getAllMarkets(): Promise<Market[]> {
    try {
      console.log("Fetching all markets...");
      
      // Use the AccountFetch utility to get markets
      const markets = await this.accountFetch.getAllMarkets();
      
      return markets;
    } catch (error) {
      console.error("Error fetching markets:", error);
      throw new Error(`Failed to fetch markets: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Get market by address
  async getMarket(marketAddress: PublicKey): Promise<Market | null> {
    try {
      console.log(`Fetching market ${marketAddress.toBase58()}...`);
      
      // Use the AccountFetch utility to get the market
      return await this.accountFetch.getMarket(marketAddress);
    } catch (error) {
      console.error(`Error fetching market ${marketAddress.toBase58()}:`, error);
      return null;
    }
  }

  // Get user's predictions
  async getUserPredictions(userAddress: PublicKey): Promise<Prediction[]> {
    try {
      console.log(`Fetching predictions for user ${userAddress.toBase58()}...`);
      
      // Use the AccountFetch utility to get predictions
      return await this.accountFetch.getUserPredictions(userAddress);
    } catch (error) {
      console.error(`Error fetching predictions for user ${userAddress.toBase58()}:`, error);
      return [];
    }
  }

  // Get predictions for a specific market
  async getMarketPredictions(marketAddress: PublicKey): Promise<Prediction[]> {
    try {
      return await this.accountFetch.getMarketPredictions(marketAddress);
    } catch (error) {
      console.error(`Error fetching predictions for market ${marketAddress.toBase58()}:`, error);
      return [];
    }
  }

  // Create a new prediction market with transaction execution
  async createMarketWithSigning(
    params: MarketParams, 
    signTransaction: (transaction: Transaction) => Promise<Transaction>,
    callbacks?: TransactionCallbacks
  ): Promise<string> {
    if (!this.userWallet) {
      throw new Error("Wallet not connected");
    }

    const transaction = new Transaction();
    
    try {
      // First check if the creator profile exists, create if not
      const [creatorProfilePda] = await findCreatorProfilePda(this.userWallet);
      const creatorProfileAccount = await this.connection.getAccountInfo(creatorProfilePda);
      
      // If creator profile doesn't exist, add instruction to create it
      if (!creatorProfileAccount) {
        const createProfileIx = await createCreatorProfileInstruction(this.userWallet);
        transaction.add(createProfileIx);
      }

      // Get AI-related values with defaults
      const aiScore = params.aiScore || 75; // Default AI score
      const aiClassification = params.aiClassification || MarketType.TimeBound;
      
      // Calculate seconds until deadline
      const currentTime = new Date().getTime();
      const deadlineTime = params.deadline.getTime();
      const secondsUntilDeadline = Math.floor((deadlineTime - currentTime) / 1000);
      
      // Add create market instruction
      const createMarketIx = await createMarketInstruction(
        this.userWallet,
        params.tokenMint,
        params.question,
        params.outcomes,
        aiScore,
        secondsUntilDeadline,
        aiClassification,
        params.creatorMetadata || JSON.stringify({ description: params.description || "", category: params.category || "General" }),
        500, // Default creator fee of 5% (500 bps)
        true // Default to AI resolvable
      );
      
      transaction.add(createMarketIx);
      
      // Execute the transaction with the transaction service
      const receipt = await this.transactionService.executeTransaction(
        transaction,
        signTransaction as any,
        this.userWallet,
        callbacks
      );
      
      return receipt.signature;
    } catch (error) {
      console.error("Error creating market:", error);
      throw new Error(`Failed to create market: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Get market statistics with prediction count
  async getEnhancedMarketStats(market: Market): Promise<MarketStats> {
    try {
      // Get basic stats
      const basicStats = this.calculateMarketStats(market);
      
      // Get prediction count
      const predictionCount = await this.accountFetch.countMarketPredictions(market.address);
      
      return {
        ...basicStats,
        totalPredictions: predictionCount
      };
    } catch (error) {
      console.error("Error calculating enhanced market stats:", error);
      return {
        totalPredictions: 0,
        outcomeDistribution: [],
        endTimestamp: new Date(),
        liquidity: 0
      };
    }
  }
  
  // Check if a user has already predicted on a market
  async hasUserPredicted(marketAddress: PublicKey, userAddress: PublicKey): Promise<boolean> {
    try {
      // Get the prediction PDA
      const [predictionPda] = await findPredictionPda(marketAddress, userAddress);
      
      // Check if the account exists
      const accountInfo = await this.connection.getAccountInfo(predictionPda);
      
      return accountInfo !== null;
    } catch (error) {
      console.error(`Error checking if user ${userAddress.toBase58()} has predicted on market ${marketAddress.toBase58()}:`, error);
      return false;
    }
  }

  // Get user statistics
  async getUserStats(userAddress: PublicKey): Promise<UserStats> {
    try {
      console.log(`Fetching user stats for ${userAddress.toBase58()}...`);
      
      // Get user profile PDA
      const [userProfilePda] = await findUserProfilePda(userAddress);
      
      // Fetch account data
      const accountInfo = await this.connection.getAccountInfo(userProfilePda);
      if (!accountInfo) {
        console.log(`User profile for ${userAddress.toBase58()} not found`);
        return {
          totalPredictions: 0,
          winningPredictions: 0,
          accuracy: 0,
          totalStaked: 0,
          totalEarnings: 0,
        };
      }
      
      try {
        // Import the AccountDeserializer
        const { AccountDeserializer } = await import('./account-deserializer');
        
        // Deserialize user profile data
        const userProfileData = AccountDeserializer.deserializeUserProfileAccount(accountInfo);
        
        // Calculate accuracy
        const accuracy = userProfileData.totalPredictions > 0
          ? (userProfileData.winningPredictions / userProfileData.totalPredictions) * 100
          : 0;
        
        // Convert to user-friendly format
        return {
          totalPredictions: userProfileData.totalPredictions,
          winningPredictions: userProfileData.winningPredictions,
          accuracy: Math.round(accuracy * 100) / 100, // Round to 2 decimal places
          totalStaked: userProfileData.totalStaked.toNumber(),
          totalEarnings: userProfileData.totalWinnings.toNumber(),
          lastActiveDate: new Date(userProfileData.lastActiveTs.toNumber() * 1000),
        };
      } catch (error) {
        console.error(`Error deserializing user profile for ${userAddress.toBase58()}:`, error);
        return {
          totalPredictions: 0,
          winningPredictions: 0,
          accuracy: 0,
          totalStaked: 0,
          totalEarnings: 0,
        };
      }
    } catch (error) {
      console.error(`Error fetching user stats for ${userAddress.toBase58()}:`, error);
      return {
        totalPredictions: 0,
        winningPredictions: 0,
        accuracy: 0,
        totalStaked: 0,
        totalEarnings: 0,
      };
    }
  }

  // Calculate market statistics
  calculateMarketStats(market: Market): MarketStats {
    try {
      // Calculate total staked across all outcomes
      const totalStaked = market.stakesPerOutcome.reduce((acc, stake) => acc + stake, 0);
      
      // Calculate distribution percentages
      const outcomeDistribution = market.stakesPerOutcome.map(stake => 
        totalStaked > 0 ? (stake / totalStaked) * 100 : 0
      );
      
      return {
        totalPredictions: 0, // This would need more data
        outcomeDistribution,
        endTimestamp: market.deadline,
        resolvedTimestamp: market.resolved ? market.deadline : undefined,
        winningOutcome: market.winningOutcome !== null ? market.winningOutcome : undefined,
        liquidity: totalStaked,
      };
    } catch (error) {
      console.error("Error calculating market stats:", error);
      return {
        totalPredictions: 0,
        outcomeDistribution: [],
        endTimestamp: new Date(),
        liquidity: 0
      };
    }
  }
}

export default MarketContract;