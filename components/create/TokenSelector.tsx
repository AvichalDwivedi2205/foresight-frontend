"use client";

import { useState, useEffect, useRef } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence, LazyMotion } from '@/components/motion';
import { TokenInfo } from '@/services/contracts/models';
import { getTokenService } from '@/services/tokenService';
import Image from 'next/image';

interface TokenSelectorProps {
  value?: TokenInfo | null;
  onChange: (token: TokenInfo) => void;
  disabled?: boolean;
}

export default function TokenSelector({ value, onChange, disabled = false }: TokenSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { connection } = useConnection();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Load tokens on mount
  useEffect(() => {
    async function loadTokens() {
      setIsLoading(true);
      try {
        const tokenService = getTokenService(connection);
        const availableTokens = await tokenService.getAllTokens();
        setTokens(availableTokens);
        
        // If no token is selected, select the default one
        if (!value && availableTokens.length > 0) {
          onChange(availableTokens[0]);
        }
      } catch (error) {
        console.error("Error loading tokens:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTokens();
  }, [connection, onChange, value]);
  
  // Filter tokens based on search query
  const filteredTokens = searchQuery.trim() === ''
    ? tokens
    : tokens.filter(token =>
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  // Handle token selection
  const handleSelectToken = (token: TokenInfo) => {
    onChange(token);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };
  
  // Fallback token image on error
  const fallbackTokenImage = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = '/token-fallback.svg';
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected token button */}
      <button
        type="button"
        onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
        className={`flex items-center justify-between w-full px-4 py-3 bg-[#0E0E10] border ${
          isDropdownOpen ? 'border-[#5F6FFF]' : 'border-white/20'
        } rounded-lg text-white ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-[#5F6FFF]'}`}
        disabled={disabled}
      >
        <div className="flex items-center">
          {value ? (
            <>
              <div className="w-6 h-6 mr-3 rounded-full overflow-hidden bg-[#232327]">
                {value.logoURI ? (
                  <img
                    src={value.logoURI}
                    alt={value.symbol}
                    width={24}
                    height={24}
                    onError={fallbackTokenImage}
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                    {value.symbol.substring(0, 2)}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start">
                <span className="font-medium">{value.symbol}</span>
                <span className="text-[#B0B0B0] text-xs">{value.name}</span>
              </div>
            </>
          ) : isLoading ? (
            <div className="flex items-center">
              <div className="w-6 h-6 mr-3 rounded-full bg-[#232327] animate-pulse"></div>
              <div className="flex flex-col items-start">
                <div className="h-4 w-16 bg-[#232327] animate-pulse rounded"></div>
                <div className="h-3 w-24 bg-[#232327] animate-pulse rounded mt-1"></div>
              </div>
            </div>
          ) : (
            <span className="text-[#B0B0B0]">Select token</span>
          )}
        </div>
        
        <div className="flex items-center ml-2">
          <svg
            className={`w-5 h-5 text-[#B0B0B0] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </button>
      
      {/* Dropdown */}
      <LazyMotion>
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              className="absolute z-50 w-full mt-2 bg-[#151518] border border-white/10 rounded-lg shadow-xl overflow-hidden"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
            {/* Search input */}
            <div className="p-3 border-b border-white/10">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tokens..."
                className="w-full bg-[#0E0E10] border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#5F6FFF]"
                autoFocus
              />
            </div>
            
            {/* Token list */}
            <div className="max-h-60 overflow-y-auto py-2">
              {isLoading ? (
                // Loading state
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center px-4 py-3">
                    <div className="w-6 h-6 mr-3 rounded-full bg-[#232327] animate-pulse"></div>
                    <div className="flex flex-col items-start">
                      <div className="h-4 w-16 bg-[#232327] animate-pulse rounded"></div>
                      <div className="h-3 w-24 bg-[#232327] animate-pulse rounded mt-1"></div>
                    </div>
                  </div>
                ))
              ) : filteredTokens.length === 0 ? (
                // No results
                <div className="text-center py-4 text-[#B0B0B0]">
                  No tokens found
                </div>
              ) : (
                // Token list
                filteredTokens.map((token) => (
                  <motion.div
                    key={token.address.toString()}
                    className={`flex items-center px-4 py-2.5 hover:bg-white/5 cursor-pointer ${
                      value?.address.toString() === token.address.toString() ? 'bg-[#5F6FFF]/10' : ''
                    }`}
                    onClick={() => handleSelectToken(token)}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                  >
                    <div className="w-6 h-6 mr-3 rounded-full overflow-hidden bg-[#232327] flex items-center justify-center">
                      {token.logoURI ? (
                        <img
                          src={token.logoURI}
                          alt={token.symbol}
                          width={24}
                          height={24}
                          onError={fallbackTokenImage}
                          className="object-contain"
                        />
                      ) : (
                        <span className="text-xs font-bold">{token.symbol.substring(0, 2)}</span>
                      )}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{token.symbol}</span>
                      <span className="text-[#B0B0B0] text-xs">{token.name}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>              </motion.div>
            )}
          </AnimatePresence>
        </LazyMotion>
      </div>
    );
  }
