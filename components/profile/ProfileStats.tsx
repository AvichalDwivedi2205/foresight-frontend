"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useAnimation, animate  } from '@/components/motion';

interface ProfileStatsProps {
  stats: {
    accuracy: number;
    totalStaked: number;
    totalEarned: number;
    predictionsMade: number;
  };
}

export default function ProfileStats({ stats }: ProfileStatsProps) {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  // Start animation when component comes into view
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);
  
  // Number counter animation
  const CounterAnimation = ({ value, prefix = '', suffix = '', decimals = 0 }: { 
    value: number, 
    prefix?: string, 
    suffix?: string,
    decimals?: number
  }) => {
    const [displayValue, setDisplayValue] = useState(0);
    
    useEffect(() => {
      let animation: any;
      if (isInView) {
        animation = animate(0, value, {
          duration: 1,
          ease: "easeOut",
          onUpdate: (latest) => {
            if (decimals > 0) {
              setDisplayValue(parseFloat(latest.toFixed(decimals)));
            } else {
              setDisplayValue(Math.floor(latest));
            }
          }
        });
      }
      return () => animation?.stop();
    }, [isInView, value, decimals]);

    return (
      <motion.span
        initial={{ opacity: 0 }}
        animate={controls}
        variants={{
          visible: {
            opacity: 1,
            transition: { duration: 0.5, delay: 0.2 }
          }
        }}
      >
        {prefix}
        {displayValue}
        {suffix}
      </motion.span>
    );
  };
  
  // Format stats for display
  const statItems = [
    {
      label: "Prediction Accuracy",
      value: stats.accuracy,
      prefix: "",
      suffix: "%",
      color: "from-green-400 to-emerald-500",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )
    },
    {
      label: "Total Staked",
      value: stats.totalStaked,
      prefix: "",
      suffix: " SOL",
      color: "from-indigo-400 to-purple-500", 
      decimals: 1,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      )
    },
    {
      label: "Total Earned",
      value: stats.totalEarned,
      prefix: "",
      suffix: " SOL",
      color: "from-amber-400 to-orange-500",
      decimals: 1,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )
    },
    {
      label: "Predictions Made",
      value: stats.predictionsMade,
      prefix: "",
      suffix: "",
      color: "from-blue-400 to-cyan-500",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
      )
    }
  ];

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      {statItems.map((stat, i) => (
        <motion.div
          key={stat.label}
          className="bg-[#151518] rounded-lg border border-white/10 p-4 hover:border-[#5F6FFF]/30 transition-colors relative overflow-hidden"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.4, delay: i * 0.1 }
            }
          }}
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {/* Background gradient */}
          <div className="absolute -right-10 -top-10 w-24 h-24 rounded-full bg-gradient-to-br opacity-10 blur-xl"
            style={{ 
              backgroundImage: `linear-gradient(to bottom right, ${stat.color.split(' ')[0].replace('from-', '')}, ${stat.color.split(' ')[1].replace('to-', '')})` 
            }} 
          />
          
          <div className="flex items-center mb-2">
            <div className={`p-1.5 rounded-full bg-gradient-to-br ${stat.color}`}>
              {stat.icon}
            </div>
            <h3 className="ml-2 text-sm text-[#B0B0B0]">{stat.label}</h3>
          </div>
          
          <div className="text-2xl font-bold">
            <CounterAnimation 
              value={stat.value} 
              prefix={stat.prefix} 
              suffix={stat.suffix} 
              decimals={stat.decimals}
            />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}