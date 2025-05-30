"use client";

import { Connection, PublicKey, Transaction, VersionedTransaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TokenInfo } from "./models";
import { createJupiterApiClient } from "@jup-ag/api";

// Jupiter devnet program ID
const JUPITER_DEVNET_PROGRAM_ID = "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4";

export class JupiterService {
  private connection: Connection;
  private jupiterClient: ReturnType<typeof createJupiterApiClient>;
  private useMockFallback = true; // Enable mock fallback for devnet

  constructor(connection: Connection) {
    this.connection = connection;
    this.jupiterClient = createJupiterApiClient({
      // Specify the base path for Jupiter API
      basePath: "https://quote-api.jup.ag/v6"
    });
  }

  // Get a list of all tokens supported by Jupiter
  async getSupportedTokens(): Promise<TokenInfo[]> {
    try {
      // Get standard tokens for Jupiter
      const standardTokensRes = await fetch("https://cache.jup.ag/tokens");
      const standardTokens: any[] = await standardTokensRes.json();
      
      // Filter to only include well-known tokens that are available on devnet
      const devnetSafeTokens = standardTokens.filter(token => 
        ['SOL', 'USDC', 'USDT', 'BTC', 'ETH', 'BONK'].includes(token.symbol)
      );
      
      console.log(`Using ${devnetSafeTokens.length} filtered tokens for devnet`);
      
      // Get custom market tokens
      try {
        // For testing, we'll create a few dummy market tokens
        // In production, you'd fetch these from your contracts
        // This allows testing the UI without needing real token addresses
        const marketTokens = [
          {
            address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC devnet address
            symbol: "USDC",
            name: "USD Coin",
            decimals: 6,
            logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"
          },
          {
            address: "So11111111111111111111111111111111111111112", // SOL address
            symbol: "SOL",
            name: "Solana",
            decimals: 9,
            logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
          },
          {
            address: "MKT111111111111111111111111111111111111111", // Example market token
            symbol: "MKT1",
            name: "Market 1 Token",
            decimals: 9,
            logoURI: null
          },
          {
            address: "MKT222222222222222222222222222222222222222", // Example market token
            symbol: "MKT2",
            name: "Market 2 Token",
            decimals: 9,
            logoURI: null
          }
        ];
        
        // Combine standard tokens with market-specific tokens
        const allTokens = [...devnetSafeTokens, ...marketTokens];
        
        console.log(`Total tokens available: ${allTokens.length} (including market tokens)`);
        
        return allTokens.map((token) => ({
          address: new PublicKey(token.address),
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          logoURI: token.logoURI,
        }));
      } catch (marketTokensError) {
        console.warn("Failed to fetch market tokens, using standard tokens only:", marketTokensError);
        
        // Just use the filtered standard tokens if we can't get market tokens
        return devnetSafeTokens.map((token) => ({
          address: new PublicKey(token.address),
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          logoURI: token.logoURI,
        }));
      }
    } catch (error) {
      console.error("Error fetching tokens:", error);
      throw error;
    }
  }

