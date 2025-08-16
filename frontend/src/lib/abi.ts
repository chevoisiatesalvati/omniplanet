import baseAbiJson from '../../../lz/starship-nft/deployments/base-testnet/MyONFT721Mock.json';
import arbAbiJson from '../../../lz/starship-nft/deployments/arbitrum-testnet/MyONFT721Mock.json';

export type ContractAbi = typeof baseAbiJson.abi;

export const STARSHIP_ABI: ContractAbi = baseAbiJson.abi as any;

export const STARSHIP_ADDRESSES = {
  base: baseAbiJson.address as `0x${string}`,
  arbitrum: arbAbiJson.address as `0x${string}`,
};
