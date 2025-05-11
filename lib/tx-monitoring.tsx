import { useCallback } from "react";
import { Connection, TransactionSignature } from "@solana/web3.js";
import { useConnection } from "./connection";
import { useToast } from "./hooks/useToast";
import { useMutation, useQuery } from "@tanstack/react-query";

type TxStatus = "pending" | "confirmed" | "finalized" | "error";

// Local transaction status tracking instead of txTx API
export const getTransactionStatus = async (
  connection: Connection,
  signature: string
): Promise<{ status: TxStatus }> => {
  try {
    const status = await connection.getSignatureStatus(signature);
    
    if (!status || !status.value) {
      return { status: "pending" };
    }
    
    if (status.value.err) {
      return { status: "error" };
    }
    
    if (status.value.confirmationStatus === "finalized") {
      return { status: "finalized" };
    }
    
    if (status.value.confirmations && status.value.confirmations > 0) {
      return { status: "confirmed" };
    }
    
    return { status: "pending" };
  } catch (error) {
    console.error("Error fetching transaction status:", error);
    return { status: "error" };
  }
};

// Hook for using transaction monitoring in components
export function useTransactionMonitoring() {
  const { connection } = useConnection();
  const { showToast } = useToast();

  // Query for checking transaction status
  interface TransactionStatusResponse {
    status: TxStatus;
  }

  const useTransactionStatus = (signature: string | null) => {
    return useQuery({
      queryKey: ["transactionStatus", signature],
      queryFn: () => connection ? getTransactionStatus(connection, signature!) : { status: "error" },
      enabled: !!connection && !!signature,
      refetchInterval: (query) => {
        const data = query.state?.data as TransactionStatusResponse | null;
        if (!data || data.status === "pending") {
          return 3000; // Check every 3 seconds for pending transactions
        }
        return false; // Stop polling when confirmed or error
      },
      refetchOnWindowFocus: false,
    });
  };

  // Send transaction with automatic tracking
  const sendAndTrackTransaction = useCallback(
    async (transaction: any, label: string, callback?: (signature: string) => void) => {
      if (!connection) {
        showToast("Connection not available", "error");
        throw new Error("Connection not available");
      }
      
      try {
        // Send the transaction
        const signature = await connection.sendRawTransaction(transaction.serialize());
        
        // Log the transaction label locally instead of using txTx
        console.log(`Transaction sent: ${label} (${signature})`);
        
        // Notify the user
        showToast(`Transaction sent: ${signature.substring(0, 8)}...`, "success");
        
        if (callback) {
          callback(signature);
        }
        
        return signature;
      } catch (error) {
        console.error("Error sending transaction:", error);
        showToast(`Transaction failed: ${(error as Error).message}`, "error");
        throw error;
      }
    },
    [connection, showToast]
  );

  return {
    useTransactionStatus,
    sendAndTrackTransaction,
  };
} 