// Default configuration
export const NETWORK = 'devnet'; // 'devnet' or 'mainnet-beta'

// RPC Configuration
export const getRpcEndpoint = () => {
  const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
  const QUICKNODE_API_KEY = process.env.NEXT_PUBLIC_QUICKNODE_API_KEY;
  
  if (NETWORK === 'devnet') {
    if (HELIUS_API_KEY) {
      return `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
    } else if (QUICKNODE_API_KEY) {
      return `https://solana-devnet.g.alchemy.com/v2/${QUICKNODE_API_KEY}`;
    } else {
      return 'https://api.devnet.solana.com';
    }
  } else {
    if (HELIUS_API_KEY) {
      return `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
    } else if (QUICKNODE_API_KEY) {
      return `https://solana-mainnet.g.alchemy.com/v2/${QUICKNODE_API_KEY}`;
    } else {
      return 'https://api.mainnet-beta.solana.com';
    }
  }
}; 