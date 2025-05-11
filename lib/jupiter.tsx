import { useConnection } from "./connection";
import { useWallet } from "./wallet-provider";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useToast } from "./hooks/useToast";
import { atom, useRecoilState } from "recoil";
import { useCallback } from "react";

// Define swap state atom
export const swapState = atom({
  key: "jupiterSwapState",
  default: {
    inputToken: null as string | null,
    outputToken: null as string | null,
    inputAmount: 0,
    outputAmount: 0,
    slippage: 1, // 1% default slippage
    routes: [] as any[],
    selectedRoute: null as any,
  },
});

export function useJupiterSwap() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, connected } = useWallet();
  const { showToast } = useToast();
  const [swap, setSwap] = useRecoilState(swapState);

  // Get possible swap routes
  const fetchRoutes = useCallback(async () => {
    if (!connection || !publicKey || !swap.inputToken || !swap.outputToken || swap.inputAmount <= 0) {
      return { routes: [] };
    }

    try {
      const response = await fetch("https://quote-api.jup.ag/v6/quote", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputMint: swap.inputToken,
          outputMint: swap.outputToken,
          amount: Math.floor(swap.inputAmount * 10 ** 9), // Convert to lamports or smallest unit
          slippageBps: swap.slippage * 100, // Convert to basis points
        }),
      });

      const data = await response.json();
      return { routes: data.data };
    } catch (error) {
      console.error("Error fetching routes:", error);
      showToast("Failed to fetch swap routes", "error");
      return { routes: [] };
    }
  }, [connection, publicKey, swap.inputToken, swap.outputToken, swap.inputAmount, swap.slippage]);

  // Query to fetch routes
  const { data: routesData, isLoading: isLoadingRoutes, refetch: refetchRoutes } = useQuery({
    queryKey: ["jupiterRoutes", swap.inputToken, swap.outputToken, swap.inputAmount, swap.slippage],
    queryFn: fetchRoutes,
    enabled: !!connection && !!publicKey && !!swap.inputToken && !!swap.outputToken && swap.inputAmount > 0,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  // Execute the swap
  const executeSwap = async (routeInfo: any) => {
    if (!connection || !publicKey || !signTransaction) {
      showToast("Wallet not connected", "error");
      throw new Error("Wallet not connected");
    }

    try {
      // Prepare the transaction
      const response = await fetch("https://quote-api.jup.ag/v6/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: routeInfo,
          userPublicKey: publicKey.toString(),
          wrapUnwrapSOL: true, // Auto wrap/unwrap SOL
        }),
      });

      const swapResult = await response.json();
      
      if (!swapResult.swapTransaction) {
        throw new Error("Failed to create swap transaction");
      }

      // Deserialize and sign the transaction
      const transactionBuffer = Buffer.from(swapResult.swapTransaction, "base64");
      const transaction = Transaction.from(transactionBuffer);
      
      // Sign the transaction
      const signedTransaction = await signTransaction(transaction);
      
      // Send the transaction
      const txid = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // Confirm the transaction
      await connection.confirmTransaction(txid, "confirmed");
      
      return { txid };
    } catch (error) {
      console.error("Error executing swap:", error);
      showToast("Swap failed: " + (error as Error).message, "error");
      throw error;
    }
  };

  const swapMutation = useMutation({
    mutationFn: executeSwap,
    onSuccess: ({ txid }) => {
      showToast(`Swap successful! Transaction ID: ${txid.substring(0, 8)}...`, "success");
      
      // Reset the swap state
      setSwap({
        inputToken: null,
        outputToken: null,
        inputAmount: 0,
        outputAmount: 0,
        slippage: 1,
        routes: [],
        selectedRoute: null,
      });
    },
    onError: (error: Error) => {
      showToast(`Swap failed: ${error.message}`, "error");
    },
  });

  // Update swap state
  const updateSwapState = useCallback((updates: Partial<typeof swap>) => {
    setSwap((prevState) => ({
      ...prevState,
      ...updates,
    }));
  }, [setSwap]);

  return {
    swap,
    updateSwapState,
    routes: routesData?.routes || [],
    isLoadingRoutes,
    executeSwap: swapMutation.mutate,
    isSwapping: swapMutation.isPending,
    refetchRoutes,
  };
} 