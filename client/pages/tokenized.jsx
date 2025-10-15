import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletContext'
import { useMarketplace } from '../hooks/useMarketplace'
import Navbar from '../components/Navbar'
import TokenizationWizard from '../components/TokenizationWizard'

const TokenizedProperties = () => {
  const { isConnected, address } = useWallet()
  const { tokenizedProperties, loading, error, fetchTokenizedProperties } = useMarketplace()
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [showTokenizationModal, setShowTokenizationModal] = useState(false)

  useEffect(() => {
    if (isConnected) {
      fetchTokenizedProperties()
    }
  }, [isConnected])

  const handleTokenizeClick = (property) => {
    setSelectedProperty(property)
    setShowTokenizationModal(true)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-deedchain-navy">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-gray-300">
            Connect your wallet to view and manage tokenized properties
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-deedchain-navy">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Tokenized Properties</h1>
            <p className="text-gray-300">
              Invest in fractional ownership of real estate properties
            </p>
          </div>
          
          <button
            onClick={() => setShowTokenizationModal(true)}
            className="btn-primary"
          >
            Tokenize Property
          </button>
        </div>

        {/* Tokenized Properties Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-700 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Properties</h3>
            <p className="text-gray-300 mb-4">{error}</p>
            <button onClick={fetchTokenizedProperties} className="btn-primary">
              Try Again
            </button>
          </div>
        ) : tokenizedProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokenizedProperties.map(property => (
              <div key={property.tokenId} className="card group hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {property.location}
                  </h3>
                  <span className="px-2 py-1 bg-indigo-500 rounded-full text-xs font-medium">
                    Tokenized
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Token Symbol:</span>
                    <span className="text-white font-semibold">{property.tokenSymbol}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Supply:</span>
                    <span className="text-white font-semibold">
                      {property.totalSupply?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Price per Token:</span>
                    <span className="text-white font-semibold">
                      ${property.pricePerToken}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Available:</span>
                    <span className="text-white font-semibold">
                      {property.availableSupply?.toLocaleString()} tokens
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button className="flex-1 btn-secondary py-2 text-sm">
                    View Details
                  </button>
                  <button className="flex-1 btn-primary py-2 text-sm">
                    Invest
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Tokenized Properties</h3>
            <p className="text-gray-300 mb-6">
              There are no tokenized properties available for investment yet.
            </p>
            <button 
              onClick={() => setShowTokenizationModal(true)}
              className="btn-primary"
            >
              Be the First to Tokenize
            </button>
          </div>
        )}
      </div>

      {/* Tokenization Modal */}
      <TokenizationWizard
        isOpen={showTokenizationModal}
        onClose={() => {
          setShowTokenizationModal(false)
          setSelectedProperty(null)
        }}
        property={selectedProperty}
      />
    </div>
  )
}

export default TokenizedProperties