import { ethers } from 'ethers'

// Contract ABIs (simplified versions)
export const CONTRACT_ABIS = {
  DeedNFT: [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function balanceOf(address owner) view returns (uint256)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function transferFrom(address from, address to, uint256 tokenId)",
    "function safeTransferFrom(address from, address to, uint256 tokenId)",
    "function approve(address to, uint256 tokenId)",
    "function getApproved(uint256 tokenId) view returns (address)",
    "function setApprovalForAll(address operator, bool approved)",
    "function isApprovedForAll(address owner, address operator) view returns (bool)",
    "function mint(address to, string memory tokenURI) returns (uint256)",
    "function burn(uint256 tokenId)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
    "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)"
  ],

  LandRegistry: [
    "function registerProperty(string memory ipfsHash, string memory location, uint256 area) returns (uint256)",
    "function verifyProperty(uint256 tokenId, address verifier)",
    "function revokeVerification(uint256 tokenId)",
    "function getProperty(uint256 tokenId) view returns (tuple(address owner, string ipfsHash, string location, uint256 area, bool verified, address verifier))",
    "function getPropertiesByOwner(address owner) view returns (uint256[])",
    "function transferProperty(uint256 tokenId, address newOwner)",
    "function isPropertyVerified(uint256 tokenId) view returns (bool)",
    "event PropertyRegistered(uint256 indexed tokenId, address indexed owner, string ipfsHash)",
    "event PropertyVerified(uint256 indexed tokenId, address indexed verifier)",
    "event PropertyTransferred(uint256 indexed tokenId, address indexed from, address indexed to)"
  ],

  TokenizationFactory: [
    "function tokenizeProperty(uint256 deedTokenId, string memory tokenName, string memory tokenSymbol, uint256 totalSupply) returns (address)",
    "function getTokenizedProperty(uint256 deedTokenId) view returns (address)",
    "function isTokenized(uint256 deedTokenId) view returns (bool)",
    "function getTokenizationFee() view returns (uint256)",
    "event PropertyTokenized(uint256 indexed deedTokenId, address indexed tokenContract)"
  ]
}

// Contract addresses (would be environment-specific)
export const CONTRACT_ADDRESSES = {
  137: { // Polygon Mainnet
    DeedNFT: '0x1234567890123456789012345678901234567890',
    LandRegistry: '0x1234567890123456789012345678901234567891',
    TokenizationFactory: '0x1234567890123456789012345678901234567892'
  },
  80001: { // Polygon Mumbai
    DeedNFT: '0x1234567890123456789012345678901234567890',
    LandRegistry: '0x1234567890123456789012345678901234567891',
    TokenizationFactory: '0x1234567890123456789012345678901234567892'
  }
}

// Contract interaction utilities
export const contractUtils = {
  // Create contract instance
  createContract: (address, abi, signerOrProvider) => {
    return new ethers.Contract(address, abi, signerOrProvider)
  },

  // Encode function call
  encodeFunctionCall: (contractInterface, functionName, params) => {
    return contractInterface.encodeFunctionData(functionName, params)
  },

  // Decode function result
  decodeFunctionResult: (contractInterface, functionName, data) => {
    return contractInterface.decodeFunctionResult(functionName, data)
  },

  // Estimate gas for transaction
  estimateGas: async (contract, functionName, params, from) => {
    try {
      return await contract.estimateGas[functionName](...params, { from })
    } catch (error) {
      console.error('Gas estimation failed:', error)
      throw error
    }
  },

  // Get contract events
  getEvents: async (contract, eventName, filter = {}, fromBlock = 0, toBlock = 'latest') => {
    try {
      return await contract.queryFilter(
        contract.filters[eventName](...Object.values(filter)),
        fromBlock,
        toBlock
      )
    } catch (error) {
      console.error('Failed to get events:', error)
      throw error
    }
  },

  // Format contract values for display
  formatContractValue: (value, type) => {
    if (ethers.BigNumber.isBigNumber(value)) {
      if (type === 'uint256' || type === 'uint') {
        return value.toString()
      } else if (type === 'address') {
        return ethers.utils.getAddress(value.toHexString())
      }
    } else if (typeof value === 'string' && ethers.utils.isAddress(value)) {
      return ethers.utils.getAddress(value)
    }
    return value
  }
}

// Contract event listeners
export const createContractListener = (contract, eventName, callback) => {
  const listener = (...args) => {
    const event = args[args.length - 1]
    callback(event)
  }

  contract.on(eventName, listener)

  return () => {
    contract.off(eventName, listener)
  }
}

// Batch contract calls
export const batchContractCalls = async (calls) => {
  const results = await Promise.allSettled(calls)
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return { success: true, data: result.value }
    } else {
      return { 
        success: false, 
        error: result.reason,
        callIndex: index
      }
    }
  })
}