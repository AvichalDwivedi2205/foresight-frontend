"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useJupiterSwap } from "@/hooks/useJupiterSwap";
import { TokenInfo } from "@/services/contracts/models";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import toast from "react-hot-toast";

// Add debug logging function
function logDebug(message: string, data?: any) {
  console.log(`[SwapTokensModal] ${message}`, data || '');
}

interface SwapTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTokenMint?: string; // Optional target token to swap to
  onSwapComplete?: (signature: string) => void;
}

export const SwapTokensModal: React.FC<SwapTokensModalProps> = ({
  isOpen,
  onClose,
  targetTokenMint,
  onSwapComplete,
}) => {
  const { connected } = useWallet();
  const { getSupportedTokens, getQuote, swapTokens, isLoading, error } = useJupiterSwap();
  
  const [fromToken, setFromToken] = useState<TokenInfo | null>(null);
  const [toToken, setToToken] = useState<TokenInfo | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [slippage, setSlippage] = useState<number>(100); // 1% by default
  const [supportedTokens, setSupportedTokens] = useState<TokenInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [quote, setQuote] = useState<any>(null);
  const [showTokenSelector, setShowTokenSelector] = useState<"from" | "to" | null>(null);
  
  // Load supported tokens
  useEffect(() => {
    if (isOpen) {
      const loadTokens = async () => {
        try {
          console.log("Loading tokens...");
          const tokens = await getSupportedTokens();
          console.log(`Loaded ${tokens.length} tokens:`, tokens.slice(0, 3)); // Log first 3 tokens
          setSupportedTokens(tokens);
          
          // Set default tokens (SOL and target token if provided)
          const sol = tokens.find((t) => t.symbol === "SOL");
          if (sol) {
            console.log("Setting default From token (SOL):", sol);
            setFromToken(sol);
          }
          
          if (targetTokenMint) {
            console.log("Looking for target token with mint:", targetTokenMint);
            const targetToken = tokens.find((t) => t.address.toString() === targetTokenMint);
            if (targetToken) {
              console.log("Setting target To token:", targetToken);
              setToToken(targetToken);
            } else {
              console.log("Target token not found in supported tokens");
            }
          }
        } catch (error) {
          console.error("Failed to load tokens:", error);
        }
      };
      
      loadTokens();
    }
  }, [isOpen, getSupportedTokens, targetTokenMint]);
  
  // Get quote when inputs change
  useEffect(() => {
    const getSwapQuote = async () => {
      if (
        fromToken &&
        toToken &&
        amount &&
        !isNaN(parseFloat(amount)) &&
        parseFloat(amount) > 0
      ) {
        try {
          const parsedAmount = parseFloat(amount) * Math.pow(10, fromToken.decimals);
          const quoteResult = await getQuote(
            fromToken.address.toString(),
            toToken.address.toString(),
            parsedAmount,
            slippage
          );
          
          setQuote(quoteResult);
        } catch (error) {
          console.error("Failed to get quote:", error);
          setQuote(null);
        }
      } else {
        setQuote(null);
      }
    };
    
    getSwapQuote();
  }, [fromToken, toToken, amount, slippage, getQuote]);
  
  // Handle the swap
  const handleSwap = useCallback(async () => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!fromToken || !toToken || !amount || !quote) {
      toast.error("Please fill all fields correctly");
      return;
    }
    
    try {
      const parsedAmount = parseFloat(amount) * Math.pow(10, fromToken.decimals);
      const signature = await swapTokens(
        fromToken.address.toString(),
        toToken.address.toString(),
        parsedAmount,
        slippage
      );
      
      toast.success("Swap successful!");
      
      if (onSwapComplete) {
        onSwapComplete(signature);
      }
      
      onClose();
    } catch (error) {
      console.error("Swap failed:", error);
      toast.error("Swap failed. Please try again.");
    }
  }, [
    connected,
    fromToken,
    toToken,
    amount,
    quote,
    swapTokens,
    slippage,
    onSwapComplete,
    onClose,
  ]);
  
  // Filter tokens by search query
  const filteredTokens = searchQuery
    ? supportedTokens.filter(
        (token) =>
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : supportedTokens;
  
  // Swap from and to tokens
  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="bg-[#1C1C22] rounded-xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Swap Tokens</h3>
                <button
                  className="text-gray-400 hover:text-white"
                  onClick={onClose}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              
              {/* Wallet connection */}
              {!connected && (
                <div className="mb-6 bg-[#13141F] p-4 rounded-lg">
                  <p className="text-white mb-3">
                    Connect your wallet to swap tokens
                  </p>
                  <div className="flex justify-center">
                    <WalletMultiButton className="!bg-gradient-to-r !from-[#5F6FFF] !to-[#13ADC7] !text-white !px-5 !py-2 !rounded-full !font-medium" />
                  </div>
                </div>
              )}
              
              {/* From token */}
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">
                  From
                </label>
                <div className="bg-[#13141F] rounded-lg p-3 flex items-center">
                  <button
                    className="flex items-center gap-2 bg-[#2D2F3D] rounded-lg px-3 py-2"
                    onClick={() => setShowTokenSelector("from")}
                  >
                    {fromToken ? (
                      <>
                        {fromToken.logoURI && (
                          <img
                            src={fromToken.logoURI}
                            alt={fromToken.symbol}
                            className="w-5 h-5 rounded-full"
                          />
                        )}
                        <span className="text-white">{fromToken.symbol}</span>
                      </>
                    ) : (
                      <span className="text-gray-400">Select token</span>
                    )}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="ml-2 bg-transparent text-white outline-none flex-1 text-right"
                    placeholder="0.0"
                    min="0"
                  />
                </div>
              </div>
              
              {/* Swap button */}
              <div className="flex justify-center -my-2">
                <button
                  className="bg-[#2D2F3D] p-2 rounded-full"
                  onClick={handleSwapTokens}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              
              {/* To token */}
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">
                  To
                </label>
                <div className="bg-[#13141F] rounded-lg p-3 flex items-center">
                  <button
                    className="flex items-center gap-2 bg-[#2D2F3D] rounded-lg px-3 py-2"
                    onClick={() => {
                      console.log("Opening To token selector");
                      setShowTokenSelector("to");
                    }}
                  >
                    {toToken ? (
                      <>
                        {toToken.logoURI && (
                          <img
                            src={toToken.logoURI}
                            alt={toToken.symbol}
                            className="w-5 h-5 rounded-full"
                          />
                        )}
                        <span className="text-white">{toToken.symbol}</span>
                      </>
                    ) : (
                      <span className="text-gray-400">Select token</span>
                    )}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {quote && (
                    <div className="ml-2 text-white flex-1 text-right">
                      {(Number(quote.outAmount) / Math.pow(10, toToken?.decimals || 1)).toFixed(6)}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Slippage */}
              <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-2">
                  Slippage Tolerance
                </label>
                <div className="flex gap-2">
                  {[100, 200, 300].map((value) => (
                    <button
                      key={value}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        slippage === value
                          ? "bg-[#5F6FFF] text-white"
                          : "bg-[#2D2F3D] text-gray-400"
                      }`}
                      onClick={() => setSlippage(value)}
                    >
                      {value / 100}%
                    </button>
                  ))}
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={slippage / 100}
                      onChange={(e) => setSlippage(Number(e.target.value) * 100)}
                      className="w-full bg-[#2D2F3D] text-white px-3 py-1 rounded-lg text-sm pr-6"
                      min="0.1"
                      max="10"
                      step="0.1"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                      %
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Quote details */}
              {quote && (
                <div className="mb-6 p-3 bg-[#13141F] rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Rate</span>
                    <span className="text-white">
                      1 {fromToken?.symbol} ≈{" "}
                      {(Number(quote.outAmount) / Number(quote.inAmount) * Math.pow(10, (fromToken?.decimals || 1) - (toToken?.decimals || 1))).toFixed(6)}{" "}
                      {toToken?.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Fee</span>
                    <span className="text-white">
                      {quote.otherAmountThreshold
                        ? (Number(quote.otherAmountThreshold) / Math.pow(10, toToken?.decimals || 1)).toFixed(6)
                        : "0"}{" "}
                      {toToken?.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Minimum received</span>
                    <span className="text-white">
                      {(Number(quote.outAmount) * (1 - slippage / 10000) / Math.pow(10, toToken?.decimals || 1)).toFixed(6)}{" "}
                      {toToken?.symbol}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Error message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-500 text-sm">
                  {error}
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex gap-4">
                <button
                  className="flex-1 bg-gray-700 text-gray-300 py-3 rounded-lg font-medium"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  className={`flex-1 bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7] text-white py-3 rounded-lg font-medium ${
                    (!connected || !fromToken || !toToken || !amount || !quote || isLoading)
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={!connected || !fromToken || !toToken || !amount || !quote || isLoading}
                  onClick={handleSwap}
                >
                  {isLoading ? "Processing..." : "Swap"}
                </button>
              </div>
            </div>
          </motion.div>
          
          {/* Token selector */}
          <AnimatePresence>
            {showTokenSelector && (
              <motion.div
                className="fixed inset-0 flex items-center justify-center z-50 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowTokenSelector(null)}
              >
                <motion.div
                  className="bg-[#1C1C22] rounded-xl p-6 max-w-md w-full shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">
                      Select Token
                    </h3>
                    <button
                      className="text-gray-400 hover:text-white"
                      onClick={() => setShowTokenSelector(null)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Search */}
                  <div className="mb-4">
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full bg-[#13141F] text-white px-4 py-3 rounded-lg pl-10"
                        placeholder="Search token name or symbol"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Token list */}
                  <div className="h-64 overflow-y-auto">
                    {filteredTokens.length > 0 ? (
                      filteredTokens.map((token) => (
                        <button
                          key={token.address.toString()}
                          className="w-full flex items-center gap-3 p-3 hover:bg-[#2D2F3D] rounded-lg transition-colors"
                          onClick={() => {
                            console.log(`Token selected: ${token.symbol}, selector: ${showTokenSelector}`);
                            const tokenCopy = {
                              address: new PublicKey(token.address.toString()),
                              symbol: token.symbol,
                              name: token.name,
                              decimals: token.decimals,
                              logoURI: token.logoURI
                            };
                            if (showTokenSelector === "from") {
                              console.log("Setting From token:", tokenCopy);
                              setFromToken(tokenCopy);
                            } else {
                              console.log("Setting To token:", tokenCopy);
                              setToToken(tokenCopy);
                            }
                            setShowTokenSelector(null);
                            setSearchQuery("");
                          }}
                        >
                          {token.logoURI ? (
                            <img
                              src={token.logoURI}
                              alt={token.symbol}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                              {token.symbol.slice(0, 2)}
                            </div>
                          )}
                          <div className="text-left">
                            <div className="text-white">{token.symbol}</div>
                            <div className="text-gray-400 text-xs">
                              {token.name}
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <span>No tokens found</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default SwapTokensModal;