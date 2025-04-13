"use client";

export default function SkeletonCard() {
  return (
    <div className="bg-[#1C1C22] p-5 rounded-xl border border-white/5">
      {/* Badge skeleton */}
      <div className="flex justify-between mb-3">
        <div className="h-5 w-16 bg-white/10 rounded-full skeleton"></div>
        <div className="h-5 w-20 bg-white/10 rounded-full skeleton"></div>
      </div>
      
      {/* Title skeleton - two lines */}
      <div className="space-y-2 mb-4">
        <div className="h-6 w-full bg-white/10 rounded skeleton"></div>
        <div className="h-6 w-3/4 bg-white/10 rounded skeleton"></div>
      </div>
      
      {/* Stats skeleton */}
      <div className="flex justify-between mb-5">
        <div className="h-4 w-24 bg-white/10 rounded skeleton"></div>
        <div className="h-4 w-16 bg-white/10 rounded skeleton"></div>
      </div>
      
      {/* Progress bar skeleton */}
      <div className="h-2 w-full bg-white/5 rounded-full mb-5 overflow-hidden">
        <div className="h-full w-3/5 bg-white/10 skeleton rounded-full"></div>
      </div>
      
      {/* Button skeleton */}
      <div className="h-10 w-full bg-white/10 rounded-full skeleton"></div>
    </div>
  );
}