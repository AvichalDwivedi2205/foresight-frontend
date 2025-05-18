// Types for Foresight Protocol Contract
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

// Market type enum
export enum MarketType {
  TimeBound = 0,
  OpenEnded = 1,
}

// Market outcome enum
export enum MarketOutcome {
  Unresolved = 0,
  Yes = 1,
  No = 2,
}

// Market state from on-chain account
export interface MarketState {
  creator: PublicKey;
  question: string;
  outcomes: string[];
  aiScore: number;
  marketType: number;
  deadline: BN;
  aiSuggestedDeadline: BN;
  resolved: boolean;
  winningOutcome: number | null;
  totalPool: BN;
  creatorFeeBps: number;
  protocolFeeBps: number;
  stakesPerOutcome: BN[];
  aiResolvable: boolean;
  bump: number;
}

// Prediction state from on-chain account
export interface PredictionState {
  user: PublicKey;
  market: PublicKey;
  outcomeIndex: number;
  amount: BN;
  timestamp: BN;
  claimed: boolean;
  bump: number;
}

// Creator profile state
export interface CreatorProfileState {
  creator: PublicKey;
  lastCreatedAt: BN;
  marketsCreated: number;
  totalVolume: BN;
  tractionScore: BN;
  tier: number;
  bump: number;
}

// User profile state
export interface UserProfileState {
  user: PublicKey;
  totalStaked: BN;
  totalWinnings: BN;
  totalPredictions: number;
  winningPredictions: number;
  lastActiveTs: BN;
  bump: number;
}

// Market frontend model (processed for UI)
export interface Market {
  address: PublicKey;
  creator: PublicKey;
  question: string;
  description?: string; // This is added for frontend, not in contract
  outcomes: string[];
  aiScore: number;
  marketType: MarketType;
  deadline: Date;
  aiSuggestedDeadline: Date;
  resolved: boolean;
  winningOutcome: number | null;
  totalPool: number;
  creatorFeeBps: number;
  protocolFeeBps: number;
  stakesPerOutcome: number[];
  aiResolvable: boolean;
  tokenMint: PublicKey;
  category?: string; // This is added for frontend, not in contract
}

// Prediction frontend model
export interface Prediction {
  marketAddress: PublicKey;
  userAddress: PublicKey;
  outcomeIndex: number;
  amount: number;
  timestamp: Date;
  claimed: boolean;
  potentialReward?: number;
  status: 'pending' | 'won' | 'lost';
}

// Parameters for creating a new market
export interface MarketParams {
  question: string;
  description?: string;
  outcomes: string[];
  deadline: Date;
  tokenMint: PublicKey;
  aiScore?: number; // Optional, may be provided by backend
  aiClassification?: MarketType; // Optional, may be provided by backend
  category?: string;
  creatorMetadata?: string;
}

// Parameters for making a prediction
export interface PredictionParams {
  marketAddress: PublicKey;
  outcomeIndex: number;
  amount: number;
  tokenMint: PublicKey;
}

// Market stats for UI
export interface MarketStats {
  totalPredictions: number;
  outcomeDistribution: number[];
  resolvedTimestamp?: Date;
  winningOutcome?: number;
  endTimestamp: Date;
  liquidity: number;
}

// User stats for UI
export interface UserStats {
  totalPredictions: number;
  winningPredictions: number;
  accuracy: number;
  totalStaked: number;
  totalEarnings: number;
  lastActiveDate?: Date;
}

// Response from claim reward operation
export interface ClaimRewardResponse {
  signature: string;
  rewardAmount: number;
  marketAddress: PublicKey;
}

// Token information
export interface TokenInfo {
  address: PublicKey;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}
