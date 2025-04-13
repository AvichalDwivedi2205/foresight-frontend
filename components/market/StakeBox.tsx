"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface StakeBoxProps {
  stakeAmount: string;
  onStakeAmountChange: (amount: string) => void;
  onSubmit: () => void;
  isSubmitDisabled: boolean;
}

export default function StakeBox({
  stakeAmount,
  onStakeAmountChange,
  onSubmit,
  isSubmitDisabled,
}: StakeBoxProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuickAmounts, setShowQuickAmounts] = useState(false);

  const quickAmounts = ["5", "10", "25", "50", "100"];

  const handleQuickAmountClick = (amount: string) => {
    onStakeAmountChange(amount);
    setShowQuickAmounts(false);
  };

  const handleSubmit = () => {
    if (isSubmitDisabled) return;
    
    setIsSubmitting(true);
    
    // Simulating transaction processing
    setTimeout(() => {
      onSubmit();
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <motion.div
      className="bg-[#1C1C22] p-6 rounded-xl border border-white/5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <h3 className="text-xl font-bold mb-4">Stake Amount</h3>
      
      {/* Amount input */}
      <div className="relative mb-6">
        <label className="block text-sm text-[#B0B0B0] mb-2">
          How much would you like to stake?
        </label>
        <div className="relative">
          <input
            type="text"
            value={stakeAmount}
            onChange={(e) => {
              // Only allow numbers and decimals
              const re = /^[0-9]*\.?[0-9]*$/;
              if (e.target.value === '' || re.test(e.target.value)) {
                onStakeAmountChange(e.target.value);
              }
            }}
            className="w-full bg-[#0E0E10] border border-white/10 rounded-xl py-3 px-4 text-[#F5F5F5] focus:outline-none focus:border-[#5F6FFF] transition-colors"
            placeholder="0.0"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#B0B0B0]">
            SOL
          </div>
        </div>
        
        {/* Quick amount selector button */}
        <button
          className="absolute right-0 -bottom-6 text-xs text-[#5F6FFF]"
          onClick={() => setShowQuickAmounts(!showQuickAmounts)}
        >
          Quick amounts
        </button>
        
        {/* Quick amounts dropdown */}
        {showQuickAmounts && (
          <motion.div
            className="absolute mt-2 right-0 bg-[#0E0E10] border border-white/10 rounded-lg overflow-hidden z-10 w-36 py-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-[#5F6FFF]/10 transition-colors"
                onClick={() => handleQuickAmountClick(amount)}
              >
                {amount} SOL
              </button>
            ))}
          </motion.div>
        )}
      </div>
      
      {/* Potential reward calculation */}
      <div className="bg-[#0E0E10]/70 p-4 rounded-lg mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-[#B0B0B0]">Your stake</span>
          <span>{stakeAmount || "0"} SOL</span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-[#B0B0B0]">Protocol fee</span>
          <span>1%</span>
        </div>
        <div className="flex justify-between font-medium pt-2 border-t border-white/5">
          <span>Potential reward</span>
          <span className="text-[#5F6FFF]">
            {stakeAmount ? `~${(parseFloat(stakeAmount) * 1.3).toFixed(2)} SOL` : "0 SOL"}
          </span>
        </div>
      </div>
      
      {/* Submit button */}
      <motion.button
        className={`w-full py-3 rounded-full font-medium text-white flex items-center justify-center ${
          isSubmitDisabled
            ? "bg-[#5F6FFF]/50 cursor-not-allowed"
            : "bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7] hover:shadow-lg hover:shadow-[#5F6FFF]/20"
        }`}
        whileHover={!isSubmitDisabled ? { scale: 1.02 } : {}}
        whileTap={!isSubmitDisabled ? { scale: 0.98 } : {}}
        onClick={handleSubmit}
        disabled={isSubmitDisabled || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          "Place Stake"
        )}
      </motion.button>
      
      <div className="mt-4 text-xs text-[#B0B0B0] text-center">
        Once submitted, your stake cannot be changed or withdrawn
      </div>
    </motion.div>
  );
}