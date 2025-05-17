"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Connection } from "@solana/web3.js";
import { getRpcEndpoint } from "./config";

// Define the connection state interface
interface ConnectionState {
  endpoint: string;
  current: "helius" | "quicknode" | "default";
  ready: boolean;
}

type ConnectionContextType = {
  connection: Connection | null;
  endpoint: string;
  isReady: boolean;
  switchToBackup: () => void;
};

const ConnectionContext = createContext<ConnectionContextType | null>(null);

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error("useConnection must be used within a ConnectionProvider");
  }
  return context;
};

type ConnectionProviderProps = {
  children: React.ReactNode;
};

export function ConnectionProvider({ children }: ConnectionProviderProps) {
  const [connection, setConnection] = useState<Connection | null>(null);
  const [connectionData, setConnectionData] = useState<ConnectionState>({
    endpoint: "",
    current: "helius",
    ready: false,
  });

  // Initialize RPC endpoints
  useEffect(() => {
    const initializeConnection = () => {
      const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY || "";
      const QUICKNODE_API_KEY = process.env.NEXT_PUBLIC_QUICKNODE_API_KEY || "";
      
      let endpoint = "";
      
      if (connectionData.current === "helius" && HELIUS_API_KEY) {
        endpoint = `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
      } else if (QUICKNODE_API_KEY) {
        endpoint = `https://solana-devnet.g.alchemy.com/v2/${QUICKNODE_API_KEY}`;
        setConnectionData(prev => ({ ...prev, current: "quicknode" }));
      } else {
        // Fallback to public RPC
        endpoint = "https://api.devnet.solana.com";
        console.warn("No API keys provided, using public RPC endpoint");
      }
      
      try {
        const conn = new Connection(endpoint, "confirmed");
        setConnection(conn);
        setConnectionData(prev => ({ 
          ...prev, 
          endpoint, 
          ready: true,
        }));
        console.log(`Connected to ${connectionData.current} RPC endpoint`);
      } catch (error) {
        console.error("Failed to establish connection:", error);
        
        // If Helius fails, try QuickNode
        if (connectionData.current === "helius" && QUICKNODE_API_KEY) {
          switchToBackup();
        }
      }
    };
    
    initializeConnection();
  }, [connectionData.current]);

  const switchToBackup = () => {
    setConnectionData(prev => ({
      ...prev,
      current: prev.current === "helius" ? "quicknode" : "helius",
      ready: false,
    }));
  };
  
  // Check connection health periodically
  useEffect(() => {
    if (!connection) return;
    
    const healthCheck = async () => {
      try {
        // Simple health check
        await connection.getVersion();
      } catch (error) {
        console.error("RPC connection lost, switching to backup:", error);
        switchToBackup();
      }
    };
    
    const interval = setInterval(healthCheck, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [connection]);

  return (
    <ConnectionContext.Provider
      value={{
        connection,
        endpoint: connectionData.endpoint,
        isReady: connectionData.ready,
        switchToBackup,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
} 