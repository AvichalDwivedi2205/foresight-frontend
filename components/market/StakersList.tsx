"use client";

import { motion  } from '@/components/motion';

interface Staker {
  address: string;
  amount: string;
  outcome: string;
}

interface StakersListProps {
  stakers: Staker[];
}

export default function StakersList({ stakers }: StakersListProps) {
  return (
    <motion.div 
      className="bg-[#1C1C22] p-6 rounded-xl border border-white/5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <h3 className="text-xl font-bold mb-6">Top Stakers</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="pb-3 text-sm text-[#B0B0B0] font-medium">Address</th>
              <th className="pb-3 text-sm text-[#B0B0B0] font-medium">Amount</th>
              <th className="pb-3 text-sm text-[#B0B0B0] font-medium">Outcome</th>
            </tr>
          </thead>
          <tbody>
            {stakers.map((staker, index) => (
              <motion.tr 
                key={staker.address} 
                className="border-b border-white/5 last:border-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <td className="py-4">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[#5F6FFF]/20 flex items-center justify-center mr-2 text-xs text-[#5F6FFF]">
                      {index + 1}
                    </div>
                    <span className="font-medium">{staker.address}</span>
                  </div>
                </td>
                <td className="py-4 font-medium">{staker.amount}</td>
                <td className="py-4">
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      staker.outcome === "Yes"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {staker.outcome}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 text-center">
        <motion.button
          className="text-sm text-[#5F6FFF] hover:text-[#13ADC7] transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          View all stakers
        </motion.button>
      </div>
    </motion.div>
  );
}