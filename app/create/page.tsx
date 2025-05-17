"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/lib/wallet-provider';
import { useAIService } from '@/lib/ai-service';
import { useToast } from '@/lib/hooks/useToast';
import { useConnection } from '@/lib/connection';
import { useIndexer } from '@/lib/indexer';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CreateMarketForm from '@/components/create/CreateMarketForm';
import AIPreviewCard from '@/components/create/AIPreviewCard';
import SubmissionStatus from '@/components/create/SubmissionStatus';

export default function CreateMarketPage() {
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { invalidateMarkets } = useIndexer();
  const { showToast } = useToast();
  const { useValidateMarket } = useAIService();
  
  // Main form data state
  const [formData, setFormData] = useState({
    marketQuestion: '',
    description: '',
    endDate: '',
    outcomes: ['Yes', 'No'],
    initialStake: ''
  });
  
  // Submission state
  const [submission, setSubmission] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
    marketId?: string;
  }>({
    status: 'idle',
    message: ''
  });

  // Use the React Query hook for validation
  const {
    data: validation,
    isLoading: isValidating,
    refetch: validateMarket,
    isSuccess: isValidated
  } = useValidateMarket({
    marketQuestion: formData.marketQuestion,
    description: formData.description,
    endDate: formData.endDate,
    outcomes: formData.outcomes
  });
  
  // Handle form data updates
  const handleFormChange = (newData: any) => {
    setFormData({ ...formData, ...newData });
  };
  
  // Handle form submission for AI validation
  const handleValidateSubmit = async () => {
    validateMarket();
  };
  
  // Handle final submission to create market
  const handleCreateMarket = async () => {
    if (!validation?.valid) {
      showToast("Market validation failed. Please review and try again.", "error");
      return;
    }
    
    if (!connected || !publicKey) {
      showToast("Please connect your wallet first", "warning");
      return;
    }
    
    setSubmission({
      status: 'loading',
      message: 'Creating your prediction market on Solana...'
    });
    
    try {
      // Mock transaction for now
      // In production, this would create and send the actual Solana transaction
      // using the Anchor program and smart contract
      
      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock successful transaction
      const mockMarketId = 'market-' + Math.floor(Math.random() * 1000);
      
      // Success!
      setSubmission({
        status: 'success',
        message: 'Your prediction market is now live on Solana!',
        marketId: mockMarketId
      });
      
      // Invalidate cache to refresh markets list
      invalidateMarkets();
      
    } catch (error) {
      console.error("Failed to create market:", error);
      
      setSubmission({
        status: 'error',
        message: 'Failed to create market. Please try again later.'
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
      initialStake: ''
    });
    
    setSubmission({ 
      status: 'idle', 
      message: '' 
    });
  };

  // Redirect to wallet connection if not connected
  useEffect(() => {
    if (!connected && validation?.valid) {
      showToast("Please connect your wallet to create a market", "info");
    }
  }, [connected, validation?.valid, showToast]);

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
              isValidating={isValidating}
              isValidated={isValidated && !!validation?.valid}
            />
          </div>
          
          {/* Right sidebar - takes 1/3 of the grid on large screens */}
          <div className="space-y-6">
            <AIPreviewCard 
              isValidating={isValidating}
              validationResult={validation ? 
                {valid: validation.valid, score: validation.score, summary: validation.summary, potentialIssues: validation.potentialIssues} : null
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