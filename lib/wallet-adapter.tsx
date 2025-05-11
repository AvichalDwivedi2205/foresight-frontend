"use client";

import React, { FC, ReactNode, useMemo, useState, useEffect } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { getRpcEndpoint } from './config';

export const WalletAdapterProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // Get RPC endpoint from config
  const [endpoint, setEndpoint] = useState<string>(clusterApiUrl('devnet'));
  
  // Initialize the endpoint
  useEffect(() => {
    setEndpoint(getRpcEndpoint());
  }, []);

  // Since we're using Wallet Standard, we don't need adapter-specific packages
  // All wallets that support Wallet Standard will be automatically available
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}; 