"use client";

import Link from "next/link";
import { motion } from "framer-motion";

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
            
            <p className="text-[#B0B0B0] mb-6 max-w-md">
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
            <h4 className="font-bold text-lg mb-4 text-[#F5F5F5]">Resources</h4>
            <ul className="space-y-2">
              <FooterLink href="/docs">Documentation</FooterLink>
              <FooterLink href="/api">API</FooterLink>
              <FooterLink href="/whitepaper">Whitepaper</FooterLink>
              <FooterLink href="/faq">FAQ</FooterLink>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4 text-[#F5F5F5]">Company</h4>
            <ul className="space-y-2">
              <FooterLink href="/about">About</FooterLink>
              <FooterLink href="/team">Team</FooterLink>
              <FooterLink href="/blog">Blog</FooterLink>
              <FooterLink href="/careers">Careers</FooterLink>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[#B0B0B0] text-sm gap-4">
          <p>© 2025 Foresight Protocol. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/cookies" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialButton = ({ children, href, aria }: { children: React.ReactNode; href: string; aria: string }) => {
  return (
    <motion.a 
      href={href}
      className="w-10 h-10 rounded-full flex items-center justify-center text-[#B0B0B0] hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
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
        className="text-[#B0B0B0] hover:text-white transition-colors"
        whileHover={{ x: 3 }}
      >
        {children}
      </motion.a>
    </li>
  );
};

export default Footer;