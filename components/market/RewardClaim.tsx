"use client";

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { motion  } from '@/components/motion';
import { MarketContract } from '@/services/contracts/marketContract';
import { TokenInfo } from '@/services/contracts/models';

interface RewardClaimProps {
  marketAddress: string;
  marketToken: TokenInfo;
  potentialReward: number;
  marketResolved: boolean;
  isWinner?: boolean;
  onSuccess?: (signature: string, amount: number) => void;
  onError?: (error: Error) => void;
}

export default function RewardClaim({
  marketAddress,
  marketToken,
  potentialReward,
  marketResolved,
  isWinner = false,
  onSuccess,
  onError
}: RewardClaimProps) {
  // Wallet and connection
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  
  // Local state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'info' | 'error' | 'success'>('info');
  
  // Handle claim button click
  const handleClaimReward = async () => {
    if (!publicKey || !signTransaction) {
      setStatusMessage('Please connect your wallet to continue.');
      setStatusType('error');
      return;
    }
    
    if (!marketResolved) {
      setStatusMessage('This market is not yet resolved.');
      setStatusType('error');
      return;
    }
    
    if (!isWinner) {
      setStatusMessage('You did not win in this market.');
      setStatusType('error');
      return;
    }
    
    setIsSubmitting(true);
    setStatusMessage('Preparing claim transaction...');
    setStatusType('info');
    
    try {
      const marketContract = new MarketContract(connection, publicKey);
      
      // Execute claim transaction
      const result = await marketContract.claimRewardsWithSigning(
        new PublicKey(marketAddress),
        marketToken.address,
        signTransaction,
        {
          onStart: () => {
            setStatusMessage('Please approve the transaction in your wallet...');
          },
          onSuccess: (receipt) => {
            // Use the actual reward amount from the result
            const rewardAmount = result.rewardAmount / Math.pow(10, marketToken.decimals);
            
            setStatusMessage(`Successfully claimed ${rewardAmount.toFixed(2)} ${marketToken.symbol}!`);
            setStatusType('success');
            
            // Callback to parent component
            if (onSuccess) {
              onSuccess(result.signature, rewardAmount);
            }
            
            // Reset form
            setTimeout(() => {
              setIsSubmitting(false);
              setStatusMessage(null);
            }, 5000);
          },
          onError: (error: any) => {
            console.error('Claim error:', error);
            setStatusMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setStatusType('error');
            setIsSubmitting(false);
            
            // Callback to parent component
            if (onError && error instanceof Error) {
              onError(error);
            }
          }
        }
      );
    } catch (error) {
      console.error('Claim transaction error:', error);
      setStatusMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStatusType('error');
      setIsSubmitting(false);
      
      // Callback to parent component
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  };
  
  // If market not resolved, show "Market Pending Resolution"
  if (!marketResolved) {
    return (
      <motion.div
        className="bg-[#151518] rounded-lg border border-amber-500/20 p-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-[#F5F5F5]">Market Pending Resolution</h3>
        </div>
        
        <p className="text-[#B0B0B0] mb-4">
          This market has not been resolved yet. Once resolved, you'll be able to claim rewards if your prediction was correct.
        </p>
        
        <div className="mt-4 p-3 bg-[#0E0E10] rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-[#F5F5F5]">Possible Reward</span>
            <span className="text-amber-400 font-medium">
              {potentialReward.toFixed(2)} {marketToken.symbol}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }
  
  // If user didn't win, show "Better Luck Next Time"
  if (!isWinner) {
    return (
      <motion.div
        className="bg-[#151518] rounded-lg border border-red-500/20 p-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-[#F5F5F5]">Better Luck Next Time</h3>
        </div>
        
        <p className="text-[#B0B0B0] mb-4">
          Your prediction wasn't correct for this market. Explore more markets and make new predictions!
        </p>
        
        <div className="mt-4 p-3 bg-[#0E0E10] rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-[#F5F5F5]">Your Prediction</span>
            <span className="text-red-400 font-medium">Lost</span>
          </div>
        </div>
      </motion.div>
    );
  }
  
  // If user won and can claim rewards
  return (
    <motion.div
      className="bg-[#151518] rounded-lg border border-green-500/20 p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-[#F5F5F5]">Congratulations!</h3>
      </div>
      
      <p className="text-[#B0B0B0] mb-4">
        Your prediction was correct! You can now claim your rewards.
      </p>
      
      <div className="mt-4 p-3 bg-[#0E0E10] rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-[#F5F5F5]">Reward Amount</span>
          <span className="text-green-400 font-medium">
            {potentialReward.toFixed(2)} {marketToken.symbol}
          </span>
        </div>
      </div>
      
      {/* Status Message */}
      {statusMessage && (
        <div className={`mt-4 p-3 rounded-md ${
          statusType === 'error' ? 'bg-red-500/20 text-red-300' :
          statusType === 'success' ? 'bg-green-500/20 text-green-300' :
          'bg-blue-500/20 text-blue-300'
        }`}>
          <p className="text-sm">{statusMessage}</p>
          
          {isSubmitting && statusType === 'info' && (
            <div className="w-full h-1 bg-[#0E0E10] rounded-full mt-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>
          )}
        </div>
      )}
      
      {/* Claim Button */}
      <motion.button
        onClick={handleClaimReward}
        className={`w-full mt-4 py-3 px-4 rounded-lg font-medium ${
          isSubmitting
            ? 'bg-[#2A2A30] text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg'
        } transition-all`}
        disabled={isSubmitting}
        whileHover={!isSubmitting ? { scale: 1.02 } : {}}
        whileTap={!isSubmitting ? { scale: 0.98 } : {}}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Processing Claim...
          </div>
        ) : (
          `Claim ${potentialReward.toFixed(2)} ${marketToken.symbol}`
        )}
      </motion.button>
    </motion.div>
  );
}
