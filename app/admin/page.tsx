"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/lib/wallet-provider";
import { useConnection } from "@/lib/connection";
import { useToast } from "@/lib/hooks/useToast";
import { useMarketData } from "@/lib/hooks/useMarketData";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

// Admin public key from the smart contract
const ADMIN_PUBKEY = "4nQVUxfFaFjmz9esZxkBUUxgjDCyCcHMarHU8Ek7nGjy";

export default function AdminPage() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const { showToast } = useToast();
  const { markets, isLoading } = useMarketData();
  
  // States for admin functionality
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [expiredMarkets, setExpiredMarkets] = useState<any[]>([]);
  const [isResolvingMarket, setIsResolvingMarket] = useState<string | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<Record<string, number>>({});
  
  // Check if connected wallet is admin
  useEffect(() => {
    if (connected && publicKey) {
      const walletIsAdmin = publicKey.toString() === ADMIN_PUBKEY;
      setIsAdmin(walletIsAdmin);
      
      if (walletIsAdmin) {
        showToast("Admin access granted", "success");
      } else {
        showToast("This page is for admin use only", "warning");
      }
    } else {
      setIsAdmin(false);
    }
  }, [connected, publicKey, showToast]);
  
  // Filter expired but unresolved markets
  useEffect(() => {
    if (markets.length > 0) {
      const now = Date.now();
      const filtered = markets.filter(market => 
        !market.resolved && market.deadline < now
      );
      setExpiredMarkets(filtered);
    }
  }, [markets]);
  
  // Handle outcome selection for resolution
  const handleOutcomeChange = (marketId: string, outcomeIndex: number) => {
    setSelectedOutcome(prev => ({
      ...prev,
      [marketId]: outcomeIndex
    }));
  };
  
  // Handle market resolution
  const handleResolveMarket = async (marketId: string) => {
    if (!isAdmin) {
      showToast("Only admin can resolve markets", "error");
      return;
    }
    
    const outcome = selectedOutcome[marketId];
    if (outcome === undefined) {
      showToast("Please select an outcome", "warning");
      return;
    }
    
    try {
      setIsResolvingMarket(marketId);
      
      // In production, this would call the smart contract
      showToast("Resolving market...", "info");
      
      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success
      showToast("Market resolved successfully", "success");
      
      // Update UI
      setExpiredMarkets(prev => prev.filter(m => m.pubkey !== marketId));
      
    } catch (error) {
      console.error("Error resolving market:", error);
      showToast("Failed to resolve market", "error");
    } finally {
      setIsResolvingMarket(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#F5F5F5]">
      <Navbar />
      
      <motion.main
        className="container mx-auto px-4 py-10 max-w-5xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7]">
            Admin Dashboard
          </h1>
          <p className="text-[#B0B0B0] mb-10">
            Manage markets and perform administrative functions. Admin access required.
          </p>
        </motion.div>
        
        {!connected ? (
          <div className="text-center py-16 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-xl mb-4">Please connect your wallet to access admin functions</p>
          </div>
        ) : !isAdmin ? (
          <div className="text-center py-16 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-xl mb-4 text-red-400">Access Denied</p>
            <p className="text-white/70">
              The connected wallet ({publicKey?.toString().substring(0, 6)}...{publicKey?.toString().substring(publicKey.toString().length - 4)}) is not authorized for admin access.
            </p>
            <p className="mt-4 text-white/50">
              Please connect with the admin wallet: {ADMIN_PUBKEY.substring(0, 6)}...{ADMIN_PUBKEY.substring(ADMIN_PUBKEY.length - 4)}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Markets pending resolution */}
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
              <h2 className="text-2xl font-bold mb-4">Markets Pending Resolution</h2>
              
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-700/50 rounded-lg"></div>
                  ))}
                </div>
              ) : expiredMarkets.length === 0 ? (
                <p className="text-white/70 text-center py-8">No markets pending resolution</p>
              ) : (
                <div className="space-y-4">
                  {expiredMarkets.map(market => (
                    <div 
                      key={market.pubkey} 
                      className="bg-gray-700/30 rounded-lg p-4 border border-gray-600"
                    >
                      <h3 className="font-medium mb-2">{market.question}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-1 bg-amber-700/30 text-amber-300 text-xs rounded-full">
                          Expired on {new Date(market.deadline).toLocaleDateString()}
                        </span>
                        <span className="px-2 py-1 bg-blue-700/30 text-blue-300 text-xs rounded-full">
                          Pool: {(market.total_pool / 1e9).toFixed(2)} SOL
                        </span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <div className="flex-1">
                          <label className="block text-sm text-white/70 mb-2">Select winning outcome:</label>
                          <select 
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md"
                            value={selectedOutcome[market.pubkey] || ""}
                            onChange={(e) => handleOutcomeChange(market.pubkey, Number(e.target.value))}
                          >
                            <option value="">Select outcome</option>
                            {market.outcomes.map((outcome: string, index: number) => (
                              <option key={index} value={index}>
                                {outcome} ({((market.stakes_per_outcome[index] / market.total_pool) * 100).toFixed(1)}%)
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex items-end">
                          <button
                            onClick={() => handleResolveMarket(market.pubkey)}
                            disabled={isResolvingMarket === market.pubkey || selectedOutcome[market.pubkey] === undefined}
                            className={`px-4 py-2 rounded-md ${
                              isResolvingMarket === market.pubkey
                                ? "bg-blue-700/50 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                          >
                            {isResolvingMarket === market.pubkey ? (
                              <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Resolving...
                              </div>
                            ) : (
                              "Resolve Market"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Protocol Statistics */}
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
              <h2 className="text-2xl font-bold mb-4">Protocol Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <h3 className="text-sm text-white/50 mb-1">Total Markets</h3>
                  <p className="text-2xl font-bold">{markets.length}</p>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <h3 className="text-sm text-white/50 mb-1">Total Volume</h3>
                  <p className="text-2xl font-bold">
                    {(markets.reduce((acc, market) => acc + market.total_pool, 0) / 1e9).toFixed(2)} SOL
                  </p>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <h3 className="text-sm text-white/50 mb-1">Resolved Markets</h3>
                  <p className="text-2xl font-bold">
                    {markets.filter(market => market.resolved).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.main>
      
      <Footer />
    </div>
  );
} 