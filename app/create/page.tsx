"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CreateMarketForm from '@/components/create/CreateMarketForm';
import AIPreviewCard from '@/components/create/AIPreviewCard';
import SubmissionStatus from '@/components/create/SubmissionStatus';

export default function CreateMarketPage() {
  // Main form data state
  const [formData, setFormData] = useState({
    marketQuestion: '',
    description: '',
    endDate: '',
    outcomes: ['Yes', 'No'],
    initialStake: ''
  });
  
  // AI validation state
  const [validation, setValidation] = useState<{
    score: number;
    summary: string;
    valid: boolean;
    isLoading: boolean;
  } | null>(null);
  
  // Submission state
  const [submission, setSubmission] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
    marketId?: string;
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
  };
  
  // Handle form submission for AI validation
  const handleValidateSubmit = async () => {
    setValidation({ score: 0, summary: '', valid: false, isLoading: true });
    
    // Simulate API call to validate with AI
    setTimeout(() => {
      // Mock AI validation response
      const mockValidation = {
        score: Math.random() * 0.5 + 0.5, // Random score between 0.5-1
        summary: "This prediction market about " + formData.marketQuestion.substring(0, 30) + 
                "... is well-defined, measurable, and has a clear resolution criteria. The timeframe is appropriate and outcomes are mutually exclusive.",
        valid: true,
        isLoading: false
      };
      setValidation(mockValidation);
    }, 2000);
  };
  
  // Handle final submission to create market
  const handleCreateMarket = async () => {
    if (!validation?.valid) return;
    
    setSubmission({
      status: 'loading',
      message: 'Creating your prediction market on Solana...'
    });
    
    // Simulate blockchain transaction
    setTimeout(() => {
      // Mock successful transaction
      const mockMarketId = 'market-' + Math.floor(Math.random() * 1000);
      setSubmission({
        status: 'success',
        message: 'Your prediction market is now live on Solana Devnet!',
        marketId: mockMarketId
      });
    }, 3000);
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