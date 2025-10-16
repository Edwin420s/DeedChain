import { createContext, useContext, useEffect, useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { userAPI } from '../utils/api'

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
      authenticateAndLoadProfile(address)
    }
  }, [isConnected, address])

  const authenticateAndLoadProfile = async (walletAddress) => {
    try {
      const authRes = await userAPI.authWallet({ walletAddress })
      const token = authRes?.data?.data?.token
      if (token) {
        localStorage.setItem('authToken', token)
      }
      const profileRes = await userAPI.getProfile()
      const profile = profileRes?.data?.data?.user || null
      setUserProfile(profile)
      setUserRole((profile?.role || 'CITIZEN').toLowerCase())
    } catch (error) {
      console.error('Authentication/profile load failed:', error)
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