"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence  } from '@/components/motion';
import Link from 'next/link';

interface SubmissionStatusProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
  marketId?: string;
  onSubmit: () => void;
  onReset: () => void;
}

export default function SubmissionStatus({
  status,
  message,
  marketId,
  onSubmit,
  onReset
}: SubmissionStatusProps) {
  // Confetti animation state
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Show confetti animation on success
  useEffect(() => {
    if (status === 'success') {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);
  
  // If status is idle, don't render anything
  if (status === 'idle' && !message) {
    return null;
  }
  
  return (
    <motion.div
      className="bg-[#151518] rounded-lg border border-white/10 p-6 relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Confetti animation for success */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full"
              initial={{ 
                top: "0%",
                left: `${Math.random() * 100}%`,
                scale: 0,
                opacity: 1
              }}
              animate={{ 
                top: `${Math.random() * 100}%`, 
                scale: Math.random() * 2 + 0.5,
                opacity: 0
              }}
              transition={{ 
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 0.5,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}
      
      <h3 className="text-lg font-medium text-white mb-3 flex items-center">
        {status === 'loading' && (
          <motion.svg
            className="w-5 h-5 mr-2 text-amber-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" strokeDasharray="30 60" />
          </motion.svg>
        )}
        {status === 'success' && (
          <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {status === 'error' && (
          <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        {status === 'loading' ? 'Creating Market' : status === 'success' ? 'Market Created!' : 'Creation Error'}
      </h3>
      
      <div className={`p-4 rounded-lg mb-4 ${
        status === 'loading' ? 'bg-amber-500/10 border border-amber-500/30' : 
        status === 'success' ? 'bg-green-500/10 border border-green-500/30' : 
        'bg-red-500/10 border border-red-500/30'
      }`}>
        <p className={`${
          status === 'loading' ? 'text-amber-300' : 
          status === 'success' ? 'text-green-300' : 
          'text-red-300'
        }`}>
          {message}
        </p>
      </div>
      
      <AnimatePresence mode="wait">
        {status === 'loading' && (
          <motion.div
            className="mt-4"
            key="loading"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="w-full bg-[#0E0E10] rounded-full h-2.5 mb-4">
              <motion.div 
                className="bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7] h-2.5 rounded-full"
                initial={{ width: "0%" }}
                animate={{ 
                  width: ["0%", "30%", "60%", "80%", "90%"],
                }}
                transition={{ 
                  duration: 3,
                  times: [0, 0.2, 0.5, 0.8, 1],
                  ease: "easeInOut"
                }}
              />
            </div>
            <p className="text-[#B0B0B0] text-sm text-center">
              Transaction in progress. Please don't close this window.
            </p>
          </motion.div>
        )}
        
        {status === 'success' && marketId && (
          <motion.div
            className="mt-4 flex flex-col items-center"
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link 
              href={`/market/${marketId}`}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:shadow-lg transition-all flex items-center mb-3 w-full justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View My Market
            </Link>
            
            <button
              onClick={onReset}
              className="px-6 py-3 border border-white/20 text-white font-medium rounded-lg hover:bg-white/10 transition-all flex items-center w-full justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Another Market
            </button>
          </motion.div>
        )}
        
        {status === 'error' && (
          <motion.div
            className="mt-4"
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={onSubmit}
              className="px-6 py-3 bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7] text-white font-medium rounded-lg hover:shadow-lg transition-all flex items-center mb-3 w-full justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
            
            <button
              onClick={onReset}
              className="px-6 py-3 border border-white/20 text-white font-medium rounded-lg hover:bg-white/10 transition-all flex items-center w-full justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
          </motion.div>
        )}
        
        {status === 'idle' && message && (
          <motion.div
            className="mt-4"
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={onSubmit}
              className="px-6 py-3 bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7] text-white font-medium rounded-lg hover:shadow-lg transition-all flex items-center w-full justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              Create Market
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}