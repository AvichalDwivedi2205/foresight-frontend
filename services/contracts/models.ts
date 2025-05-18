import { PublicKey } from "@solana/web3.js";
import  BN  from "bn.js";

export enum MarketOutcome {
  Unresolved = 0,
  Yes = 1,
  No = 2,
}

export interface Market {
  address: PublicKey;
  creator: PublicKey;
  question: string;
  description: string;
  tokenAddress: PublicKey;
  yesAmount: BN;
  noAmount: BN;
  outcome: MarketOutcome;
  endTimestamp: BN;
  category: string;
  imageUrl?: string;
  resolvedTimestamp?: BN;
  totalLiquidity: BN;
}

export interface Prediction {
  marketAddress: PublicKey;
  userAddress: PublicKey;
  outcome: boolean; // true = Yes, false = No
  amount: BN;
  timestamp: BN;
  claimed: boolean;
}

export interface MarketParams {
  question: string;
  description: string;
  category: string;
  endTimestamp: number;
  imageUrl?: string;
}

export interface PredictionParams {
  marketAddress: PublicKey;
  outcome: boolean; // true = Yes, false = No
  amount: number;
}

export interface MarketStats {
  totalPredictions: number;
  yesPercentage: number;
  noPercentage: number;
  resolvedTimestamp?: Date;
  outcome?: MarketOutcome;
  endTimestamp: Date;
  liquidity: number;
}

export interface UserStats {
  totalPredictions: number;
  winningPredictions: number;
  accuracy: number;
  totalStaked: number;
  totalEarnings: number;
}

export interface TokenInfo {
  address: PublicKey;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
} 