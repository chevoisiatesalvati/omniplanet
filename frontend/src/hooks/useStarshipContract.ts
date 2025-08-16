import { useMemo } from 'react';
import { publicClients } from '@/lib/viem';
import { STARSHIP_ABI } from '@/lib/abi';
import { arbitrumSepolia, baseSepolia } from 'viem/chains';
import { Address, Hex, encodeFunctionData } from 'viem';
import { CONTRACT_ADDRESSES, NetworkKey, NETWORKS } from '@/config/networks';
import { useSwitchChain, useWalletClient } from 'wagmi';

export function useStarshipContract(network: NetworkKey) {
  const contractAddress = CONTRACT_ADDRESSES[network];
  const chain = network === 'base-sepolia' ? baseSepolia : arbitrumSepolia;

  const pubClient = publicClients[chain.id];
  const walletClient = useWalletClient();
  const { switchChainAsync } = useSwitchChain();

  return useMemo(() => {
    return {
      address: contractAddress,
      chain,
      async readBalanceOf(owner: Address) {
        return pubClient.readContract({
          abi: STARSHIP_ABI as any,
          address: contractAddress,
          functionName: 'balanceOf',
          args: [owner],
        }) as Promise<bigint>;
      },
      async mint(to: Address, amount: bigint) {
        const wallet = walletClient.data;
        if (!wallet) throw new Error('Wallet not available');
        if (wallet.chain?.id !== chain.id) {
          await switchChainAsync({ chainId: chain.id });
        }
        const data = encodeFunctionData({
          abi: STARSHIP_ABI as any,
          functionName: 'mint',
          args: [to, amount],
        });
        const fromAccount = to;
        return wallet.sendTransaction({
          to: contractAddress,
          data: data as Hex,
          account: fromAccount,
          chain,
        });
      },
      async ownerOf(tokenId: bigint) {
        return pubClient.readContract({
          abi: STARSHIP_ABI as any,
          address: contractAddress,
          functionName: 'ownerOf',
          args: [tokenId],
        }) as Promise<Address>;
      },
      async tokenURI(tokenId: bigint) {
        return pubClient.readContract({
          abi: STARSHIP_ABI as any,
          address: contractAddress,
          functionName: 'tokenURI',
          args: [tokenId],
        }) as Promise<string>;
      },
      async quoteSend(params: {
        dstEid: number;
        toAddressBytes32: Hex;
        tokenId: bigint;
        extraOptions?: Hex;
      }) {
        const sendParam = {
          dstEid: params.dstEid,
          to: params.toAddressBytes32,
          tokenId: params.tokenId,
          extraOptions: params.extraOptions ?? '0x',
          composeMsg: '0x',
          onftCmd: '0x',
        } as const;
        return pubClient.readContract({
          abi: STARSHIP_ABI as any,
          address: contractAddress,
          functionName: 'quoteSend',
          args: [sendParam, false],
        }) as Promise<{ nativeFee: bigint; lzTokenFee: bigint }>;
      },
      async send(params: {
        dstEid: number;
        toAddressBytes32: Hex;
        tokenId: bigint;
        feeNative: bigint;
        refundAddress: Address;
        extraOptions?: Hex;
      }) {
        const wallet = walletClient.data;
        if (!wallet) throw new Error('Wallet not available');
        if (wallet.chain?.id !== chain.id) {
          await switchChainAsync({ chainId: chain.id });
        }
        const sendParam = {
          dstEid: params.dstEid,
          to: params.toAddressBytes32,
          tokenId: params.tokenId,
          extraOptions: params.extraOptions ?? '0x',
          composeMsg: '0x',
          onftCmd: '0x',
        } as const;
        const fee = { nativeFee: params.feeNative, lzTokenFee: 0n } as const;
        const data = encodeFunctionData({
          abi: STARSHIP_ABI as any,
          functionName: 'send',
          args: [sendParam, fee, params.refundAddress],
        });
        const fromAccount = params.refundAddress;
        return wallet.sendTransaction({
          to: contractAddress,
          data: data as Hex,
          value: params.feeNative,
          account: fromAccount,
          chain,
        });
      },
    };
  }, [contractAddress, chain, pubClient, walletClient.data, switchChainAsync]);
}

export function toBytes32(address: Address): Hex {
  return `0x000000000000000000000000${address.slice(2)}` as Hex;
}
