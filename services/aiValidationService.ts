"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { MarketType } from "./contracts/contract-types";

// Define the maximum number of retry attempts for API calls
const MAX_RETRIES = 3;

// Define interface for validation result
export interface MarketValidationResult {
  isValid: boolean;
  score: number; // 0-100 scale
  summary: string;
  suggestedEndDate?: Date;
  marketType?: MarketType;
  error?: string;
}

// Interface for market validation request
export interface MarketValidationRequest {
  question: string;
  description?: string;
  outcomes: string[];
  endDate?: Date;
}

export class AIValidationService {
  private apiKeys: string[];
  private currentKeyIndex: number = 0;

  constructor() {
    // Load API keys from environment variables
    this.apiKeys = [
      process.env.NEXT_PUBLIC_GEMINI_API_KEY1,
      process.env.NEXT_PUBLIC_GEMINI_API_KEY2,
      process.env.NEXT_PUBLIC_GEMINI_API_KEY3,
      process.env.NEXT_PUBLIC_GEMINI_API_KEY4,
      process.env.NEXT_PUBLIC_GEMINI_API_KEY5,
      process.env.NEXT_PUBLIC_GEMINI_API_KEY6,
      process.env.NEXT_PUBLIC_GEMINI_API_KEY7,
    ].filter(Boolean) as string[];
    
    if (this.apiKeys.length === 0) {
      console.error("No Gemini API keys found in environment variables");
    } else {
      console.log(`Loaded ${this.apiKeys.length} Gemini API keys`);
    }
  }

  // Get the next API key in rotation
  private getNextApiKey(): string {
    if (this.apiKeys.length === 0) {
      throw new Error("No Gemini API keys available");
    }
    
    const key = this.apiKeys[this.currentKeyIndex];
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    return key;
  }

  // Validate a market with retry logic
  async validateMarket(market: MarketValidationRequest, retryCount = 0): Promise<MarketValidationResult> {
    try {
      // Check if we should use local validation instead of API (for development or when quota is exceeded)
      if (process.env.NEXT_PUBLIC_USE_LOCAL_VALIDATION === 'true' || this.apiKeys.length === 0) {
        console.log("Using local validation (API disabled)");
        return this.performLocalValidation(market);
      }
      
      const apiKey = this.getNextApiKey();
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      // Prepare the prompt for Gemini
      const prompt = this.createValidationPrompt(market);
      
      try {
        // Call Gemini API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Parse the response
        return this.parseValidationResponse(text, market);
      } catch (apiError: any) {
        console.error("Gemini API error:", apiError);
        
        // Check for quota exceeded errors
        const isQuotaError = 
          apiError?.message?.includes("quota") || 
          apiError?.message?.includes("429") || 
          apiError?.message?.includes("rate limit");
        
        // If this is a quota error and we have more API keys to try, use the next one
        if (isQuotaError && retryCount < MAX_RETRIES && this.apiKeys.length > 1) {
          console.log(`API quota exceeded, retrying with a different key (attempt ${retryCount + 1})`);
          return this.validateMarket(market, retryCount + 1);
        }
        
        // If all API keys are exhausted or it's some other error, use local validation
        console.log("API quota exceeded for all keys or other API error, falling back to local validation");
        return this.performLocalValidation(market, apiError);
      }
    } catch (error) {
      console.error("Error in validation process:", error);
      
      // Fallback to a local validation if all else fails
      return this.createFallbackResponse(market, error);
    }
  }

  // Create the prompt for the AI model
  private createValidationPrompt(market: MarketValidationRequest): string {
    return `You are a prediction market validator. You need to evaluate if a prediction market question is well-formed, objective, and has a clear resolution criteria. 

Market details:
Question: ${market.question}
Description: ${market.description || "None provided"}
Possible Outcomes: ${market.outcomes.join(", ")}
Proposed End Date: ${market.endDate ? market.endDate.toISOString() : "None specified"}

Evaluate the market on these criteria:
1. Clarity: Is the question clear and unambiguous?
2. Objectivity: Can the outcome be determined objectively without subjective judgment?
3. Verifiability: Is there a clear way to verify the outcome?
4. Time-boundedness: Is there a clear timeframe or deadline?
5. Outcome definition: Are the possible outcomes mutually exclusive and collectively exhaustive?

Please provide your assessment in the following JSON format:
{
  "isValid": true/false (whether this market meets quality standards),
  "score": 0-100 (quality score),
  "marketType": "TimeBound" or "OpenEnded",
  "suggestedEndDate": "ISO date string" (only if the provided end date seems inappropriate),
  "summary": "Brief explanation of assessment"
}`;
  }

