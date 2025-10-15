import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletContext'
import { useContracts } from '../context/ContractContext'
import Navbar from '../components/Navbar'
import PropertyCard from '../components/PropertyCard'
import Link from 'next/link'

const Dashboard = () => {
  const { isConnected, address } = useWallet()
  const { isInitialized } = useContracts()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (isConnected && address) {
      fetchUserProperties()
    }
  }, [isConnected, address, isInitialized])

  const fetchUserProperties = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/user/properties?address=${address}`)
      const data = await response.json()
      setProperties(data.properties || [])
    } catch (error) {
      console.error('Failed to fetch properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProperties = properties.filter(property => {
    if (activeTab === 'all') return true
    return property.status === activeTab
  })

  const stats = {
    total: properties.length,
    verified: properties.filter(p => p.status === 'verified').length,
    pending: properties.filter(p => p.status === 'pending').length,
    transferring: properties.filter(p => p.status === 'transferring').length,
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-deedchain-navy">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Please Connect Your Wallet</h1>
          <p className="text-gray-300 mb-8">Connect your wallet to view your property dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-deedchain-navy">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Property Dashboard</h1>
          <p className="text-gray-300">Manage and view all your registered properties</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-gray-300 text-sm">Total Properties</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-400">{stats.verified}</div>
            <div className="text-gray-300 text-sm">Verified</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-gray-300 text-sm">Pending</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.transferring}</div>
            <div className="text-gray-300 text-sm">In Transfer</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex space-x-2 overflow-x-auto">
            {[
              { id: 'all', label: 'All Properties' },
              { id: 'verified', label: 'Verified' },
              { id: 'pending', label: 'Pending' },
              { id: 'transferring', label: 'In Transfer' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-accent-teal text-deedchain-navy font-semibold'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <Link href="/register" className="btn-primary whitespace-nowrap">
            Register New Property
          </Link>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-700 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map(property => (
              <PropertyCard key={property.tokenId} property={property} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Properties Found</h3>
            <p className="text-gray-300 mb-6">
              {activeTab === 'all' 
                ? "You haven't registered any properties yet."
                : `No properties with status "${activeTab}" found.`
              }
            </p>
            <Link href="/register" className="btn-primary">
              Register Your First Property
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard