"use client";

import { 
  Connection, 
  Transaction, 
  VersionedTransaction,
  PublicKey, 
  SendOptions,
  RpcResponseAndContext,
  SignatureResult,
  Keypair,
  TransactionError
} from "@solana/web3.js";

// Transaction status for tracking
export enum TransactionStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  FINALIZED = "finalized",
  FAILED = "failed"
}

// Transaction receipt for better tracking
export interface TransactionReceipt {
  signature: string;
  status: TransactionStatus;
  confirmations: number;
  slot?: number;
  blockTime?: number;
  error?: string;
  errorLogs?: string[];
}

// Transaction confirmation options
export interface TransactionConfirmationOptions {
  maxRetries?: number;
  retryIntervalMs?: number;
  commitment?: "processed" | "confirmed" | "finalized";
  skipPreflight?: boolean;
  preflightCommitment?: "processed" | "confirmed" | "finalized";
  maxConfirmations?: number;
}

// Transaction callbacks for loading state management
export interface TransactionCallbacks {
  onStart?: () => void;
  onSuccess?: (receipt: TransactionReceipt) => void;
  onError?: (error: Error, receipt?: TransactionReceipt) => void;
  onSettled?: () => void;
}

const DEFAULT_CONFIRMATION_OPTIONS: TransactionConfirmationOptions = {
  maxRetries: 5,
  retryIntervalMs: 1000,
  commitment: "confirmed",
  skipPreflight: false,
  preflightCommitment: "processed",
  maxConfirmations: 3,
};

