import { useEffect, useMemo, useState } from 'react';
import { publicClients } from '@/lib/viem';
import { sepolia } from 'viem/chains';
import { Address } from 'viem';
import { SHIP_SPECS_ADDRESS } from '@/config/networks';
import { STARHUB_ABI } from '@/lib/abi';

// Types
export interface GameState {
  active: boolean;
  round: number;
  player1Health: number;
  player2Health: number;
  player1Attack: number;
  player1Defense: number;
  player2Attack: number;
  player2Defense: number;
  gameWinner: `0x${string}`;
}

export interface ShipSpecs {
  health: bigint;
  attack: bigint;
  defense: bigint;
}

export interface MessagingFee {
  nativeFee: bigint;
  lzTokenFee: bigint;
}

export interface StarHubState {
  gameState: GameState | null;
  shipSpecs: ShipSpecs | null;
  isLoading: boolean;
  error?: string;
}

export function useStarHubContract() {
  const chain = sepolia;
  const contractAddress = SHIP_SPECS_ADDRESS;
  const pubClient = publicClients[chain.id];

  const [state, setState] = useState<StarHubState>({
    gameState: null,
    shipSpecs: null,
    isLoading: false,
  });

  const contract = useMemo(() => {
    return {
      address: contractAddress,
      chain,
      // View functions
      async getGameState() {
        return pubClient.readContract({
          abi: STARHUB_ABI,
          address: contractAddress,
          functionName: 'getGameState',
          args: [],
        }) as Promise<
          [
            boolean,
            number,
            number,
            number,
            number,
            number,
            number,
            number,
            `0x${string}`,
          ]
        >;
      },
      async getPlayerHealth(playerId: number) {
        return pubClient.readContract({
          abi: STARHUB_ABI,
          address: contractAddress,
          functionName: 'playerHealth',
          args: [playerId],
        }) as Promise<number>;
      },
      async getPlayerAttackZones(playerId: number) {
        return pubClient.readContract({
          abi: STARHUB_ABI,
          address: contractAddress,
          functionName: 'playerAttackZones',
          args: [playerId],
        }) as Promise<number>;
      },
      async getPlayerDefenseZones(playerId: number) {
        return pubClient.readContract({
          abi: STARHUB_ABI,
          address: contractAddress,
          functionName: 'playerDefenseZones',
          args: [playerId],
        }) as Promise<number>;
      },
      async getCurrentRound() {
        return pubClient.readContract({
          abi: STARHUB_ABI,
          address: contractAddress,
          functionName: 'currentRound',
          args: [],
        }) as Promise<number>;
      },
      async isGameActive() {
        return pubClient.readContract({
          abi: STARHUB_ABI,
          address: contractAddress,
          functionName: 'gameActive',
          args: [],
        }) as Promise<boolean>;
      },
      async getWinner() {
        return pubClient.readContract({
          abi: STARHUB_ABI,
          address: contractAddress,
          functionName: 'winner',
          args: [],
        }) as Promise<`0x${string}`>;
      },
      async getLastMessage() {
        return pubClient.readContract({
          abi: STARHUB_ABI,
          address: contractAddress,
          functionName: 'lastMessage',
          args: [],
        }) as Promise<string>;
      },
      async getOwner() {
        return pubClient.readContract({
          abi: STARHUB_ABI,
          address: contractAddress,
          functionName: 'owner',
          args: [],
        }) as Promise<`0x${string}`>;
      },
      async getMaxHealth() {
        return pubClient.readContract({
          abi: STARHUB_ABI,
          address: contractAddress,
          functionName: 'MAX_HEALTH',
          args: [],
        }) as Promise<number>;
      },
      async getRoundCompletions(round: number, playerId: number) {
        return pubClient.readContract({
          abi: STARHUB_ABI,
          address: contractAddress,
          functionName: 'roundCompletions',
          args: [round, playerId],
        }) as Promise<boolean>;
      },
      async quoteSendString(
        dstEid: number,
        message: string,
        options: `0x${string}`,
        payInLzToken: boolean
      ) {
        return pubClient.readContract({
          abi: STARHUB_ABI,
          address: contractAddress,
          functionName: 'quoteSendString',
          args: [dstEid, message, options, payInLzToken],
        }) as Promise<[bigint, bigint]>;
      },
    };
  }, [contractAddress, chain, pubClient]);

  const refresh = async () => {
    if (!contractAddress) {
      setState({
        gameState: null,
        shipSpecs: null,
        isLoading: false,
        error: 'Contract not deployed',
      });
      return;
    }

    setState(s => ({ ...s, isLoading: true }));

    try {
      const [
        active,
        round,
        player1Health,
        player2Health,
        player1Attack,
        player1Defense,
        player2Attack,
        player2Defense,
        gameWinner,
      ] = await contract.getGameState();

      const gameState: GameState = {
        active,
        round,
        player1Health,
        player2Health,
        player1Attack,
        player1Defense,
        player2Attack,
        player2Defense,
        gameWinner,
      };

      const shipSpecs: ShipSpecs = {
        health: BigInt(player1Health),
        attack: BigInt(player1Attack),
        defense: BigInt(player1Defense),
      };

      setState({
        gameState,
        shipSpecs,
        isLoading: false,
      });
    } catch (e: any) {
      console.error('[useStarHubContract] Error fetching game state:', e);
      setState({
        gameState: null,
        shipSpecs: null,
        isLoading: false,
        error: e?.message ?? 'Error fetching game state',
      });
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    state,
    contract,
    refresh,
  };
}
