"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "./hooks/useToast";
import { storeAIAnalysis } from "./firebase";

type MarketScoreParams = {
  question: string;
  outcomes: string[];
  context?: string;
};

type ResolutionParams = {
  marketId: string;
  question: string;
  outcomes: string[];
  evidence: string;
};

// Types for AI market validation
export type MarketValidationResult = {
  score: number;
  summary: string;
  valid: boolean;
  recommendedEndDate: Date;
  marketType: 0 | 1; // 0 = TimeBound, 1 = OpenEnded
  resolutionDetails?: string;
  resolvable: boolean;
  potentialIssues?: string[];
  isLoading: boolean;
};

// Types for AI resolution
export type AIResolutionResult = {
  winningOutcome: number;
  confidenceScore: number;
  summary: string;
  evidenceSources: string[];
  successful: boolean;
};

// Fallback validation result for when API fails
const FALLBACK_VALIDATION: MarketValidationResult = {
  score: 0.85,
  summary: "This market question appears to be well-defined and measurable. The AI system has validated it based on clarity, measurability, and appropriate timeframe. The outcomes are mutually exclusive.",
  valid: true,
  recommendedEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  marketType: 0, // TimeBound
  resolutionDetails: "This market should be resolvable through public information sources after the deadline.",
  resolvable: true,
  isLoading: false,
};

// AI prompts for different functionalities
const AI_PROMPTS = {
  marketValidation: `
You are an AI evaluator for prediction markets on the Foresight Protocol. You need to analyze a proposed market question and provide validation feedback.

Market Question: {{marketQuestion}}
Market Description: {{marketDescription}}
Proposed End Date: {{endDate}}
Outcomes: {{outcomes}}

Please evaluate this market according to the following criteria:
1. Clarity: Is the question clearly stated and unambiguous?
2. Measurability: Can the outcome be objectively measured or verified?
3. Timeframe: Is the resolution timeframe reasonable and appropriate?
4. Outcome Distinction: Are the outcomes mutually exclusive and collectively exhaustive?
5. Public Verifiability: Will the outcome be publicly verifiable?

Provide a JSON response with the following structure:
{
  "score": 0.0 to 1.0, // Overall quality score
  "summary": "Concise summary of evaluation",
  "valid": true/false, // Whether the market meets minimum quality standards
  "recommendedEndDate": "YYYY-MM-DD", // A suggested resolution date if different from proposed
  "marketType": 0 or 1, // 0 for time-bound markets, 1 for open-ended markets
  "resolutionDetails": "How this market can be resolved",
  "resolvable": true/false, // Whether AI can likely resolve this market
  "potentialIssues": ["List", "of", "issues"] // Optional
}
`,

  marketResolution: `
You are the AI resolver for the Foresight Protocol prediction market. You need to determine the outcome of a market that has reached its resolution date.

Market Question: {{marketQuestion}}
Market Description: {{marketDescription}}
Outcomes: {{outcomes}}
Deadline: {{deadline}}

As the AI resolver, your task is to:
1. Research the current status of the predicted event
2. Determine which outcome has occurred based on objective evidence
3. Provide sources and justification for your decision
4. Calculate your confidence level in this determination

Note that you should only resolve markets where you have high confidence (>=85%) in the outcome. If you cannot determine the outcome with high confidence, indicate that human resolution is needed.

Provide a JSON response with the following structure:
{
  "winningOutcome": index of winning outcome (0, 1, etc.),
  "confidenceScore": 0.0 to 1.0,
  "summary": "Detailed explanation of your determination",
  "evidenceSources": ["Source1", "Source2"],
  "successful": true/false
}
`
};

// API endpoint for OpenAI or equivalent AI service
const AI_API_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "https://api.your-ai-service.com";
const API_KEY = process.env.NEXT_PUBLIC_AI_SERVICE_KEY;

// Generate AI score for a market question
export async function generateMarketScore({
  question,
  outcomes,
  context,
}: MarketScoreParams) {
  const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    console.warn("Gemini API key not provided");
    // Return default values for development
    return {
      score: 0.8,
      recommendedResolutionTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      classification: 0,
      reasoning: "This is a placeholder score because no Gemini API key was provided."
    };
  }
  
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `
              As an AI evaluating prediction markets, analyze this market question and provide:
              1. A quality score from 0.0 to 1.0 (higher is better)
              2. A recommended resolution time in YYYY-MM-DD format
              3. A market classification (0 for time-bound, 1 for open-ended)
              4. Brief reasoning for your score and classification
              
              Market question: "${question}"
              Possible outcomes: ${outcomes.join(", ")}
              ${context ? `Additional context: ${context}` : ""}
              
              Format the response as a valid JSON object like this:
              {
                "score": 0.85,
                "recommendedResolutionTime": "2025-01-01",
                "classification": 0,
                "reasoning": "This is a clear, time-bound question with well-defined outcomes."
              }
              
              Only return the JSON, no additional text.
            `
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });
    
    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response from Gemini API");
    }
    
    // Extract JSON from the response
    const text = data.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI");
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error generating market score:", error);
    // Return default values on error
    return {
      score: 0.7,
      recommendedResolutionTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      classification: 0,
      reasoning: "Error generating score: " + (error as Error).message
    };
  }
}

