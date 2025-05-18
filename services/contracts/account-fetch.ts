import { Connection, PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "./pda-utils";
import { AccountDeserializer } from "./account-deserializer";
import { Market, Prediction } from "./models";

/**
 * Utility for fetching and parsing accounts from the blockchain
 */
export class AccountFetch {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Get all markets from the blockchain
   */
  async getAllMarkets(): Promise<Market[]> {
    try {
      // Use getProgramAccounts to fetch all market accounts
      const marketAccounts = await this.connection.getProgramAccounts(PROGRAM_ID, {
        filters: [
          {
            memcmp: {
              offset: 0, // At the beginning of the account data
              bytes: "FORESIGHT", // This is a placeholder. In a real implementation with Anchor, 
                               // we would use the correct discriminator bytes specific to market accounts
            },
          }
        ],
      });
      
      console.log(`Found ${marketAccounts.length} market accounts`);
      
      // Process the accounts
      const markets: Market[] = [];
      for (const marketAccount of marketAccounts) {
        try {
          // Deserialize market data
          const marketData = AccountDeserializer.deserializeMarketAccount(marketAccount.account);
          
          // We need token mint information for each market
          // For this example, using a placeholder mint (should be part of account data)
          const tokenMint = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"); // USDC devnet
          
          // Convert to user-friendly format
          const market = AccountDeserializer.marketStateToMarket(
            marketAccount.pubkey, 
            marketData,
            tokenMint
          );
          
          markets.push(market);
        } catch (error) {
          console.error(`Error processing market account ${marketAccount.pubkey.toBase58()}:`, error);
        }
      }
      
      return markets;
    } catch (error) {
      console.error("Error fetching markets:", error);
      return [];
    }
  }

  /**
   * Get a specific market by its address
   */
  async getMarket(marketAddress: PublicKey): Promise<Market | null> {
    try {
      // Fetch account data
      const accountInfo = await this.connection.getAccountInfo(marketAddress);
      if (!accountInfo) {
        console.log(`Market ${marketAddress.toBase58()} not found`);
        return null;
      }
      
      try {
        // Deserialize market data
        const marketData = AccountDeserializer.deserializeMarketAccount(accountInfo);
        
        // We need token mint information
        const tokenMint = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"); // USDC devnet
        
        // Convert to user-friendly format
        return AccountDeserializer.marketStateToMarket(
          marketAddress, 
          marketData,
          tokenMint
        );
      } catch (error) {
        console.error(`Error deserializing market ${marketAddress.toBase58()}:`, error);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching market ${marketAddress.toBase58()}:`, error);
      return null;
    }
  }

  /**
   * Get predictions for a specific user
   */
  async getUserPredictions(userAddress: PublicKey): Promise<Prediction[]> {
    try {
      // Use getProgramAccounts with filters to find user's predictions
      const predictionAccounts = await this.connection.getProgramAccounts(PROGRAM_ID, {
        filters: [
          {
            memcmp: {
              offset: 0, // Discriminator
              bytes: "FORESIGHT_PREDICTION", // This is a placeholder
            },
          },
          {
            memcmp: {
              offset: 8, // After discriminator, at user pubkey position
              bytes: userAddress.toBase58(),
            },
          },
        ],
      });
      
      console.log(`Found ${predictionAccounts.length} prediction accounts for user ${userAddress.toBase58()}`);
      
      // Process the accounts
      const predictions: Prediction[] = [];
      for (const predictionAccount of predictionAccounts) {
        try {
          // Deserialize prediction data
          const predictionData = AccountDeserializer.deserializePredictionAccount(predictionAccount.account);
          
          // Convert to user-friendly format
          const prediction = AccountDeserializer.predictionStateToPrediction(predictionData);
          
          // Get market info to determine prediction status
          const market = await this.getMarket(prediction.marketAddress);
          if (market && market.resolved) {
            if (market.winningOutcome === prediction.outcomeIndex) {
              prediction.status = 'won';
              
              // Calculate potential reward
              const totalPool = market.totalPool;
              const winningStake = market.stakesPerOutcome[prediction.outcomeIndex];
              if (winningStake > 0) {
                const userShare = prediction.amount / winningStake;
                const creatorFee = (totalPool * market.creatorFeeBps) / 10000;
                const protocolFee = (totalPool * market.protocolFeeBps) / 10000;
                const winnerPool = totalPool - creatorFee - protocolFee;
                prediction.potentialReward = winnerPool * userShare;
              }
            } else {
              prediction.status = 'lost';
            }
          }
          
          predictions.push(prediction);
        } catch (error) {
          console.error(`Error processing prediction account ${predictionAccount.pubkey.toBase58()}:`, error);
        }
      }
      
      return predictions;
    } catch (error) {
      console.error(`Error fetching predictions for user ${userAddress.toBase58()}:`, error);
      return [];
    }
  }

  /**
   * Get predictions for a specific market
   */
  async getMarketPredictions(marketAddress: PublicKey): Promise<Prediction[]> {
    try {
      // Use getProgramAccounts with filters to find predictions for this market
      const predictionAccounts = await this.connection.getProgramAccounts(PROGRAM_ID, {
        filters: [
          {
            memcmp: {
              offset: 0, // Discriminator
              bytes: "FORESIGHT_PREDICTION", // This is a placeholder
            },
          },
          {
            memcmp: {
              offset: 40, // After discriminator and user pubkey, at market pubkey position
              bytes: marketAddress.toBase58(),
            },
          },
        ],
      });
      
      console.log(`Found ${predictionAccounts.length} prediction accounts for market ${marketAddress.toBase58()}`);
      
      // Process the accounts
      const predictions: Prediction[] = [];
      for (const predictionAccount of predictionAccounts) {
        try {
          // Deserialize prediction data
          const predictionData = AccountDeserializer.deserializePredictionAccount(predictionAccount.account);
          
          // Convert to user-friendly format
          const prediction = AccountDeserializer.predictionStateToPrediction(predictionData);
          predictions.push(prediction);
        } catch (error) {
          console.error(`Error processing prediction account ${predictionAccount.pubkey.toBase58()}:`, error);
        }
      }
      
      return predictions;
    } catch (error) {
      console.error(`Error fetching predictions for market ${marketAddress.toBase58()}:`, error);
      return [];
    }
  }

  /**
   * Count predictions for a market to be used in market stats
   */
  async countMarketPredictions(marketAddress: PublicKey): Promise<number> {
    try {
      // Use getProgramAccounts with filters just to count
      const predictionAccounts = await this.connection.getProgramAccounts(PROGRAM_ID, {
        filters: [
          {
            memcmp: {
              offset: 0,
              bytes: "FORESIGHT_PREDICTION", // This is a placeholder
            },
          },
          {
            memcmp: {
              offset: 40,
              bytes: marketAddress.toBase58(),
            },
          },
        ],
        dataSlice: { offset: 0, length: 0 }, // We don't need the data, just the count
      });
      
      return predictionAccounts.length;
    } catch (error) {
      console.error(`Error counting predictions for market ${marketAddress.toBase58()}:`, error);
      return 0;
    }
  }
}
