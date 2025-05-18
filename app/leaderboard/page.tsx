"use client";

import { useReducer, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence  } from '@/components/motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LeaderboardHeader from '../../components/leaderboard/LeaderboardHeader';
import LeaderboardTable from '../../components/leaderboard/LeaderboardTable';
import WeeklyLeaderboardToggle from '../../components/leaderboard/WeeklyLeaderboardToggle';

// Define reducer types
type TimeFrame = 'all' | 'weekly' | 'monthly';

type LeaderboardState = {
  timeFrame: TimeFrame;
  isLoading: boolean;
  leaderboardData: any[];
  currentUserRank: number | null;
  error: string | null;
};

type LeaderboardAction =
  | { type: 'SET_TIME_FRAME'; payload: TimeFrame }
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: { data: any[]; userRank: number | null } }
  | { type: 'FETCH_ERROR'; payload: string };

const initialState: LeaderboardState = {
  timeFrame: 'all',
  isLoading: true,
  leaderboardData: [],
  currentUserRank: null,
  error: null
};

function leaderboardReducer(state: LeaderboardState, action: LeaderboardAction): LeaderboardState {
  switch (action.type) {
    case 'SET_TIME_FRAME':
      return {
        ...state,
        timeFrame: action.payload
      };
    case 'FETCH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        leaderboardData: action.payload.data,
        currentUserRank: action.payload.userRank,
        error: null
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    default:
      return state;
  }
}

export default function LeaderboardPage() {
  const [state, dispatch] = useReducer(leaderboardReducer, initialState);
  const { timeFrame, isLoading, leaderboardData, currentUserRank, error } = state;
  const fetchController = useRef<AbortController | null>(null);

  // Generate mock leaderboard data for different timeframes - memoized to avoid recreation
  const generateMockLeaderboardData = useCallback((timeFrame: string) => {
    const data = [];
    const baseAccuracy = timeFrame === 'weekly' ? 75 : timeFrame === 'monthly' ? 70 : 65;
    const basePredictions = timeFrame === 'weekly' ? 12 : timeFrame === 'monthly' ? 35 : 120;
    
    for (let i = 0; i < 100; i++) {
      // Add some randomness to the data but use a deterministic seed per index
      // to avoid unnecessary re-renders with changing random values
      const seed = i * 0.1;
      const accuracyVariance = (Math.sin(seed) + 1) * 7.5 - 5; // -5 to +10
      const predictionsVariance = Math.floor((Math.cos(seed) + 1) * 10) - 5; // -5 to +15
      const winningsMultiplier = (100 - i) / 30 + Math.sin(seed); // Decreases as rank goes down

      data.push({
        rank: i + 1,
        walletAddress: `wallet_${(10000 + i).toString(16)}`,
        accuracy: Math.min(99, Math.max(50, baseAccuracy + accuracyVariance - (i * 0.2))),
        predictionsMade: Math.max(5, basePredictions + predictionsVariance - Math.floor(i / 5)),
        winnings: Number(((100 - i) * winningsMultiplier).toFixed(1))
      });
    }
    
    return data;
  }, []);

  // Fetch leaderboard data based on selected timeframe
  const fetchLeaderboardData = useCallback(() => {
    // Cancel any in-flight requests
    if (fetchController.current) {
      fetchController.current.abort();
    }
    
    // Create new controller for this request
    fetchController.current = new AbortController();
    const signal = fetchController.current.signal;
    
    dispatch({ type: 'FETCH_START' });
    
    // Simulate API call with abort capability
    const timeoutId = setTimeout(() => {
      if (!signal.aborted) {
        try {
          const mockData = generateMockLeaderboardData(timeFrame);
          dispatch({
            type: 'FETCH_SUCCESS',
            payload: {
              data: mockData,
              userRank: 87 // Simulate finding the current user in the leaderboard
            }
          });
        } catch (err) {
          dispatch({
            type: 'FETCH_ERROR',
            payload: 'Failed to load leaderboard data. Please try again.'
          });
        }
      }
    }, 1000);
    
    return () => {
      clearTimeout(timeoutId);
      if (fetchController.current) {
        fetchController.current.abort();
      }
    };
  }, [timeFrame, generateMockLeaderboardData]);
  
  // Handle time frame change
  const handleTimeFrameChange = useCallback((newTimeFrame: TimeFrame) => {
    dispatch({ type: 'SET_TIME_FRAME', payload: newTimeFrame });
  }, []);
  
  // Fetch data when timeFrame changes
  useEffect(() => {
    const cleanup = fetchLeaderboardData();
    return cleanup;
  }, [fetchLeaderboardData]);

  // Memoized motion variants for animations
  const fadeIn = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }), []);
  
  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#F5F5F5]">
      <Navbar />
      
      <motion.main
        className="container mx-auto px-4 py-10 max-w-5xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LeaderboardHeader 
          timeFrame={timeFrame}
          userRank={currentUserRank}
        />
        
        <WeeklyLeaderboardToggle 
          activeTab={timeFrame} 
          onTabChange={handleTimeFrameChange} 
        />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={`${timeFrame}-${isLoading}`}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeIn}
          >
            {error && (
              <motion.div
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg my-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
                <button 
                  className="ml-2 underline" 
                  onClick={fetchLeaderboardData}
                >
                  Retry
                </button>
              </motion.div>
            )}
            <LeaderboardTable 
              data={leaderboardData} 
              isLoading={isLoading} 
              currentUserRank={currentUserRank}
            />
          </motion.div>
        </AnimatePresence>
      </motion.main>
      
      <Footer />
    </div>
  );
}