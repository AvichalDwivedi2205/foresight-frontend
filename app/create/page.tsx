"use client";

import { useState, useEffect } from 'react';
import { motion, LazyMotion } from '@/components/motion';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CreateMarketForm from '@/components/create/CreateMarketForm';
import AIPreviewCard from '@/components/create/AIPreviewCard';
import SubmissionStatus from '@/components/create/SubmissionStatus';
import { aiValidationService, MarketValidationRequest } from '@/services/aiValidationService';
import { MarketContract } from '@/services/contracts/marketContract';
import { TokenInfo, MarketParams, MarketType } from '@/services/contracts/models';

export default function CreateMarketPage() {
  // Wallet and connection
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  
  // Main form data state
  const [formData, setFormData] = useState({
    marketQuestion: '',
    description: '',
    endDate: '',
    outcomes: ['Yes', 'No'],
    initialStake: '',
    tokenInfo: undefined as TokenInfo | undefined,
  });
  
  // AI validation state
  const [validation, setValidation] = useState<{
    score: number;
    summary: string;
    valid: boolean;
    isLoading: boolean;
    marketType?: MarketType;
    suggestedEndDate?: Date;
    error?: string;  // Add error field to store validation errors
  } | null>(null);
  
  // Submission state
  const [submission, setSubmission] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
    marketId?: string;
    errorDetails?: string;
  }>({
    status: 'idle',
    message: ''
  });
  
  // Handle form data updates
  const handleFormChange = (newData: any) => {
    setFormData({ ...formData, ...newData });
    // Reset validation when form changes
    if (validation) {
      setValidation(null);
    }
    // Reset submission when form changes
    if (submission.status !== 'idle') {
      setSubmission({
        status: 'idle',
        message: ''
      });
    }
  };
  
  // Handle form submission for AI validation
  const handleValidateSubmit = async () => {
    setValidation({ score: 0, summary: '', valid: false, isLoading: true });
    
    try {
      // Create validation request
      const validationRequest: MarketValidationRequest = {
        question: formData.marketQuestion,
        description: formData.description,
        outcomes: formData.outcomes,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined
      };
      
      // Call AI validation service
      const result = await aiValidationService.validateMarket(validationRequest);
      
      // Handle the response - note that even if there was an API error, we get a valid result
      // from our local validation fallback
      setValidation({
        score: result.score,
        summary: result.summary,
        valid: result.isValid,
        isLoading: false,
        marketType: result.marketType,
        suggestedEndDate: result.suggestedEndDate,
        error: result.error // Include any error message from the validation process
      });
    } catch (error) {
      console.error('AI validation error:', error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isQuotaError = 
        errorMessage.includes("quota") || 
        errorMessage.includes("429") || 
        errorMessage.includes("rate limit");
      
      // Set error state, but still allow creation if it's just an API quota issue
      setValidation({
        score: isQuotaError ? 50 : 0,
        summary: isQuotaError ? 
          "AI validation unavailable due to API quota limits. You can still proceed with market creation." : 
          `Error during validation: ${errorMessage}`,
        valid: isQuotaError, // Allow creation if it's just a quota error
        isLoading: false,
        error: errorMessage
      });
    }
  };
  
  // Handle final submission to create market
  const handleCreateMarket = async () => {
    if (!validation?.valid || !formData.tokenInfo || !publicKey || !signTransaction) {
      setSubmission({
        status: 'error',
        message: !validation?.valid ? 'Market validation failed. Please fix the issues and try again.' :
               !formData.tokenInfo ? 'Please select a token for the market.' :
               !publicKey ? 'Please connect your wallet to create a market.' :
               'Transaction signing not available. Please check your wallet connection.',
      });
      return;
    }
    
    setSubmission({
      status: 'loading',
      message: 'Creating your prediction market on Solana...'
    });
    
    try {
      // Create market contract instance
      const marketContract = new MarketContract(connection, publicKey);
      
      // Prepare market parameters
      const marketParams: MarketParams = {
        question: formData.marketQuestion,
        description: formData.description,
        outcomes: formData.outcomes,
        deadline: new Date(formData.endDate),
        tokenMint: formData.tokenInfo.address,
        aiScore: validation.score,
        aiClassification: validation.marketType || MarketType.TimeBound,
        category: 'General', // Default category
      };
      
      // Transaction callbacks for UI feedback
      const callbacks = {
        onStart: () => {
          setSubmission({
            status: 'loading',
            message: 'Please approve the transaction in your wallet...'
          });
        },
        onSuccess: (receipt: any) => {
          console.log('Market creation successful:', receipt);
          // Generate market ID from signature
          const marketId = receipt.signature.slice(0, 12);
          
          setSubmission({
            status: 'success',
            message: 'Your prediction market is now live on Solana Devnet!',
            marketId
          });
        },
        onError: (error: any) => {
          console.error('Market creation error:', error);
          
          setSubmission({
            status: 'error',
            message: 'Failed to create the prediction market.',
            errorDetails: error instanceof Error ? error.message : 'Unknown error occurred.',
          });
        }
      };
      
      // Create the market
      await marketContract.createMarket(
        marketParams,
        signTransaction,
        callbacks
      );
      
    } catch (error) {
      console.error('Market creation error:', error);
      
      setSubmission({
        status: 'error',
        message: 'Failed to create the prediction market.',
        errorDetails: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };
  
  // Handle form reset
  const handleReset = () => {
    setFormData({
      marketQuestion: '',
      description: '',
      endDate: '',
      outcomes: ['Yes', 'No'],
      initialStake: '',
      tokenInfo: undefined
    });
    setValidation(null);
    setSubmission({ status: 'idle', message: '' });
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
            Create a Prediction Market
          </h1>
          <p className="text-[#B0B0B0] mb-10">
            Define a clear, measurable question with a future resolution date. Our AI will validate your market for clarity and fairness.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main form - takes 2/3 of the grid on large screens */}
          <div className="lg:col-span-2">
            <CreateMarketForm
              formData={formData}
              onChange={handleFormChange}
              onValidateSubmit={handleValidateSubmit}
              isValidating={validation?.isLoading || false}
              isValidated={validation?.valid || false}
            />
          </div>
          
          {/* Right sidebar - takes 1/3 of the grid on large screens */}
          <div className="space-y-6">
            <AIPreviewCard 
              isValidating={validation?.isLoading || false}
              validationResult={validation ? 
                {valid: validation.valid, score: validation.score, summary: validation.summary} : null
              }
            />
            
            {validation?.valid && (
              <SubmissionStatus 
                status={submission.status}
                message={submission.message}
                marketId={submission.marketId}
                onSubmit={handleCreateMarket}
                onReset={handleReset}
              />
            )}
          </div>
        </div>
      </motion.main>
      
      <Footer />
    </div>
  );
}