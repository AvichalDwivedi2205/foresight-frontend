"use client";

import React from "react";
import { WalletProvider } from "./wallet-provider";
import { WalletAdapterProvider } from "./wallet-adapter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

type ClientProvidersProps = {
  children: React.ReactNode;
};

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletAdapterProvider>
        <WalletProvider>
          {children}
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              style: {
                background: "#1C1C22",
                color: "#F5F5F5",
                border: "1px solid rgba(255, 255, 255, 0.1)"
              },
            }}
          />
        </WalletProvider>
      </WalletAdapterProvider>
      {process.env.NODE_ENV !== "production" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
} 