import { useState, useEffect } from 'react'

const PriceFeed = () => {
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrices()
    const interval = setInterval(fetchPrices, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchPrices = async () => {
    try {
      // In a real app, this would fetch from an API
      const mockPrices = {
        matic: { usd: 0.75, change: 2.1 },
        eth: { usd: 2500, change: -1.2 },
        usdc: { usd: 1.00, change: 0.0 }
      }
      setPrices(mockPrices)
    } catch (error) {
      console.error('Failed to fetch prices:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 4 : 2
    }).format(price)
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-6 text-sm">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-16 mb-1"></div>
            <div className="h-3 bg-gray-700 rounded w-12"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-6 text-sm">
      {Object.entries(prices).map(([token, data]) => (
        <div key={token} className="text-right">
          <div className="text-white font-medium">
            {formatPrice(data.usd)}
          </div>
          <div className={`text-xs ${
            data.change >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {data.change >= 0 ? '↗' : '↘'} {Math.abs(data.change)}%
          </div>
        </div>
      ))}
    </div>
  )
}

export default PriceFeed