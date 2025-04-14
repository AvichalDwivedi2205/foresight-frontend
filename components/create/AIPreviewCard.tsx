"use client";

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface AIPreviewCardProps {
  isValidating: boolean;
  validationResult: {
    valid: boolean;
    score: number;
    summary: string;
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
  
  return (
    <motion.div
      className="mt-8 mb-8 bg-[#151518] rounded-lg border border-white/10 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isValidating ? 'bg-amber-500/20' : 
          validationResult?.valid ? 'bg-green-500/20' : 'bg-red-500/20'
        }`}>
          {isValidating ? (
            <motion.div 
              className="w-6 h-6 border-t-2 border-amber-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : validationResult?.valid ? (
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          ) : (
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          )}
        </div>
        
        <div className="ml-3">
          <h3 className="text-lg font-medium text-white">
            {isValidating ? "AI Validation in Progress" : 
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
                  <span>{Math.round(validationResult.score * 100)}% clear & objective</span>
                </>
              ) : (
                <>
                  <span className="mr-1">✕</span>
                  <span>Needs revision</span>
                </>
              )}
            </motion.div>
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