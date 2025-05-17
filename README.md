# Foresight Protocol Frontend

A decentralized prediction market platform built on Solana blockchain that leverages AI for market creation, validation, and resolution.

## Overview

Foresight Protocol is a next-generation prediction market platform that allows users to:
- Create markets on future events
- Stake tokens on potential outcomes
- Earn rewards for accurate predictions
- Leverage AI for market validation and resolution

The frontend provides an intuitive, modern interface for interacting with the Foresight Protocol smart contracts on the Solana blockchain.

## Technologies & Services

### Core Technologies
- **Next.js 15**: App router-based framework for both server and client components
- **React 18**: For building the user interface with modern patterns
- **TypeScript**: For type-safe code
- **TailwindCSS**: For responsive styling
- **Framer Motion**: For fluid animations and transitions

### Blockchain Integration
- **Solana Web3.js**: Core library for Solana blockchain interaction
- **Anchor**: Framework for Solana program development
- **Wallet Adapter**: For seamless wallet connection:
  - Phantom
  - Solflare
  - Walrus
  - and other Web3 wallets

### Data Management & State
- **TanStack Query (React Query)**: For efficient data fetching and caching
- **Zustand/Context API**: For global state management

### Third-Party Services
- **Jupiter Protocol**: Integrated for token swapping functionality
- **AI Service Integration**: For market validation, scoring, and resolution
- **Metaplex**: For NFT creation and display
- **Helius/QuickNode**: As RPC providers for blockchain data
- **Firebase**: For additional off-chain data storage

## Architecture

The frontend is structured with a clear separation of concerns:

### `/app` Directory
Contains Next.js 15 app router pages and layouts

### `/components` Directory
Reusable UI components organized by feature:
- `market/`: Components for market display and interaction
- `wallet/`: Wallet connection and management components
- `ui/`: Shared UI elements (buttons, cards, inputs)

### `/lib` Directory
Core services and utilities:
- `wallet-provider.tsx`: Wallet connection services
- `connection.tsx`: Solana RPC connection management
- `indexer.tsx`: On-chain data indexing and retrieval
- `jupiter.tsx`: Jupiter DEX integration for token swaps
- `ai-service.tsx`: AI integration for market validation and resolution

### `/hooks` Directory
Custom React hooks for data and functionality:
- `useMarketData.tsx`: For fetching and managing market data
- `useUserPredictions.tsx`: For user prediction history
- `useToast.tsx`: For notifications

## Key Features

### Market Creation
Users can create prediction markets with:
- Custom questions and outcomes
- AI validation for question quality
- Time-bound or open-ended resolution options

### Market Participation
- Stake tokens on outcomes
- View probability distributions
- Track market history and trends
- Receive rewards for correct predictions

### AI Integration
- AI evaluates market questions for clarity and measurability
- Provides market scoring and recommendation for deadline
- Can resolve time-bound markets with high confidence
- Generates market summaries and analysis

### Wallet Integration
- Connect multiple wallet types
- View balances and transaction history
- Sign transactions for staking and claiming

### Token Swapping
Jupiter integration allows:
- Swapping tokens before staking on markets
- Finding optimal routes for trades
- Low slippage token exchanges

## Smart Contract Integration

The frontend interacts with the Foresight Protocol smart contract which has these core functions:
- `create_market`: Creates a new prediction market
- `stake_prediction`: Stakes tokens on a specific outcome
- `resolve_market`: Resolves market outcomes (admin or AI)
- `claim_reward`: Claims rewards for winning predictions
- `vote_market_outcome`: For community-driven resolution

Data is retrieved through an indexer that watches on-chain events:
- `MarketCreatedEvent`: Triggered when a new market is created
- `PredictionStakedEvent`: When a user stakes on an outcome
- `RewardClaimedEvent`: When a user claims rewards

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Solana wallet with SOL for testing

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/foresight-protocol
cd foresight-protocol/foresight-frontend

# Install dependencies
npm install
# or
yarn install
```

### Environment Setup
Create a `.env.local` file with the following variables:
```
NEXT_PUBLIC_RPC_ENDPOINT=https://your-rpc-endpoint.com
NEXT_PUBLIC_AI_SERVICE_URL=https://your-ai-service.com
NEXT_PUBLIC_ADMIN_WALLET=your-admin-wallet-address
```

### Development
```bash
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:3000.

## Deployment

The application can be deployed to Vercel with:
```bash
vercel
```

## License

[MIT](LICENSE)
