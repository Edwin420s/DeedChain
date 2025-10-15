'use client'

import { useAccount, useConnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Shield, 
  Users, 
  TrendingUp,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function Home() {
  const { isConnected } = useAccount()

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Fraud Prevention',
      description: 'Immutable blockchain records prevent land fraud and duplicate registrations'
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: 'Digital Verification',
      description: 'GPS coordinates and property details stored on-chain for transparent verification'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'DAO Governance',
      description: 'Community-driven verification through decentralized autonomous organization'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Tokenization',
      description: 'Fractional ownership enables real estate investment for everyone'
    }
  ]

  const stats = [
    { value: '0%', label: 'Fraud Cases' },
    { value: 'Instant', label: 'Verification' },
    { value: '24/7', label: 'Access' },
    { value: 'Global', label: 'Accessibility' }
  ]

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass-effect border-b border-primary-teal/20 fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-teal rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-navy" />
              </div>
              <span className="text-xl font-bold gradient-text">DeedChain</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {isConnected ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="text-text-secondary hover:text-primary-teal transition-colors"
                  >
                    Dashboard
                  </Link>
                  <ConnectButton />
                </>
              ) : (
                <ConnectButton />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Revolutionizing{' '}
              <span className="gradient-text">Land Ownership</span>
              <br />
              with Blockchain
            </h1>
            <p className="text-xl text-text-secondary mb-8 max-w-3xl mx-auto">
              DeedChain brings transparency and security to property registration 
              through NFT-based land deeds, DAO verification, and fractional ownership.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {isConnected ? (
                <Link 
                  href="/dashboard"
                  className="bg-primary-teal text-primary-navy px-8 py-3 rounded-lg font-semibold hover:shadow-glow-hover transition-all flex items-center space-x-2"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <div className="bg-primary-teal text-primary-navy px-8 py-3 rounded-lg font-semibold">
                  <ConnectButton />
                </div>
              )}
              <Link 
                href="/register"
                className="border border-primary-teal text-primary-teal px-8 py-3 rounded-lg font-semibold hover:bg-primary-teal/10 transition-all"
              >
                Register Property
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary-teal mb-2">
                  {stat.value}
                </div>
                <div className="text-text-secondary">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Features */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose DeedChain?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="glass-effect rounded-xl p-6 hover:shadow-glow-hover transition-all"
                >
                  <div className="text-primary-teal mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-text-secondary">{feature.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Register Property',
                description: 'Upload property details and documents to create a digital land deed'
              },
              {
                step: '02',
                title: 'DAO Verification',
                description: 'Community validators verify property details through transparent voting'
              },
              {
                step: '03',
                title: 'Mint & Transfer',
                description: 'Get your NFT deed and easily transfer ownership through smart contracts'
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-teal text-primary-navy rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-text-secondary">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-6">Ready to Secure Your Property?</h2>
            <p className="text-xl text-text-secondary mb-8">
              Join thousands of landowners who have already protected their assets with DeedChain
            </p>
            {isConnected ? (
              <Link 
                href="/register"
                className="bg-primary-teal text-primary-navy px-8 py-4 rounded-lg font-semibold hover:shadow-glow-hover transition-all inline-flex items-center space-x-2"
              >
                <span>Register Your First Property</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <div className="bg-primary-teal text-primary-navy px-8 py-4 rounded-lg font-semibold inline-block">
                <ConnectButton />
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-effect border-t border-primary-teal/20 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-primary-teal rounded flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-navy" />
            </div>
            <span className="text-lg font-bold gradient-text">DeedChain</span>
          </div>
          <p className="text-text-secondary">
            Securing land ownership through blockchain technology
          </p>
        </div>
      </footer>
    </div>
  )
}