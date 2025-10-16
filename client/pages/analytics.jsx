import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletContext'
import Navbar from '../components/Navbar'
import StatsOverview from '../components/StatsOverview'

const Analytics = () => {
  const { isConnected, isAdmin } = useWallet()
  const [stats, setStats] = useState({})
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-deedchain-navy">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-gray-300">
            Connect your wallet to view platform analytics
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
            <h1 className="text-3xl font-bold text-white mb-2">Platform Analytics</h1>
            <p className="text-gray-300">
              Insights and statistics about DeedChain platform usage
            </p>
          </div>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field w-auto"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Overview</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-8 bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <StatsOverview stats={stats} />
          )}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Registration Trends */}
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4">Property Registrations</h3>
            <div className="h-64 flex items-center justify-center bg-gray-800 rounded-lg">
              <p className="text-gray-400">Chart: Registration trends over time</p>
            </div>
          </div>

          {/* Verification Status */}
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4">Verification Status</h3>
            <div className="h-64 flex items-center justify-center bg-gray-800 rounded-lg">
              <p className="text-gray-400">Chart: Verification status distribution</p>
            </div>
          </div>

          {/* User Activity */}
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4">User Activity</h3>
            <div className="h-64 flex items-center justify-center bg-gray-800 rounded-lg">
              <p className="text-gray-400">Chart: User activity heatmap</p>
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4">Geographic Distribution</h3>
            <div className="h-64 flex items-center justify-center bg-gray-800 rounded-lg">
              <p className="text-gray-400">Map: Property locations</p>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        {isAdmin && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Admin Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">
                  {stats.avgVerificationTime || '0'}
                </div>
                <div className="text-gray-300 text-sm">Avg Verification Time (days)</div>
              </div>
              
              <div className="card text-center">
                <div className="text-2xl font-bold text-blue-400 mb-2">
                  {stats.successRate || '0'}%
                </div>
                <div className="text-gray-300 text-sm">Transaction Success Rate</div>
              </div>
              
              <div className="card text-center">
                <div className="text-2xl font-bold text-purple-400 mb-2">
                  {stats.activeUsers || '0'}
                </div>
                <div className="text-gray-300 text-sm">Active Users (30d)</div>
              </div>
              
              <div className="card text-center">
                <div className="text-2xl font-bold text-orange-400 mb-2">
                  ${stats.totalVolume || '0'}
                </div>
                <div className="text-gray-300 text-sm">Total Transaction Volume</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics