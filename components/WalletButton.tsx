"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export const WalletButton = () => {
  const { publicKey, connected } = useWallet();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    if (publicKey) {
      const address = publicKey.toBase58();
      setWalletAddress(
        address.slice(0, 4) + ".." + address.slice(-4)
      );
    } else {
      setWalletAddress(null);
    }
  }, [publicKey]);

  return (
    <motion.div
      className="wallet-adapter-button-wrapper"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <WalletMultiButton 
        className="!bg-gradient-to-r !from-[#5F6FFF] !to-[#13ADC7] !text-white !px-5 !py-2 !rounded-full !font-medium" 
      />
    </motion.div>
  );
};

export default WalletButton; 

