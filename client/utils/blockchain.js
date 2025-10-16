import { ethers } from 'ethers'

export const formatEther = (value) => {
  if (!value) return '0'
  return ethers.utils.formatEther(value)
}

export const parseEther = (value) => {
  return ethers.utils.parseEther(value.toString())
}

export const formatUnits = (value, decimals = 18) => {
  if (!value) return '0'
  return ethers.utils.formatUnits(value, decimals)
}

export const parseUnits = (value, decimals = 18) => {
  return ethers.utils.parseUnits(value.toString(), decimals)
}

export const shortenAddress = (address, chars = 4) => {
  if (!address) return ''
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export const isAddress = (address) => {
  return ethers.utils.isAddress(address)
}

export const getBlockExplorerUrl = (txHash, chainId = 137) => {
  const explorers = {
    1: 'https://etherscan.io',
    137: 'https://polygonscan.com',
    80001: 'https://mumbai.polygonscan.com',
    56: 'https://bscscan.com',
    42161: 'https://arbiscan.io'
  }
  
  const baseUrl = explorers[chainId] || explorers[137]
  return `${baseUrl}/tx/${txHash}`
}

export const calculateGasMargin = (value) => {
  return value.mul(ethers.BigNumber.from(10000 + 2000)).div(ethers.BigNumber.from(10000))
}

export const waitForTransaction = async (provider, txHash, confirmations = 1) => {
  const receipt = await provider.waitForTransaction(txHash, confirmations)
  return receipt
}