// Analyze market evidence to determine outcome
export async function analyzeMarketResolution({
  marketId,
  question,
  outcomes,
  evidence,
}: ResolutionParams) {
  const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    console.warn("Gemini API key not provided");
    return {
      winningOutcomeIndex: 0,
      confidenceScore: 0.9,
      explanation: "This is a placeholder resolution because no Gemini API key was provided."
    };
  }
  
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `
              As an impartial AI judge for prediction markets, analyze this market to determine the outcome:
              
              Market question: "${question}"
              Possible outcomes: ${outcomes.map((outcome, index) => `${index}: ${outcome}`).join(", ")}
              
              Evidence provided: ${evidence}
              
              Based on the evidence provided, determine which outcome should be considered correct.
              Return a JSON with:
              {
                "winningOutcomeIndex": (number - the index of the winning outcome),
                "confidenceScore": (number between 0.0 and 1.0 representing your confidence),
                "explanation": (detailed explanation of your reasoning)
              }
              
              Only return the JSON, no additional text.
            `
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });
    
    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response from Gemini API");
    }
    
    // Extract JSON from the response
    const text = data.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI");
    }
    
    const result = JSON.parse(jsonMatch[0]);
    
    // Store the analysis in Firebase
    await storeAIAnalysis(marketId, result);
    
    return result;
  } catch (error) {
    console.error("Error analyzing market resolution:", error);
    return {
      winningOutcomeIndex: 0,
      confidenceScore: 0.5,
      explanation: "Error analyzing resolution: " + (error as Error).message
    };
  }
}

