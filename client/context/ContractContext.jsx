import { createContext, useContext, useEffect, useState } from 'react'
import { useProvider, useSigner, useChainId } from 'wagmi'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESSES as ADDR_FROM_CONSTANTS } from '../utils/constants'
import { CONTRACT_ABIS } from '../utils/contracts'

const ContractContext = createContext()

export const useContracts = () => {
  const context = useContext(ContractContext)
  if (!context) {
    throw new Error('useContracts must be used within a ContractProvider')
  }
  return context
}

export const ContractProvider = ({ children }) => {
  const provider = useProvider()
  const { data: signer } = useSigner()
  const chainId = useChainId()

  const [deedNFT, setDeedNFT] = useState(null)
  const [landRegistry, setLandRegistry] = useState(null)
  const [transferManager, setTransferManager] = useState(null)

  useEffect(() => {
    if (provider && signer) {
      initializeContracts()
    }
  }, [provider, signer])

  const initializeContracts = async () => {
    const addresses = ADDR_FROM_CONSTANTS?.[chainId] || ADDR_FROM_CONSTANTS?.[137] || {}

    const deedNFTAddr = addresses.DEED_NFT || addresses.DeedNFT
    const landRegistryAddr = addresses.LAND_REGISTRY || addresses.LandRegistry
    const transferManagerAddr = addresses.TRANSFER_MANAGER || addresses.TransferManager

    const deedNFTContract = deedNFTAddr
      ? new ethers.Contract(deedNFTAddr, CONTRACT_ABIS.DeedNFT || [], signer || provider)
      : null

    const landRegistryContract = landRegistryAddr
      ? new ethers.Contract(landRegistryAddr, CONTRACT_ABIS.LandRegistry || [], signer || provider)
      : null

    const transferManagerContract = transferManagerAddr
      ? new ethers.Contract(transferManagerAddr, CONTRACT_ABIS.TransferManager || [], signer || provider)
      : null

    setDeedNFT(deedNFTContract)
    setLandRegistry(landRegistryContract)
    setTransferManager(transferManagerContract)
  }

  const value = {
    deedNFT,
    landRegistry,
    transferManager,
    isInitialized: Boolean(deedNFT && landRegistry),
  }

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  )
}