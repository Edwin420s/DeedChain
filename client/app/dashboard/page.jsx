'use client'

import { useAccount, useConnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Home, 
  Plus, 
  Shield, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { isConnected, address } = useAccount()
  const router = useRouter()
  const [userStats, setUserStats] = useState(null)
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
      return
    }

    fetchUserData()
  }, [isConnected, address])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API calls
      const mockStats = {
        totalProperties: 3,
        verifiedProperties: 2,
        pendingProperties: 1,
        totalTransfers: 5
      }

      const mockProperties = [
        {
          id: '1',
          title: 'Residential Plot - Karen',
          location: 'Karen, Nairobi',
          status: 'VERIFIED',
          tokenId: 123,
          verifiedAt: '2024-01-15'
        },
        {
          id: '2',
          title: 'Commercial Land - Westlands',
          location: 'Westlands, Nairobi',
          status: 'VERIFIED',
          tokenId: 124,
          verifiedAt: '2024-01-10'
        },
        {
          id: '3',
          title: 'Agricultural Land - Kiambu',
          location: 'Kiambu County',
          status: 'PENDING',
          tokenId: null,
          submittedAt: '2024-01-20'
        }
      ]

      setUserStats(mockStats)
      setProperties(mockProperties)
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-400" />
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'VERIFIED':
        return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'PENDING':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'REJECTED':
        return 'text-red-400 bg-red-400/10 border-red-400/20'
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Connect Your Wallet</h2>
          <ConnectButton />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-teal"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-navy">
      {/* Navigation */}
      <nav className="glass-effect border-b border-primary-teal/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-teal rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-primary-navy" />
                </div>
                <span className="text-xl font-bold gradient-text">DeedChain</span>
              </div>
              <div className="hidden md:flex space-x-6">
                <Link href="/dashboard" className="text-primary-teal font-semibold">
                  Dashboard
                </Link>
                <Link href="/register" className="text-text-secondary hover:text-primary-teal transition-colors">
                  Register Property
                </Link>
                <Link href="/properties" className="text-text-secondary hover:text-primary-teal transition-colors">
                  My Properties
                </Link>
                <Link href="/transfer" className="text-text-secondary hover:text-primary-teal transition-colors">
                  Transfer
                </Link>
              </div>
            </div>
            <ConnectButton />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h1>
          <p className="text-text-secondary">
            Manage your properties, track verifications, and handle transfers
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              icon: <Home className="w-6 h-6" />,
              label: 'Total Properties',
              value: userStats?.totalProperties || 0,
              color: 'text-blue-400'
            },
            {
              icon: <Shield className="w-6 h-6" />,
              label: 'Verified',
              value: userStats?.verifiedProperties || 0,
              color: 'text-green-400'
            },
            {
              icon: <Clock className="w-6 h-6" />,
              label: 'Pending',
              value: userStats?.pendingProperties || 0,
              color: 'text-yellow-400'
            },
            {
              icon: <TrendingUp className="w-6 h-6" />,
              label: 'Transfers',
              value: userStats?.totalTransfers || 0,
              color: 'text-purple-400'
            }
          ].map((stat, index) => (
            <div key={index} className="glass-effect rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color} mt-1`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Link 
            href="/register"
            className="glass-effect rounded-xl p-6 hover:shadow-glow-hover transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-teal/10 rounded-lg group-hover:bg-primary-teal/20 transition-colors">
                <Plus className="w-6 h-6 text-primary-teal" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Register Property</h3>
                <p className="text-text-secondary text-sm">
                  Add a new property to the blockchain
                </p>
              </div>
            </div>
          </Link>

          <Link 
            href="/transfer"
            className="glass-effect rounded-xl p-6 hover:shadow-glow-hover transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-teal/10 rounded-lg group-hover:bg-primary-teal/20 transition-colors">
                <ArrowRight className="w-6 h-6 text-primary-teal" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Transfer Ownership</h3>
                <p className="text-text-secondary text-sm">
                  Transfer property to another user
                </p>
              </div>
            </div>
          </Link>

          <Link 
            href="/properties"
            className="glass-effect rounded-xl p-6 hover:shadow-glow-hover transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-teal/10 rounded-lg group-hover:bg-primary-teal/20 transition-colors">
                <Home className="w-6 h-6 text-primary-teal" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">View Properties</h3>
                <p className="text-text-secondary text-sm">
                  See all your registered properties
                </p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Recent Properties */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Recent Properties</h2>
            <Link 
              href="/properties"
              className="text-primary-teal hover:text-primary-teal/80 transition-colors flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {properties.map((property) => (
              <div key={property.id} className="flex items-center justify-between p-4 rounded-lg bg-black/20 hover:bg-black/30 transition-colors">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(property.status)}
                  <div>
                    <h3 className="font-semibold">{property.title}</h3>
                    <p className="text-text-secondary text-sm">{property.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(property.status)}`}>
                    {property.status}
                  </span>
                  {property.tokenId && (
                    <span className="text-text-secondary text-sm">
                      Token #{property.tokenId}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {properties.length === 0 && (
            <div className="text-center py-8">
              <Home className="w-12 h-12 text-text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Properties Yet</h3>
              <p className="text-text-secondary mb-4">
                Get started by registering your first property
              </p>
              <Link 
                href="/register"
                className="bg-primary-teal text-primary-navy px-6 py-2 rounded-lg font-semibold hover:shadow-glow-hover transition-all inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Register Property</span>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}