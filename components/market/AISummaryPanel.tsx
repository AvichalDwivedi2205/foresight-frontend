"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface AISummaryPanelProps {
  summary: string;
}

export default function AISummaryPanel({ summary }: AISummaryPanelProps) {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (!isVisible) return;
    
    if (displayText.length < summary.length) {
      const timeoutId = setTimeout(() => {
        setDisplayText(summary.slice(0, displayText.length + 1));
      }, 20);
      
      return () => clearTimeout(timeoutId);
    } else {
      setIsTyping(false);
    }
  }, [displayText, summary, isVisible]);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsVisible(true);
    }, 800);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <motion.div 
      className="bg-[#1C1C22] p-6 rounded-xl border border-white/5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center mb-4">
        <h3 className="text-xl font-bold">AI Analysis</h3>
        <div className="flex items-center gap-1 ml-auto">
          {isTyping && (
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-[#13ADC7] animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-[#13ADC7] animate-pulse" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 rounded-full bg-[#13ADC7] animate-pulse" style={{ animationDelay: "0.4s" }}></div>
            </div>
          )}
          {!isTyping && (
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          )}
        </div>
      </div>
      
      <div className="text-[#B0B0B0] mb-4 min-h-[100px]">
        {isVisible ? displayText : ""}
        {isTyping && <span className="ml-1 border-r-2 border-[#13ADC7] animate-pulse">&nbsp;</span>}
      </div>
      
      <div className="flex items-center text-xs text-[#B0B0B0] pt-3 border-t border-white/5">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"></path>
          </svg>
          <span>Information is based on available data and may not represent future outcomes.</span>
        </div>
        <div className="ml-auto px-2 py-1 rounded-full bg-[#5F6FFF]/10 text-[#5F6FFF] flex items-center">
          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-0.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0c1.36-1.35 2.04-3.13 2.04-4.9h2c0 2.32-0.92 4.65-2.75 6.44-3.66 3.66-9.64 3.66-13.31 0-3.66-3.66-3.66-9.64 0-13.31 3.66-3.66 9.64-3.66 13.31 0l2.72-2.72V10.12z"></path>
          </svg>
          Validated by AI • Gemini Pro
        </div>
      </div>
    </motion.div>
  );
}