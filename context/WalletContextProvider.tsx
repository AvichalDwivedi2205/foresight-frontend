"use client";

import { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

// Import default styles for wallet modal
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletContextProviderProps {
  children: ReactNode;
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  // Set the network to 'devnet' for development, 'mainnet-beta' for production
  const network = WalletAdapterNetwork.Devnet;
  
  // Get the RPC endpoint for the selected network
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  
  // Initialize wallet adapters for supported wallets with explicit devnet configuration
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter({ network }),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
    ],
    [network]
  );

  console.log("Initializing wallet context with network:", network);
  
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider; 