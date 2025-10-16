import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletContext'
import Navbar from '../components/Navbar'
import TransactionHistory from '../components/TransactionHistory'
import { formatAddress, formatDate } from '../utils/formatters'

const TransactionsPage = () => {
  const { isConnected, address } = useWallet()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    if (isConnected) {
      fetchTransactions()
    }
  }, [isConnected, filters])

  const fetchTransactions = async () => {
    if (!address) return
    
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value)
      })
      
      const response = await fetch(`/api/transactions/${address}?${queryParams}`)
      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      type: '',
      startDate: '',
      endDate: ''
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-deedchain-navy">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-gray-300">
            Connect your wallet to view your transaction history
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
          <h1 className="text-3xl font-bold text-white mb-2">Transaction History</h1>
          <p className="text-gray-300">
            View all your property-related transactions on the blockchain
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-accent-teal hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Transaction Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="input-field"
              >
                <option value="">All Types</option>
                <option value="registration">Registration</option>
                <option value="transfer">Transfer</option>
                <option value="verification">Verification</option>
                <option value="tokenization">Tokenization</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="card">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
                  <div className="w-3 h-3 bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-800 hover:bg-gray-750 transition-colors">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-3 h-3 rounded-full ${
                      tx.type === 'registration' ? 'bg-blue-500' :
                      tx.type === 'transfer' ? 'bg-purple-500' :
                      tx.type === 'verification' ? 'bg-green-500' :
                      'bg-indigo-500'
                    }`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-white font-semibold text-sm capitalize">
                          {tx.type.replace('_', ' ')}
                        </h4>
                        {tx.status === 'pending' && (
                          <span className="px-2 py-1 bg-yellow-500 text-black text-xs rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                      
                      {tx.property && (
                        <p className="text-gray-300 text-sm truncate">
                          {tx.property.location}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                        <span>{formatDate(tx.timestamp)}</span>
                        <span>Block #{tx.blockNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-gray-300 text-sm">
                      {tx.gasUsed && `Gas: ${tx.gasUsed}`}
                    </span>
                    <a
                      href={`https://polygonscan.com/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-teal hover:underline text-sm"
                    >
                      View on Explorer
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Transactions Found</h3>
              <p className="text-gray-300">
                {hasActiveFilters 
                  ? 'No transactions match your current filters.' 
                  : "You haven't made any transactions yet."
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-primary mt-4"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Export Option */}
        {transactions.length > 0 && (
          <div className="text-center mt-6">
            <button className="btn-secondary">
              Export Transaction History
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionsPage