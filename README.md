# Foresight Protocol Frontend

A decentralized prediction market platform built on Solana.

## Features

- Create and participate in prediction markets
- AI-powered market scoring and analysis
- NFT achievements for successful predictions
- Token swaps with Jupiter integration
- Wallet connection with Walrus and Privy
- Transaction monitoring with txTx
- Admin dashboard for platform management

## Third-Party Integrations

This frontend integrates with the following services:

- **Helius/QuickNode**: RPC providers and blockchain indexing
- **Metaplex**: NFT creation and display
- **Jupiter**: Token swapping
- **Walrus**: Wallet connection and transaction UI
- **Privy**: Authentication and wallet abstraction
- **txTx**: Transaction monitoring and notifications
- **Firebase**: Data storage and user profiles
- **Gemini AI**: Market scoring and analysis

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Solana devnet account with SOL for testing

### Environment Setup

1. Copy the example environment file:

```bash
cp .env.local.example .env.local
```

2. Fill in your API keys and configuration values in `.env.local`

### Installation

```bash
npm install
# or
yarn install
```

### Development

```bash
npm run dev
# or
yarn dev
```

The application will start on [http://localhost:3022](http://localhost:3022).

## Project Structure

- `app/`: Next.js 15 app router directory containing pages
- `components/`: Reusable UI components
- `lib/`: Service integrations and utilities
  - `ai-service.tsx`: Gemini AI integration for market analysis
  - `connection.tsx`: Helius/QuickNode RPC connection provider
  - `firebase.tsx`: Firebase integration for additional data storage
  - `indexer.tsx`: On-chain data indexing with Helius
  - `jupiter.tsx`: Token swap integration
  - `metaplex.tsx`: NFT integration
  - `providers.tsx`: Central provider wrapper
  - `tx-monitoring.tsx`: Transaction monitoring with txTx
  - `wallet-provider.tsx`: Wallet integration with Walrus

## Admin Dashboard

The admin dashboard is available at `/admin` and restricted to the wallet address specified in the `NEXT_PUBLIC_ADMIN_WALLET` environment variable.

## Smart Contract Integration

This frontend integrates with the Foresight Protocol smart contract deployed on Solana devnet. The contract handles:

- Market creation and resolution
- User predictions
- Token staking and rewards
- Creator fees and protocol fees

## Development Notes

- This application uses server and client components optimized for performance
- State management is handled with Recoil and React Query for optimized data fetching
- The UI is built with TailwindCSS and Framer Motion for animations
- Authentication is managed through Privy for a seamless user experience
