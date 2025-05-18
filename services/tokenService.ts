"use client";

import { Connection, PublicKey } from "@solana/web3.js";
import { JupiterService } from "./contracts/jupiterService";
import { TokenInfo } from "./contracts/models";

// Default well-known tokens for the app
const DEFAULT_TOKENS = {
  // Solana native token
  SOL: {
    symbol: "SOL",
    name: "Solana",
    address: "So11111111111111111111111111111111111111112",
    decimals: 9,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  },
  // USDC on devnet
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  },
};

export class TokenService {
  private connection: Connection;
  private jupiterService: JupiterService;
  private cachedTokens: TokenInfo[] | null = null;
  private loadingPromise: Promise<TokenInfo[]> | null = null;

  constructor(connection: Connection) {
    this.connection = connection;
    this.jupiterService = new JupiterService(connection);
  }

  // Get all available tokens for the app
  async getAllTokens(forceRefresh: boolean = false): Promise<TokenInfo[]> {
    // Return cached tokens if available and refresh not forced
    if (this.cachedTokens && !forceRefresh) {
      return this.cachedTokens;
    }

    // If already loading, return the promise
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // Start loading tokens
    this.loadingPromise = this.loadTokens();
    try {
      const tokens = await this.loadingPromise;
      this.cachedTokens = tokens;
      return tokens;
    } finally {
      this.loadingPromise = null;
    }
  }

  // Load tokens from Jupiter API
  private async loadTokens(): Promise<TokenInfo[]> {
    try {
      // Get tokens from Jupiter service
      const jupiterTokens = await this.jupiterService.getSupportedTokens();
      
      // Ensure our default tokens are included (and at the top)
      const defaultTokenInfos = Object.values(DEFAULT_TOKENS).map(token => ({
        address: new PublicKey(token.address),
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        logoURI: token.logoURI,
      }));
      
      // Filter out Jupiter tokens that match our default tokens to avoid duplicates
      const defaultAddresses = new Set(defaultTokenInfos.map(t => t.address.toString()));
      const filteredJupiterTokens = jupiterTokens.filter(
        token => !defaultAddresses.has(token.address.toString())
      );
      
      // Combine default tokens with Jupiter tokens
      return [...defaultTokenInfos, ...filteredJupiterTokens];
    } catch (error) {
      console.error("Error loading tokens:", error);
      
      // Fallback to default tokens if Jupiter API fails
      return Object.values(DEFAULT_TOKENS).map(token => ({
        address: new PublicKey(token.address),
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        logoURI: token.logoURI,
      }));
    }
  }

  // Get token by address
  async getTokenByAddress(address: string): Promise<TokenInfo | null> {
    const tokens = await this.getAllTokens();
    return tokens.find(t => t.address.toString() === address) || null;
  }

  // Get token by symbol
  async getTokenBySymbol(symbol: string): Promise<TokenInfo | null> {
    const tokens = await this.getAllTokens();
    return tokens.find(t => t.symbol.toUpperCase() === symbol.toUpperCase()) || null;
  }

  // Get default token (SOL)
  async getDefaultToken(): Promise<TokenInfo> {
    const sol = await this.getTokenBySymbol("SOL");
    if (!sol) {
      throw new Error("Default token (SOL) not found");
    }
    return sol;
  }
}

// Create a singleton instance for use throughout the app
let tokenServiceInstance: TokenService | null = null;

export function getTokenService(connection: Connection): TokenService {
  if (!tokenServiceInstance) {
    tokenServiceInstance = new TokenService(connection);
  }
  return tokenServiceInstance;
}
