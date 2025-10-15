import { useState, useEffect } from 'react'
import { useWallet } from '../../context/WalletContext'
import Navbar from '../../components/Navbar'
import { formatAddress, formatDate } from '../../utils/formatters'

const AdminVerify = () => {
  const { isConnected, isVerifier } = useWallet()
  const [pendingProperties, setPendingProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(null)

  useEffect(() => {
    if (isVerifier) {
      fetchPendingProperties()
    }
  }, [isVerifier])

  const fetchPendingProperties = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/pending-properties')
      const data = await response.json()
      setPendingProperties(data.properties || [])
    } catch (error) {
      console.error('Failed to fetch pending properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (propertyId, approved) => {
    setVerifying(propertyId)
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          approved,
        }),
      })

      if (response.ok) {
        // Remove from pending list
        setPendingProperties(prev => 
          prev.filter(prop => prop.tokenId !== propertyId)
        )
        alert(`Property ${approved ? 'approved' : 'rejected'} successfully!`)
      } else {
        throw new Error('Verification failed')
      }
    } catch (error) {
      console.error('Verification failed:', error)
      alert('Verification failed. Please try again.')
    } finally {
      setVerifying(null)
    }
  }

  if (!isConnected || !isVerifier) {
    return (
      <div className="min-h-screen bg-deedchain-navy">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300">
            You need to be a verified administrator to access this page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-deedchain-navy">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Property Verification</h1>
          <p className="text-gray-300">
            Review and verify pending property registration requests
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-2xl font-bold text-white">{pendingProperties.length}</div>
            <div className="text-gray-300 text-sm">Pending Verification</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {pendingProperties.filter(p => !p.documents).length}
            </div>
            <div className="text-gray-300 text-sm">Missing Documents</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-400">
              {pendingProperties.filter(p => p.verificationRequests > 0).length}
            </div>
            <div className="text-gray-300 text-sm">Under Review</div>
          </div>
        </div>

        {/* Pending Properties List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : pendingProperties.length > 0 ? (
          <div className="space-y-6">
            {pendingProperties.map(property => (
              <div key={property.tokenId} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {property.location}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                      <span>Token ID: #{property.tokenId}</span>
                      <span>Area: {property.area} acres</span>
                      <span>Registered: {formatDate(property.registeredAt)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-300">Owner</p>
                    <p className="text-white font-mono text-sm">
                      {formatAddress(property.owner)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                  {/* Property Details */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Property Details</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-400">Survey Number:</span> {property.surveyNumber}</p>
                      <p><span className="text-gray-400">Coordinates:</span> {property.coordinates?.lat}, {property.coordinates?.lng}</p>
                      {property.description && (
                        <p><span className="text-gray-400">Description:</span> {property.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Documents</h4>
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
                          <span className="text-gray-300 text-sm">{doc.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => handleVerification(property.tokenId, false)}
                    disabled={verifying === property.tokenId}
                    className="flex-1 btn-secondary disabled:opacity-50"
                  >
                    {verifying === property.tokenId ? 'Processing...' : 'Reject'}
                  </button>
                  <button
                    onClick={() => handleVerification(property.tokenId, true)}
                    disabled={verifying === property.tokenId}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {verifying === property.tokenId ? 'Processing...' : 'Approve & Verify'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-white mb-2">All Caught Up!</h3>
            <p className="text-gray-300">
              There are no pending properties requiring verification at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminVerify