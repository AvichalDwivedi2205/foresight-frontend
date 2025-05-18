"use client";

import { motion  } from '@/components/motion';

export default function HeroBanner() {
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-[#5F6FFF]/10 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-[#13ADC7]/10 rounded-full blur-[80px]"></div>
      </div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="flex flex-col items-center text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-[#5F6FFF] to-[#13ADC7]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Explore Prediction Markets
          </motion.h1>
          
          <motion.p 
            className="text-[#B0B0B0] max-w-xl text-lg mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Discover, stake, and track predictions across a variety of categories
          </motion.p>
          
          {/* Animated orbit visual */}
          <motion.div 
            className="relative w-24 h-24 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="absolute inset-0 rounded-full border-2 border-[#5F6FFF]/30 animate-pulse"></div>
            <div className="absolute inset-3 rounded-full border-2 border-[#13ADC7]/30"></div>
            <div className="absolute inset-6 rounded-full bg-gradient-to-r from-[#5F6FFF]/60 to-[#13ADC7]/60 glow-primary"></div>
            
            {/* Orbiting element */}
            <motion.div
              className="absolute w-4 h-4 bg-white rounded-full shadow-glow"
              animate={{
                x: [0, 20, 0, -20, 0],
                y: [-20, 0, 20, 0, -20],
              }}
              transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
            ></motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}