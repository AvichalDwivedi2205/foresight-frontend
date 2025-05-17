"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type OutcomeOptionsProps = {
  outcomes: Record<string, number>;
  selectedOutcome: number | null;
  onOutcomeChange: (outcomeIndex: number) => void;
  outcomeLabels?: string[];
  userPrediction?: {
    outcome: number;
    amount: number;
  };
  disabled?: boolean;
};

export default function OutcomeOptions({
  outcomes,
  selectedOutcome,
  onOutcomeChange,
  outcomeLabels,
  userPrediction,
  disabled = false
}: OutcomeOptionsProps) {
  // Create an array of outcome keys and values for easier rendering
  const outcomeEntries = Object.entries(outcomes);
  
  // Map the entries to include the original index if outcomeLabels is provided
  const mappedOutcomes = outcomeLabels
    ? outcomeLabels.map((label, index) => ({
        label,
        value: outcomes[label] || 0,
        index
      }))
    : outcomeEntries.map(([key, value], index) => ({
        label: key,
        value,
        index
      }));
  
  return (
    <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700">
      <h3 className="text-xl font-semibold mb-3">Predict Outcome</h3>
      <p className="text-white/70 mb-4">
        Select an outcome and stake your prediction.
      </p>
      
      {userPrediction && (
        <div className="mb-4 p-3 bg-blue-900/30 rounded-md border border-blue-700/50">
          <p className="text-blue-300 font-medium">
            Your prediction: <span className="text-white">{mappedOutcomes[userPrediction.outcome]?.label || '?'}</span>
          </p>
          <p className="text-sm text-blue-300/80">
            Amount staked: <span className="text-white">{userPrediction.amount.toFixed(2)} SOL</span>
          </p>
        </div>
      )}
      
      <div className="space-y-3">
        {mappedOutcomes.map(({ label, value, index }) => (
          <button
            key={index}
            onClick={() => !disabled && onOutcomeChange(index)}
            disabled={disabled}
            className={`w-full p-4 rounded-lg flex flex-col transition-colors duration-200 ${
              selectedOutcome === index
                ? "bg-blue-700 border border-blue-500"
                : "bg-gray-700/50 border border-gray-600 hover:bg-gray-700"
            } ${disabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{label}</span>
              <span className="text-sm bg-black/30 px-2 py-1 rounded">
                {value}%
              </span>
            </div>
            
            <div className="mt-2 w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className={`h-full ${
                  selectedOutcome === index ? "bg-blue-500" : "bg-blue-700/70"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
            
            {userPrediction?.outcome === index && (
              <div className="mt-2">
                <span className="text-xs text-blue-300">Your prediction</span>
              </div>
            )}
          </button>
        ))}
      </div>
      
      {disabled && (
        <p className="mt-4 text-sm text-amber-400">
          Market is no longer active for predictions
        </p>
      )}
    </div>
  );
}