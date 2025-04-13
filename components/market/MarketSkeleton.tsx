"use client";

export default function MarketSkeleton() {
  return (
    <div className="container mx-auto px-4 max-w-7xl py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-3/4 bg-[#1C1C22] rounded-lg skeleton mb-4"></div>
        <div className="h-4 w-1/2 bg-[#1C1C22] rounded-lg skeleton mb-3"></div>
        <div className="h-20 w-full bg-[#1C1C22] rounded-lg skeleton"></div>
      </div>
      
      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Stats panel skeleton */}
          <div className="bg-[#1C1C22] p-6 rounded-xl">
            <div className="flex justify-between mb-4">
              <div className="h-6 w-32 bg-white/10 rounded skeleton"></div>
              <div className="h-6 w-20 bg-white/10 rounded skeleton"></div>
            </div>
            <div className="h-4 w-full bg-white/5 rounded-full mb-4">
              <div className="h-full w-3/5 bg-white/10 rounded-full skeleton"></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-8 w-full bg-white/10 rounded skeleton"></div>
              <div className="h-8 w-full bg-white/10 rounded skeleton"></div>
              <div className="h-8 w-full bg-white/10 rounded skeleton"></div>
            </div>
          </div>
          
          {/* AI panel skeleton */}
          <div className="bg-[#1C1C22] p-6 rounded-xl">
            <div className="h-6 w-40 bg-white/10 rounded skeleton mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-white/10 rounded skeleton"></div>
              <div className="h-4 w-full bg-white/10 rounded skeleton"></div>
              <div className="h-4 w-3/4 bg-white/10 rounded skeleton"></div>
            </div>
          </div>
          
          {/* Stakers list skeleton */}
          <div className="bg-[#1C1C22] p-6 rounded-xl">
            <div className="h-6 w-36 bg-white/10 rounded skeleton mb-5"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-5 w-36 bg-white/10 rounded skeleton"></div>
                  <div className="h-5 w-20 bg-white/10 rounded skeleton"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right sidebar skeleton */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-[#1C1C22] p-6 rounded-xl">
            <div className="h-6 w-32 bg-white/10 rounded skeleton mb-5"></div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="h-12 w-full bg-white/10 rounded-lg skeleton"></div>
              <div className="h-12 w-full bg-white/10 rounded-lg skeleton"></div>
            </div>
            <div className="h-6 w-24 bg-white/10 rounded skeleton mb-3"></div>
            <div className="h-12 w-full bg-white/10 rounded-lg skeleton mb-3"></div>
            <div className="h-12 w-full bg-white/10 rounded-lg skeleton"></div>
          </div>
        </div>
      </div>
    </div>
  );
}