"use client";

import { useState } from "react";
import Link from "next/link";
import { motion  } from '@/components/motion';
import WalletButton from "./WalletButton";
import SwapTokensModal from "./SwapTokensModal";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  return (
    <nav className="bg-[#0E0E10] border-b border-white/5">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7]">
              ForesightProtocol
            </span>
            <div className="h-2 w-2 rounded-full bg-[#13ADC7] ml-1 animate-pulse"></div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/markets" className="text-[#F5F5F5] hover:text-[#5F6FFF] transition-colors">
              Markets
            </Link>
            <Link href="/profile" className="text-[#F5F5F5] hover:text-[#5F6FFF] transition-colors">
              Dashboard
            </Link>
            <Link href="/create" className="text-[#F5F5F5] hover:text-[#5F6FFF] transition-colors">
              Create
            </Link>
            <Link href="/leaderboard" className="text-[#F5F5F5] hover:text-[#5F6FFF] transition-colors">
              Leaderboard
            </Link>
            
            {/* Swap Tokens Button */}
            <motion.button
              className="bg-gradient-to-r from-[#FF9500] to-[#FFD500] text-[#121212] px-5 py-2 rounded-full font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSwapModalOpen(true)}
            >
              Swap Tokens
            </motion.button>
            
            {/* Wallet button */}
            <WalletButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#F5F5F5] hover:text-white hover:bg-gray-800/50"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <motion.div
          className="md:hidden bg-[#1C1C22]"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              href="/markets" 
              className="block px-3 py-2 rounded-md text-base font-medium text-[#F5F5F5] hover:bg-[#5F6FFF]/10 hover:text-[#5F6FFF]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Markets
            </Link>
            <Link 
              href="/profile" 
              className="block px-3 py-2 rounded-md text-base font-medium text-[#F5F5F5] hover:bg-[#5F6FFF]/10 hover:text-[#5F6FFF]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/create" 
              className="block px-3 py-2 rounded-md text-base font-medium text-[#F5F5F5] hover:bg-[#5F6FFF]/10 hover:text-[#5F6FFF]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Create
            </Link>
            <Link 
              href="/leaderboard" 
              className="block px-3 py-2 rounded-md text-base font-medium text-[#F5F5F5] hover:bg-[#5F6FFF]/10 hover:text-[#5F6FFF]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Leaderboard
            </Link>
            <button
              className="w-full px-3 py-2 mt-2 rounded-md text-base font-medium text-[#121212] bg-gradient-to-r from-[#FF9500] to-[#FFD500]"
              onClick={() => {
                setIsSwapModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
            >
              Swap Tokens
            </button>
            <div className="pt-2">
              <WalletButton />
            </div>
          </div>
        </motion.div>
      )}

      {/* Swap Tokens Modal */}
      <SwapTokensModal 
        isOpen={isSwapModalOpen} 
        onClose={() => setIsSwapModalOpen(false)} 
        onSwapComplete={(signature) => {
          console.log("Swap completed with signature:", signature);
          setIsSwapModalOpen(false);
        }}
      />
    </nav>
  );
}