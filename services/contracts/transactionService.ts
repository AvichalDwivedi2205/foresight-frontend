"use client";

import { 
  Connection, 
  Transaction, 
  PublicKey, 
  SendOptions,
  RpcResponseAndContext,
  SignatureResult,
  Keypair
} from "@solana/web3.js";

export interface TransactionConfirmationOptions {
  maxRetries?: number;
  retryIntervalMs?: number;
}

const DEFAULT_CONFIRMATION_OPTIONS: TransactionConfirmationOptions = {
  maxRetries: 5,
  retryIntervalMs: 500,
};

export class TransactionService {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  // Sign and send a transaction with the provided function from the wallet adapter
  async signAndSendTransaction(
    transaction: Transaction,
    signTransaction: (transaction: Transaction) => Promise<Transaction>,
    publicKey: PublicKey,
    additionalSigners: Keypair[] = [],
    options?: SendOptions
  ): Promise<string> {
    try {
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (
        await this.connection.getLatestBlockhash()
      ).blockhash;

      // If there are additional signers, get them to sign first
      if (additionalSigners.length > 0) {
        transaction.partialSign(...additionalSigners);
      }

      // Get the user to sign the transaction
      const signedTransaction = await signTransaction(transaction);

      // Send the signed transaction
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize(),
        options
      );

      return signature;
    } catch (error) {
      console.error("Transaction error:", error);
      throw error;
    }
  }

  // Confirm that a transaction has been confirmed
  async confirmTransaction(
    signature: string,
    options: TransactionConfirmationOptions = DEFAULT_CONFIRMATION_OPTIONS
  ): Promise<RpcResponseAndContext<SignatureResult>> {
    const { maxRetries = 5, retryIntervalMs = 500 } = options;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const result = await this.connection.confirmTransaction(signature, "confirmed");
        if (result.value.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(result.value.err)}`);
        }
        return result;
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, retryIntervalMs));
      }
    }

    throw new Error(`Failed to confirm transaction after ${maxRetries} attempts`);
  }

  // Helper method to sign, send, and confirm a transaction
  async signSendAndConfirmTransaction(
    transaction: Transaction,
    signTransaction: (transaction: Transaction) => Promise<Transaction>,
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

  // Get transaction details
  async getTransactionDetails(signature: string) {
    return await this.connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
  }
}

export default TransactionService; 