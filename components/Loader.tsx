"use client";

import { useState, useEffect } from "react";
import { motion } from '@/components/motion';

interface LoadingProps {
  size?: "small" | "medium" | "large";
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

export default function Loading({ 
  size = "medium", 
  message = "Loading...", 
  fullScreen = false,
  overlay = false
}: LoadingProps) {
  const [dots, setDots] = useState("");
  
  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Size configurations
  const sizeConfig = {
    small: {
      outer: "w-8 h-8",
      inner: "w-6 h-6",
      text: "text-sm",
      container: "gap-3"
    },
    medium: {
      outer: "w-16 h-16",
      inner: "w-12 h-12",
      text: "text-base",
      container: "gap-6"
    },
    large: {
      outer: "w-24 h-24",
      inner: "w-20 h-20",
      text: "text-lg",
      container: "gap-8"
    }
  };
  
  const config = sizeConfig[size];
  
  const LoadingContent = (
    <div className={`flex flex-col items-center justify-center ${config.container}`}>
      {/* Spinner with the gradient colors from the site */}
      <div className={`relative ${config.outer}`}>
        {/* Outer ring (rotating) */}
        <motion.div 
          className={`absolute inset-0 rounded-full border-t-2 border-r-2 border-transparent border-t-[#5F6FFF] border-r-[#13ADC7]`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner ring (counter-rotating) */}
        <motion.div 
          className={`absolute ${config.inner} m-auto inset-0 rounded-full border-b-2 border-l-2 border-transparent border-b-[#13ADC7] border-l-[#5F6FFF]`}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Glowing center dot */}
        <div className="absolute inset-0 m-auto w-2 h-2 bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7] rounded-full">
          <div className="absolute inset-0 bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7] rounded-full opacity-40 animate-pulse" style={{ filter: 'blur(6px)' }}></div>
        </div>
      </div>
      
      {/* Loading text */}
      {message && (
        <motion.div 
          className={`text-white/80 ${config.text} font-medium`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message}{dots}
        </motion.div>
      )}
    </div>
  );

  // Full screen overlay version
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-[#0E0E10]/90 backdrop-blur-sm">
        {LoadingContent}
      </div>
    );
  }
  
  // Modal overlay version
  if (overlay) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#0E0E10]/70 backdrop-blur-[2px] rounded-2xl">
        {LoadingContent}
      </div>
    );
  }
  
  // Regular inline version
  return (
    <div className="flex items-center justify-center py-8">
      {LoadingContent}
    </div>
  );
}