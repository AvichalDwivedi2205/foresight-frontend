"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion  } from '@/components/motion';
import { useInView } from "react-intersection-observer";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
        scrolled ? "bg-[#0E0E10]/90 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <nav className="flex justify-between items-center max-w-7xl mx-auto">
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7] flex items-center justify-center">
            <span className="font-bold text-white">FP</span>
          </div>
          <span className="font-bold text-xl">Foresight Protocol</span>
        </motion.div>
        
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="#how-it-works">How It Works</NavLink>
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#markets">Markets</NavLink>
          <NavLink href="#about">About</NavLink>
        </div>
        
        <div className="flex items-center gap-4">
          <motion.button
            className="hidden md:block px-4 py-2 rounded-full border border-[#13ADC7] text-[#13ADC7] hover:bg-[#13ADC7]/10 transition-all"
            whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(19, 173, 199, 0.5)" }}
            whileTap={{ scale: 0.98 }}
          >
            Explore Markets
          </motion.button>
          
          <motion.button
            className="px-4 py-2 rounded-full bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7] hover:opacity-90 text-white font-medium transition-all"
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(95, 111, 255, 0.6)" }}
            whileTap={{ scale: 0.98 }}
          >
            Connect Wallet
          </motion.button>
          
          <button className="md:hidden text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </nav>
    </motion.header>
  );
};

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <motion.a
      href={href}
      className="text-white/80 hover:text-white relative"
      whileHover={{ scale: 1.1 }}
    >
      <span>{children}</span>
      <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#13ADC7] transform scale-x-0 transition-transform origin-left hover:scale-x-100 duration-300"></span>
    </motion.a>
  );
};

// Hero Section
const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 px-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-[#5F6FFF]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-[#13ADC7]/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>
      </div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="flex flex-col gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="inline-flex gap-2 items-center mb-2"
              variants={fadeIn}
            >
              <span className="bg-[#5F6FFF]/20 text-[#5F6FFF] px-3 py-1 rounded-full text-sm font-medium">
                Built on Solana
              </span>
              <span className="bg-[#13ADC7]/20 text-[#13ADC7] px-3 py-1 rounded-full text-sm font-medium">
                AI-powered
              </span>
            </motion.div>
            
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-[#5F6FFF] to-[#13ADC7] animate-gradient"
              variants={fadeIn}
            >
              Forecast the Future.<br />Stake Your Belief.
            </motion.h1>
            
            <motion.p
              className="text-white/80 text-lg md:text-xl max-w-xl"
              variants={fadeIn}
            >
              The first decentralized prediction market protocol with AI-powered validation and real-time results summarization.
            </motion.p>
            
            <motion.div
              className="flex flex-wrap gap-4 mt-2"
              variants={fadeIn}
            >
              <motion.button
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7] hover:opacity-90 text-white font-medium text-lg glow-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Connect Wallet
              </motion.button>
              
              <motion.button
                className="px-6 py-3 rounded-full border border-[#5F6FFF] text-white hover:bg-[#5F6FFF]/10 transition-all font-medium text-lg"
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(95, 111, 255, 0.4)" }}
                whileTap={{ scale: 0.98 }}
              >
                Explore Markets
              </motion.button>
            </motion.div>
            
            <motion.p
              className="text-white/60 text-sm mt-4"
              variants={fadeIn}
            >
              Over $2M in prediction market volume • 10,000+ active users
            </motion.p>
          </motion.div>
          
          <motion.div
            className="relative h-[400px] lg:h-[500px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <motion.div 
              className="absolute w-full h-full flex items-center justify-center animate-float"
            >
              <Image
                src="/globe.svg"
                alt="Animated data globe"
                width={500}
                height={500}
                className="object-contain"
                priority
              />
              
              {/* Orbiting elements */}
              <motion.div
                className="absolute w-10 h-10 rounded-full bg-[#5F6FFF]/30 backdrop-blur-sm flex items-center justify-center"
                animate={{
                  x: [0, 120, 0, -120, 0],
                  y: [-120, 0, 120, 0, -120],
                  transition: { repeat: Infinity, duration: 15, ease: "linear" }
                }}
              >
                <span className="text-white text-xs">AI</span>
              </motion.div>
              
              <motion.div
                className="absolute w-12 h-12 rounded-full bg-[#13ADC7]/30 backdrop-blur-sm flex items-center justify-center"
                animate={{
                  x: [0, -150, 0, 150, 0],
                  y: [150, 0, -150, 0, 150],
                  transition: { repeat: Infinity, duration: 20, ease: "linear" }
                }}
              >
                <span className="text-white text-xs">SOL</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <span className="text-white/50 text-sm">Scroll to explore</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="white" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>
    </section>
  );
};

