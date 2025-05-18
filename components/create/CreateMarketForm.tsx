"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence  } from '@/components/motion';
import TokenSelector from './TokenSelector';
import CalendarPicker from './CalendarPicker';
import { TokenInfo } from '@/services/contracts/models';

interface CreateMarketFormProps {
  formData: {
    marketQuestion: string;
    description: string;
    endDate: string;
    outcomes: string[];
    initialStake: string;
    tokenInfo?: TokenInfo;
  };
  onChange: (data: any) => void;
  onValidateSubmit: () => void;
  isValidating: boolean;
  isValidated: boolean;
}

export default function CreateMarketForm({
  formData,
  onChange,
  onValidateSubmit,
  isValidating,
  isValidated
}: CreateMarketFormProps) {
  // Character count for market question
  const [charCount, setCharCount] = useState(0);
  
  // Validation states
  const [errors, setErrors] = useState<{
    marketQuestion?: string;
    endDate?: string;
    outcomes?: string;
    initialStake?: string;
    tokenInfo?: string;
  }>({});
  
  // Update character count when market question changes
  useEffect(() => {
    setCharCount(formData.marketQuestion.length);
  }, [formData.marketQuestion]);
  
  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
    
    // Clear errors for this field
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Handle date selection from calendar
  const handleDateChange = (date: Date | null) => {
    if (date) {
      // Set time to end of day (11:59:59 PM)
      date.setHours(23, 59, 59, 999);
      onChange({ endDate: date.toISOString() });
    } else {
      onChange({ endDate: '' });
    }
    
    // Clear errors for this field
    if (errors.endDate) {
      setErrors(prev => ({ ...prev, endDate: undefined }));
    }
  };

  // Handle token selection
  const handleTokenChange = (token: TokenInfo) => {
    onChange({ tokenInfo: token });
    
    // Clear errors for token
    if (errors.tokenInfo) {
      setErrors(prev => ({ ...prev, tokenInfo: undefined }));
    }
  };
  
  // Handle outcome changes
  const handleOutcomeChange = (index: number, value: string) => {
    const newOutcomes = [...formData.outcomes];
    newOutcomes[index] = value;
    onChange({ outcomes: newOutcomes });
    
    // Clear errors for outcomes
    if (errors.outcomes) {
      setErrors(prev => ({ ...prev, outcomes: undefined }));
    }
  };
  
  // Add new outcome
  const handleAddOutcome = () => {
    if (formData.outcomes.length < 5) {
      onChange({ outcomes: [...formData.outcomes, ''] });
    }
  };
  
  // Remove outcome
  const handleRemoveOutcome = (index: number) => {
    if (formData.outcomes.length > 2) {
      const newOutcomes = [...formData.outcomes];
      newOutcomes.splice(index, 1);
      onChange({ outcomes: newOutcomes });
    }
  };
  
  // Validate form before submitting
  const validateForm = () => {
    const newErrors: {
      marketQuestion?: string;
      endDate?: string;
      outcomes?: string;
      initialStake?: string;
      tokenInfo?: string;
    } = {};
    
    // Check market question (required, min length)
    if (!formData.marketQuestion) {
      newErrors.marketQuestion = 'Market question is required';
    } else if (formData.marketQuestion.length < 10) {
      newErrors.marketQuestion = 'Market question must be at least 10 characters';
    }
    
    // Check end date (required, future date)
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else {
      const endDate = new Date(formData.endDate);
      const now = new Date();
      if (endDate <= now) {
        newErrors.endDate = 'End date must be in the future';
      }
    }
    
    // Check outcomes (all required, unique)
    const emptyOutcomes = formData.outcomes.some(o => !o.trim());
    if (emptyOutcomes) {
      newErrors.outcomes = 'All outcomes must have a value';
    } else {
      const uniqueOutcomes = new Set(formData.outcomes.map(o => o.trim().toLowerCase()));
      if (uniqueOutcomes.size !== formData.outcomes.length) {
        newErrors.outcomes = 'All outcomes must be unique';
      }
    }
    
    // Check initial stake (must be a number if provided)
    if (formData.initialStake && isNaN(Number(formData.initialStake))) {
      newErrors.initialStake = 'Initial stake must be a valid number';
    }
    
    // Check token info
    if (!formData.tokenInfo) {
      newErrors.tokenInfo = 'Token is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onValidateSubmit();
    }
  };
  
  return (
    <motion.form
      className="bg-[#151518] rounded-lg border border-white/10 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      onSubmit={handleSubmit}
    >
      {/* Market Question Field */}
      <div className="mb-6">
        <label className="block text-[#F5F5F5] font-medium mb-2" htmlFor="marketQuestion">
          Market Question *
        </label>
        <div className="relative">
          <motion.textarea
            id="marketQuestion"
            name="marketQuestion"
            value={formData.marketQuestion}
            onChange={handleInputChange}
            placeholder="Will Ethereum reach $10,000 before the end of 2025?"
            className={`w-full bg-[#0E0E10] border ${
              errors.marketQuestion ? 'border-red-500' : 'border-white/20'
            } text-white rounded-lg p-3 h-24 focus:outline-none focus:ring-2 focus:ring-[#5F6FFF]`}
            disabled={isValidating || isValidated}
            animate={{
              boxShadow: errors.marketQuestion 
                ? '0 0 0 2px rgba(239, 68, 68, 0.2)' 
                : formData.marketQuestion 
                ? '0 0 10px rgba(95, 111, 255, 0.3)'
                : 'none'
            }}
          />
          <motion.div 
            className={`absolute bottom-2 right-3 text-xs ${
              charCount > 150 ? 'text-amber-500' : 'text-[#B0B0B0]'
            }`}
          >
            {charCount}/200 characters
          </motion.div>
        </div>
        {errors.marketQuestion && (
          <motion.p 
            className="mt-1 text-red-500 text-sm"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.marketQuestion}
          </motion.p>
        )}
        <p className="mt-2 text-[#B0B0B0] text-sm">
          Ask a clear, objective question that will have a verifiable outcome in the future.
        </p>
      </div>

      {/* Description Field */}
      <div className="mb-6">
        <label className="block text-[#F5F5F5] font-medium mb-2" htmlFor="description">
          Description <span className="text-[#B0B0B0] text-sm">(optional)</span>
        </label>
        <motion.textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Add any additional context, resolution criteria, or relevant details..."
          className="w-full bg-[#0E0E10] border border-white/20 text-white rounded-lg p-3 h-32 focus:outline-none focus:ring-2 focus:ring-[#5F6FFF]"
          disabled={isValidating || isValidated}
          animate={{
            height: formData.description.length > 100 ? "9rem" : "8rem",
            boxShadow: formData.description ? '0 0 10px rgba(19, 173, 199, 0.15)' : 'none'
          }}
        />
        <p className="mt-2 text-[#B0B0B0] text-sm">
          Provide details on how the outcome will be determined and any specific conditions.
        </p>
      </div>

      {/* End Date Field */}
      <div className="mb-6">
        <label className="block text-[#F5F5F5] font-medium mb-2" htmlFor="endDate">
          Resolution Date *
        </label>
        <CalendarPicker
          selectedDate={formData.endDate ? new Date(formData.endDate) : null}
          onChange={handleDateChange}
          minDate={new Date()} // Cannot select dates in the past
          maxDate={new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10)} // 10 years in the future max
          placeholder="Select resolution date"
          error={errors.endDate}
          disabled={isValidating || isValidated}
        />
        {errors.endDate && (
          <motion.p 
            className="mt-1 text-red-500 text-sm"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.endDate}
          </motion.p>
        )}
        <p className="mt-2 text-[#B0B0B0] text-sm">
          When will the market be resolved? Choose a specific date and time.
        </p>
      </div>

      {/* Outcomes Fields */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-[#F5F5F5] font-medium">
            Possible Outcomes *
          </label>
          {formData.outcomes.length < 5 && (
            <motion.button
              type="button"
              onClick={handleAddOutcome}
              className="text-sm text-[#5F6FFF] hover:text-[#13ADC7] transition-colors flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isValidating || isValidated}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Add Outcome
            </motion.button>
          )}
        </div>
        
        <AnimatePresence>
          {formData.outcomes.map((outcome, index) => (
            <motion.div 
              key={`outcome-${index}`}
              className="flex mb-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <input
                type="text"
                value={outcome}
                onChange={(e) => handleOutcomeChange(index, e.target.value)}
                className={`flex-grow bg-[#0E0E10] border border-white/20 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#5F6FFF]`}
                placeholder={`Outcome ${index + 1}`}
                disabled={isValidating || isValidated}
              />
              {formData.outcomes.length > 2 && (
                <motion.button
                  type="button"
                  onClick={() => handleRemoveOutcome(index)}
                  className="ml-2 text-[#B0B0B0] hover:text-red-400 transition-colors p-2"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={isValidating || isValidated}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </motion.button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {errors.outcomes && (
          <motion.p 
            className="mt-1 text-red-500 text-sm"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.outcomes}
          </motion.p>
        )}
        <p className="mt-2 text-[#B0B0B0] text-sm">
          Define all possible outcomes. Default is Yes/No, but you can add up to 5 different outcomes.
        </p>
      </div>

      {/* Token Selection */}
      <div className="mb-6">
        <label className="block text-[#F5F5F5] font-medium mb-2">
          Market Token *
        </label>
        <TokenSelector
          value={formData.tokenInfo}
          onChange={handleTokenChange}
          disabled={isValidating || isValidated}
        />
        {errors.tokenInfo && (
          <motion.p 
            className="mt-1 text-red-500 text-sm"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.tokenInfo}
          </motion.p>
        )}
        <p className="mt-2 text-[#B0B0B0] text-sm">
          Select the token that will be used for staking and rewards in this market.
        </p>
      </div>

      {/* Initial Stake Field */}
      <div className="mb-8">
        <label className="block text-[#F5F5F5] font-medium mb-2" htmlFor="initialStake">
          Initial Stake <span className="text-[#B0B0B0] text-sm">(optional)</span>
        </label>
        <div className="relative">
          <motion.input
            type="text"
            id="initialStake"
            name="initialStake"
            value={formData.initialStake}
            onChange={handleInputChange}
            placeholder="5"
            className={`w-full bg-[#0E0E10] border ${
              errors.initialStake ? 'border-red-500' : 'border-white/20'
            } text-white rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-[#5F6FFF]`}
            disabled={isValidating || isValidated}
            animate={{
              boxShadow: errors.initialStake 
                ? '0 0 0 2px rgba(239, 68, 68, 0.2)' 
                : formData.initialStake 
                ? '0 0 10px rgba(95, 111, 255, 0.3)'
                : 'none'
            }}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-[#B0B0B0]">{formData.tokenInfo?.symbol || 'SOL'}</span>
          </div>
        </div>
        {errors.initialStake && (
          <motion.p 
            className="mt-1 text-red-500 text-sm"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.initialStake}
          </motion.p>
        )}
        <p className="mt-2 text-[#B0B0B0] text-sm">
          Adding an initial stake helps reduce spam and increases market visibility.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <motion.button
          type="submit"
          className={`px-8 py-3 rounded-lg font-medium text-white ${
            isValidated
              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
              : 'bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7]'
          } hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
          disabled={isValidating || isValidated}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          animate={{
            boxShadow: isValidating ? '0 0 15px rgba(95, 111, 255, 0.7)' : '0 0 0 rgba(95, 111, 255, 0)'
          }}
        >
          {isValidating ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Validating with AI...
            </div>
          ) : isValidated ? (
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Validated Successfully
            </div>
          ) : (
            'Validate with AI'
          )}
        </motion.button>
      </div>
    </motion.form>
  );
}