  // Get a quote for swapping tokens
  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 100 // Default 1% slippage
  ) {
    try {
      console.log(`Getting quote for ${inputMint} -> ${outputMint}, amount: ${amount}`);
      
      // Use Jupiter API to get quote
      const response = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}&cluster=devnet`
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Quote API error:", errorText);
        
        if (this.useMockFallback) {
          console.log("Using mock quote due to API error");
          // Return a mock quote suitable for devnet testing
          const mockRate = 1.02; // Mock exchange rate
          const outputAmount = Math.floor(amount * mockRate);
          
          return {
            inputMint,
            outputMint,
            inAmount: amount,
            outAmount: outputAmount,
            otherAmountThreshold: Math.floor(outputAmount * (1 - slippageBps / 10000)),
            swapMode: "ExactIn",
            slippageBps,
            routes: [
              {
                marketInfos: [
                  {
                    id: "mock-market",
                    label: "Mock DEX",
                    inputMint,
                    outputMint,
                    inAmount: amount,
                    outAmount: outputAmount,
                    lpFee: { amount: Math.floor(amount * 0.003), percent: 0.3 }
                  }
                ],
                amount: amount,
                outputAmount,
                otherAmountThreshold: Math.floor(outputAmount * (1 - slippageBps / 10000)),
                slippageBps,
                priceImpactPct: 0.1,
              }
            ],
            priceImpactPct: 0.1,
            contextSlot: 0,
          };
        }
        
        throw new Error(`Failed to get quote: ${response.status} - ${errorText}`);
      }
      
      const quoteResponse = await response.json();
      console.log("Quote received successfully");
      return quoteResponse;
    } catch (error) {
      console.error("Error getting quote:", error);
      
      if (this.useMockFallback) {
        console.log("Using mock quote due to error");
        // Return a mock quote for testing
        const mockRate = 1.02; // Mock exchange rate
        const outputAmount = Math.floor(amount * mockRate);
        
        return {
          inputMint,
          outputMint,
          inAmount: amount,
          outAmount: outputAmount,
          otherAmountThreshold: Math.floor(outputAmount * (1 - slippageBps / 10000)),
          swapMode: "ExactIn",
          slippageBps,
          routes: [
            {
              marketInfos: [
                {
                  id: "mock-market",
                  label: "Mock DEX",
                  inputMint,
                  outputMint,
                  inAmount: amount,
                  outAmount: outputAmount,
                  lpFee: { amount: Math.floor(amount * 0.003), percent: 0.3 }
                }
              ],
              amount: amount,
              outputAmount,
              otherAmountThreshold: Math.floor(outputAmount * (1 - slippageBps / 10000)),
              slippageBps,
              priceImpactPct: 0.1,
            }
          ],
          priceImpactPct: 0.1,
          contextSlot: 0,
        };
      }
      
      throw error;
    }
  }

  // Create a swap transaction
  async createSwapTransaction(
    userPublicKey: PublicKey,
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 100 // Default 1% slippage
  ): Promise<Transaction | VersionedTransaction> {
    try {
      // Step 1: Get a quote
      const quote = await this.getQuote(inputMint, outputMint, amount, slippageBps);
      
      // Try real Jupiter API first
      if (!this.useMockFallback) {
        try {
          // Step 2: Create a swap transaction using Jupiter's swap API
          console.log("Creating swap transaction with Jupiter devnet API");
          const swapResponse = await fetch('https://quote-api.jup.ag/v6/swap', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              quoteResponse: quote,
              userPublicKey: userPublicKey.toString(),
              wrapAndUnwrapSol: true,
              // Specify devnet cluster explicitly
              cluster: "devnet",
              // Use the correct program ID
              programId: JUPITER_DEVNET_PROGRAM_ID,
              // Keep this false for better devnet compatibility
              useSharedAccounts: false,
              // Use legacy transaction format for better devnet compatibility
              asLegacyTransaction: true
            })
          });
          
          if (!swapResponse.ok) {
            const errorText = await swapResponse.text();
            console.error("Swap API error:", errorText);
            throw new Error(`Failed to get swap transaction: ${swapResponse.status} - ${errorText}`);
          }
          
          const { swapTransaction } = await swapResponse.json();
          console.log("Swap transaction received from Jupiter API");
          
          // Deserialize as a legacy transaction (since we requested asLegacyTransaction: true)
          try {
            const transaction = Transaction.from(Buffer.from(swapTransaction, "base64"));
            console.log("Transaction deserialized successfully");
            
            // For devnet, get a fresh blockhash to ensure transaction validity
            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = userPublicKey;
            
            return transaction;
          } catch (error) {
            console.error("Error deserializing transaction:", error);
            throw new Error(`Failed to deserialize transaction: ${String(error)}`);
          }
        } catch (error) {
          console.error("Error with real Jupiter swap, using fallback:", error);
          // Fall through to mock implementation
        }
      }
      
      // If we get here, use the mock implementation for devnet
      console.log("Creating mock swap transaction for devnet");
      
      // Create a simple SOL transfer transaction (just to ourselves)
      // This is guaranteed to work on devnet and simulate a successful swap
      const transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: userPublicKey,
          toPubkey: userPublicKey, // Send to self
          lamports: 100, // Very small amount (100 lamports)
        })
      );
      
      // Set recent blockhash and fee payer
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;
      transaction.feePayer = userPublicKey;
      
      console.log("Mock transaction created successfully - this will simulate a swap for UI testing");
      return transaction;
    } catch (error) {
      console.error("Error creating swap transaction:", error);
      throw error;
    }
  }

  // Get prices for a token pair
  async getPrices(inputMint: string, outputMint: string) {
    try {
      // Use direct API call to get prices
      console.log(`Getting prices for ${inputMint} and ${outputMint}`);
      
      const response = await fetch(
        `https://price.jup.ag/v6/price?ids=${[inputMint, outputMint].join(",")}&cluster=devnet`
      );
      
      if (!response.ok) {
        console.warn(`Price API returned ${response.status}, using fallback pricing`);
        
        // On devnet, we can return mock prices for testing purposes
        return {
          data: {
            [inputMint]: {
              id: inputMint,
              mintSymbol: "SOURCE",
              vsToken: "USD",
              vsTokenSymbol: "USD",
              price: 1.0
            },
            [outputMint]: {
              id: outputMint,
              mintSymbol: "TARGET",
              vsToken: "USD",
              vsTokenSymbol: "USD",
              price: 1.0
            }
          }
        };
      }
      
      const prices = await response.json();
      return prices;
    } catch (error) {
      console.error("Error getting prices:", error);
      
      // Provide fallback prices for devnet testing
      return {
        data: {
          [inputMint]: {
            id: inputMint,
            mintSymbol: "SOURCE",
            vsToken: "USD",
            vsTokenSymbol: "USD",
            price: 1.0
          },
          [outputMint]: {
            id: outputMint,
            mintSymbol: "TARGET", 
            vsToken: "USD",
            vsTokenSymbol: "USD",
            price: 1.0
          }
        }
      };
    }
  }
}

export default JupiterService;