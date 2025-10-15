import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useWallet } from '../../context/WalletContext'
import { useContracts } from '../../context/ContractContext'
import Navbar from '../../components/Navbar'
import { formatAddress, formatDate, formatArea } from '../../utils/formatters'

const PropertyDetail = () => {
  const router = useRouter()
  const { id } = router.query
  const { isConnected, address } = useWallet()
  const { isInitialized } = useContracts()
  
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [transferring, setTransferring] = useState(false)

  useEffect(() => {
    if (id) {
      fetchPropertyDetails()
    }
  }, [id])

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/property/${id}`)
      const data = await response.json()
      setProperty(data)
    } catch (error) {
      console.error('Failed to fetch property:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTransfer = async () => {
    if (!isConnected || !property) return
    
    setTransferring(true)
    try {
      // Transfer logic would go here
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Transfer initiated successfully!')
    } catch (error) {
      console.error('Transfer failed:', error)
      alert('Transfer failed. Please try again.')
    } finally {
      setTransferring(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-deedchain-navy">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="card animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-deedchain-navy">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Property Not Found</h1>
          <p className="text-gray-300">The requested property could not be found.</p>
        </div>
      </div>
    )
  }

  const isOwner = property.owner?.toLowerCase() === address?.toLowerCase()

  return (
    <div className="min-h-screen bg-deedchain-navy">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {property.location || 'Unknown Location'}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-300">
                <span>Token ID: #{property.tokenId}</span>
                <span className={`px-2 py-1 rounded-full ${
                  property.status === 'verified' ? 'bg-green-500' : 
                  property.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  {property.status?.charAt(0).toUpperCase() + property.status?.slice(1)}
                </span>
              </div>
            </div>
            
            {isOwner && property.status === 'verified' && (
              <button
                onClick={handleTransfer}
                disabled={transferring}
                className="btn-primary disabled:opacity-50"
              >
                {transferring ? 'Transferring...' : 'Transfer Ownership'}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Details */}
            <div className="card">
              <h2 className="text-xl font-semibold text-white mb-4">Property Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Area</label>
                  <p className="text-white font-semibold">{formatArea(property.area)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Survey Number</label>
                  <p className="text-white font-semibold">{property.surveyNumber}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Registered</label>
                  <p className="text-white font-semibold">{formatDate(property.registeredAt)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Coordinates</label>
                  <p className="text-white font-semibold text-sm font-mono">
                    {property.coordinates?.lat}, {property.coordinates?.lng}
                  </p>
                </div>
              </div>
              
              {property.description && (
                <div className="mt-4">
                  <label className="text-sm text-gray-400">Description</label>
                  <p className="text-white mt-1">{property.description}</p>
                </div>
              )}
            </div>

            {/* Ownership History */}
            <div className="card">
              <h2 className="text-xl font-semibold text-white mb-4">Ownership History</h2>
              <div className="space-y-3">
                {property.transfers?.map((transfer, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                    <div>
                      <p className="text-white text-sm">
                        Transferred from {formatAddress(transfer.from)} to {formatAddress(transfer.to)}
                      </p>
                      <p className="text-gray-400 text-xs">{formatDate(transfer.timestamp)}</p>
                    </div>
                    <a 
                      href={`https://polygonscan.com/tx/${transfer.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-teal hover:underline text-sm"
                    >
                      View Transaction
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Owner */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-3">Current Owner</h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent-teal rounded-full flex items-center justify-center">
                  <span className="text-deedchain-navy font-bold">O</span>
                </div>
                <div>
                  <p className="text-white font-mono text-sm">
                    {formatAddress(property.owner)}
                  </p>
                  {isOwner && (
                    <p className="text-accent-teal text-xs">You</p>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-3">Verification Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Status</span>
                  <span className={`font-semibold ${
                    property.status === 'verified' ? 'text-green-400' :
                    property.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {property.status?.charAt(0).toUpperCase() + property.status?.slice(1)}
                  </span>
                </div>
                {property.verifiedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Verified On</span>
                    <span className="text-white">{formatDate(property.verifiedAt)}</span>
                  </div>
                )}
                {property.verifier && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Verified By</span>
                    <span className="text-white text-sm">{formatAddress(property.verifier)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-3">Documents</h3>
              <div className="space-y-2">
                {property.documents?.map((doc, index) => (
                  <a
                    key={index}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-gray-300 text-sm truncate">{doc.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetail