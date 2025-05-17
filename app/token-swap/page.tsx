"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TokenSwapComponent from "@/components/token/TokenSwapComponent";
import { useWallet } from "@/lib/wallet-provider";

export default function TokenSwapPage() {
  const { connected } = useWallet();

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
            Token Swap
          </h1>
          <p className="text-[#B0B0B0] mb-10">
            Swap between SPL tokens using Jupiter aggregator. Connect your wallet to get started.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <TokenSwapComponent />
          </div>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 h-fit">
            <h3 className="text-xl font-bold mb-4">About Token Swaps</h3>
            <div className="space-y-4 text-sm text-white/80">
              <p>
                Token swapping allows you to exchange one SPL token for another at the best possible rate using the Jupiter aggregator.
              </p>
              <p>
                Jupiter aggregates liquidity from various DEXs on Solana to provide the best prices and lowest slippage.
              </p>
              <p>
                Always double-check the rate and slippage before confirming any swap. Transaction fees will be paid in SOL.
              </p>
              
              {!connected && (
                <div className="mt-6 p-3 bg-blue-900/30 border border-blue-800/30 rounded-lg">
                  <p className="text-blue-400 font-medium">Connect your wallet to start swapping tokens!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.main>
      
      <Footer />
    </div>
  );
} 