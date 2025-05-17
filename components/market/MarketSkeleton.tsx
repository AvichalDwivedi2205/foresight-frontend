"use client";

import { motion } from "framer-motion";

export default function MarketSkeleton() {
  return (
    <div className="container mx-auto px-4 max-w-7xl py-8">
      {/* Header skeleton */}
      <div className="animate-pulse">
        <div className="h-10 bg-gray-700 rounded-lg w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded-lg w-1/2 mb-3"></div>
        <div className="h-4 bg-gray-700 rounded-lg w-1/3 mb-6"></div>
        
        <div className="flex flex-wrap gap-2 mb-8">
          <div className="h-6 w-24 bg-gray-700 rounded-full"></div>
          <div className="h-6 w-32 bg-gray-700 rounded-full"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Stats panel skeleton */}
          <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700 animate-pulse">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="h-20 bg-gray-700 rounded-lg"></div>
              <div className="h-20 bg-gray-700 rounded-lg"></div>
              <div className="h-20 bg-gray-700 rounded-lg"></div>
            </div>
            
            <div className="h-32 bg-gray-700 rounded-lg"></div>
          </div>
          
          {/* AI summary skeleton */}
          <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700 animate-pulse">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gray-700 rounded mr-3"></div>
              <div className="h-6 bg-gray-700 rounded w-40"></div>
            </div>
            
            <div className="space-y-3">
              <div className="h-4 bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-700 rounded w-4/5"></div>
              <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
          
          {/* Stakers list skeleton */}
          <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700 animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-40 mb-4"></div>
            
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="h-5 bg-gray-700 rounded w-32"></div>
                  <div className="h-5 bg-gray-700 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1 space-y-8">
          {/* Outcomes skeleton */}
          <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700 animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-40 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-6"></div>
            
            <div className="space-y-4">
              <div className="h-16 bg-gray-700 rounded-lg w-full"></div>
              <div className="h-16 bg-gray-700 rounded-lg w-full"></div>
            </div>
          </div>
          
          {/* Stake box skeleton */}
          <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700 animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-6"></div>
            
            <div className="h-12 bg-gray-700 rounded-lg w-full mb-4"></div>
            
            <div className="flex gap-2 mb-4">
              <div className="h-8 bg-gray-700 rounded w-16"></div>
              <div className="h-8 bg-gray-700 rounded w-16"></div>
              <div className="h-8 bg-gray-700 rounded w-16"></div>
            </div>
            
            <div className="h-12 bg-gray-700 rounded-lg w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}