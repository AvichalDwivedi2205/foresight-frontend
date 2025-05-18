import { AccountInfo, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { Buffer } from "buffer";
import { 
  MarketState, 
  PredictionState, 
  CreatorProfileState, 
  UserProfileState,
  Market,
  Prediction
} from "./models";

/**
 * Deserializes raw account data from contract accounts
 */
export class AccountDeserializer {
  /**
   * Deserialize market account data
   */
  static deserializeMarketAccount(accountInfo: AccountInfo<Buffer>): MarketState {
    // This is a simplified implementation
    // In a real-world scenario with Anchor, we would:
    // 1. Skip the first 8 bytes (discriminator)
    // 2. Parse each field according to the schema
    // 3. Handle arrays, options, and nested data properly
    
    // For now we'll create a simple placeholder
    // A real implementation would need to match the exact layout from the contract
    
    const data = accountInfo.data;
    let offset = 8; // skip discriminator
    
    // Read creator pubkey (32 bytes)
    const creator = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;
    
    // Read question string length and question
    const questionLen = data.readUInt32LE(offset);
    offset += 4;
    const question = data.slice(offset, offset + questionLen).toString('utf8');
    offset += questionLen;
    
    // Read outcomes array length and outcomes
    const outcomesLen = data.readUInt32LE(offset);
    offset += 4;
    
    const outcomes: string[] = [];
    for (let i = 0; i < outcomesLen; i++) {
      const strLen = data.readUInt32LE(offset);
      offset += 4;
      const outcomeStr = data.slice(offset, offset + strLen).toString('utf8');
      offset += strLen;
      outcomes.push(outcomeStr);
    }
    
    // Read ai score
    const aiScore = data.readFloatLE(offset);
    offset += 4;
    
    // Read market type
    const marketType = data.readUInt8(offset);
    offset += 1;
    
    // Read deadline
    const deadline = new BN(data.slice(offset, offset + 8), 'le');
    offset += 8;
    
    // Read ai suggested deadline
    const aiSuggestedDeadline = new BN(data.slice(offset, offset + 8), 'le');
    offset += 8;
    
    // Read resolved flag
    const resolved = data.readUInt8(offset) === 1;
    offset += 1;
    
    // Read winning outcome
    const hasWinningOutcome = data.readUInt8(offset) === 1;
    offset += 1;
    const winningOutcome = hasWinningOutcome ? data.readUInt8(offset) : null;
    offset += 1;
    
    // Read total pool
    const totalPool = new BN(data.slice(offset, offset + 8), 'le');
    offset += 8;
    
    // Read creator fee bps
    const creatorFeeBps = data.readUInt16LE(offset);
    offset += 2;
    
    // Read protocol fee bps
    const protocolFeeBps = data.readUInt16LE(offset);
    offset += 2;
    
    // Read stakes per outcome array
    const stakesPerOutcomeLen = data.readUInt32LE(offset);
    offset += 4;
    
    const stakesPerOutcome: BN[] = [];
    for (let i = 0; i < stakesPerOutcomeLen; i++) {
      const stake = new BN(data.slice(offset, offset + 8), 'le');
      offset += 8;
      stakesPerOutcome.push(stake);
    }
    
    // Read AI resolvable flag
    const aiResolvable = data.readUInt8(offset) === 1;
    offset += 1;
    
    // Read bump
    const bump = data.readUInt8(offset);
    offset += 1;
    
    return {
      creator,
      question,
      outcomes,
      aiScore,
      marketType,
      deadline,
      aiSuggestedDeadline,
      resolved,
      winningOutcome,
      totalPool,
      creatorFeeBps,
      protocolFeeBps,
      stakesPerOutcome,
      aiResolvable,
      bump
    };
  }

  /**
   * Deserialize prediction account data
   */
  static deserializePredictionAccount(accountInfo: AccountInfo<Buffer>): PredictionState {
    // Similar to market deserializer but for predictions
    // Placeholder implementation
    const data = accountInfo.data;
    let offset = 8; // skip discriminator
    
    // Read user pubkey (32 bytes)
    const user = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;
    
    // Read market pubkey (32 bytes)
    const market = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;
    
    // Read outcome index
    const outcomeIndex = data.readUInt8(offset);
    offset += 1;
    
    // Read amount
    const amount = new BN(data.slice(offset, offset + 8), 'le');
    offset += 8;
    
    // Read timestamp
    const timestamp = new BN(data.slice(offset, offset + 8), 'le');
    offset += 8;
    
    // Read claimed flag
    const claimed = data.readUInt8(offset) === 1;
    offset += 1;
    
    // Read bump
    const bump = data.readUInt8(offset);
    offset += 1;
    
    return {
      user,
      market,
      outcomeIndex,
      amount,
      timestamp,
      claimed,
      bump
    };
  }

  /**
   * Deserialize creator profile account data
   */
  static deserializeCreatorProfileAccount(accountInfo: AccountInfo<Buffer>): CreatorProfileState {
    const data = accountInfo.data;
    let offset = 8; // skip discriminator
    
    // Read creator pubkey (32 bytes)
    const creator = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;
    
    // Read last created at timestamp
    const lastCreatedAt = new BN(data.slice(offset, offset + 8), 'le');
    offset += 8;
    
    // Read markets created count
    const marketsCreated = data.readUInt32LE(offset);
    offset += 4;
    
    // Read total volume
    const totalVolume = new BN(data.slice(offset, offset + 8), 'le');
    offset += 8;
    
    // Read traction score
    const tractionScore = new BN(data.slice(offset, offset + 8), 'le');
    offset += 8;
    
    // Read tier
    const tier = data.readUInt8(offset);
    offset += 1;
    
    // Read bump
    const bump = data.readUInt8(offset);
    offset += 1;
    
    return {
      creator,
      lastCreatedAt,
      marketsCreated,
      totalVolume,
      tractionScore,
      tier,
      bump
    };
  }

  /**
   * Deserialize user profile account data
   */
  static deserializeUserProfileAccount(accountInfo: AccountInfo<Buffer>): UserProfileState {
    const data = accountInfo.data;
    let offset = 8; // skip discriminator
    
    // Read user pubkey (32 bytes)
    const user = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;
    
    // Read total staked
    const totalStaked = new BN(data.slice(offset, offset + 8), 'le');
    offset += 8;
    
    // Read total winnings
    const totalWinnings = new BN(data.slice(offset, offset + 8), 'le');
    offset += 8;
    
    // Read total predictions
    const totalPredictions = data.readUInt32LE(offset);
    offset += 4;
    
    // Read winning predictions
    const winningPredictions = data.readUInt32LE(offset);
    offset += 4;
    
    // Read last active timestamp
    const lastActiveTs = new BN(data.slice(offset, offset + 8), 'le');
    offset += 8;
    
    // Read bump
    const bump = data.readUInt8(offset);
    offset += 1;
    
    return {
      user,
      totalStaked,
      totalWinnings,
      totalPredictions,
      winningPredictions,
      lastActiveTs,
      bump
    };
  }

  /**
   * Convert on-chain market data to user-friendly format
   */
  static marketStateToMarket(
    address: PublicKey, 
    state: MarketState, 
    tokenMint: PublicKey
  ): Market {
    return {
      address,
      creator: state.creator,
      question: state.question,
      outcomes: state.outcomes,
      aiScore: state.aiScore,
      marketType: state.marketType,
      deadline: new Date(state.deadline.toNumber() * 1000),
      aiSuggestedDeadline: new Date(state.aiSuggestedDeadline.toNumber() * 1000),
      resolved: state.resolved,
      winningOutcome: state.winningOutcome,
      totalPool: state.totalPool.toNumber(),
      creatorFeeBps: state.creatorFeeBps,
      protocolFeeBps: state.protocolFeeBps,
      stakesPerOutcome: state.stakesPerOutcome.map(stake => stake.toNumber()),
      aiResolvable: state.aiResolvable,
      tokenMint
    };
  }

  /**
   * Convert on-chain prediction data to user-friendly format
   */
  static predictionStateToPrediction(state: PredictionState): Prediction {
    return {
      marketAddress: state.market,
      userAddress: state.user,
      outcomeIndex: state.outcomeIndex,
      amount: state.amount.toNumber(),
      timestamp: new Date(state.timestamp.toNumber() * 1000),
      claimed: state.claimed,
      status: 'pending' // Default status, should be updated based on market resolution
    };
  }
}
