"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/lib/wallet-provider";

type StakeBoxProps = {
  stakeAmount: string;
  onStakeAmountChange: (amount: string) => void;
  onSubmit: () => void;
  isSubmitDisabled: boolean;
  isLoading?: boolean;
  maxAmount?: number;
};

export default function StakeBox({
  stakeAmount,
  onStakeAmountChange,
  onSubmit,
  isSubmitDisabled,
  isLoading = false,
  maxAmount
}: StakeBoxProps) {
  const { connected, balance } = useWallet();
  const [inputFocused, setInputFocused] = useState(false);
  
  // Quick amount buttons
  const quickAmounts = [0.1, 0.5, 1, 5];

  // Validate stake amount
  const handleAmountChange = (value: string) => {
    // Only allow numbers and a single decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      // Prevent multiple leading zeros
      if (value === "0" && stakeAmount === "0") return;
      
      // Check if amount exceeds balance
      const numericValue = parseFloat(value || "0");
      if (connected && numericValue > balance) {
        onStakeAmountChange(balance.toString());
        return;
      }
      
      // Check if amount exceeds max amount if provided
      if (maxAmount !== undefined && numericValue > maxAmount) {
        onStakeAmountChange(maxAmount.toString());
        return;
      }
      
      onStakeAmountChange(value);
    }
  };

  const handleQuickAmount = (amount: number) => {
    if (connected && amount > balance) {
      onStakeAmountChange(balance.toString());
      return;
    }
    
    if (maxAmount !== undefined && amount > maxAmount) {
      onStakeAmountChange(maxAmount.toString());
      return;
    }
    
    onStakeAmountChange(amount.toString());
  };

  const handleMaxAmount = () => {
    if (!connected) return;
    
    const max = maxAmount !== undefined ? Math.min(balance, maxAmount) : balance;
    onStakeAmountChange(max.toFixed(9));
  };

  return (
    <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700">
      <h3 className="text-xl font-semibold mb-3">Stake Amount</h3>
      <p className="text-white/70 mb-4">
        Enter the amount of SOL to stake on your prediction.
      </p>
      
      {connected && (
        <div className="mb-4 flex justify-between items-center text-sm">
          <span className="text-white/70">Your Balance:</span>
          <span className="font-medium">{balance.toFixed(4)} SOL</span>
        </div>
      )}
      
      <div className={`relative border ${inputFocused ? "border-blue-500" : "border-gray-600"} rounded-lg mb-4`}>
        <input
          type="text"
          value={stakeAmount}
          onChange={(e) => handleAmountChange(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder="0.0"
          className="w-full bg-transparent p-4 pr-16 text-xl font-semibold focus:outline-none"
          disabled={isLoading}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70">
          SOL
        </div>
      </div>
      
      <div className="flex gap-2 mb-4 flex-wrap">
        {quickAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => handleQuickAmount(amount)}
            className="px-3 py-1 bg-gray-700/70 hover:bg-gray-700 rounded-md text-sm"
            disabled={isLoading}
          >
            {amount} SOL
          </button>
        ))}
        <button
          onClick={handleMaxAmount}
          className="px-3 py-1 bg-blue-700/50 hover:bg-blue-700/70 rounded-md text-sm"
          disabled={!connected || isLoading}
        >
          MAX
        </button>
      </div>
      
      <button
        onClick={onSubmit}
        disabled={isSubmitDisabled || isLoading}
        className={`w-full py-3 rounded-lg flex items-center justify-center font-medium transition-colors duration-200 ${
          isSubmitDisabled || isLoading
            ? "bg-gray-700 cursor-not-allowed text-white/50"
            : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
        }`}
      >
        {isLoading ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </div>
        ) : (
          <>
            {!connected ? "Connect Wallet to Stake" : "Stake Your Prediction"}
          </>
        )}
      </button>
      
      {parseFloat(stakeAmount) > 0 && (
        <div className="mt-4 text-sm text-white/70">
          <div className="flex justify-between">
            <span>Total stake:</span>
            <span>{stakeAmount} SOL</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Potential reward:</span>
            <span>Varies based on final outcome pool</span>
          </div>
        </div>
      )}
    </div>
  );
}