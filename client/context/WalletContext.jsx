import { createContext, useContext, useEffect, useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

const WalletContext = createContext()

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

export const WalletProvider = ({ children }) => {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  
  const [userRole, setUserRole] = useState('user')
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    if (isConnected && address) {
      fetchUserProfile(address)
    }
  }, [isConnected, address])

  const fetchUserProfile = async (walletAddress) => {
    try {
      const response = await fetch(`/api/user/${walletAddress}`)
      const profile = await response.json()
      setUserProfile(profile)
      setUserRole(profile.role || 'user')
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
  }

  const value = {
    address,
    isConnected,
    connect,
    disconnect,
    connectors,
    userRole,
    userProfile,
    isAdmin: userRole === 'admin',
    isVerifier: userRole === 'verifier' || userRole === 'admin',
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}