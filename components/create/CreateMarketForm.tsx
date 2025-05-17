"use client";

import { useState, useEffect } from "react";
import { useAIService } from "@/lib/ai-service";
import { useToast } from "@/lib/hooks/useToast";
import { motion } from "framer-motion";

type CreateMarketFormProps = {
  formData: {
    marketQuestion: string;
    description: string;
    endDate: string;
    outcomes: string[];
    initialStake: string;
  };
  onChange: (data: any) => void;
  onValidateSubmit: () => void;
  isValidating: boolean;
  isValidated: boolean;
};

export default function CreateMarketForm({
  formData,
  onChange,
  onValidateSubmit,
  isValidating,
  isValidated,
}: CreateMarketFormProps) {
  const { showToast } = useToast();
  const { analyzeMarketText } = useAIService();
  const [questionFeedback, setQuestionFeedback] = useState<{
    feedback: string;
    suggestions: string[];
  } | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnalyzingQuestion, setIsAnalyzingQuestion] = useState(false);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  // Handle input changes
  const handleChange = (field: string, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  // Handle outcome changes (add/remove)
  const handleOutcomeChange = (index: number, value: string) => {
    const newOutcomes = [...formData.outcomes];
    newOutcomes[index] = value;
    handleChange("outcomes", newOutcomes);
  };

  const handleAddOutcome = () => {
    if (formData.outcomes.length < 5) {
      handleChange("outcomes", [...formData.outcomes, ""]);
    } else {
      showToast("Maximum 5 outcomes allowed", "warning");
    }
  };

  const handleRemoveOutcome = (index: number) => {
    if (formData.outcomes.length > 2) {
      const newOutcomes = [...formData.outcomes];
      newOutcomes.splice(index, 1);
      handleChange("outcomes", newOutcomes);
    } else {
      showToast("Minimum 2 outcomes required", "warning");
    }
  };

  // AI question analysis
  const analyzeQuestion = async () => {
    if (formData.marketQuestion.length < 10) return;
    
    setIsAnalyzingQuestion(true);
    try {
      const result = await analyzeMarketText(formData.marketQuestion);
      setQuestionFeedback(result);
      setShowFeedback(true);
    } catch (error) {
      console.error("Error analyzing question:", error);
    } finally {
      setIsAnalyzingQuestion(false);
    }
  };

  // Debounce question analysis
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.marketQuestion.length >= 10) {
        analyzeQuestion();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData.marketQuestion]);

  const handleValidate = () => {
    // Basic validation
    if (formData.marketQuestion.length < 10) {
      showToast("Please enter a longer market question", "error");
      return;
    }

    if (formData.description.length < 20) {
      showToast("Please provide a more detailed description", "error");
      return;
    }

    if (!formData.endDate) {
      showToast("Please select an end date", "error");
      return;
    }

    if (formData.outcomes.some(outcome => !outcome)) {
      showToast("All outcomes must have a value", "error");
      return;
    }

    onValidateSubmit();
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <div className="mb-6">
        <label className="block text-white font-medium mb-2">
          Market Question <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.marketQuestion}
            onChange={(e) => handleChange("marketQuestion", e.target.value)}
            placeholder="Will ETH reach $5,000 before May 2025?"
            className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-70"
            disabled={isValidated}
          />
          
          {isAnalyzingQuestion && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        {showFeedback && questionFeedback && questionFeedback.suggestions.length > 0 && (
          <motion.div 
            className="mt-2 p-3 bg-blue-900/30 border border-blue-800/30 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-blue-300 mb-2">{questionFeedback.feedback}</p>
            {questionFeedback.suggestions.length > 0 && (
              <div>
                <p className="text-xs text-white/70 mb-1">Suggestions:</p>
                <ul className="text-xs text-white/80 space-y-1 list-disc pl-4">
                  {questionFeedback.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-white font-medium mb-2">
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Provide details about this prediction market, including resolution criteria..."
          rows={4}
          className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-70"
          disabled={isValidated}
        ></textarea>
      </div>

      <div className="mb-6">
        <label className="block text-white font-medium mb-2">
          Resolution Date <span className="text-red-400">*</span>
        </label>
        <input
          type="date"
          value={formData.endDate}
          onChange={(e) => handleChange("endDate", e.target.value)}
          min={minDateStr}
          className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-70"
          disabled={isValidated}
        />
      </div>

      <div className="mb-6">
        <label className="block text-white font-medium mb-2">
          Outcomes <span className="text-red-400">*</span>
        </label>
        <div className="space-y-3">
          {formData.outcomes.map((outcome, index) => (
            <div key={index} className="flex items-center">
              <input
                type="text"
                value={outcome}
                onChange={(e) => handleOutcomeChange(index, e.target.value)}
                placeholder={`Outcome ${index + 1}`}
                className="flex-grow p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-70"
                disabled={isValidated}
              />
              {formData.outcomes.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOutcome(index)}
                  className="ml-2 p-2 text-red-400 hover:text-red-300 disabled:opacity-50"
                  disabled={isValidated}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              )}
            </div>
          ))}
          
          {formData.outcomes.length < 5 && !isValidated && (
            <button
              type="button"
              onClick={handleAddOutcome}
              className="mt-2 flex items-center text-blue-400 hover:text-blue-300 text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add another outcome
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-white font-medium mb-2">
          Initial Stake
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.initialStake}
            onChange={(e) => {
              // Only allow numbers and decimals
              const re = /^[0-9]*\.?[0-9]*$/;
              if (e.target.value === '' || re.test(e.target.value)) {
                handleChange("initialStake", e.target.value);
              }
            }}
            placeholder="0.0"
            className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors pr-16 disabled:opacity-70"
            disabled={isValidated}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70">
            SOL
          </div>
        </div>
        <p className="mt-1 text-xs text-white/50">
          Optional: Add your initial stake to this market
        </p>
      </div>

      {!isValidated && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleValidate}
            disabled={isValidating}
            className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center transition-colors ${
              isValidating
                ? "bg-blue-700/50 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
            }`}
          >
            {isValidating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Validating with AI...
              </>
            ) : (
              "Validate Market"
            )}
          </button>
        </div>
      )}
      
      {isValidated && (
        <div className="p-4 bg-green-900/20 border border-green-800/30 rounded-lg flex items-center">
          <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span className="text-green-400">Market validated successfully! Review the details and submit.</span>
        </div>
      )}
    </div>
  );
}