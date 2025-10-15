export const CONTRACT_ADDRESSES = {
  DEED_NFT: process.env.NEXT_PUBLIC_DEED_NFT_ADDRESS,
  LAND_REGISTRY: process.env.NEXT_PUBLIC_LAND_REGISTRY_ADDRESS,
  TRANSFER_MANAGER: process.env.NEXT_PUBLIC_TRANSFER_MANAGER_ADDRESS,
}

export const IPFS_GATEWAY = 'https://ipfs.io/ipfs/'

export const NETWORK_CONFIG = {
  chainId: 137, // Polygon Mainnet
  chainName: 'Polygon Mainnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: ['https://polygon-rpc.com'],
  blockExplorerUrls: ['https://polygonscan.com/'],
}

export const PROPERTY_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  TRANSFERRING: 'transferring',
}