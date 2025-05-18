import { PublicKey } from "@solana/web3.js";

// Program ID from the contract
export const PROGRAM_ID = new PublicKey("7Gh4eFGmobz5ngu2U3bgZiQm2Adwm33dQTsUwzRb7wBi");

// Protocol fee account (this would be set by your protocol)
export const PROTOCOL_FEE_ACCOUNT = new PublicKey("4nQVUxfFaFjmz9esZxkBUUxgjDCyCcHMarHU8Ek7nGjy");

// Find PDA for creator profile
export const findCreatorProfilePda = async (creatorPubkey: PublicKey): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("creator_profile"), creatorPubkey.toBuffer()],
    PROGRAM_ID
  );
};

// Find PDA for market account
export const findMarketPda = async (
  creatorPubkey: PublicKey, 
  marketsCreated: number
): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("market"), 
      creatorPubkey.toBuffer(), 
      new Uint8Array(Buffer.from(marketsCreated.toString()))
    ],
    PROGRAM_ID
  );
};

// Find market by index
// For use when marketsCreated is not known, will try different indices
export const findMarketByIndex = async (
  creatorPubkey: PublicKey,
  index: number
): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("market"),
      creatorPubkey.toBuffer(),
      new Uint8Array(Buffer.from(index.toString()))
    ],
    PROGRAM_ID
  );
};

// Find PDA for market vault
export const findMarketVaultPda = async (marketPubkey: PublicKey): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("market_vault"), marketPubkey.toBuffer()],
    PROGRAM_ID
  );
};

// Find PDA for prediction
export const findPredictionPda = async (
  marketPubkey: PublicKey,
  userPubkey: PublicKey
): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("prediction"), marketPubkey.toBuffer(), userPubkey.toBuffer()],
    PROGRAM_ID
  );
};

// Find PDA for user profile
export const findUserProfilePda = async (userPubkey: PublicKey): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("user_profile"), userPubkey.toBuffer()],
    PROGRAM_ID
  );
};

// Find PDA for AI resolver
export const findAiResolverPda = async (adminPubkey: PublicKey): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("ai_resolver"), adminPubkey.toBuffer()],
    PROGRAM_ID
  );
};

// Find PDA for outcome vote
export const findOutcomeVotePda = async (
  marketPubkey: PublicKey,
  voterPubkey: PublicKey
): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("outcome_vote"), marketPubkey.toBuffer(), voterPubkey.toBuffer()],
    PROGRAM_ID
  );
};

// Find PDA for vote result
export const findVoteResultPda = async (marketPubkey: PublicKey): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vote_result"), marketPubkey.toBuffer()],
    PROGRAM_ID
  );
};
