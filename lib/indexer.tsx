import { useConnection } from "./connection";
import { useQuery } from "@tanstack/react-query";
import { PublicKey, Connection } from "@solana/web3.js";
import { useCallback } from "react";
import { useToast } from "./hooks/useToast";

// Types
type Market = {
  pubkey: string;
  creator: string;
  question: string;
  outcomes: string[];
  deadline: number;
  total_pool: number;
  resolved: boolean;
  winning_outcome?: number;
  ai_score: number;
  market_type: number;
  stakes_per_outcome: number[];
  creator_fee_bps: number;
  protocol_fee_bps: number;
  ai_resolvable: boolean;
};

type Prediction = {
  pubkey: string;
  market: string;
  user: string;
  outcome_index: number;
  amount: number;
  timestamp: number;
  claimed: boolean;
};

type CreatorProfile = {
  pubkey: string;
  creator: string;
  last_created_at: number;
  markets_created: number;
  total_volume: number;
  traction_score: number;
  tier: number;
};

// Fetching functions
export async function fetchAllMarkets() {
  const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
  
  if (!HELIUS_API_KEY) {
    console.warn("Helius API key not provided");
    return [];
  }
  
  try {
    // Using Helius DAS API to get all market accounts
    const response = await fetch(`https://api-devnet.helius.xyz/v0/addresses/7Gh4eFGmobz5ngu2U3bgZiQm2Adwm33dQTsUwzRb7wBi/accounts?api-key=${HELIUS_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Filter for Market accounts
        commitment: "confirmed",
        encoding: "jsonParsed",
        accountsDiscriminator: "Market",
      }),
    });
    
    const data = await response.json();
    if (!data.accounts) {
      return [];
    }
    
    // Transform the data to our Market type
    return data.accounts.map((account: any) => {
      const accountData = account.data.parsed;
      return {
        pubkey: account.account,
        creator: accountData.creator,
        question: accountData.question,
        outcomes: accountData.outcomes,
        deadline: accountData.deadline,
        total_pool: accountData.total_pool,
        resolved: accountData.resolved,
        winning_outcome: accountData.winning_outcome,
        ai_score: accountData.ai_score,
        market_type: accountData.market_type,
        stakes_per_outcome: accountData.stakes_per_outcome,
        creator_fee_bps: accountData.creator_fee_bps,
        protocol_fee_bps: accountData.protocol_fee_bps,
        ai_resolvable: accountData.ai_resolvable,
      };
    });
  } catch (error) {
    console.error("Error fetching markets:", error);
    return [];
  }
}

export async function fetchMarketById(marketId: string) {
  try {
    const marketPubkey = new PublicKey(marketId);
    
    // Get the raw account data from Solana
    const connection = new Connection("https://api.devnet.solana.com");
    const accountInfo = await connection.getAccountInfo(marketPubkey);
    
    if (!accountInfo) {
      return null;
    }
    
    // This is a simplified version - in a real app, you would deserialize the account data
    // using Anchor's coder or a custom deserializer
    
    // For the hackathon, we'll cheat and use Helius to get the parsed account
    const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
    
    if (!HELIUS_API_KEY) {
      console.warn("Helius API key not provided");
      return null;
    }
    
    const response = await fetch(`https://api-devnet.helius.xyz/v0/addresses/${marketId}/account?api-key=${HELIUS_API_KEY}`);
    const data = await response.json();
    
    if (!data.data || !data.data.parsed) {
      return null;
    }
    
    const accountData = data.data.parsed;
    return {
      pubkey: marketId,
      creator: accountData.creator,
      question: accountData.question,
      outcomes: accountData.outcomes,
      deadline: accountData.deadline,
      total_pool: accountData.total_pool,
      resolved: accountData.resolved,
      winning_outcome: accountData.winning_outcome,
      ai_score: accountData.ai_score,
      market_type: accountData.market_type,
      stakes_per_outcome: accountData.stakes_per_outcome,
      creator_fee_bps: accountData.creator_fee_bps,
      protocol_fee_bps: accountData.protocol_fee_bps,
      ai_resolvable: accountData.ai_resolvable,
    };
  } catch (error) {
    console.error("Error fetching market:", error);
    return null;
  }
}

export async function fetchMarketsByCreator(creatorAddress: string) {
  const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
  
  if (!HELIUS_API_KEY) {
    console.warn("Helius API key not provided");
    return [];
  }
  
  try {
    // Using Helius DAS API to get markets by creator
    const response = await fetch(`https://api-devnet.helius.xyz/v0/addresses/7Gh4eFGmobz5ngu2U3bgZiQm2Adwm33dQTsUwzRb7wBi/accounts?api-key=${HELIUS_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        commitment: "confirmed",
        encoding: "jsonParsed",
        accountsDiscriminator: "Market",
        filters: [
          {
            field: "creator",
            value: creatorAddress,
          },
        ],
      }),
    });
    
    const data = await response.json();
    if (!data.accounts) {
      return [];
    }
    
    return data.accounts.map((account: any) => {
      const accountData = account.data.parsed;
      return {
        pubkey: account.account,
        creator: accountData.creator,
        question: accountData.question,
        outcomes: accountData.outcomes,
        deadline: accountData.deadline,
        total_pool: accountData.total_pool,
        resolved: accountData.resolved,
        winning_outcome: accountData.winning_outcome,
        ai_score: accountData.ai_score,
        market_type: accountData.market_type,
        stakes_per_outcome: accountData.stakes_per_outcome,
        creator_fee_bps: accountData.creator_fee_bps,
        protocol_fee_bps: accountData.protocol_fee_bps,
        ai_resolvable: accountData.ai_resolvable,
      };
    });
  } catch (error) {
    console.error("Error fetching markets by creator:", error);
    return [];
  }
}

export async function fetchUserPredictions(userAddress: string) {
  const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
  
  if (!HELIUS_API_KEY) {
    console.warn("Helius API key not provided");
    return [];
  }
  
  try {
    // Using Helius DAS API to get predictions by user
    const response = await fetch(`https://api-devnet.helius.xyz/v0/addresses/7Gh4eFGmobz5ngu2U3bgZiQm2Adwm33dQTsUwzRb7wBi/accounts?api-key=${HELIUS_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        commitment: "confirmed",
        encoding: "jsonParsed",
        accountsDiscriminator: "Prediction",
        filters: [
          {
            field: "user",
            value: userAddress,
          },
        ],
      }),
    });
    
    const data = await response.json();
    if (!data.accounts) {
      return [];
    }
    
    return data.accounts.map((account: any) => {
      const accountData = account.data.parsed;
      return {
        pubkey: account.account,
        market: accountData.market,
        user: accountData.user,
        outcome_index: accountData.outcome_index,
        amount: accountData.amount,
        timestamp: accountData.timestamp,
        claimed: accountData.claimed,
      };
    });
  } catch (error) {
    console.error("Error fetching user predictions:", error);
    return [];
  }
}

