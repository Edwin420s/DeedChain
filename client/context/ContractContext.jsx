import { createContext, useContext, useEffect, useState } from 'react'
import { useContract, useProvider, useSigner } from 'wagmi'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESSES } from '../utils/constants'

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
  
  const [deedNFT, setDeedNFT] = useState(null)
  const [landRegistry, setLandRegistry] = useState(null)
  const [transferManager, setTransferManager] = useState(null)

  useEffect(() => {
    if (provider && signer) {
      initializeContracts()
    }
  }, [provider, signer])

  const initializeContracts = async () => {
    // Contract ABIs would be imported here
    // For now, we'll set up the contract instances
    const deedNFTContract = new ethers.Contract(
      CONTRACT_ADDRESSES.DEED_NFT,
      [], // ABI would go here
      signer || provider
    )
    
    const landRegistryContract = new ethers.Contract(
      CONTRACT_ADDRESSES.LAND_REGISTRY,
      [], // ABI would go here
      signer || provider
    )
    
    const transferManagerContract = new ethers.Contract(
      CONTRACT_ADDRESSES.TRANSFER_MANAGER,
      [], // ABI would go here
      signer || provider
    )

    setDeedNFT(deedNFTContract)
    setLandRegistry(landRegistryContract)
    setTransferManager(transferManagerContract)
  }

  const value = {
    deedNFT,
    landRegistry,
    transferManager,
    isInitialized: deedNFT && landRegistry && transferManager,
  }

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  )
}