  // Parse the AI response into a structured validation result
  private parseValidationResponse(responseText: string, market: MarketValidationRequest): MarketValidationResult {
    try {
      // Extract JSON from the response text
      const jsonMatch = responseText.match(/{[\s\S]*}/);
      
      if (!jsonMatch) {
        throw new Error("Could not extract JSON from response");
      }
      
      const jsonResponse = JSON.parse(jsonMatch[0]);
      
      // Extract and validate fields
      // Add explicit type annotation to ensure TypeScript knows this is a boolean
    const isValid: boolean = typeof jsonResponse.isValid === 'string' 
    ? jsonResponse.isValid.toLowerCase() === 'true'
    : Boolean(jsonResponse.isValid);
      const score = Number(jsonResponse.score);
      const summary = jsonResponse.summary || "No summary provided";
      
      // Handle optional fields
      let marketType: MarketType | undefined;
      if (jsonResponse.marketType === "TimeBound") {
        marketType = MarketType.TimeBound;
      } else if (jsonResponse.marketType === "OpenEnded") {
        marketType = MarketType.OpenEnded;
      }
      
      let suggestedEndDate: Date | undefined;
      if (jsonResponse.suggestedEndDate) {
        try {
          suggestedEndDate = new Date(jsonResponse.suggestedEndDate);
        } catch (e) {
          console.warn("Could not parse suggested end date", e);
        }
      }
      
      return {
        isValid,
        score: isNaN(score) ? 50 : score, // Default to 50 if not a number
        summary,
        marketType,
        suggestedEndDate
      };
    } catch (error) {
      console.error("Error parsing validation response:", error);
      console.log("Raw response:", responseText);
      
      // Return a fallback parsed response
      return this.createFallbackResponse(market, error);
    }
  }

  // Perform local validation without using the API
  private performLocalValidation(market: MarketValidationRequest, error?: any): MarketValidationResult {
    console.log("Performing local validation for market:", market.question);
    
    // Check for basic market quality criteria
    const hasQuestion = Boolean(market.question?.trim());
    const questionLength = market.question?.trim().length || 0;
    const hasDescription = Boolean(market.description?.trim());
    const descriptionLength = market.description?.trim().length || 0;
    const hasMultipleOutcomes = (market.outcomes?.length || 0) >= 2;
    const hasEndDate = Boolean(market.endDate);
    
    // Calculate a score based on these factors
    let score = 0;
    let reasons = [];
    
    // Question quality (0-30 points)
    if (questionLength >= 50) score += 30;
    else if (questionLength >= 30) score += 20;
    else if (questionLength >= 15) score += 10;
    else reasons.push("Question is too short");
    
    // Description quality (0-20 points)
    if (descriptionLength >= 100) score += 20;
    else if (descriptionLength >= 50) score += 15;
    else if (descriptionLength > 0) score += 10;
    else reasons.push("Missing or short description");
    
    // Outcomes (0-25 points)
    if (hasMultipleOutcomes) {
      if (market.outcomes!.length === 2 && 
          market.outcomes!.includes("Yes") && 
          market.outcomes!.includes("No")) {
        score += 25; // Yes/No questions are clear
      } else {
        score += 20; // Other outcome structures
      }
    } else {
      reasons.push("Needs at least two possible outcomes");
    }
    
    // End date (0-25 points)
    if (hasEndDate) {
      const now = new Date();
      const endDate = new Date(market.endDate!);
      const daysUntilEnd = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysUntilEnd < 0) {
        reasons.push("End date is in the past");
      } else if (daysUntilEnd > 365 * 2) {
        score += 15;
        reasons.push("Very distant end date (over 2 years)");
      } else if (daysUntilEnd > 365) {
        score += 20;
      } else if (daysUntilEnd >= 7) {
        score += 25;
      } else {
        score += 15;
        reasons.push("End date is very soon");
      }
    } else {
      reasons.push("Missing end date");
    }

    // Determine if the market is valid based on the score
    const isValid = score >= 60;
    
    // Generate a human-readable summary
    let summary = "";
    if (isValid) {
      summary = `This market meets basic validation criteria with a score of ${score}/100.`;
    } else {
      summary = `This market needs improvement (score: ${score}/100). Issues: ${reasons.join("; ")}.`;
    }
    
    // Add note if this was due to an error
    if (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isQuotaError = errorMessage.includes("quota") || 
                           errorMessage.includes("429") || 
                           errorMessage.includes("rate limit");
      
      if (isQuotaError) {
        summary = `API quota exceeded. ${summary} Consider upgrading your Gemini API plan for AI validation.`;
      } else {
        summary = `AI validation unavailable. ${summary}`;
      }
    }
    
    return {
      isValid,
      score,
      summary,
      marketType: MarketType.TimeBound,
      error: error ? (error instanceof Error ? error.message : String(error)) : undefined
    };
  }

  // Create a fallback validation response when the API or parsing fails
  private createFallbackResponse(market: MarketValidationRequest, error: any): MarketValidationResult {
    // Use the local validation as the fallback
    return this.performLocalValidation(market, error);
  }
}

// Singleton instance for use throughout the application
export const aiValidationService = new AIValidationService();