import Link from 'next/link'
import Navbar from '../components/Navbar'

const Custom404 = () => {
  return (
    <div className="min-h-screen bg-deedchain-navy">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="card max-w-2xl mx-auto">
          <div className="text-8xl mb-8">🔍</div>
          
          <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1>
          
          <p className="text-xl text-gray-300 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <Link href="/" className="btn-primary text-center">
              Go Home
            </Link>
            <Link href="/dashboard" className="btn-secondary text-center">
              Dashboard
            </Link>
          </div>
          
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Popular Pages</h3>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <Link href="/marketplace" className="text-accent-teal hover:underline">
                Marketplace
              </Link>
              <Link href="/register" className="text-accent-teal hover:underline">
                Register Property
              </Link>
              <Link href="/tokenized" className="text-accent-teal hover:underline">
                Tokenized Properties
              </Link>
              <Link href="/help" className="text-accent-teal hover:underline">
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Custom404