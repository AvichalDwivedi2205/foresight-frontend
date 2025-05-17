"use client";

import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { TokenInfo } from "./models";
import { createJupiterApiClient } from "@jup-ag/api";

export class JupiterService {
  private connection: Connection;
  private jupiterClient: ReturnType<typeof createJupiterApiClient>;

  constructor(connection: Connection) {
    this.connection = connection;
    this.jupiterClient = createJupiterApiClient({
      // Default to mainnet-beta, but this can be changed based on your needs
      // (e.g., 'devnet' for testing)
      cluster: "mainnet-beta",
    });
  }

  // Get a list of all tokens supported by Jupiter
  async getSupportedTokens(): Promise<TokenInfo[]> {
    try {
      const tokens = await this.jupiterClient.getTokens();
      
      return Object.values(tokens).map((token) => ({
        address: new PublicKey(token.address),
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        logoURI: token.logoURI,
      }));
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
      const quote = await this.jupiterClient.quoteGet({
        inputMint,
        outputMint,
        amount,
        slippageBps,
      });
      
      return quote;
    } catch (error) {
      console.error("Error getting quote:", error);
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
  ): Promise<Transaction> {
    try {
      // Step 1: Get a quote
      const quote = await this.getQuote(inputMint, outputMint, amount, slippageBps);
      
      // Step 2: Create a swap transaction
      const { swapTransaction } = await this.jupiterClient.swapPost({
        quoteResponse: quote,
        userPublicKey: userPublicKey.toString(),
        wrapAndUnwrapSol: true, // Automatically wrap and unwrap SOL
      });
      
      // Step 3: Deserialize the transaction
      const transaction = Transaction.from(Buffer.from(swapTransaction, "base64"));
      
      return transaction;
    } catch (error) {
      console.error("Error creating swap transaction:", error);
      throw error;
    }
  }

  // Get prices for a token pair
  async getPrices(inputMint: string, outputMint: string) {
    try {
      const prices = await this.jupiterClient.priceGet({
        ids: [inputMint, outputMint].join(","),
      });
      
      return prices;
    } catch (error) {
      console.error("Error getting prices:", error);
      throw error;
    }
  }
}

export default JupiterService; 