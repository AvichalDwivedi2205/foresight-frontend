"use client";

import { motion  } from '@/components/motion';

interface LeaderboardBadgeProps {
  rank: number;
}

export default function LeaderboardBadge({ rank }: LeaderboardBadgeProps) {
  // Get badge details based on rank
  const getBadgeDetails = () => {
    switch(rank) {
      case 1:
        return {
          emoji: '🥇',
          color: 'from-amber-400 to-yellow-500',
          pulseColor: 'rgba(251, 191, 36, 0.4)'
        };
      case 2:
        return {
          emoji: '🥈',
          color: 'from-slate-300 to-slate-400',
          pulseColor: 'rgba(203, 213, 225, 0.4)'
        };
      case 3:
        return {
          emoji: '🥉',
          color: 'from-amber-600 to-amber-700',
          pulseColor: 'rgba(217, 119, 6, 0.4)'
        };
      default:
        return {
          emoji: `${rank}`,
          color: 'from-gray-700 to-gray-800',
          pulseColor: 'rgba(55, 65, 81, 0.4)'
        };
    }
  };

  const { emoji, color, pulseColor } = getBadgeDetails();

  return (
    <motion.div className="relative">
      <motion.div
        className={`w-7 h-7 flex items-center justify-center font-bold bg-gradient-to-br ${color} rounded-full relative z-10`}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.1 }}
      >
        {emoji}
      </motion.div>
      
      {rank <= 3 && (
        <motion.div
          className="absolute inset-0 rounded-full z-0"
          style={{ boxShadow: `0 0 0 ${pulseColor}` }}
          animate={{
            boxShadow: [
              `0 0 0 0px ${pulseColor}`,
              `0 0 0 4px ${pulseColor}`,
              `0 0 0 8px transparent`
            ],
            scale: [0.9, 1.1, 1.2],
            opacity: [0.7, 0.5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  );
}