// How It Works Section with animation
const HowItWorksSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.2
  });
  
  const steps = [
    {
      icon: "🧙",
      title: "Create or Join Prediction Markets",
      description: "Create markets for future events or join existing ones. From crypto prices to election outcomes."
    },
    {
      icon: "💰",
      title: "Stake Tokens on Outcomes",
      description: "Put your knowledge to work. Stake tokens on outcomes you're confident about."
    },
    {
      icon: "🚀",
      title: "Win Based on Real Outcomes",
      description: "Earn rewards when your predictions are correct. Verified by AI and on-chain data."
    }
  ];
  
  return (
    <section id="how-it-works" className="py-20 px-4 overflow-hidden" ref={ref}>
      <div className="container mx-auto max-w-7xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-white/70 max-w-2xl mx-auto">The future of prediction markets, combining decentralized finance with AI-powered validation and analysis.</p>
        </motion.div>
        
        <div className="flex flex-col md:flex-row gap-6 md:gap-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="bg-[#181820] p-6 md:p-8 rounded-2xl flex-1 border border-white/5 hover:border-[#5F6FFF]/40 transition-all relative group"
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -5, boxShadow: "0 10px 30px -15px rgba(95, 111, 255, 0.3)" }}
            >
              <div className="absolute -right-2 -top-2 w-10 h-10 bg-[#0E0E10] rounded-full border border-white/10 flex items-center justify-center">
                <span className="font-bold text-[#13ADC7]">{index + 1}</span>
              </div>
              
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-[#5F6FFF] transition-colors">{step.title}</h3>
              <p className="text-white/70">{step.description}</p>
              
              <div className="h-1 w-12 bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7] mt-6 rounded-full group-hover:w-16 transition-all"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Features Section
const FeaturesSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1
  });
  
  const features = [
    {
      icon: "💡",
      title: "AI-Powered Market Validation",
      description: "Neural networks validate market outcomes by analyzing multiple data sources for fair and transparent settlements."
    },
    {
      icon: "⚖️",
      title: "On-Chain Settlement",
      description: "All transactions and outcomes are recorded on Solana blockchain, ensuring maximum transparency and immutability."
    },
    {
      icon: "🎯",
      title: "Gamified Leaderboard UX",
      description: "Compete with other predictors, earn badges, and climb the global leaderboard as you improve your forecasting skills."
    },
    {
      icon: "🔮",
      title: "Collective Forecasting Community",
      description: "Tap into the wisdom of crowds with sentiment analysis and community insights on every prediction market."
    }
  ];

  return (
    <section id="features" className="py-20 px-4 bg-[#0A0A0C]" ref={ref}>
      <div className="container mx-auto max-w-7xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Features</h2>
          <p className="text-white/70 max-w-2xl mx-auto">Powered by cutting-edge technology to create the most reliable prediction markets.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-gradient-to-br from-[#181820] to-[#14141A] p-6 rounded-2xl border border-white/5 relative group"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -5, boxShadow: "0 10px 30px -15px rgba(19, 173, 199, 0.4)" }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-[#13ADC7] transition-colors">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
              
              {/* Subtle glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#5F6FFF]/0 to-[#13ADC7]/0 group-hover:from-[#5F6FFF]/10 group-hover:to-[#13ADC7]/10 transition-all pointer-events-none"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Markets Section with skeleton loading
const MarketsSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1
  });
  
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const markets = [
    {
      title: "Will ETH hit $5,000 before May 15, 2025?",
      category: "Crypto",
      outcomes: ["Yes", "No"],
      poolSize: "342.5K SOL",
      timeLeft: "3d 8h",
      yesPercentage: 72
    },
    {
      title: "Will Apple release AR glasses in 2025?",
      category: "Tech",
      outcomes: ["Yes", "No"],
      poolSize: "187.2K SOL",
      timeLeft: "10d 4h",
      yesPercentage: 45
    },
    {
      title: "Will BTC reach $100K in 2025?",
      category: "Crypto",
      outcomes: ["Yes", "No"],
      poolSize: "512.8K SOL",
      timeLeft: "23d 12h",
      yesPercentage: 85
    },
    {
      title: "Will SpaceX reach Mars before 2030?",
      category: "Space",
      outcomes: ["Yes", "No"],
      poolSize: "298.4K SOL",
      timeLeft: "60d 0h",
      yesPercentage: 63
    }
  ];

  return (
    <section id="markets" className="py-20 px-4" ref={ref}>
      <div className="container mx-auto max-w-7xl">
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Active Markets</h2>
            <p className="text-white/70">Explore and stake on trending prediction markets</p>
          </div>
          
          <motion.button
            className="px-4 py-2 rounded-full bg-[#13ADC7] text-white font-medium"
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(19, 173, 199, 0.4)" }}
            whileTap={{ scale: 0.98 }}
          >
            View All Markets
          </motion.button>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            // Skeleton loaders
            Array(4).fill(0).map((_, index) => (
              <div 
                key={index} 
                className="bg-[#181820] p-6 rounded-2xl border border-white/5 animate-pulse"
              >
                <div className="h-4 w-2/3 bg-white/10 rounded mb-4"></div>
                <div className="h-6 w-5/6 bg-white/10 rounded mb-6"></div>
                <div className="flex justify-between mb-6">
                  <div className="h-4 w-24 bg-white/10 rounded"></div>
                  <div className="h-4 w-16 bg-white/10 rounded"></div>
                </div>
                <div className="h-10 w-full bg-white/10 rounded-full mb-4"></div>
                <div className="h-10 w-full bg-white/10 rounded-full"></div>
              </div>
            ))
          ) : (
            markets.map((market, index) => (
              <motion.div
                key={index}
                className="bg-[#181820] p-6 rounded-2xl border border-white/5 hover:border-[#13ADC7]/30 transition-all relative group"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 10px 30px -15px rgba(19, 173, 199, 0.3)" }}
              >
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-[#13ADC7] font-medium">{market.category}</span>
                  <span className="text-sm text-white/50">{market.timeLeft} left</span>
                </div>
                
                <h3 className="text-xl font-bold mb-4 group-hover:text-[#13ADC7] transition-colors">{market.title}</h3>
                
                <div className="flex justify-between mb-4">
                  <span className="text-white/70">Pool size</span>
                  <span className="font-medium">{market.poolSize}</span>
                </div>
                
                <div className="mb-4">
                  <div className="h-2 w-full bg-white/10 rounded-full mb-2">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7] rounded-full"
                      style={{ width: `${market.yesPercentage}%` }}
                      initial={{ width: 0 }}
                      animate={inView ? { width: `${market.yesPercentage}%` } : { width: 0 }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                    ></motion.div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Yes: {market.yesPercentage}%</span>
                    <span>No: {100 - market.yesPercentage}%</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    className="px-4 py-3 rounded-full bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7]/80 text-white font-medium"
                    whileHover={{ scale: 1.03, boxShadow: "0 0 15px rgba(95, 111, 255, 0.3)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Stake Yes
                  </motion.button>
                  
                  <motion.button
                    className="px-4 py-3 rounded-full border border-white/20 hover:border-white/40 text-white font-medium"
                    whileHover={{ scale: 1.03, boxShadow: "0 0 15px rgba(255, 255, 255, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Stake No
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

// Trust & Stack Section
const TrustSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1
  });
  
  const technologies = [
    { name: "Solana", logo: "/vercel.svg" },
    { name: "OpenAI", logo: "/vercel.svg" },
    { name: "Anchor", logo: "/vercel.svg" },
    { name: "FastAPI", logo: "/vercel.svg" },
    { name: "Gemini", logo: "/vercel.svg" },
  ];

  return (
    <section id="about" className="py-20 px-4 bg-[#0A0A0C] relative overflow-hidden" ref={ref}>
      {/* Radar glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-30 pointer-events-none">
        <div className="absolute inset-0 rounded-full border border-[#5F6FFF]/20"></div>
        <div className="absolute inset-4 rounded-full border border-[#5F6FFF]/15 animate-pulse"></div>
        <div className="absolute inset-8 rounded-full border border-[#5F6FFF]/10 animate-pulse" style={{ animationDelay: "300ms" }}></div>
        <div className="absolute inset-12 rounded-full border border-[#5F6FFF]/5 animate-pulse" style={{ animationDelay: "600ms" }}></div>
      </div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built For The Future</h2>
          <p className="text-white/70 max-w-2xl mx-auto">Powered by cutting-edge technology for speed, scale, and intelligence</p>
        </motion.div>
        
        <motion.div 
          className="flex flex-wrap justify-center gap-8 md:gap-12"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {technologies.map((tech, index) => (
            <motion.div
              key={index}
              className="text-center group"
              variants={fadeIn}
              whileHover={{ y: -5 }}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#181820] rounded-xl flex items-center justify-center mb-3 group-hover:glow-primary transition-all">
                <Image 
                  src={tech.logo} 
                  alt={tech.name} 
                  width={40} 
                  height={40}
                  className="opacity-70 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <p className="text-white/70 group-hover:text-white transition-colors">{tech.name}</p>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="mt-20 bg-gradient-to-br from-[#181820] to-[#14141A] p-8 rounded-2xl border border-white/5 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7] flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.2 5.2L8.8 16.6L3.8 11.6L2.4 13L8.8 19.4L21.6 6.6L20.2 5.2Z" fill="white"/>
              </svg>
            </div>
            
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Security & Reliability</h3>
              <p className="text-white/70">Foresight Protocol is audited by leading security firms, with funds secured in non-custodial smart contracts, ensuring maximum safety of your assets.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Footer component
const Footer = () => {
  return (
    <footer className="bg-[#0E0E10] border-t border-white/5 pt-12 pb-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7] flex items-center justify-center">
                <span className="font-bold text-white">FP</span>
              </div>
              <span className="font-bold text-xl">Foresight Protocol</span>
            </div>
            
            <p className="text-white/70 mb-6 max-w-md">
              A decentralized prediction market protocol built on Solana, combining AI-powered validation with on-chain settlement for forecasting the future.
            </p>
            
            <div className="flex gap-4">
              <SocialButton href="https://twitter.com" aria="Twitter">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 5.8a8.5 8.5 0 0 1-2.4.7 4.2 4.2 0 0 0 1.9-2.4c-.9.5-1.8.9-2.8 1a4.3 4.3 0 0 0-7.3 3.9A12 12 0 0 1 2.8 4.3a4.3 4.3 0 0 0 1.3 5.7 4.2 4.2 0 0 1-1.9-.5v.1a4.3 4.3 0 0 0 3.4 4.2 4.2 4.2 0 0 1-1.9 0 4.3 4.3 0 0 0 4 3 8.5 8.5 0 0 1-5.3 1.8c-.3 0-.7 0-1-.1A12 12 0 0 0 7.5 21c8.4 0 13-7 13-13v-.6c.9-.6 1.6-1.4 2.2-2.3l-.1-.3Z" />
                </svg>
              </SocialButton>
              
              <SocialButton href="https://github.com" aria="GitHub">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 0 0-3.2 19.4.5.5 0 0 0 .7-.5v-1.7C6.8 20 6 18 6 18c-.6-1.6-1.5-2-1.5-2-.9-.7 0-.7 0-.7 1 0 1.6 1 1.6 1 .9 1.6 2.4 1.1 3 .9 0-.7.3-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7 0-.3-.4-1.3.1-2.7 0 0 .8-.2 2.7 1a9.4 9.4 0 0 1 5 0c1.8-1.2 2.6-1 2.6-1 .6 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .3.3.6 1 .6 1.9V21a.5.5 0 0 0 .7.5A10 10 0 0 0 12 2Z" />
                </svg>
              </SocialButton>
              
              <SocialButton href="https://discord.com" aria="Discord">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.3 4.4c-1.5-.7-3.1-1.2-4.8-1.5l-.2.5c-1.5-.3-3-.3-4.6 0l-.2-.5A17 17 0 0 0 5.7 4.4a18 18 0 0 0-3.6 14.4 17 17 0 0 0 5.3 2.7l.4-.7c-.7-.3-1.4-.6-2-1l.2-.1c.2 0 .3.1.4.2a12 12 0 0 0 10.4 0l.4-.2c.1 0 0 0 0 0-.7.4-1.3.7-2.1 1l.4.7c1.9-.6 3.7-1.5 5.3-2.7A17.9 17.9 0 0 0 20.3 4.4ZM8.5 15.5a2 2 0 0 1 0-4 2 2 0 0 1 0 4Zm7 0a2 2 0 0 1 0-4 2 2 0 0 1 0 4Z" />
                </svg>
              </SocialButton>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Resources</h4>
            <ul className="space-y-2">
              <FooterLink href="/docs">Documentation</FooterLink>
              <FooterLink href="/api">API</FooterLink>
              <FooterLink href="/whitepaper">Whitepaper</FooterLink>
              <FooterLink href="/faq">FAQ</FooterLink>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Company</h4>
            <ul className="space-y-2">
              <FooterLink href="/about">About</FooterLink>
              <FooterLink href="/team">Team</FooterLink>
              <FooterLink href="/blog">Blog</FooterLink>
              <FooterLink href="/careers">Careers</FooterLink>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-white/50 text-sm gap-4">
          <p>© 2025 Foresight Protocol. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/cookies" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
        
        {/* Back to top button */}
        <motion.a
          href="#"
          className="fixed bottom-8 right-8 w-10 h-10 bg-[#5F6FFF] rounded-full flex items-center justify-center z-30"
          whileHover={{ y: -3, boxShadow: "0 0 15px rgba(95, 111, 255, 0.5)" }}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.a>
      </div>
    </footer>
  );
};

const SocialButton = ({ children, href, aria }: { children: React.ReactNode; href: string; aria: string }) => {
  return (
    <motion.a 
      href={href}
      className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label={aria}
    >
      {children}
    </motion.a>
  );
};

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <li>
      <motion.a 
        href={href}
        className="text-white/70 hover:text-white transition-colors"
        whileHover={{ x: 3 }}
      >
        {children}
      </motion.a>
    </li>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0E0E10] text-white overflow-hidden">
      <Header />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <MarketsSection />
      <TrustSection />
      <Footer />
    </div>
  );
}
