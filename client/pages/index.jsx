import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletContext'
import { useConnectModal } from 'connectkit'
import Navbar from '../components/Navbar'
import Link from 'next/link'

const HomePage = () => {
  const { isConnected } = useWallet()
  const { openConnectModal } = useConnectModal()
  const [stats, setStats] = useState({
    totalProperties: 0,
    verifiedProperties: 0,
    totalTransactions: 0,
  })

  useEffect(() => {
    // Fetch platform stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }
    
    fetchStats()
  }, [])

  const features = [
    {
      title: 'Secure Land Registration',
      description: 'Register your property as an NFT with immutable ownership records on the blockchain.',
      icon: '🏠',
    },
    {
      title: 'Fraud Prevention',
      description: 'Eliminate duplicate titles and fraudulent transfers with transparent verification.',
      icon: '🛡️',
    },
    {
      title: 'Instant Verification',
      description: 'Verify property ownership instantly with on-chain records accessible to everyone.',
      icon: '⚡',
    },
    {
      title: 'Fractional Ownership',
      description: 'Tokenize your property and enable fractional investment opportunities.',
      icon: '💰',
    },
  ]

  return (
    <div className="min-h-screen bg-deedchain-navy">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Revolutionizing Land
              <span className="text-accent-teal block">Ownership</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              DeedChain brings transparency and security to property ownership through blockchain technology. 
              Fight land fraud and unlock new opportunities with tokenized real estate.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isConnected ? (
                <Link href="/dashboard" className="btn-primary text-lg px-8 py-4">
                  Go to Dashboard
                </Link>
              ) : (
                <button onClick={openConnectModal} className="btn-primary text-lg px-8 py-4">
                  Connect Wallet to Start
                </button>
              )}
              <Link href="/marketplace" className="btn-secondary text-lg px-8 py-4">
                Explore Marketplace
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background gradient */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-deedchain-navy via-purple-900/20 to-deedchain-navy pointer-events-none" />
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-teal mb-2">
                {stats.totalProperties.toLocaleString()}+
              </div>
              <div className="text-gray-300">Properties Registered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-teal mb-2">
                {stats.verifiedProperties.toLocaleString()}+
              </div>
              <div className="text-gray-300">Verified Deeds</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-teal mb-2">
                {stats.totalTransactions.toLocaleString()}+
              </div>
              <div className="text-gray-300">Secure Transactions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose DeedChain?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              We're building the future of real estate with blockchain technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center hover:transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Secure Your Property?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of property owners who have already registered their deeds on DeedChain
          </p>
          {isConnected ? (
            <Link href="/register" className="btn-primary text-lg px-8 py-4">
              Register Your Property
            </Link>
          ) : (
            <button onClick={openConnectModal} className="btn-primary text-lg px-8 py-4">
              Connect Wallet to Get Started
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

export default HomePage