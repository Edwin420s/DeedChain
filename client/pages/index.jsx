import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletContext'
import { useConnectModal } from 'connectkit'
import Navbar from '../components/Navbar'
import QuickActions from '../components/QuickActions'
import StatsOverview from '../components/StatsOverview'
import Link from 'next/link'

const HomePage = () => {
  const { isConnected } = useWallet()
  const { openConnectModal } = useConnectModal()
  const [stats, setStats] = useState({
    totalProperties: 12543,
    verifiedProperties: 8942,
    totalTransactions: 45678,
    totalUsers: 8921,
    pendingVerifications: 342,
    tokenizedProperties: 567
  })

  const features = [
    {
      title: 'Secure Land Registration',
      description: 'Register your property as an NFT with immutable ownership records on the blockchain.',
      icon: '🏠',
      benefits: ['Immutable records', 'Fraud prevention', 'Instant verification']
    },
    {
      title: 'Property Tokenization',
      description: 'Fractionalize property ownership into tradable tokens for investment opportunities.',
      icon: '💰',
      benefits: ['Fractional ownership', 'Liquidity', 'Investment access']
    },
    {
      title: 'Transparent Verification',
      description: 'DAO-based verification system ensures trust and eliminates corruption.',
      icon: '✅',
      benefits: ['DAO verified', 'Transparent process', 'Community trust']
    },
    {
      title: 'Global Marketplace',
      description: 'Buy, sell, and trade property rights in a secure global marketplace.',
      icon: '🌍',
      benefits: ['Global access', 'Secure transactions', 'Market pricing']
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Property Investor',
      content: 'DeedChain revolutionized how I invest in real estate. The transparency and security are unmatched.',
      avatar: '👩'
    },
    {
      name: 'Marcus Johnson',
      role: 'Land Owner',
      content: 'Finally, a system that protects my property rights and makes ownership transfer seamless.',
      avatar: '👨'
    },
    {
      name: 'Amina Patel',
      role: 'Real Estate Developer',
      content: 'Tokenizing properties has opened up new funding opportunities for our development projects.',
      avatar: '👩'
    }
  ]

  return (
    <div className="min-h-screen bg-deedchain-navy">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-bg">
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
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
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

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
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
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-teal mb-2">
                  {stats.totalUsers.toLocaleString()}+
                </div>
                <div className="text-gray-300">Active Users</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background gradient */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-deedchain-navy via-purple-900/20 to-deedchain-navy pointer-events-none" />
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Easy-to-use tools for property registration, verification, and investment
            </p>
          </div>
          <QuickActions />
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card hover-lift p-8">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-accent-teal">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              See what our users are saying about DeedChain
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card text-center p-8">
                <div className="text-4xl mb-4">{testimonial.avatar}</div>
                <p className="text-gray-300 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="text-white font-semibold">{testimonial.name}</div>
                  <div className="text-accent-teal text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Secure Your Property?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of property owners who have already registered their deeds on DeedChain
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isConnected ? (
              <Link href="/register" className="btn-primary text-lg px-8 py-4">
                Register Your Property
              </Link>
            ) : (
              <button onClick={openConnectModal} className="btn-primary text-lg px-8 py-4">
                Connect Wallet to Get Started
              </button>
            )}
            <Link href="/help" className="btn-secondary text-lg px-8 py-4">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage