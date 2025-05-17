"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useWallet } from "../lib/wallet-provider";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { publicKey, connected, connecting, connectWallet, disconnectWallet, balance, WalletButton } = useWallet();
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Format wallet address for display
  const formatWalletAddress = (address: string) => {
    if (!address) return "";
    return address.slice(0, 4) + "..." + address.slice(-4);
  };

  // Format SOL balance
  const formatBalance = (sol: number) => {
    return sol.toFixed(2);
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-[#0E0E10] backdrop-blur-sm border-b border-[#13ADC7]/20" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="text-xl font-bold text-[#F5F5F5]">
                <span className="text-[#13ADC7]">Foresight</span> Protocol
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex mx-auto">
            <div className="flex space-x-1">
              <Link 
                href="/markets" 
                className="text-[#F5F5F5]/80 hover:text-[#F5F5F5] hover:bg-[#181820] px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Markets
              </Link>
              <Link 
                href="/create" 
                className="text-[#F5F5F5]/80 hover:text-[#F5F5F5] hover:bg-[#181820] px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Create
              </Link>
              <Link 
                href="/leaderboard" 
                className="text-[#F5F5F5]/80 hover:text-[#F5F5F5] hover:bg-[#181820] px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Leaderboard
              </Link>
              <Link 
                href="/token-swap" 
                className="text-[#F5F5F5]/80 hover:text-[#F5F5F5] hover:bg-[#181820] px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Token Swap
              </Link>
            </div>
          </div>
          
          {/* Wallet Section */}
          <div className="hidden md:flex items-center space-x-3">
            {connected && (
              <motion.div 
                className="bg-[#181820] border border-[#13ADC7]/20 text-white py-1.5 px-4 rounded-lg inline-flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-[#13ADC7] font-medium">{formatBalance(balance)} SOL</span>
              </motion.div>
            )}
            <WalletButton />
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#F5F5F5]/80 hover:text-[#F5F5F5] hover:bg-[#181820] focus:outline-none"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">{isMobileMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
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
          className="md:hidden bg-[#0E0E10]/95 border-b border-[#13ADC7]/20 backdrop-blur-md"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/markets"
              className="text-[#F5F5F5]/80 hover:text-[#F5F5F5] hover:bg-[#181820] block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Markets
            </Link>
            <Link
              href="/create"
              className="text-[#F5F5F5]/80 hover:text-[#F5F5F5] hover:bg-[#181820] block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Create
            </Link>
            <Link
              href="/leaderboard"
              className="text-[#F5F5F5]/80 hover:text-[#F5F5F5] hover:bg-[#181820] block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Leaderboard
            </Link>
            <Link
              href="/token-swap"
              className="text-[#F5F5F5]/80 hover:text-[#F5F5F5] hover:bg-[#181820] block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Token Swap
            </Link>
          </div>
          
          <div className="pt-4 pb-3 border-t border-[#13ADC7]/20">
            <div className="flex items-center justify-center px-5">
              {connected && (
                <div className="mb-3 bg-[#181820] border border-[#13ADC7]/20 text-white py-2 px-4 rounded-lg inline-flex items-center gap-2 w-full justify-center">
                  <span className="text-[#13ADC7] font-medium">{formatBalance(balance)} SOL</span>
                </div>
              )}
            </div>
            <div className="mt-3 px-2 flex justify-center">
              <WalletButton />
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}