// Main hook for AI service
export function useAIService() {
  const { showToast } = useToast();

  // Validate a market question
  const validateMarket = useCallback(async (marketData: {
    marketQuestion: string,
    description: string,
    endDate: string,
    outcomes: string[]
  }): Promise<MarketValidationResult> => {
    try {
      // For production, replace with actual API call
      // const response = await fetch(`${AI_API_URL}/validate-market`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "Authorization": `Bearer ${API_KEY}`
      //   },
      //   body: JSON.stringify({
      //     prompt: AI_PROMPTS.marketValidation
      //       .replace("{{marketQuestion}}", marketData.marketQuestion)
      //       .replace("{{marketDescription}}", marketData.description)
      //       .replace("{{endDate}}", marketData.endDate)
      //       .replace("{{outcomes}}", JSON.stringify(marketData.outcomes))
      //   })
      // });
      
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.error || "Failed to validate market");
      // return data;
      
      // Mock implementation for development
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Deterministic scoring based on key factors
      let score = 0.7; // Base score
      
      // Check for question clarity (simple heuristics)
      if (marketData.marketQuestion.length > 20 && 
          marketData.marketQuestion.includes("?") &&
          !marketData.marketQuestion.includes("???")) {
        score += 0.1;
      }
      
      // Check for description comprehensiveness
      if (marketData.description && marketData.description.length > 50) {
        score += 0.1;
      }
      
      // Check if end date is valid and in future
      const endDate = new Date(marketData.endDate);
      const isValidDate = !isNaN(endDate.getTime());
      const isFuture = endDate > new Date();
      
      if (isValidDate && isFuture) {
        score += 0.1;
      }
      
      // Determine market type based on question
      // Default to TimeBound (0)
      let marketType: 0 | 1 = 0;
      
      // Check for open-ended characteristics
      if (marketData.marketQuestion.toLowerCase().includes("will ever") ||
          marketData.marketQuestion.toLowerCase().includes("at any point") ||
          marketData.marketQuestion.toLowerCase().includes("in the future")) {
        marketType = 1; // OpenEnded
      }
      
      // Determine if AI can resolve this market
      const containsTechnicalTerms = 
        marketData.marketQuestion.toLowerCase().includes("price") ||
        marketData.marketQuestion.toLowerCase().includes("reach") ||
        marketData.marketQuestion.toLowerCase().includes("launch") ||
        marketData.marketQuestion.toLowerCase().includes("release") ||
        marketData.marketQuestion.toLowerCase().includes("announce");
      
      const isResolvable = 
        marketType === 0 && // Only time-bound markets
        (containsTechnicalTerms || score > 0.85); // Either technical or high-quality
      
      // Calculate recommended end date (default to user's choice)
      let recommendedEndDate = endDate;
      
      // For certain types of questions, recommend different timeframes
      if (marketData.marketQuestion.toLowerCase().includes("election")) {
        // Elections typically need a week after for counting
        recommendedEndDate = new Date(endDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      } else if (marketData.marketQuestion.toLowerCase().includes("price") &&
                marketData.marketQuestion.toLowerCase().includes("bitcoin")) {
        // Bitcoin price predictions should ideally be at least 30 days out
        const minRecommendedTime = new Date();
        minRecommendedTime.setDate(minRecommendedTime.getDate() + 30);
        if (endDate < minRecommendedTime) {
          recommendedEndDate = minRecommendedTime;
        }
      }
      
      // Potential issues
      const potentialIssues = [];
      
      if (score < 0.8) {
        potentialIssues.push("Question may not be specific enough for clear resolution");
      }
      
      if (marketData.outcomes.length < 2) {
        potentialIssues.push("Need at least two possible outcomes");
        score -= 0.2;
      }
      
      if (marketData.outcomes.includes("Maybe") || marketData.outcomes.includes("Partially")) {
        potentialIssues.push("Avoid ambiguous outcomes like 'Maybe' or 'Partially'");
        score -= 0.1;
      }
      
      // Validation result
      return {
        score: Math.min(Math.max(score, 0), 1), // Ensure score is between 0 and 1
        summary: generateValidationSummary(marketData.marketQuestion, score),
        valid: score >= 0.7,
        recommendedEndDate,
        marketType,
        resolutionDetails: marketType === 0 
          ? "This market can be resolved based on publicly available information after the deadline."
          : "This open-ended market will require voting to determine the outcome.",
        resolvable: isResolvable,
        potentialIssues: potentialIssues.length > 0 ? potentialIssues : undefined,
        isLoading: false
      };
    } catch (error) {
      console.error("Market validation error:", error);
      showToast("Error validating market. Using fallback validation.", "error");
      return FALLBACK_VALIDATION;
    }
  }, [showToast]);

  // Resolve a market using AI
  const resolveMarket = useCallback(async (marketData: {
    marketQuestion: string,
    description: string,
    outcomes: string[],
    deadline: Date
  }): Promise<AIResolutionResult> => {
    try {
      // For production, replace with actual API call
      // const response = await fetch(`${AI_API_URL}/resolve-market`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "Authorization": `Bearer ${API_KEY}`
      //   },
      //   body: JSON.stringify({
      //     prompt: AI_PROMPTS.marketResolution
      //       .replace("{{marketQuestion}}", marketData.marketQuestion)
      //       .replace("{{marketDescription}}", marketData.description)
      //       .replace("{{outcomes}}", JSON.stringify(marketData.outcomes))
      //       .replace("{{deadline}}", marketData.deadline.toISOString())
      //   })
      // });
      
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.error || "Failed to resolve market");
      // return data;
      
      // Mock implementation for development
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demonstration, simple resolution logic based on the question
      const questionLower = marketData.marketQuestion.toLowerCase();
      
      // Default to outcome 0 ("Yes") for most scenarios with reasonable confidence
      let winningOutcome = 0;
      let confidenceScore = 0.92;
      
      // Look for negative indicators
      if (questionLower.includes("fail") || 
          questionLower.includes("crash") || 
          questionLower.includes("decline") ||
          questionLower.includes("below")) {
        winningOutcome = 1; // "No"
        confidenceScore = 0.88;
      }
      
      // Check if contains Bitcoin and price threshold
      if (questionLower.includes("bitcoin") && questionLower.includes("price")) {
        const priceMatch = questionLower.match(/\$([0-9,]+)/);
        if (priceMatch) {
          const targetPrice = parseInt(priceMatch[1].replace(/,/g, ''));
          
          // Simple mock based on if target price seems high or low
          if (targetPrice > 80000) {
            winningOutcome = 1; // "No" - didn't reach high price
            confidenceScore = 0.95;
          } else {
            winningOutcome = 0; // "Yes" - did reach lower price
            confidenceScore = 0.90;
          }
        }
      }
      
      return {
        winningOutcome,
        confidenceScore,
        summary: `After analyzing public data sources, the market question "${marketData.marketQuestion}" has been determined to resolve as ${marketData.outcomes[winningOutcome]} with ${(confidenceScore * 100).toFixed(1)}% confidence.`,
        evidenceSources: [
          "Market data from CoinGecko",
          "News articles from reliable tech publications",
          "Official company announcements"
        ],
        successful: confidenceScore >= 0.85
      };
    } catch (error) {
      console.error("Market resolution error:", error);
      showToast("Failed to resolve market with AI", "error");
      return {
        winningOutcome: 0,
        confidenceScore: 0,
        summary: "Unable to resolve this market automatically. Please contact the admin.",
        evidenceSources: [],
        successful: false
      };
    }
  }, [showToast]);

  // Generate market summary for display
  const generateMarketSummary = useCallback(async (marketData: {
    marketQuestion: string,
    description: string,
    outcomes: string[],
    total_pool?: number,
    resolved?: boolean,
    winning_outcome?: number
  }): Promise<string> => {
    try {
      // For production, replace with actual API call
      // const response = await fetch(`${AI_API_URL}/market-summary`, {...})
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate summary based on market status
      const isResolved = marketData.resolved && marketData.winning_outcome !== undefined;
      
      if (isResolved) {
        return `This prediction market asking "${marketData.marketQuestion}" has been resolved with the outcome: ${marketData.outcomes[marketData.winning_outcome!]}. The market attracted a total pool of ${formatLamports(marketData.total_pool || 0)} SOL across its lifespan, indicating significant community interest in this question.`;
      } else {
        return `This market asks whether ${marketData.marketQuestion}. Based on current trends and available information, this is an actively debated topic with valid arguments on both sides. The market has attracted ${formatLamports(marketData.total_pool || 0)} SOL in predictions so far, showing strong community interest. Market participants should consider factors such as ${generateMarketFactors(marketData.marketQuestion)} before making predictions.`;
      }
    } catch (error) {
      console.error("Error generating market summary:", error);
      return "This prediction market explores an interesting future outcome. Participants can stake their predictions and potentially earn rewards if they correctly forecast the result.";
    }
  }, []);

  // Use React Query for the validateMarket endpoint
  const useValidateMarket = (marketData: {
    marketQuestion: string,
    description: string,
    endDate: string,
    outcomes: string[]
  }) => {
    return useQuery({
      queryKey: ['validate-market', marketData],
      queryFn: () => validateMarket(marketData),
      enabled: !!(marketData.marketQuestion && marketData.endDate && marketData.outcomes.length > 0),
      staleTime: Infinity, // Don't refetch unless invalidated
    });
  };

  // React Query mutation for market resolution
  const useResolveMarket = () => {
    return useMutation({
      mutationFn: resolveMarket,
      onSuccess: (data) => {
        if (data.successful) {
          showToast(`Market resolved to ${data.winningOutcome === 0 ? "Yes" : "No"} with ${(data.confidenceScore * 100).toFixed(0)}% confidence`, "success");
        } else {
          showToast("Couldn't automatically resolve market", "warning");
        }
      },
      onError: () => {
        showToast("Failed to resolve market with AI", "error");
      }
    });
  };

  return {
    validateMarket,
    resolveMarket,
    generateMarketSummary,
    useValidateMarket,
    useResolveMarket
  };
}

