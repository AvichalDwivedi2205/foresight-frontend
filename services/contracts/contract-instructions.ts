import { 
  PublicKey, 
  SystemProgram, 
  SYSVAR_RENT_PUBKEY, 
  TransactionInstruction 
} from "@solana/web3.js";
import { 
  PROGRAM_ID, 
  findCreatorProfilePda, 
  findMarketPda, 
  findMarketVaultPda, 
  findPredictionPda, 
  findUserProfilePda 
} from "./pda-utils";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import BN from "bn.js";
import { Buffer } from "buffer";

// Serialize instruction data
function serializeInstructionData(instruction: any): Buffer {
  // This is a minimal implementation for now
  // In a real-world scenario, we would use the Anchor IDL to serialize instructions properly
  const [name, data] = Object.entries(instruction)[0];
  
  // Convert name to discriminator (8 bytes)
  // In real implementation, this would be the first 8 bytes of the SHA256 hash
  const discriminator = Buffer.alloc(8);
  discriminator.write(name.padEnd(8, '\0'));
  
  // Serialize the data (simplistic implementation)
  let serializedData = Buffer.alloc(0);
  if (data) {
    serializedData = Buffer.from(JSON.stringify(data));
  }
  
  return Buffer.concat([discriminator, serializedData]);
}

// Create Market Instruction
export async function createMarketInstruction(
  creator: PublicKey,
  mint: PublicKey,
  question: string,
  outcomes: string[],
  aiScore: number,
  aiRecommendedResolutionTime: number,
  aiClassification: number,
  creatorMetadata: string,
  creatorFeeBps: number | null = null,
  aiResolvable: boolean | null = null
): Promise<TransactionInstruction> {
  // Get PDAs
  const [creatorProfilePda] = await findCreatorProfilePda(creator);
  
  // Get creator profile to find out markets_created
  // In a real implementation, we would fetch this from the blockchain
  // For now, we'll just use 0 as a placeholder
  const marketsCreated = 0;
  
  const [marketPda] = await findMarketPda(creator, marketsCreated);
  const [marketVaultPda] = await findMarketVaultPda(marketPda);
  
  // Create instruction data
  const data = serializeInstructionData({
    createMarket: {
      question,
      outcomes,
      aiScore,
      aiRecommendedResolutionTime: new BN(aiRecommendedResolutionTime),
      aiClassification,
      creatorMetadata,
      creatorFeeBps: creatorFeeBps !== null ? creatorFeeBps : null,
      aiResolvable: aiResolvable !== null ? aiResolvable : null
    }
  });
  
  // Define accounts
  const accounts = [
    { pubkey: creator, isSigner: true, isWritable: true },
    { pubkey: creatorProfilePda, isSigner: false, isWritable: true },
    { pubkey: marketPda, isSigner: false, isWritable: true },
    { pubkey: marketVaultPda, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
  ];
  
  // Return the instruction
  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: accounts,
    data
  });
}

// Stake Prediction Instruction
export async function stakePredictionInstruction(
  user: PublicKey,
  market: PublicKey,
  userTokenAccount: PublicKey,
  outcomeIndex: number,
  amount: number
): Promise<TransactionInstruction> {
  // Get PDAs
  const [marketVaultPda] = await findMarketVaultPda(market);
  const [predictionPda] = await findPredictionPda(market, user);
  const [userProfilePda] = await findUserProfilePda(user);
  
  // Fetch market data to get creator
  // In real implementation, we would fetch this from blockchain
  // For now, we'll use a placeholder
  const creatorPubkey = new PublicKey("4nQVUxfFaFjmz9esZxkBUUxgjDCyCcHMarHU8Ek7nGjy");
  const [creatorProfilePda] = await findCreatorProfilePda(creatorPubkey);
  
  // Create instruction data
  const data = serializeInstructionData({
    stakePrediction: {
      outcomeIndex,
      amount: new BN(amount)
    }
  });
  
  // Define accounts
  const accounts = [
    { pubkey: user, isSigner: true, isWritable: true },
    { pubkey: market, isSigner: false, isWritable: true },
    { pubkey: creatorProfilePda, isSigner: false, isWritable: true },
    { pubkey: predictionPda, isSigner: false, isWritable: true },
    { pubkey: userTokenAccount, isSigner: false, isWritable: true },
    { pubkey: marketVaultPda, isSigner: false, isWritable: true },
    { pubkey: userProfilePda, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
  ];
  
  // Return the instruction
  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: accounts,
    data
  });
}

// Claim Reward Instruction
export async function claimRewardInstruction(
  user: PublicKey,
  market: PublicKey,
  userTokenAccount: PublicKey,
  creatorTokenAccount: PublicKey,
  protocolFeeAccount: PublicKey
): Promise<TransactionInstruction> {
  // Get PDAs
  const [predictionPda] = await findPredictionPda(market, user);
  const [marketVaultPda] = await findMarketVaultPda(market);
  const [userProfilePda] = await findUserProfilePda(user);
  
  // Fetch market data to get creator
  // In real implementation, we would fetch this from blockchain
  // For now, we'll use a placeholder
  const creatorPubkey = new PublicKey("4nQVUxfFaFjmz9esZxkBUUxgjDCyCcHMarHU8Ek7nGjy");
  const [creatorProfilePda] = await findCreatorProfilePda(creatorPubkey);
  
  // Create instruction data
  const data = serializeInstructionData({
    claimReward: {}
  });
  
  // Define accounts
  const accounts = [
    { pubkey: user, isSigner: true, isWritable: true },
    { pubkey: market, isSigner: false, isWritable: true },
    { pubkey: predictionPda, isSigner: false, isWritable: true },
    { pubkey: marketVaultPda, isSigner: false, isWritable: true },
    { pubkey: userTokenAccount, isSigner: false, isWritable: true },
    { pubkey: creatorTokenAccount, isSigner: false, isWritable: true },
    { pubkey: protocolFeeAccount, isSigner: false, isWritable: true },
    { pubkey: userProfilePda, isSigner: false, isWritable: true },
    { pubkey: creatorProfilePda, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }
  ];
  
  // Return the instruction
  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: accounts,
    data
  });
}

// Create Creator Profile Instruction
export async function createCreatorProfileInstruction(
  creator: PublicKey
): Promise<TransactionInstruction> {
  // Get PDA
  const [creatorProfilePda] = await findCreatorProfilePda(creator);
  
  // Create instruction data
  const data = serializeInstructionData({
    createCreatorProfile: {}
  });
  
  // Define accounts
  const accounts = [
    { pubkey: creator, isSigner: true, isWritable: true },
    { pubkey: creatorProfilePda, isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
  ];
  
  // Return the instruction
  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: accounts,
    data
  });
}

// Initialize User Profile Instruction
export async function initializeUserProfileInstruction(
  user: PublicKey
): Promise<TransactionInstruction> {
  // Get PDA
  const [userProfilePda] = await findUserProfilePda(user);
  
  // Create instruction data
  const data = serializeInstructionData({
    initializeUserProfile: {}
  });
  
  // Define accounts
  const accounts = [
    { pubkey: user, isSigner: true, isWritable: true },
    { pubkey: userProfilePda, isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
  ];
  
  // Return the instruction
  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: accounts,
    data
  });
}
