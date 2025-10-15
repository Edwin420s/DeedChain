import { useState, useEffect } from 'react'
import { useWallet } from '../../context/WalletContext'
import Navbar from '../../components/Navbar'
import { formatAddress, formatDate } from '../../utils/formatters'

const AdminDashboard = () => {
  const { isConnected, isAdmin } = useWallet()
  const [stats, setStats] = useState({})
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData()
    }
  }, [isAdmin])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      const [statsResponse, activityResponse] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/recent-activity')
      ])
      
      const statsData = await statsResponse.json()
      const activityData = await activityResponse.json()
      
      setStats(statsData)
      setRecentActivity(activityData.activities || [])
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected || !isAdmin) {
    return (
      <div className="min-h-screen bg-deedchain-navy">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300">
            You need administrator privileges to access this page.
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">
            Overview of platform statistics and recent activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card text-center">
            <div className="text-2xl font-bold text-accent-teal mb-2">
              {stats.totalProperties || 0}
            </div>
            <div className="text-gray-300 text-sm">Total Properties</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">
              {stats.verifiedProperties || 0}
            </div>
            <div className="text-gray-300 text-sm">Verified Properties</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              {stats.pendingVerifications || 0}
            </div>
            <div className="text-gray-300 text-sm">Pending Verifications</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {stats.totalUsers || 0}
            </div>
            <div className="text-gray-300 text-sm">Registered Users</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-800">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'registration' ? 'bg-blue-400' :
                    activity.type === 'verification' ? 'bg-green-400' :
                    activity.type === 'transfer' ? 'bg-purple-400' : 'bg-gray-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      {activity.description}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-gray-400 text-xs">
                        {formatAddress(activity.user)}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {formatDate(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href="/admin/verify"
                className="block p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-semibold">Verify Properties</h4>
                    <p className="text-gray-300 text-sm">
                      Review and approve pending property registrations
                    </p>
                  </div>
                  <div className="text-2xl">✅</div>
                </div>
              </a>

              <a
                href="/admin/users"
                className="block p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-semibold">Manage Users</h4>
                    <p className="text-gray-300 text-sm">
                      View and manage user accounts and permissions
                    </p>
                  </div>
                  <div className="text-2xl">👥</div>
                </div>
              </a>

              <a
                href="/admin/analytics"
                className="block p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-semibold">View Analytics</h4>
                    <p className="text-gray-300 text-sm">
                      Platform usage statistics and insights
                    </p>
                  </div>
                  <div className="text-2xl">📊</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard