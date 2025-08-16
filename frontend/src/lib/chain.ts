import { arbitrumSepolia, baseSepolia, Chain } from 'viem/chains';

export function mapChainIdToChain(chainId: number): Chain | undefined {
  switch (chainId) {
    case baseSepolia.id:
      return baseSepolia;
    case arbitrumSepolia.id:
      return arbitrumSepolia;
    default:
      return undefined;
  }
}
