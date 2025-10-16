import { useState } from 'react'
import { useNetwork, useSwitchNetwork } from 'wagmi'
import Modal from './Modal'

const NetworkSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { chain } = useNetwork()
  const { chains, error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork()

  const supportedNetworks = [
    {
      id: 137,
      name: 'Polygon Mainnet',
      icon: '🟣',
      description: 'Recommended for production use'
    },
    {
      id: 80001,
      name: 'Polygon Mumbai',
      icon: '🧪',
      description: 'Testnet for development'
    },
    {
      id: 1,
      name: 'Ethereum Mainnet',
      icon: '🔷',
      description: 'Ethereum main network'
    },
    {
      id: 5,
      name: 'Goerli Testnet',
      icon: '⚫',
      description: 'Ethereum test network'
    }
  ]

  const getNetworkInfo = (chainId) => {
    return supportedNetworks.find(network => network.id === chainId) || {
      name: `Chain ${chainId}`,
      icon: '❓',
      description: 'Unsupported network'
    }
  }

  const handleSwitchNetwork = (chainId) => {
    if (switchNetwork) {
      switchNetwork(chainId)
      setIsOpen(false)
    }
  }

  const currentNetwork = getNetworkInfo(chain?.id)

  return (
    <>
      {/* Network Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
      >
        <span className="text-lg">{currentNetwork.icon}</span>
        <span className="text-white text-sm font-medium hidden sm:block">
          {currentNetwork.name}
        </span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Select Network">
        <div className="space-y-3">
          {/* Current Network */}
          <div className="bg-gray-800 rounded-lg p-4 border border-accent-teal">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{currentNetwork.icon}</span>
              <div className="flex-1">
                <div className="text-white font-semibold">{currentNetwork.name}</div>
                <div className="text-gray-300 text-sm">Currently connected</div>
              </div>
              <div className="w-2 h-2 bg-accent-teal rounded-full"></div>
            </div>
          </div>

          {/* Supported Networks */}
          {supportedNetworks
            .filter(network => network.id !== chain?.id)
            .map((network) => (
              <button
                key={network.id}
                onClick={() => handleSwitchNetwork(network.id)}
                disabled={isLoading && pendingChainId === network.id}
                className="w-full flex items-center space-x-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors disabled:opacity-50"
              >
                <span className="text-2xl">{network.icon}</span>
                <div className="flex-1 text-left">
                  <div className="text-white font-semibold">{network.name}</div>
                  <div className="text-gray-300 text-sm">{network.description}</div>
                </div>
                {isLoading && pendingChainId === network.id && (
                  <div className="w-4 h-4 border-2 border-accent-teal border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            ))}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error.message}</p>
            </div>
          )}

          {/* Network Information */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <h4 className="text-white font-medium mb-2">Network Information</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <div>Current Chain ID: {chain?.id}</div>
              <div>Block Explorer: {chain?.blockExplorers?.default?.name}</div>
              <div>Currency: {chain?.nativeCurrency?.symbol}</div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default NetworkSwitcher