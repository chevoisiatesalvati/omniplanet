import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { baseSepolia, arbitrumSepolia, Chain } from 'viem/chains';
import { mapChainIdToChain } from '@/lib/chain';

export const publicClients = {
  [baseSepolia.id]: createPublicClient({
    chain: baseSepolia,
    transport: http(),
  }),
  [arbitrumSepolia.id]: createPublicClient({
    chain: arbitrumSepolia,
    transport: http(),
  }),
} as const;

export async function getWalletClient() {
  if (typeof window === 'undefined') return undefined;
  const provider = (window as any).ethereum;
  if (!provider) return undefined;
  // detect chain id from provider
  let chain: Chain = baseSepolia;
  try {
    const chainIdHex: string = await provider.request({
      method: 'eth_chainId',
    });
    const chainId = parseInt(chainIdHex, 16);
    chain = mapChainIdToChain(chainId) ?? baseSepolia;
  } catch {}
  return createWalletClient({ chain, transport: custom(provider) });
}

export function getPublicClientByChainId(chainId: number) {
  switch (chainId) {
    case baseSepolia.id:
      return publicClients[baseSepolia.id];
    case arbitrumSepolia.id:
      return publicClients[arbitrumSepolia.id];
    default:
      return publicClients[baseSepolia.id];
  }
}
