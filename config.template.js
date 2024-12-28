// Configuration template
// 1. Copy this file to config.js
// 2. Add your RPC endpoints and example addresses
// 3. Add config.js to .gitignore

export const NETWORKS = {
  BITCOIN: {
    mainnet: {
      name: "mainnet",
      rpcUrl: "", // Bitcoin RPC endpoint (e.g., mempool.space API)
      exampleAddress: "", // BTC address for testing
    },
  },
  ETHEREUM: {
    mainnet: {
      name: "mainnet",
      rpcUrl: "", // Ethereum RPC endpoint
      exampleAddress: "", // ETH address for testing
    },
  },
  SOLANA: {
    mainnet: {
      name: "mainnet-beta",
      rpcUrl: "", // Solana RPC endpoint
      exampleAddress: "", // SOL address for testing
    },
  },
};

export const API_ENDPOINTS = {
  BITCOIN: {
    GET_UTXO: (address) => `/address/${address}/utxo`,
    GET_LATEST_BLOCK: "/blocks/tip/hash",
  },
};

export const UNITS = {
  BITCOIN: {
    SATOSHI_PER_BTC: 100000000,
  },
  ETHEREUM: {
    WEI_PER_ETH: 1e18,
  },
  SOLANA: {
    LAMPORTS_PER_SOL: 1e9,
  },
};

export const ERROR_MESSAGES = {
  CONNECTION_FAILED: (chain) => `Failed to connect to ${chain} network`,
  INVALID_ADDRESS: (chain) => `Invalid ${chain} address`,
  FETCH_BALANCE_FAILED: (chain) => `Failed to fetch ${chain} balance`,
  ADDRESS_REQUIRED: "Address is required",
  TIMEOUT: "Request timed out",
};
