"use client";

import { motion, AnimatePresence } from "framer-motion";

type AIPreviewCardProps = {
  isValidating: boolean;
  validationResult: {
    valid: boolean;
    score: number;
    summary: string;
    potentialIssues?: string[];
  } | null;
};

export default function AIPreviewCard({ isValidating, validationResult }: AIPreviewCardProps) {
  // Format score as percentage
  const scorePercentage = validationResult ? Math.round(validationResult.score * 100) : 0;
  
  // Determine score color
  const getScoreColor = (score: number) => {
    if (score >= 0.9) return "text-green-400";
    if (score >= 0.8) return "text-emerald-400";
    if (score >= 0.7) return "text-blue-400";
    if (score >= 0.6) return "text-yellow-400";
    return "text-amber-500";
  };
  
  // Determine score text
  const getScoreText = (score: number) => {
    if (score >= 0.9) return "Excellent";
    if (score >= 0.8) return "Good";
    if (score >= 0.7) return "Satisfactory";
    if (score >= 0.6) return "Needs Improvement";
    return "Poor";
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <h3 className="font-semibold text-xl mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
        </svg>
        AI Validation
      </h3>

      {isValidating ? (
        <div className="py-6 flex flex-col items-center justify-center">
          <motion.div
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
          <p className="text-white/70">Analyzing market criteria...</p>
        </div>
      ) : !validationResult ? (
        <div className="p-4 bg-gray-700/30 rounded-lg text-white/70 text-center">
          <p>Fill in market details and validate to see AI analysis</p>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70">Market Quality Score:</span>
                <span className={`text-xl font-bold ${getScoreColor(validationResult.score)}`}>
                  {scorePercentage}%
                </span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <motion.div
                  className={`h-2.5 rounded-full ${scorePercentage >= 70 ? 'bg-blue-500' : 'bg-amber-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${scorePercentage}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
              
              <div className="mt-1 text-right text-sm">
                <span className={getScoreColor(validationResult.score)}>
                  {getScoreText(validationResult.score)}
                </span>
              </div>
            </div>
            
            <div className="mb-5">
              <h4 className="font-medium mb-2">AI Feedback:</h4>
              <p className="text-white/80 text-sm">
                {validationResult.summary}
              </p>
            </div>
            
            {validationResult.potentialIssues && validationResult.potentialIssues.length > 0 && (
              <div className="mb-5">
                <h4 className="font-medium mb-2">Potential Issues:</h4>
                <ul className="list-disc pl-5 text-sm text-amber-300/90 space-y-1">
                  {validationResult.potentialIssues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full ${validationResult.valid ? 'bg-green-500' : 'bg-red-500'} mr-2`} />
                <span className="text-sm">
                  {validationResult.valid ? 'Ready to submit' : 'Needs improvement'}
                </span>
              </div>
              <span className="text-xs text-white/50">
                Powered by AI
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}