"use client";

import { motion  } from '@/components/motion';

interface OutcomeOptionsProps {
  outcomes: {
    yes: number;
    no: number;
  };
  selectedOutcome: string | null;
  onOutcomeChange: (outcome: string) => void;
}

export default function OutcomeOptions({
  outcomes,
  selectedOutcome,
  onOutcomeChange,
}: OutcomeOptionsProps) {
  return (
    <motion.div
      className="bg-[#1C1C22] p-6 rounded-xl border border-white/5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="text-xl font-bold mb-4">Choose Your Prediction</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          className={`relative p-5 rounded-xl border ${
            selectedOutcome === "Yes"
              ? "border-green-500 bg-green-500/10"
              : "border-white/10 hover:border-white/20 bg-[#0E0E10]"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onOutcomeChange("Yes")}
        >
          <div className="text-lg font-bold mb-1 text-green-400">Yes</div>
          <div className="text-sm text-[#B0B0B0]">{outcomes.yes}%</div>
          
          {selectedOutcome === "Yes" && (
            <motion.div 
              className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </motion.div>
          )}
          
          {/* Pulse effect when selected */}
          {selectedOutcome === "Yes" && (
            <motion.div
              className="absolute inset-0 rounded-xl border border-green-500"
              animate={{ 
                opacity: [1, 0],
                scale: [1, 1.05] 
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                repeatType: "loop"
              }}
            ></motion.div>
          )}
        </motion.button>
        
        <motion.button
          className={`relative p-5 rounded-xl border ${
            selectedOutcome === "No"
              ? "border-red-500 bg-red-500/10"
              : "border-white/10 hover:border-white/20 bg-[#0E0E10]"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onOutcomeChange("No")}
        >
          <div className="text-lg font-bold mb-1 text-red-400">No</div>
          <div className="text-sm text-[#B0B0B0]">{outcomes.no}%</div>
          
          {selectedOutcome === "No" && (
            <motion.div 
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </motion.div>
          )}
          
          {/* Pulse effect when selected */}
          {selectedOutcome === "No" && (
            <motion.div
              className="absolute inset-0 rounded-xl border border-red-500"
              animate={{ 
                opacity: [1, 0],
                scale: [1, 1.05] 
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                repeatType: "loop"
              }}
            ></motion.div>
          )}
        </motion.button>
      </div>
      
      <div className="mt-4 text-xs text-[#B0B0B0] text-center">
        Select an outcome to stake your tokens
      </div>
    </motion.div>
  );
}