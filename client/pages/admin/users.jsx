import { useState, useEffect } from 'react'
import { useWallet } from '../../context/WalletContext'
import Navbar from '../../components/Navbar'
import { formatAddress, formatDate } from '../../utils/formatters'

const AdminUsers = () => {
  const { isConnected, isAdmin } = useWallet()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  })

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin, filters])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value)
      })
      
      const response = await fetch(`/api/admin/users?${queryParams}`)
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole })
      })

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ))
      }
    } catch (error) {
      console.error('Failed to update user role:', error)
    }
  }

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentStatus })
      })

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, active: !currentStatus } : user
        ))
      }
    } catch (error) {
      console.error('Failed to update user status:', error)
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
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-300">
            Manage user accounts, roles, and permissions
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search by name or address..."
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Role
              </label>
              <select
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                className="input-field"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="verifier">Verifier</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="input-field"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={fetchUsers}
                className="w-full btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">User</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Role</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Properties</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Joined</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-white font-medium">
                            {user.name || 'Unnamed User'}
                          </div>
                          <div className="text-gray-400 text-sm font-mono">
                            {formatAddress(user.address)}
                          </div>
                          {user.email && (
                            <div className="text-gray-400 text-sm">
                              {user.email}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-accent-teal"
                        >
                          <option value="user">User</option>
                          <option value="verifier">Verifier</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="text-white">{user.stats?.properties || 0}</div>
                        <div className="text-gray-400 text-sm">
                          {user.stats?.verified || 0} verified
                        </div>
                      </td>
                      
                      <td className="py-3 px-4 text-gray-300">
                        {formatDate(user.registeredAt)}
                      </td>
                      
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.active 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleUserStatus(user.id, user.active)}
                            className={`text-xs px-3 py-1 rounded ${
                              user.active
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                          >
                            {user.active ? 'Deactivate' : 'Activate'}
                          </button>
                          
                          <button className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded">
                            View Profile
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Users Found</h3>
              <p className="text-gray-300">
                No users match your current filters.
              </p>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="card text-center">
            <div className="text-2xl font-bold text-accent-teal mb-2">
              {users.filter(u => u.role === 'user').length}
            </div>
            <div className="text-gray-300 text-sm">Regular Users</div>
          </div>
          
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {users.filter(u => u.role === 'verifier').length}
            </div>
            <div className="text-gray-300 text-sm">Verifiers</div>
          </div>
          
          <div className="card text-center">
            <div className="text-2xl font-bold text-purple-400 mb-2">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-gray-300 text-sm">Admins</div>
          </div>
          
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">
              {users.filter(u => u.active).length}
            </div>
            <div className="text-gray-300 text-sm">Active Users</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminUsers