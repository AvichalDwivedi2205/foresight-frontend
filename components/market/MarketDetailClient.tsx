"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/lib/wallet-provider";
import { useIndexer } from "@/lib/indexer";
import { useAIService } from "@/lib/ai-service";
import { useToast } from "@/lib/hooks/useToast";
import MarketDetailsHeader from "@/components/market/MarketDetailsHeader";
import OutcomeOptions from "@/components/market/OutcomeOptions";
import StakeBox from "@/components/market/StakeBox";
import AISummaryPanel from "@/components/market/AISummaryPanel";
import StatsPanel from "@/components/market/StatsPanel";
import StakersList from "@/components/market/StakersList";
import ClaimRewardBox from "@/components/market/ClaimRewardBox";
import MarketSkeleton from "@/components/market/MarketSkeleton";
import { useMarketData } from "@/lib/hooks/useMarketData";
import { useUserPredictions } from "@/lib/hooks/useUserPredictions";

export default function MarketDetailClient({ marketId }: { marketId: string }) {
  const { showToast } = useToast();
  const { publicKey, connected, sendTransaction } = useWallet();
  const { invalidateUserData } = useIndexer();
  const { generateMarketSummary } = useAIService();
  
  // Use our custom hooks instead of directly using useIndexer
  const { market, isLoading: marketLoading, error: marketError, refetch: refetchMarket } = useMarketData({ marketId });
  const { predictions, hasPrediction, getPrediction } = useUserPredictions();
  
  // Local state for UI
  const [selectedOutcome, setSelectedOutcome] = useState<number | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [aiSummary, setAiSummary] = useState<string>("");
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  const [isStaking, setIsStaking] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  
  // Get user's prediction for this market
  const userPrediction = useMemo(() => {
    if (!connected || !publicKey) return null;
    return getPrediction(marketId);
  }, [connected, publicKey, getPrediction, marketId]);
  
  // Check if user can claim reward
  const canClaimReward = useMemo(() => {
    if (!market || !userPrediction) return false;
    
    return (
      market.resolved && 
      market.winning_outcome !== undefined && 
      userPrediction.outcome_index === market.winning_outcome && 
      !userPrediction.claimed
    );
  }, [market, userPrediction]);
  
  // Time left calculation
  const timeLeft = useMemo(() => {
    if (!market) return "";
    
    const now = Date.now();
    const deadline = market.deadline;
    
    if (deadline <= now) {
      return "Ended";
    }
    
    const diff = deadline - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h`;
  }, [market]);
  
  // Market status
  const marketStatus = useMemo(() => {
    if (!market) return "unknown";
    
    if (market.resolved) return "resolved";
    if (market.deadline < Date.now()) return "expired";
    return "active";
  }, [market]);
  
  // Fetch AI summary when market data loads
  useEffect(() => {
    if (market) {
      const fetchSummary = async () => {
        setSummaryLoading(true);
        try {
          const summary = await generateMarketSummary({
            marketQuestion: market.question,
            description: "", // This would come from market description if available
            outcomes: market.outcomes,
            total_pool: market.total_pool,
            resolved: market.resolved,
            winning_outcome: market.winning_outcome
          });
          setAiSummary(summary);
        } catch (error) {
          console.error("Error fetching AI summary:", error);
          setAiSummary("Unable to generate market summary. Please check back later.");
        } finally {
          setSummaryLoading(false);
        }
      };
      
      fetchSummary();
    }
  }, [market, generateMarketSummary]);

  const handleOutcomeChange = (outcomeIndex: number) => {
    setSelectedOutcome(outcomeIndex);
  };

  const handleStakeAmountChange = (amount: string) => {
    setStakeAmount(amount);
  };

  const handleStakeSubmit = async () => {
    if (!connected) {
      showToast("Please connect your wallet first", "warning");
      return;
    }
    
    if (selectedOutcome === null || !stakeAmount) {
      showToast("Please select an outcome and enter an amount", "warning");
      return;
    }
    
    if (!market) {
      showToast("Market data not available", "error");
      return;
    }
    
    try {
      setIsStaking(true);
      
      // In production, this would create and send the actual Solana transaction
      // using anchor and the smart contract program
      
      // For demo purposes, we'll use a mock transaction
      showToast("Submitting your prediction...", "info");
      
      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success
      showToast(`Successfully staked ${stakeAmount} SOL on outcome: ${market.outcomes[selectedOutcome]}`, "success");
      
      // Reset form
      setSelectedOutcome(null);
      setStakeAmount("");
      
      // Refresh user predictions
      if (publicKey) {
        invalidateUserData(publicKey.toString());
      }
      
      // Refresh market data
      refetchMarket();
      
    } catch (error) {
      console.error("Staking error:", error);
      showToast("Failed to submit your prediction. Please try again.", "error");
    } finally {
      setIsStaking(false);
    }
  };

  // Handle claim reward
  const handleClaimReward = async () => {
    if (!connected) {
      showToast("Please connect your wallet first", "warning");
      return;
    }
    
    if (!market || !userPrediction) {
      showToast("Market or prediction data not available", "error");
      return;
    }
    
    try {
      setIsClaiming(true);
      
      // In production, this would create and send the actual Solana transaction
      showToast("Claiming your reward...", "info");
      
      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Calculate reward amount (this would be done by the smart contract)
      const userStake = userPrediction.amount;
      const winningPool = market.stakes_per_outcome[market.winning_outcome!];
      const totalPool = market.total_pool;
      
      const rewardShare = userStake / winningPool;
      const estimatedReward = rewardShare * totalPool * 0.98; // Accounting for fees
      
      // Success
      showToast(`Successfully claimed ${(estimatedReward / 1e9).toFixed(2)} SOL!`, "success");
      
      // Refresh user predictions
      if (publicKey) {
        invalidateUserData(publicKey.toString());
      }
      
      // Refresh market data
      refetchMarket();
      
    } catch (error) {
      console.error("Claim reward error:", error);
      showToast("Failed to claim your reward. Please try again.", "error");
    } finally {
      setIsClaiming(false);
    }
  };

  // Show loading state
  if (marketLoading) {
    return <MarketSkeleton />;
  }

  // Show error state
  if (marketError || !market) {
    return (
      <div className="container mx-auto px-4 max-w-7xl py-16 text-center">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Market</h2>
        <p className="text-white/70 mb-6">
          Unable to load market details. This market may not exist or there could be a network issue.
        </p>
        <button 
          onClick={() => refetchMarket()}
          className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Format outcomes for UI
  const formattedOutcomes = market.outcomes.reduce((acc, outcome, index) => {
    const stakePercentage = market.total_pool > 0 
      ? (market.stakes_per_outcome[index] / market.total_pool) * 100 
      : 0;
    
    acc[outcome] = parseFloat(stakePercentage.toFixed(1));
    return acc;
  }, {} as Record<string, number>);

  return (
    <AnimatePresence>
      <motion.div
        className="container mx-auto px-4 max-w-7xl py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <MarketDetailsHeader
          title={market.question}
          description="" // This would come from market description if available
          creator={market.creator}
          createdAt={new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toLocaleDateString()} // Mocked for now
          endDate={new Date(market.deadline).toLocaleDateString()}
          category={market.market_type === 0 ? "Time-bound" : "Open-ended"}
          status={marketStatus}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <StatsPanel
              poolSize={`${(market.total_pool / 1e9).toLocaleString()} SOL`}
              stakerCount={userPrediction ? 1 : 0} // This should be actual count from blockchain
              timeLeft={timeLeft}
              outcomes={formattedOutcomes}
            />

            <AISummaryPanel 
              summary={aiSummary} 
              isLoading={summaryLoading} 
            />

            <StakersList 
              stakers={[
                // Mock data - in production, this would be fetched from the blockchain
                { address: "0x3Fb...B6a2", amount: "12.4K SOL", outcome: market.outcomes[0] },
                { address: "0x8Dc...9F3e", amount: "8.6K SOL", outcome: market.outcomes[1] },
                { address: market.creator.substring(0, 6) + "..." + market.creator.substring(market.creator.length - 4), 
                  amount: "6.2K SOL", outcome: market.outcomes[0] }
              ]} 
            />
          </div>

          <div className="lg:col-span-1 space-y-8">
            {marketStatus === "active" && (
              <>
                <OutcomeOptions
                  outcomes={formattedOutcomes}
                  selectedOutcome={selectedOutcome}
                  onOutcomeChange={handleOutcomeChange}
                  outcomeLabels={market.outcomes}
                  userPrediction={userPrediction ? {
                    outcome: userPrediction.outcome_index,
                    amount: userPrediction.amount / 1e9
                  } : undefined}
                  disabled={!!userPrediction}
                />

                <StakeBox
                  stakeAmount={stakeAmount}
                  onStakeAmountChange={handleStakeAmountChange}
                  onSubmit={handleStakeSubmit}
                  isSubmitDisabled={!connected || selectedOutcome === null || !stakeAmount || !!userPrediction}
                  isLoading={isStaking}
                />
              </>
            )}

            {canClaimReward && (
              <ClaimRewardBox
                userHasWon={true}
                winningOutcome={market.outcomes[market.winning_outcome!]}
                rewardAmount={`${((userPrediction!.amount / market.stakes_per_outcome[market.winning_outcome!]) * market.total_pool / 1e9).toFixed(2)} SOL`}
                onClaim={handleClaimReward}
                isLoading={isClaiming}
              />
            )}
            
            {marketStatus === "resolved" && !canClaimReward && (
              <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700">
                <h3 className="text-xl font-semibold mb-3">Market Resolved</h3>
                <p className="text-white/80">
                  This market has been resolved with the outcome: <span className="font-bold text-green-400">{market.outcomes[market.winning_outcome!]}</span>
                </p>
                {userPrediction && userPrediction.outcome_index !== market.winning_outcome && (
                  <p className="mt-3 text-red-400">
                    Your prediction was incorrect. Better luck next time!
                  </p>
                )}
                {userPrediction && userPrediction.claimed && (
                  <p className="mt-3 text-green-400">
                    You have already claimed your reward for this market.
                  </p>
                )}
                {!userPrediction && (
                  <p className="mt-3 text-white/60">
                    You did not participate in this market.
                  </p>
                )}
              </div>
            )}
            
            {marketStatus === "expired" && (
              <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700">
                <h3 className="text-xl font-semibold mb-3">Market Expired</h3>
                <p className="text-white/80">
                  This market has expired but has not been resolved yet. Resolution is pending.
                </p>
                {userPrediction && (
                  <p className="mt-3 text-yellow-400">
                    You predicted: <span className="font-bold">{market.outcomes[userPrediction.outcome_index]}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}