export type NetworkKey = 'base-sepolia' | 'arbitrum-sepolia';

interface NetworkConfigItem {
  chainId: number;
  networkKey: NetworkKey;
  rpcUrl: string;
  contractAddress: `0x${string}`;
  // LayerZero v2 Endpoint ID for cross-chain sends
  // TODO: Fill with the correct EIDs for each network
  lzEid?: number;
}

export const STARSHIP_ABI_PATHS = {
  base: '/lz/starship-nft/deployments/base-testnet/MyONFT721Mock.json',
  arbitrum: '/lz/starship-nft/deployments/arbitrum-testnet/MyONFT721Mock.json',
} as const;

// Contract addresses pulled from deployments json
export const CONTRACT_ADDRESSES: Record<NetworkKey, `0x${string}`> = {
  'base-sepolia': '0x037B44B33E41D5AdFBbC43A3d67f32b5b9876B99',
  'arbitrum-sepolia': '0x037B44B33E41D5AdFBbC43A3d67f32b5b9876B99',
};

export const NETWORKS: Record<NetworkKey, NetworkConfigItem> = {
  'base-sepolia': {
    chainId: 84532,
    networkKey: 'base-sepolia',
    rpcUrl: 'https://sepolia.base.org',
    contractAddress: CONTRACT_ADDRESSES['base-sepolia'],
    // TODO: ask for correct LZ v2 EID for Base Sepolia and fill here
    lzEid: undefined,
  },
  'arbitrum-sepolia': {
    chainId: 421614,
    networkKey: 'arbitrum-sepolia',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    contractAddress: CONTRACT_ADDRESSES['arbitrum-sepolia'],
    // TODO: ask for correct LZ v2 EID for Arbitrum Sepolia and fill here
    lzEid: undefined,
  },
};

export const PLANET_TO_NETWORK: Record<string, NetworkKey> = {
  Vulcania: 'arbitrum-sepolia',
  Amethea: 'base-sepolia',
};
