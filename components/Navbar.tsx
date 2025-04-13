"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const Navbar = () => {
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
        <Link href="/" className="group">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#5F6FFF] to-[#13ADC7] flex items-center justify-center">
              <span className="font-bold text-white">FP</span>
            </div>
            <span className="font-bold text-xl text-[#F5F5F5]">Foresight Protocol</span>
          </motion.div>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/markets" isActive>Markets</NavLink>
          <NavLink href="#features">Features</NavLink>
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

const NavLink = ({ href, children, isActive = false }: { href: string; children: React.ReactNode, isActive?: boolean }) => {
  return (
    <Link href={href} className="group">
      <motion.span
        className={`${isActive ? "text-white" : "text-white/80 hover:text-white"} relative`}
        whileHover={{ scale: 1.1 }}
      >
        {children}
        <span className={`absolute left-0 right-0 bottom-0 h-0.5 bg-[#13ADC7] transform ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'} transition-transform origin-left duration-300`}></span>
      </motion.span>
    </Link>
  );
};

export default Navbar;