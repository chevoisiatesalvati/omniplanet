import { useEffect, useMemo, useState } from 'react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';
import { NetworkKey, NETWORKS } from '@/config/networks';
import { toBytes32, useStarshipContract } from '@/hooks/useStarshipContract';

export interface StarshipState {
  hasShip: boolean;
  tokenId?: bigint;
  tokenUri?: string;
  isLoading: boolean;
  error?: string;
}

export function useStarship(network: NetworkKey) {
  const { address } = useAccount();
  const contract = useStarshipContract(network);
  const [state, setState] = useState<StarshipState>({
    hasShip: false,
    isLoading: false,
  });

  const refresh = async () => {
    if (!address) return setState(s => ({ ...s, hasShip: false }));
    setState(s => ({ ...s, isLoading: true }));
    try {
      const bal = await contract.readBalanceOf(address as Address);
      const hasShip = bal > 0n;
      // For now assume tokenId = 1 for first ship minted
      const tokenId = hasShip ? 1n : undefined;
      const tokenUri = tokenId ? await contract.tokenURI(tokenId) : undefined;
      setState({ hasShip, tokenId, tokenUri, isLoading: false });
    } catch (e: any) {
      setState({
        hasShip: false,
        isLoading: false,
        error: e?.message ?? 'Error',
      });
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, network]);

  const mint = async (amount: bigint = 1n) => {
    if (!address) throw new Error('No wallet');
    const tx = await contract.mint(address as Address, amount);
    return tx;
  };

  const travel = async (params: {
    destination: NetworkKey;
    tokenId: bigint;
  }) => {
    if (!address) throw new Error('No wallet');
    const dst = NETWORKS[params.destination];
    if (!dst.lzEid) throw new Error('Missing LayerZero EID for destination');
    const to = toBytes32(address as Address);

    try {
      const msgFee = await contract.quoteSend({
        dstEid: dst.lzEid,
        toAddressBytes32: to,
        tokenId: params.tokenId,
      });

      const tx = await contract.send({
        dstEid: dst.lzEid,
        toAddressBytes32: to,
        tokenId: params.tokenId,
        feeNative: msgFee.nativeFee,
        refundAddress: address as Address,
      });
      return tx;
    } catch (error) {
      console.error('Travel error:', error);
      throw error;
    }
  };

  return {
    state,
    refresh,
    mint,
    travel,
  };
}
