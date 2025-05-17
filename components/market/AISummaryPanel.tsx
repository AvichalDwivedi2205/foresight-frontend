"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type AISummaryPanelProps = {
  summary: string;
  isLoading?: boolean;
};

export default function AISummaryPanel({ summary, isLoading = false }: AISummaryPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Display placeholder loading animation when loading
  if (isLoading) {
    return (
      <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700 animate-pulse">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-700/40 rounded-lg mr-3"></div>
          <div className="h-6 bg-gray-700 rounded w-40"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-11/12"></div>
          <div className="h-4 bg-gray-700 rounded w-10/12"></div>
          <div className="h-4 bg-gray-700 rounded w-8/12"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-blue-700/40 rounded-lg flex items-center justify-center mr-3">
          <svg
            className="w-5 h-5 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold">AI Market Analysis</h3>
      </div>

      <motion.div
        className={`text-white/80 overflow-hidden relative text-sm`}
        initial={{ height: "auto", maxHeight: expanded ? "none" : "120px" }}
        animate={{ maxHeight: expanded ? "none" : "120px" }}
        transition={{ duration: 0.3 }}
      >
        <p>
          {summary || "No AI analysis available for this market yet."}
        </p>
        
        {!expanded && summary && summary.length > 300 && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-800/90 to-transparent" />
        )}
      </motion.div>

      {summary && summary.length > 300 && (
        <button
          onClick={toggleExpand}
          className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center"
        >
          {expanded ? "Show less" : "Read more"}
          <svg
            className={`ml-1 w-4 h-4 transition-transform duration-300 ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}