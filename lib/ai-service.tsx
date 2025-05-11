import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
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

// React hook for using the AI service in components
export function useAIService() {
  const { showToast } = useToast();
  
  // Mutation for generating market score
  const scoreMarketMutation = useMutation({
    mutationFn: (params: MarketScoreParams) => generateMarketScore(params),
    onError: (error: Error) => {
      showToast(`AI scoring failed: ${error.message}`, "error");
    },
  });
  
  // Mutation for resolving market
  const resolveMarketMutation = useMutation({
    mutationFn: (params: ResolutionParams) => analyzeMarketResolution(params),
    onSuccess: (data) => {
      showToast(`Market analyzed with ${data.confidenceScore.toFixed(2)} confidence`, "success");
    },
    onError: (error: Error) => {
      showToast(`AI resolution failed: ${error.message}`, "error");
    },
  });
  const analyzeMarketText = useCallback(async (text: string) => {
    const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      return {
        feedback: "API key is missing, cannot analyze text.",
        suggestions: []
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
                Analyze this prediction market question text and provide feedback on its clarity, specificity, and measurability.
                
                Text: "${text}"
                
                Return a JSON with:
                {
                  "feedback": "Overall assessment of the question quality",
                  "suggestions": ["specific improvement 1", "specific improvement 2", ...]
                }
                
                Only return the JSON, no additional text.
              `
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
          },
        }),
      });
      
      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No response from AI");
      }
      
      const responseText = data.candidates[0].content.parts[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error("Invalid response format");
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("Error analyzing text:", error);
      return {
        feedback: "Error analyzing text: " + (error as Error).message,
        suggestions: []
      };
    }
  }, []);
  
  return {
    scoreMarket: scoreMarketMutation.mutate,
    isScoring: scoreMarketMutation.isPending,
    scoreResult: scoreMarketMutation.data,
    
    resolveMarket: resolveMarketMutation.mutate,
    isResolving: resolveMarketMutation.isPending,
    resolutionResult: resolveMarketMutation.data,
    
    analyzeMarketText,
  };
} 