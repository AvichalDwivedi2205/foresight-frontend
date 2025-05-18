"use client";

import { useEffect, useState } from 'react';
import { 
  motion as framerMotion, 
  AnimatePresence as framerAnimatePresence,
  useInView as framerUseInView,
  useAnimation as framerUseAnimation,
  animate as framerAnimate,
  domAnimation,
  LazyMotion as FramerLazyMotion
} from 'framer-motion';

// Re-export with dynamic loading to prevent SSR issues
export const motion = framerMotion;
export const AnimatePresence = framerAnimatePresence;
export const useInView = framerUseInView;
export const useAnimation = framerUseAnimation;
export const animate = framerAnimate;

// LazyMotion component that ensures framer-motion is only loaded on client-side
export function LazyMotion({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return null; // Don't render anything during SSR
  }
  
  // Use the actual LazyMotion from framer-motion with domAnimation
  return <FramerLazyMotion features={domAnimation}>{children}</FramerLazyMotion>;
}
