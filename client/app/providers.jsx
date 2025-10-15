'use client'

import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { linea, lineaTestnet } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { RainbowKitProvider, getDefaultWallets, darkTheme } from '@rainbow-me/rainbowkit'
import { Toaster } from 'react-hot-toast'
import '@rainbow-me/rainbowkit/styles.css'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [lineaTestnet, linea],
  [publicProvider()]
)

const { connectors } = getDefaultWallets({
  appName: 'DeedChain',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'deedchain-app',
  chains,
})

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

export function Providers({ children }) {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider 
        chains={chains} 
        theme={darkTheme({
          accentColor: '#64FFDA',
          accentColorForeground: '#0A192F',
          borderRadius: 'medium',
        })}
      >
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#0A192F',
              color: '#F8FAFC',
              border: '1px solid #64FFDA',
            },
          }}
        />
      </RainbowKitProvider>
    </WagmiConfig>
  )
}