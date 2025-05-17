"use client";

import { 
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  Keypair,
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createTransferInstruction,
} from "@solana/spl-token";
import { BN } from "bn.js";
import { 
  Market, 
  MarketOutcome, 
  MarketParams, 
  Prediction, 
  PredictionParams, 
  MarketStats, 
  UserStats 
} from "./models";

// Program ID should be replaced with the actual deployed program ID
const PROGRAM_ID = new PublicKey("This_Will_Be_Replaced_With_Real_Program_ID");

export class MarketContract {
  private connection: Connection;
  private userWallet: PublicKey | null;

  constructor(connection: Connection, userWallet: PublicKey | null) {
    this.connection = connection;
    this.userWallet = userWallet;
  }

  // Helper to find PDA for a market
  private async findMarketPDA(creator: PublicKey, question: string): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("market"),
        creator.toBuffer(),
        Buffer.from(question.slice(0, 32)), // Use first 32 chars of question as seed
      ],
      PROGRAM_ID
    );
  }

  // Helper to find PDA for a prediction
  private async findPredictionPDA(
    marketAddress: PublicKey,
    userAddress: PublicKey
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("prediction"),
        marketAddress.toBuffer(),
        userAddress.toBuffer(),
      ],
      PROGRAM_ID
    );
  }

  // Create a new prediction market
  async createMarket(params: MarketParams): Promise<Transaction> {
    if (!this.userWallet) {
      throw new Error("Wallet not connected");
    }

    // For now, this is a placeholder that will need to be updated with actual instructions
    // when we have the contract IDL or know the exact instruction structure
    
    const transaction = new Transaction();
    
    // This is where we would add the actual create market instruction
    // based on the contract's interface
    
    return transaction;
  }

  // Make a prediction on a market
  async makePrediction(params: PredictionParams): Promise<Transaction> {
    if (!this.userWallet) {
      throw new Error("Wallet not connected");
    }

    const transaction = new Transaction();
    
    // This is where we would add the actual make prediction instruction
    // based on the contract's interface
    
    return transaction;
  }

  // Claim rewards for a winning prediction
  async claimRewards(marketAddress: PublicKey): Promise<Transaction> {
    if (!this.userWallet) {
      throw new Error("Wallet not connected");
    }

    const transaction = new Transaction();
    
    // This is where we would add the actual claim rewards instruction
    // based on the contract's interface
    
    return transaction;
  }

  // Get all markets
  async getAllMarkets(): Promise<Market[]> {
    // Placeholder - will need to be replaced with actual contract account parsing
    // when we have more details about the contract structure
    
    return [];
  }

  // Get market by address
  async getMarket(marketAddress: PublicKey): Promise<Market | null> {
    // Placeholder - will need to be replaced with actual contract account parsing
    
    return null;
  }

  // Get user's predictions
  async getUserPredictions(userAddress: PublicKey): Promise<Prediction[]> {
    // Placeholder - will need to be replaced with actual contract account parsing
    
    return [];
  }

  // Get user statistics
  async getUserStats(userAddress: PublicKey): Promise<UserStats> {
    // Placeholder - will need to be replaced with actual contract account parsing
    
    return {
      totalPredictions: 0,
      winningPredictions: 0,
      accuracy: 0,
      totalStaked: 0,
      totalEarnings: 0,
    };
  }

  // Calculate market statistics
  calculateMarketStats(market: Market): MarketStats {
    const totalAmount = market.yesAmount.add(market.noAmount);
    
    let yesPercentage = 0;
    let noPercentage = 0;
    
    if (!totalAmount.isZero()) {
      yesPercentage = (market.yesAmount.toNumber() / totalAmount.toNumber()) * 100;
      noPercentage = (market.noAmount.toNumber() / totalAmount.toNumber()) * 100;
    }
    
    return {
      totalPredictions: 0, // This would need to be calculated from predictions count
      yesPercentage,
      noPercentage,
      endTimestamp: new Date(market.endTimestamp.toNumber() * 1000),
      resolvedTimestamp: market.resolvedTimestamp 
        ? new Date(market.resolvedTimestamp.toNumber() * 1000) 
        : undefined,
      outcome: market.outcome,
      liquidity: totalAmount.toNumber() / LAMPORTS_PER_SOL,
    };
  }
}

export default MarketContract; 