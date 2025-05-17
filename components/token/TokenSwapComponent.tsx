import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/lib/wallet-provider";
import { useJupiterSwap } from "@/lib/jupiter";
import { useToast } from "@/lib/hooks/useToast";
import { motion } from "framer-motion";

export default function TokenSwapComponent() {
  const { connected, publicKey } = useWallet();
  const { showToast } = useToast();
  const { 
    swap, 
    updateSwapState, 
    routes, 
    isLoadingRoutes, 
    executeSwap, 
    isSwapping,
    refetchRoutes 
  } = useJupiterSwap();

  // Local state
  const [availableTokens, setAvailableTokens] = useState<any[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);

  // Load available tokens
  useEffect(() => {
    const fetchTokens = async () => {
      setIsLoadingTokens(true);
      try {
        const response = await fetch("https://token.jup.ag/all");
        const tokens = await response.json();
        // Filter to common tokens
        const commonTokens = tokens.filter((token: any) => 
          token.tags?.includes("popular") || token.symbol === "SOL" || token.symbol === "USDC"
        );
        setAvailableTokens(commonTokens);
      } catch (error) {
        console.error("Error fetching tokens:", error);
        showToast("Failed to load available tokens", "error");
      } finally {
        setIsLoadingTokens(false);
      }
    };

    if (connected) {
      fetchTokens();
    }
  }, [connected, showToast]);

  // Handle input token selection
  const handleInputTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSwapState({ 
      inputToken: e.target.value,
      // Reset output amount when input token changes
      outputAmount: 0
    });
    refetchRoutes();
  };

  // Handle output token selection
  const handleOutputTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSwapState({ 
      outputToken: e.target.value,
      // Reset output amount when output token changes
      outputAmount: 0
    });
    refetchRoutes();
  };

  // Handle input amount change
  const handleInputAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Validate input is a number
    if (!isNaN(Number(value))) {
      updateSwapState({ inputAmount: Number(value) });
      refetchRoutes();
    }
  };

  // Handle slippage change
  const handleSlippageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    updateSwapState({ slippage: value });
    refetchRoutes();
  };

  // Handle swap execution
  const handleSwap = async () => {
    if (!connected) {
      showToast("Please connect your wallet first", "warning");
      return;
    }

    if (!swap.inputToken || !swap.outputToken || swap.inputAmount <= 0) {
      showToast("Please select tokens and enter an amount", "warning");
      return;
    }

    if (routes.length === 0) {
      showToast("No routes available for this swap", "error");
      return;
    }

    try {
      // Execute the swap with the best route
      await executeSwap(routes[0]);
    } catch (error) {
      console.error("Swap execution error:", error);
      showToast(`Swap failed: ${(error as Error).message}`, "error");
    }
  };

  // Find selected tokens
  const inputToken = availableTokens.find(t => t.address === swap.inputToken);
  const outputToken = availableTokens.find(t => t.address === swap.outputToken);

  // Calculate output amount based on best route
  const bestRoute = routes.length > 0 ? routes[0] : null;
  const outputAmount = bestRoute ? bestRoute.outAmount / (10 ** (outputToken?.decimals || 9)) : 0;

  return (
    <motion.div 
      className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-6 text-white">Swap Tokens</h2>

      {!connected ? (
        <div className="text-center py-6">
          <p className="text-white/70 mb-4">Connect your wallet to swap tokens</p>
        </div>
      ) : (
        <>
          {/* From Token */}
          <div className="mb-6">
            <label className="block text-white/80 mb-2 text-sm">From</label>
            <div className="flex items-center gap-2 bg-gray-700/50 border border-gray-600 rounded-lg p-3">
              <select
                value={swap.inputToken || ""}
                onChange={handleInputTokenChange}
                className="bg-transparent text-white focus:outline-none w-1/3"
                disabled={isLoadingTokens}
              >
                <option value="">Select</option>
                {availableTokens.map((token) => (
                  <option key={token.address} value={token.address}>
                    {token.symbol}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={swap.inputAmount || ""}
                onChange={handleInputAmountChange}
                placeholder="0.0"
                className="bg-transparent text-white focus:outline-none flex-1 text-right"
                disabled={!swap.inputToken}
              />
            </div>
          </div>

          {/* Swap Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-blue-500/20 p-2 rounded-full">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
          </div>

          {/* To Token */}
          <div className="mb-6">
            <label className="block text-white/80 mb-2 text-sm">To</label>
            <div className="flex items-center gap-2 bg-gray-700/50 border border-gray-600 rounded-lg p-3">
              <select
                value={swap.outputToken || ""}
                onChange={handleOutputTokenChange}
                className="bg-transparent text-white focus:outline-none w-1/3"
                disabled={isLoadingTokens}
              >
                <option value="">Select</option>
                {availableTokens.map((token) => (
                  <option key={token.address} value={token.address}>
                    {token.symbol}
                  </option>
                ))}
              </select>
              <div className="flex-1 text-right text-white">
                {isLoadingRoutes ? (
                  <div className="h-5 w-16 bg-gray-600/50 rounded animate-pulse ml-auto"></div>
                ) : (
                  outputAmount > 0 ? outputAmount.toFixed(6) : "0.0"
                )}
              </div>
            </div>
          </div>

          {/* Slippage Setting */}
          <div className="mb-6">
            <label className="block text-white/80 mb-2 text-sm">Slippage Tolerance (%)</label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={swap.slippage}
              onChange={handleSlippageChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-white/70 mt-1">
              <span>0.1%</span>
              <span>{swap.slippage}%</span>
              <span>5%</span>
            </div>
          </div>

          {/* Swap Details */}
          {routes.length > 0 && (
            <div className="mb-6 p-3 bg-gray-700/30 rounded-lg text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-white/70">Rate</span>
                <span className="text-white">
                  1 {inputToken?.symbol} ≈ {(outputAmount / swap.inputAmount).toFixed(6)} {outputToken?.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Fee</span>
                <span className="text-white">
                  {bestRoute?.marketInfos.reduce((acc, info) => acc + (info.fee?.amount || 0), 0) / (10 ** (outputToken?.decimals || 9))} {outputToken?.symbol}
                </span>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={isSwapping || isLoadingRoutes || !swap.inputToken || !swap.outputToken || swap.inputAmount <= 0 || routes.length === 0}
            className={`w-full py-3 rounded-lg flex items-center justify-center font-medium transition-colors ${
              isSwapping || isLoadingRoutes || !swap.inputToken || !swap.outputToken || swap.inputAmount <= 0 || routes.length === 0
                ? "bg-gray-700 cursor-not-allowed text-white/50"
                : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
            }`}
          >
            {isSwapping ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Swapping...
              </div>
            ) : isLoadingRoutes ? (
              "Loading Routes..."
            ) : !swap.inputToken || !swap.outputToken ? (
              "Select Tokens"
            ) : swap.inputAmount <= 0 ? (
              "Enter Amount"
            ) : routes.length === 0 ? (
              "No Routes Available"
            ) : (
              "Swap"
            )}
          </button>
        </>
      )}
    </motion.div>
  );
} 