import { useState } from 'react'
import { ConnectKitButton } from 'connectkit'
import { useWallet } from '../context/WalletContext'
import Link from 'next/link'
import { useRouter } from 'next/router'

const Navbar = () => {
  const { isConnected, userRole, isAdmin, isVerifier } = useWallet()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', show: isConnected },
    { name: 'Register Property', href: '/register', show: isConnected },
    { name: 'Marketplace', href: '/marketplace', show: true },
    { name: 'Verify Properties', href: '/admin/verify', show: isVerifier },
    { name: 'Admin', href: '/admin', show: isAdmin },
  ]

  return (
    <nav className="bg-deedchain-navy border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
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

          <div className="flex items-center space-x-4">
            <ConnectKitButton />
            
            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-900">
            {navigation.map((item) => 
              item.show && (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar