import { useState } from 'react'
import { ConnectKitButton } from 'connectkit'
import { useWallet } from '../context/WalletContext'
import Link from 'next/link'
import { useRouter } from 'next/router'
import NetworkSwitcher from './NetworkSwitcher'
import NotificationBell from './NotificationBell'
import UserProfile from './UserProfile'
import PriceFeed from './PriceFeed'

const Navbar = () => {
  const { isConnected, userRole, isAdmin, isVerifier } = useWallet()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', show: isConnected },
    { name: 'Register Property', href: '/register', show: isConnected },
    { name: 'Marketplace', href: '/marketplace', show: true },
    { name: 'Tokenized', href: '/tokenized', show: true },
    { name: 'Analytics', href: '/analytics', show: isConnected },
    { name: 'Transactions', href: '/transactions', show: isConnected },
    { name: 'Verify Properties', href: '/admin/verify', show: isVerifier },
    { name: 'Admin', href: '/admin', show: isAdmin },
  ]

  return (
    <>
      <nav className="bg-deedchain-navy border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Main Navigation */}
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-accent-teal rounded-lg flex items-center justify-center mr-3">
                  <span className="text-deedchain-navy font-bold text-lg">D</span>
                </div>
                <span className="text-white text-xl font-bold">DeedChain</span>
              </Link>
              
              <div className="hidden md:ml-6 md:flex md:space-x-4">
                {navigation.map((item) => 
                  item.show && (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        router.pathname === item.href
                          ? 'text-accent-teal bg-gray-900'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Price Feed */}
              <div className="hidden lg:block">
                <PriceFeed />
              </div>

              {/* Network Switcher */}
              <NetworkSwitcher />

              {/* Notifications */}
              {isConnected && <NotificationBell />}

              {/* Wallet Connection */}
              <ConnectKitButton />

              {/* User Profile */}
              {isConnected && (
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => 
                item.show && (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      router.pathname === item.href
                        ? 'text-accent-teal bg-gray-800'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              )}
              
              {/* Mobile Price Feed */}
              <div className="px-3 py-2">
                <PriceFeed />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* User Profile Modal */}
      <UserProfile 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </>
  )
}

export default Navbar