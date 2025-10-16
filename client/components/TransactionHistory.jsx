import { useState, useEffect } from 'react'
import { formatAddress, formatDate } from '../utils/formatters'

const TransactionHistory = ({ address, limit = 10 }) => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTransactionHistory()
  }, [address])

  const fetchTransactionHistory = async () => {
    if (!address) return
    
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/transactions/${address}?limit=${limit}`)
      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (err) {
      setError('Failed to load transaction history')
      console.error('Error fetching transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTransactionType = (type) => {
    const types = {
      'registration': { label: 'Property Registration', color: 'bg-blue-500' },
      'transfer': { label: 'Ownership Transfer', color: 'bg-purple-500' },
      'verification': { label: 'Property Verified', color: 'bg-green-500' },
      'tokenization': { label: 'Property Tokenized', color: 'bg-indigo-500' }
    }
    return types[type] || { label: type, color: 'bg-gray-500' }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center space-x-4 p-3">
            <div className="w-3 h-3 bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 mb-4">{error}</p>
        <button onClick={fetchTransactionHistory} className="btn-secondary text-sm">
          Retry
        </button>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">📝</div>
        <p className="text-gray-400">No transactions found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx, index) => {
        const typeInfo = getTransactionType(tx.type)
        return (
          <div key={tx.id || index} className="flex items-start space-x-4 p-3 rounded-lg bg-gray-800 hover:bg-gray-750 transition-colors">
            <div className={`w-3 h-3 rounded-full mt-2 ${typeInfo.color}`}></div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <p className="text-white font-medium text-sm truncate">
                  {typeInfo.label}
                </p>
                <a
                  href={`https://polygonscan.com/tx/${tx.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-teal hover:underline text-xs ml-2 flex-shrink-0"
                >
                  View
                </a>
              </div>
              
              {tx.property && (
                <p className="text-gray-300 text-sm truncate mb-1">
                  {tx.property.location}
                </p>
              )}
              
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>{formatDate(tx.timestamp)}</span>
                <span>Block #{tx.blockNumber}</span>
              </div>
            </div>
          </div>
        )
      })}
      
      {transactions.length >= limit && (
        <div className="text-center pt-4">
          <button className="text-accent-teal hover:underline text-sm">
            View All Transactions
          </button>
        </div>
      )}
    </div>
  )
}

export default TransactionHistory