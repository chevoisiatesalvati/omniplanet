import { useEffect, useMemo, useState } from 'react';
import { publicClients } from '@/lib/viem';
import { arbitrumSepolia, baseSepolia } from 'viem/chains';
import { Address } from 'viem';
import { NetworkKey, SHIP_SPECS_ADDRESS } from '@/config/networks';

// ABI for the PlayerStat contract from the mockShipSpecs.json
const PLAYER_STAT_ABI = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'players',
    outputs: [
      {
        internalType: 'uint256',
        name: 'health',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'attack',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'defense',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'playerId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'health',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'attack',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'defense',
        type: 'uint256',
      },
    ],
    name: 'updateStats',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export interface ShipSpecs {
  health: bigint;
  attack: bigint;
  defense: bigint;
}

export interface ShipSpecsState {
  specs: ShipSpecs | null;
  isLoading: boolean;
  error?: string;
}

export function useShipSpecs(network: NetworkKey, playerId: bigint = 1n) {
  // Always use arbitrum-sepolia as the hub for ship specs data
  // The PlayerStat contract is deployed only on arbitrum-sepolia and contains all ship specs
  const chain = arbitrumSepolia;
  const contractAddress = SHIP_SPECS_ADDRESS;
  const pubClient = publicClients[chain.id];

  const [state, setState] = useState<ShipSpecsState>({
    specs: null,
    isLoading: false,
  });

  const contract = useMemo(() => {
    return {
      address: contractAddress,
      chain,
      async getPlayerStats(playerId: bigint) {
        return pubClient.readContract({
          abi: PLAYER_STAT_ABI,
          address: contractAddress,
          functionName: 'players',
          args: [playerId],
        }) as Promise<[bigint, bigint, bigint]>; // [health, attack, defense]
      },
    };
  }, [contractAddress, chain, pubClient]);

  const refresh = async () => {
    if (!contractAddress) {
      // Return mock data if contract is not deployed
      setState({
        specs: {
          health: 100n,
          attack: 10n,
          defense: 10n,
        },
        isLoading: false,
      });
      return;
    }

    setState(s => ({ ...s, isLoading: true }));

    try {
      const [health, attack, defense] = await contract.getPlayerStats(playerId);

      setState({
        specs: {
          health,
          attack,
          defense,
        },
        isLoading: false,
      });
    } catch (e: any) {
      console.error('[useShipSpecs] Error fetching player stats:', e);
      setState({
        specs: null,
        isLoading: false,
        error: e?.message ?? 'Error fetching ship specs',
      });
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, playerId]);

  return {
    state,
    refresh,
  };
}