export class TransactionService {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  // Sign and send a transaction with the provided function from the wallet adapter
  async signAndSendTransaction(
    transaction: Transaction | VersionedTransaction,
    signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>,
    publicKey: PublicKey,
    additionalSigners: Keypair[] = [],
    options?: SendOptions
  ): Promise<string> {
    try {
      console.log("Preparing transaction...");
      
      // Handle regular Transaction vs VersionedTransaction differently
      if (transaction instanceof Transaction) {
        // Ensure we have the latest blockhash to avoid issues on devnet
        const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.lastValidBlockHeight = lastValidBlockHeight;
        transaction.feePayer = publicKey;
  
        // If there are additional signers, get them to sign first
        if (additionalSigners.length > 0) {
          transaction.partialSign(...additionalSigners);
        }
        
        console.log("Transaction prepared for signing");
      }
      // Note: VersionedTransaction needs to be already properly set up
      // We can't modify it here the same way

      // Get the user to sign the transaction
      const signedTransaction = await signTransaction(transaction as Transaction);
      console.log("Transaction signed by user");

      // Send the signed transaction with preflight checks disabled
      // This can help with transactions that might have simulation issues on devnet
      const sendOptions: SendOptions = {
        skipPreflight: Boolean(options?.skipPreflight) || true, // Skip preflight checks for better compatibility on devnet
        preflightCommitment: options?.preflightCommitment || 'confirmed',
        maxRetries: options?.maxRetries || 3,
        ...(options || {})
      };

      console.log("Sending transaction to network...");
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize(),
        sendOptions
      );
      
      console.log("Transaction sent with signature:", signature);
      return signature;
    } catch (error) {
      console.error("Transaction error:", error);
      throw error;
    }
  }

  // Confirm that a transaction has been confirmed with advanced error handling
  async confirmTransaction(
    signature: string,
    options: TransactionConfirmationOptions = DEFAULT_CONFIRMATION_OPTIONS
  ): Promise<TransactionReceipt> {
    const { 
      maxRetries = 5, 
      retryIntervalMs = 1000, 
      commitment = 'confirmed',
      maxConfirmations = 3
    } = options;
    
    let retries = 0;
    let receipt: TransactionReceipt = {
      signature,
      status: TransactionStatus.PENDING,
      confirmations: 0
    };

    console.log(`Confirming transaction ${signature}...`);

    while (retries < maxRetries) {
      try {
        // First check if transaction is confirmed
        const result = await this.connection.confirmTransaction(
          signature, 
          commitment as any
        );
        
        if (result.value.err) {
          const errorMessage = typeof result.value.err === 'string' 
            ? result.value.err 
            : JSON.stringify(result.value.err);
            
          receipt.status = TransactionStatus.FAILED;
          receipt.error = `Transaction failed: ${errorMessage}`;
          
          console.error(`Transaction ${signature} failed:`, errorMessage);
          throw new Error(receipt.error);
        }

        // If confirmed, get more transaction details
        const txDetails = await this.connection.getTransaction(signature, {
          maxSupportedTransactionVersion: 0,
        });

        receipt.status = TransactionStatus.CONFIRMED;
        receipt.slot = txDetails?.slot;
        receipt.blockTime = txDetails?.blockTime || undefined;
        receipt.confirmations = 1; // Set default confirmation count

        // Check for preflight or simulation errors that might not show up in the normal error flow
        if (txDetails?.meta?.err) {
          receipt.status = TransactionStatus.FAILED;
          receipt.error = JSON.stringify(txDetails.meta.err);
          receipt.errorLogs = txDetails.meta.logMessages || [];
          
          console.error(`Transaction ${signature} has errors in metadata:`, receipt.error);
          throw new Error(receipt.error);
        }
        
        // Wait for more confirmations if needed
        if (receipt.confirmations < maxConfirmations && commitment !== 'finalized') {
          await new Promise(resolve => setTimeout(resolve, retryIntervalMs));
          continue; // Try to get more confirmations
        }
        
        // Only set to finalized if we explicitly asked for it or reached max confirmations
        if (commitment === 'finalized' || receipt.confirmations >= maxConfirmations) {
          receipt.status = TransactionStatus.FINALIZED;
        }
        
        console.log(`Transaction ${signature} confirmed with ${receipt.confirmations} confirmations`);
        return receipt;
      } catch (error) {
        retries++;
        console.warn(`Retry ${retries}/${maxRetries} confirming transaction ${signature}`);
        
        if (retries >= maxRetries) {
          receipt.status = TransactionStatus.FAILED;
          receipt.error = `Failed to confirm transaction after ${maxRetries} attempts: ${error instanceof Error ? error.message : String(error)}`;
          console.error(receipt.error);
          throw new Error(receipt.error);
        }

        // Exponential backoff for retries
        const backoffTime = retryIntervalMs * Math.pow(1.5, retries);
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
      }
    }

    receipt.status = TransactionStatus.FAILED;
    receipt.error = `Failed to confirm transaction after ${maxRetries} attempts`;
    throw new Error(receipt.error);
  }

  // Helper to get a recent blockhash
  private async getRecentBlockhash(): Promise<string> {
    const { blockhash } = await this.connection.getLatestBlockhash();
    return blockhash;
  }

  // Helper method to sign, send, and confirm a transaction
  async signSendAndConfirmTransaction(
    transaction: Transaction | VersionedTransaction,
    signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>,
    publicKey: PublicKey,
    additionalSigners: Keypair[] = [],
    options?: SendOptions,
    confirmOptions?: TransactionConfirmationOptions
  ): Promise<string> {
    // Sign and send the transaction
    const signature = await this.signAndSendTransaction(
      transaction,
      signTransaction,
      publicKey,
      additionalSigners,
      options
    );

    // Confirm the transaction
    await this.confirmTransaction(signature, confirmOptions);

    return signature;
  }

  // Execute a transaction with loading state management and error handling
  async executeTransaction(
    transaction: Transaction | VersionedTransaction,
    signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>,
    publicKey: PublicKey,
    callbacks?: TransactionCallbacks,
    additionalSigners: Keypair[] = [],
    options?: SendOptions,
    confirmOptions?: TransactionConfirmationOptions
  ): Promise<TransactionReceipt> {
    try {
      // Trigger the onStart callback if provided
      if (callbacks?.onStart) {
        callbacks.onStart();
      }
      
      // Sign and send transaction
      const signature = await this.signAndSendTransaction(
        transaction,
        signTransaction,
        publicKey,
        additionalSigners,
        options
      );
      
      // Confirm transaction
      const receipt = await this.confirmTransaction(signature, confirmOptions);
      
      // Trigger success callback if provided
      if (callbacks?.onSuccess) {
        callbacks.onSuccess(receipt);
      }
      
      return receipt;
    } catch (error) {
      console.error("Transaction execution failed:", error);
      
      // Create error receipt
      const errorReceipt: TransactionReceipt = {
        signature: "",
        status: TransactionStatus.FAILED,
        confirmations: 0,
        error: error instanceof Error ? error.message : String(error)
      };
      
      // Trigger error callback if provided
      if (callbacks?.onError) {
        callbacks.onError(
          error instanceof Error ? error : new Error(String(error)), 
          errorReceipt
        );
      }
      
      throw error;
    } finally {
      // Trigger settled callback if provided
      if (callbacks?.onSettled) {
        callbacks.onSettled();
      }
    }
  }

  // Get transaction details
  async getTransactionDetails(signature: string) {
    return await this.connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
  }
  
  // Parse transaction errors for better error messages
  parseTransactionError(error: unknown): string {
    if (!error) return "Unknown error";
    
    // Try to extract the most useful information from the error
    if (error instanceof Error) {
      // Check for common Solana error patterns
      const errorStr = error.message;
      
      // Check for instruction error
      if (errorStr.includes("custom program error:")) {
        const match = errorStr.match(/custom program error: (0x[0-9a-f]+)/i);
        if (match && match[1]) {
          const errorCode = parseInt(match[1]);
          return this.getProgramErrorMessage(errorCode) || `Program error: ${match[1]}`;
        }
      }
      
      // Check for simulation failures
      if (errorStr.includes("Transaction simulation failed:")) {
        return errorStr.replace("Transaction simulation failed:", "Failed:").trim();
      }
      
      // Extract logs if available
      if (errorStr.includes("Program log:")) {
        const logs = errorStr.match(/Program log: (.*)/g);
        if (logs && logs.length) {
          return logs.map(log => log.replace("Program log:", "").trim()).join("; ");
        }
      }
      
      return error.message;
    }
    
    return String(error);
  }
  
  // Map program error codes to user-friendly messages
  private getProgramErrorMessage(errorCode: number): string | null {
    const ERROR_MAP: Record<number, string> = {
      0: "The operation completed successfully",
      1: "Not enough SOL to pay for transaction",
      2: "Account doesn't have enough tokens",
      3: "Market not found",
      4: "Market has already been resolved",
      5: "Market has not been resolved yet",
      6: "Invalid outcome index",
      7: "Invalid market resolution",
      8: "You've already made a prediction on this market",
      9: "You haven't made a prediction on this market",
      10: "You've already claimed your reward",
      11: "You didn't win this prediction",
      12: "Creator profile not found",
      // Add more mappings as they become available
    };
    
    return ERROR_MAP[errorCode] || null;
  }
}

export default TransactionService;