export async function fetchCreatorProfile(creatorAddress: string) {
  const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
  
  if (!HELIUS_API_KEY) {
    console.warn("Helius API key not provided");
    return null;
  }
  
  try {
    // Get creator profile account
    const response = await fetch(`https://api-devnet.helius.xyz/v0/addresses/${creatorAddress}/account?api-key=${HELIUS_API_KEY}`);
    const data = await response.json();
    
    if (!data.data || !data.data.parsed) {
      return null;
    }
    
    const accountData = data.data.parsed;
    return {
      pubkey: creatorAddress,
      creator: accountData.creator,
      last_created_at: accountData.last_created_at,
      markets_created: accountData.markets_created,
      total_volume: accountData.total_volume,
      traction_score: accountData.traction_score,
      tier: accountData.tier,
    };
  } catch (error) {
    console.error("Error fetching creator profile:", error);
    return null;
  }
}

// Hooks for component usage
export function useIndexer() {
  const { connection } = useConnection();
  const { showToast } = useToast();
  
  // Fetch all markets
  const useMarkets = (filter?: string) => {
    return useQuery({
      queryKey: ["markets", filter],
      queryFn: async () => {
        try {
          const markets = await fetchAllMarkets();
          
          // Apply filter if provided
          if (filter && filter !== "all") {
            return markets.filter((market: Market) => {
              if (filter === "active") {
                return !market.resolved && market.deadline > Date.now() / 1000;
              }
              if (filter === "resolved") {
                return market.resolved;
              }
              if (filter === "expired") {
                return !market.resolved && market.deadline < Date.now() / 1000;
              }
              return true;
            });
          }
          
          return markets;
        } catch (error) {
          console.error("Error in useMarkets:", error);
          showToast("Failed to fetch markets", "error");
          return [];
        }
      },
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    });
  };
  
  // Fetch a single market by ID
  const useMarket = (marketId: string) => {
    return useQuery({
      queryKey: ["market", marketId],
      queryFn: async () => {
        try {
          return await fetchMarketById(marketId);
        } catch (error) {
          console.error("Error in useMarket:", error);
          showToast("Failed to fetch market details", "error");
          return null;
        }
      },
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      enabled: !!marketId,
    });
  };

  // Fetch all markets created by a user
  const useCreatorMarkets = (creatorAddress: string) => {
    return useQuery({
      queryKey: ["creatorMarkets", creatorAddress],
      queryFn: async () => {
        try {
          return await fetchMarketsByCreator(creatorAddress);
        } catch (error) {
          console.error("Error in useCreatorMarkets:", error);
          showToast("Failed to fetch creator markets", "error");
          return [];
        }
      },
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      enabled: !!creatorAddress,
    });
  };

  // Fetch all predictions made by a user
  const useUserPredictions = (userAddress: string) => {
    return useQuery({
      queryKey: ["userPredictions", userAddress],
      queryFn: async () => {
        try {
          return await fetchUserPredictions(userAddress);
        } catch (error) {
          console.error("Error in useUserPredictions:", error);
          showToast("Failed to fetch user predictions", "error");
          return [];
        }
      },
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      enabled: !!userAddress,
    });
  };

  // Fetch a creator's profile
  const useCreatorProfile = (creatorAddress: string) => {
    return useQuery({
      queryKey: ["creatorProfile", creatorAddress],
      queryFn: async () => {
        try {
          return await fetchCreatorProfile(creatorAddress);
        } catch (error) {
          console.error("Error in useCreatorProfile:", error);
          showToast("Failed to fetch creator profile", "error");
          return null;
        }
      },
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      enabled: !!creatorAddress,
    });
  };
  
  return {
    useMarkets,
    useMarket,
    useCreatorMarkets,
    useUserPredictions,
    useCreatorProfile
  };
} 