"use client";

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence  } from '@/components/motion';
import { PublicKey } from '@solana/web3.js';
import { JupiterService } from '@/services/contracts/jupiterService';
import { MarketContract } from '@/services/contracts/marketContract';
import { TokenInfo } from '@/services/contracts/models';
import { getTokenService } from '@/services/tokenService';

interface StakingFormProps {
  marketAddress: string;
  marketToken: TokenInfo;
  outcomes: string[];
  onSuccess?: (signature: string, amount: number, outcomeIndex: number) => void;
  onError?: (error: Error) => void;
}

export default function StakingForm({
  marketAddress,
  marketToken,
  outcomes,
  onSuccess,
  onError
}: StakingFormProps) {
  // Wallet and connection
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  
  // Local state
  const [selectedOutcome, setSelectedOutcome] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsSwap, setNeedsSwap] = useState(false);
  const [swapAmount, setSwapAmount] = useState<string>('');
  
  // Status messages
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'info' | 'error' | 'success'>('info');
  
  // Services
  const [jupiterService, setJupiterService] = useState<JupiterService | null>(null);
  const [marketContract, setMarketContract] = useState<MarketContract | null>(null);
  
  // Available tokens to swap from
  const [availableTokens, setAvailableTokens] = useState<TokenInfo[]>([]);
  const [selectedSwapToken, setSelectedSwapToken] = useState<TokenInfo | null>(null);
  
  // Exchange rate and quote
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  
  // Initialize services
  useEffect(() => {
    if (connection) {
      setJupiterService(new JupiterService(connection));
      
      if (publicKey) {
        setMarketContract(new MarketContract(connection, publicKey));
      }
      
      // Load available tokens
      const loadTokens = async () => {
        try {
          const tokenService = getTokenService(connection);
          const tokens = await tokenService.getAllTokens();
          setAvailableTokens(tokens);
          
          // Default to SOL for swapping
          const sol = tokens.find(t => t.symbol === 'SOL');
          if (sol) {
            setSelectedSwapToken(sol);
          }
        } catch (error) {
          console.error("Error loading tokens:", error);
        }
      };
      
      loadTokens();
    }
  }, [connection, publicKey]);
  
  // Update quote when swap parameters change
  useEffect(() => {
    const getQuote = async () => {
      if (!jupiterService || !selectedSwapToken || !swapAmount || !marketToken) return;
      
      const parsedAmount = parseFloat(swapAmount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) return;
      
      setIsLoadingQuote(true);
      setQuoteError(null);
      
      try {
        // Scale amount by token decimals
        const scaledAmount = Math.floor(parsedAmount * (10 ** selectedSwapToken.decimals));
        
        // Get quote
        const quote = await jupiterService.getQuote(
          selectedSwapToken.address.toString(),
          marketToken.address.toString(),
          scaledAmount,
          100 // 1% slippage
        );
        
        // Calculate exchange rate
        const outputAmount = quote.outAmount / (10 ** marketToken.decimals);
        const rate = outputAmount / parsedAmount;
        
        setExchangeRate(rate);
        setAmount(outputAmount.toFixed(marketToken.decimals < 6 ? marketToken.decimals : 4));
      } catch (error) {
        console.error("Error getting quote:", error);
        setQuoteError("Failed to get quote");
        setExchangeRate(null);
      } finally {
        setIsLoadingQuote(false);
      }
    };
    
    if (needsSwap && swapAmount) {
      getQuote();
    }
  }, [needsSwap, swapAmount, selectedSwapToken, marketToken, jupiterService]);
  
  // Handle token selection
  const handleSwapTokenChange = (token: TokenInfo) => {
    setSelectedSwapToken(token);
    // Reset exchange rate and quote when token changes
    setExchangeRate(null);
  };
  
  // Handle outcome selection
  const handleOutcomeClick = (index: number) => {
    setSelectedOutcome(index);
  };
  
  // Handle amount input
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    if (/^[0-9]*\.?[0-9]*$/.test(value) || value === '') {
      setAmount(value);
    }
  };
  
  // Handle swap amount input
  const handleSwapAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    if (/^[0-9]*\.?[0-9]*$/.test(value) || value === '') {
      setSwapAmount(value);
    }
  };
  
  // Toggle swap mode
  const handleToggleSwap = () => {
    setNeedsSwap(!needsSwap);
    if (!needsSwap) {
      // Reset amount when entering swap mode
      setAmount('');
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey || !signTransaction) {
      setStatusMessage('Please connect your wallet to continue.');
      setStatusType('error');
      return;
    }
    
    if (!marketContract) {
      setStatusMessage('Market contract service not initialized.');
      setStatusType('error');
      return;
    }
    
    if (selectedOutcome === null) {
      setStatusMessage('Please select an outcome.');
      setStatusType('error');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setStatusMessage('Please enter a valid amount.');
      setStatusType('error');
      return;
    }
    
    setIsSubmitting(true);
    setStatusMessage('Preparing transaction...');
    setStatusType('info');
    
    try {
      // If we need to swap first
      if (needsSwap && jupiterService && selectedSwapToken) {
        setStatusMessage('Creating swap transaction...');
        
        // Parse swap amount
        const parsedSwapAmount = parseFloat(swapAmount);
        if (isNaN(parsedSwapAmount) || parsedSwapAmount <= 0) {
          throw new Error('Invalid swap amount');
        }
        
        // Scale by decimals
        const scaledAmount = Math.floor(parsedSwapAmount * (10 ** selectedSwapToken.decimals));
        
        // Create swap transaction
        const swapTransaction = await jupiterService.createSwapTransaction(
          publicKey,
          selectedSwapToken.address.toString(),
          marketToken.address.toString(),
          scaledAmount,
          100 // 1% slippage
        );
        
        setStatusMessage('Please approve the swap transaction in your wallet...');
        
        // Sign and send the swap transaction
        const signedTransaction = await signTransaction(swapTransaction);
        
        setStatusMessage('Sending swap transaction...');
        
        const swapSig = await connection.sendRawTransaction(signedTransaction.serialize());
        
        setStatusMessage('Waiting for swap confirmation...');
        
        // Wait for confirmation
        await connection.confirmTransaction(swapSig, 'confirmed');
        
        setStatusMessage('Swap successful! Preparing prediction transaction...');
      }
      
      // Now stake on the outcome
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Invalid stake amount');
      }
      
      // Scale by decimals
      const scaledAmount = Math.floor(parsedAmount * (10 ** marketToken.decimals));
      
      // Create prediction transaction
      const signature = await marketContract.makePredictionWithSigning(
        {
          marketAddress: new PublicKey(marketAddress),
          outcomeIndex: selectedOutcome,
          amount: scaledAmount,
          tokenMint: marketToken.address
        },
        signTransaction,
        {
          onStart: () => setStatusMessage('Please approve the staking transaction in your wallet...'),
          onSuccess: (receipt) => {
            setStatusMessage('Prediction successfully made!');
            setStatusType('success');
            
            // Callback to parent component
            if (onSuccess) {
              onSuccess(signature, parsedAmount, selectedOutcome);
            }
            
            // Reset form
            setTimeout(() => {
              setSelectedOutcome(null);
              setAmount('');
              setSwapAmount('');
              setNeedsSwap(false);
              setIsSubmitting(false);
              setStatusMessage(null);
            }, 3000);
          },
          onError: (error) => {
            console.error('Staking error:', error);
            setStatusMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setStatusType('error');
            setIsSubmitting(false);
            
            // Callback to parent component
            if (onError && error instanceof Error) {
              onError(error);
            }
          },
        }
      );
      
    } catch (error) {
      console.error('Transaction error:', error);
      setStatusMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStatusType('error');
      setIsSubmitting(false);
      
      // Callback to parent component
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  };
  
  return (
    <motion.div
      className="bg-[#151518] rounded-lg border border-white/10 p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h3 className="text-lg font-medium text-[#F5F5F5] mb-4">Make a Prediction</h3>
      
      <form onSubmit={handleSubmit}>
        {/* Outcome Selection */}
        <div className="mb-5">
          <label className="block text-[#F5F5F5] text-sm font-medium mb-2">
            Select Outcome
          </label>
          <div className="grid grid-cols-2 gap-2">
            {outcomes.map((outcome, index) => (
              <motion.button
                key={index}
                type="button"
                className={`py-3 px-4 rounded-lg text-center transition-all ${
                  selectedOutcome === index
                    ? 'bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7] text-white shadow-glow'
                    : 'bg-[#0E0E10] text-[#F5F5F5] hover:bg-[#1A1A1D] border border-white/10'
                }`}
                onClick={() => handleOutcomeClick(index)}
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {outcome}
              </motion.button>
            ))}
          </div>
        </div>
        
        {/* Staking Amount */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[#F5F5F5] text-sm font-medium">
              Stake Amount
            </label>
            <motion.button
              type="button"
              onClick={handleToggleSwap}
              className="text-xs text-[#5F6FFF] hover:text-[#13ADC7] flex items-center"
              disabled={isSubmitting}
            >
              {needsSwap ? 'Direct Stake' : 'Swap & Stake'}
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          </div>
          
          <AnimatePresence mode="wait">
            {needsSwap ? (
              <motion.div
                key="swap-inputs"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                {/* Swap Amount Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={swapAmount}
                    onChange={handleSwapAmountChange}
                    placeholder="0.0"
                    disabled={isSubmitting}
                    className="w-full bg-[#0E0E10] border border-white/20 text-white rounded-lg p-3 pl-10 pr-20 focus:outline-none focus:ring-2 focus:ring-[#5F6FFF]"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-[#B0B0B0]">{selectedSwapToken?.symbol || 'SOL'}</span>
                  </div>
                </div>
                
                {/* Conversion Rate */}
                <div className="flex justify-center items-center text-[#B0B0B0] text-sm">
                  {isLoadingQuote ? (
                    <div className="flex items-center">
                      <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Getting quote...
                    </div>
                  ) : quoteError ? (
                    <div className="text-red-400">{quoteError}</div>
                  ) : exchangeRate ? (
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                      1 {selectedSwapToken?.symbol} ≈ {exchangeRate.toFixed(4)} {marketToken.symbol}
                    </div>
                  ) : (
                    <div>Enter an amount to see the conversion rate</div>
                  )}
                </div>
                
                {/* Resulting Amount */}
                <div className="relative">
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.0"
                    disabled={true}
                    className="w-full bg-[#0E0E10] border border-white/20 text-white rounded-lg p-3 pl-10 focus:outline-none"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-[#B0B0B0]">{marketToken.symbol}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="direct-input"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="relative">
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.0"
                    disabled={isSubmitting}
                    className="w-full bg-[#0E0E10] border border-white/20 text-white rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-[#5F6FFF]"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-[#B0B0B0]">{marketToken.symbol}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Status Message */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              className={`mb-4 p-3 rounded-md ${
                statusType === 'error' ? 'bg-red-500/20 text-red-300' :
                statusType === 'success' ? 'bg-green-500/20 text-green-300' :
                'bg-blue-500/20 text-blue-300'
              }`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <p className="text-sm">{statusMessage}</p>
              
              {isSubmitting && statusType === 'info' && (
                <div className="w-full h-1 bg-[#0E0E10] rounded-full mt-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7]"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Submit Button */}
        <motion.button
          type="submit"
          className={`w-full py-3 px-4 rounded-lg font-medium ${
            selectedOutcome === null || !amount || isSubmitting
              ? 'bg-[#2A2A30] text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7] text-white hover:shadow-lg'
          } transition-all`}
          disabled={selectedOutcome === null || !amount || isSubmitting}
          whileHover={selectedOutcome !== null && amount && !isSubmitting ? { scale: 1.02 } : {}}
          whileTap={selectedOutcome !== null && amount && !isSubmitting ? { scale: 0.98 } : {}}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Processing...
            </div>
          ) : (
            `Stake ${amount ? `${amount} ${marketToken.symbol} on ` : ''}${selectedOutcome !== null ? outcomes[selectedOutcome] : 'Selected Outcome'}`
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
