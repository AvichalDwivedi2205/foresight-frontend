"use client";

import { motion  } from '@/components/motion';
import { useState, useEffect } from 'react';

interface AIPreviewCardProps {
  isValidating: boolean;
  validationResult: {
    valid: boolean;
    score: number;
    summary: string;
    marketType?: number;
    suggestedEndDate?: Date;
    error?: string; // Added error field
  } | null;
}

export default function AIPreviewCard({ isValidating, validationResult }: AIPreviewCardProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Typewriter effect for the summary
  useEffect(() => {
    if (validationResult?.summary) {
      setIsTyping(true);
      let index = 0;
      const text = validationResult.summary;
      
      const typingInterval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText((prev) => prev + text.charAt(index));
          index++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, 20);
      
      return () => clearInterval(typingInterval);
    } else {
      setDisplayedText("");
    }
  }, [validationResult?.summary]);
  
  // If no validation in progress or result, don't show
  if (!isValidating && !validationResult) {
    return null;
  }
  
  // Determine if there's an API quota error
  const hasQuotaError = validationResult?.error && 
    (validationResult.error.includes("quota") || 
     validationResult.error.includes("429") || 
     validationResult.error.includes("rate limit"));

  return (
    <motion.div
      className="bg-[#181820] border border-white/10 rounded-xl p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-start">
        <div className="w-12 h-12 rounded-full bg-[#0E0E10] border border-[#5F6FFF]/30 flex items-center justify-center mr-4 flex-shrink-0">
          {isValidating ? (
            <div className="w-5 h-5 border-2 border-[#5F6FFF] border-t-transparent rounded-full animate-spin"></div>
          ) : validationResult?.valid ? (
            <span className="text-[#5F6FFF] text-xl">✓</span>
          ) : (
            <span className="text-red-400 text-xl">✕</span>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-white">
            {isValidating ? "AI Validation in Progress" : 
             hasQuotaError ? "Local Validation Used" :
             validationResult?.valid ? "Validated by AI" : "AI Validation Failed"}
          </h3>
          
          {!isValidating && validationResult && (
            <motion.div
              className={`mt-1 px-2 py-1 text-xs inline-flex items-center rounded-full ${
                validationResult.valid ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}
              animate={{ 
                boxShadow: [
                  '0 0 0 rgba(0,0,0,0)', 
                  '0 0 10px rgba(95, 111, 255, 0.7)', 
                  '0 0 0 rgba(0,0,0,0)'
                ]
              }}
              transition={{ 
                duration: 2, 
                repeat: 2,
                repeatType: 'reverse'
              }}
            >
              {validationResult.valid ? (
                <>
                  <span className="mr-1">✓</span>
                  <span>{Math.round(validationResult.score)}% {hasQuotaError ? "passing basic checks" : "clear & objective"}</span>
                </>
              ) : (
                <>
                  <span className="mr-1">✕</span>
                  <span>Needs revision</span>
                </>
              )}
            </motion.div>
          )}
          
          {hasQuotaError && !isValidating && (
            <div className="mt-2 text-xs text-amber-400 bg-amber-500/10 px-3 py-2 rounded-md">
              <span className="font-medium">API quota exceeded.</span> Using local validation instead. 
              Consider upgrading your Gemini API plan for AI-powered validation.
            </div>
          )}
        </div>
      </div>
      
      {isValidating ? (
        <div className="mt-4 bg-[#0E0E10] rounded-md p-4">
          <div className="flex space-x-2 justify-center items-center h-12">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-white/50 rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{ 
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut" 
                }}
              />
            ))}
          </div>
          <p className="text-[#B0B0B0] text-center">Analyzing your market question and outcomes...</p>
        </div>
      ) : validationResult && (
        <motion.div 
          className={`mt-4 bg-[#0E0E10] rounded-md p-4 ${
            validationResult.valid ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
          }`}
        >
          <p className="text-white">
            {displayedText}
            {isTyping && <span className="animate-pulse">|</span>}
          </p>
          
          {!validationResult.valid && (
            <div className="mt-4 text-[#B0B0B0]">
              <p className="font-medium">Suggestions:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Make your question more objective and verifiable</li>
                <li>Ensure outcomes are mutually exclusive</li>
                <li>Add specific resolution criteria</li>
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}