import { useMemo } from "react";
import { useWallet } from "./wallet-provider";
import { useConnection } from "./connection";
import { useToast } from "./hooks/useToast";
import { useQuery, useMutation } from "@tanstack/react-query";

// Simplified achievement system without NFTs
export function useAchievements() {
  const { publicKey, connected } = useWallet();
  const { showToast } = useToast();

  // Mock achievements data - this would normally come from NFTs
  const mockAchievements = [
    {
      id: "first-prediction",
      name: "First Prediction",
      description: "Made your first prediction on the platform",
      image: "/images/achievements/first-prediction.png",
    },
    {
      id: "winning-streak",
      name: "Winning Streak",
      description: "Won 3 predictions in a row",
      image: "/images/achievements/winning-streak.png",
    }
  ];

  // Fetch user's achievements (mocked)
  const { data: userAchievements, isLoading: isLoadingAchievements } = useQuery({
    queryKey: ["userAchievements", publicKey?.toString()],
    queryFn: async () => {
      // In a real implementation, this would fetch NFTs
      // This is just a mock that returns the first achievement for logged in users
      if (!publicKey) {
        return [];
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return [mockAchievements[0]];
    },
    enabled: !!publicKey && connected,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false
  });

  // Mock function to grant an achievement (would mint an NFT in the real implementation)
  const grantAchievement = async ({
    id,
    additionalData = {}
  }: {
    id: string;
    additionalData?: Record<string, any>;
  }) => {
    if (!publicKey) {
      showToast("Wallet not connected", "error");
      throw new Error("Wallet not connected");
    }

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find the achievement
      const achievement = mockAchievements.find(a => a.id === id);
      if (!achievement) {
        throw new Error(`Achievement ${id} not found`);
      }
      
      console.log(`Achievement granted: ${achievement.name}`, additionalData);
      
      return { success: true, achievement };
    } catch (error) {
      console.error("Error granting achievement:", error);
      showToast("Failed to grant achievement: " + (error as Error).message, "error");
      throw error;
    }
  };

  const grantAchievementMutation = useMutation<
    { success: boolean; achievement: typeof mockAchievements[0] },
    Error,
    {
      id: string;
      additionalData?: Record<string, any>;
    }
  >({
    mutationFn: grantAchievement,
    onSuccess: ({ achievement }) => {
      showToast(`Achievement "${achievement.name}" granted!`, "success");
    },
    onError: (error) => {
      showToast(`Failed to grant achievement: ${error.message}`, "error");
    },
  });

  return {
    userAchievements,
    isLoadingAchievements,
    grantAchievement: grantAchievementMutation.mutate,
    isGranting: grantAchievementMutation.isPending,
  };
} 