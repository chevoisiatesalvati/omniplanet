import { useEffect, useState } from 'react';
import { baseSepolia, arbitrumSepolia } from 'viem/chains';
import { NetworkKey } from '@/config/networks';

function mapChainIdToNetworkKey(chainId: number): NetworkKey | undefined {
  switch (chainId) {
    case baseSepolia.id:
      return 'base-sepolia';
    case arbitrumSepolia.id:
      return 'arbitrum-sepolia';
    default:
      return undefined;
  }
}

export function useCurrentNetworkKey(defaultKey: NetworkKey = 'base-sepolia') {
  const [key, setKey] = useState<NetworkKey>(defaultKey);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const provider: any = (window as any).ethereum;
    if (!provider) return;
    const read = async () => {
      try {
        const chainIdHex: string = await provider.request({
          method: 'eth_chainId',
        });
        const chainId = parseInt(chainIdHex, 16);
        const nk = mapChainIdToNetworkKey(chainId);
        if (nk) setKey(nk);
      } catch {}
    };
    read();
    const onChanged = (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      const nk = mapChainIdToNetworkKey(chainId);
      if (nk) setKey(nk);
    };
    provider.on?.('chainChanged', onChanged);
    return () => provider.removeListener?.('chainChanged', onChanged);
  }, []);

  return key;
}