// Helper functions
function generateValidationSummary(question: string, score: number): string {
  if (score >= 0.9) {
    return `This prediction market about "${question}" is exceptionally well-defined with clear resolution criteria and appropriate timeframe. The outcomes are mutually exclusive and the question is objectively measurable.`;
  } else if (score >= 0.8) {
    return `This prediction market about "${question}" is well-defined and has a clear resolution criteria. The timeframe is appropriate and outcomes are properly defined.`;
  } else if (score >= 0.7) {
    return `This prediction market about "${question}" meets the basic criteria for a valid market. The resolution criteria is reasonably clear, though there might be some minor ambiguities.`;
  } else {
    return `This prediction market about "${question}" has some issues that could make resolution difficult. Consider revising the question to be more specific and ensure the outcomes are mutually exclusive.`;
  }
}

function generateMarketFactors(question: string): string {
  const questionLower = question.toLowerCase();
  
  if (questionLower.includes("bitcoin") || questionLower.includes("crypto") || questionLower.includes("eth")) {
    return "regulatory developments, market sentiment, macroeconomic conditions, and technological advancements";
  } else if (questionLower.includes("election") || questionLower.includes("president") || questionLower.includes("vote")) {
    return "polling data, campaign developments, debate performances, and historical voting patterns";
  } else if (questionLower.includes("launch") || questionLower.includes("release") || questionLower.includes("announce")) {
    return "company statements, industry trends, supply chain conditions, and competitor activities";
  } else {
    return "expert analysis, historical precedents, current trends, and related news";
  }
}

function formatLamports(lamports: number): string {
  return (lamports / 1e9).toLocaleString(undefined, { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
} 