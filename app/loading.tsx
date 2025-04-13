import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0E0E10] z-50">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-[#13ADC7] border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[#5F6FFF] font-bold text-sm">FP</span>
        </div>
      </div>
      <p className="absolute mt-24 text-[#13ADC7] font-light text-sm animate-pulse">
        Loading Foresight Protocol...
      </p>
    </div>
  );
}