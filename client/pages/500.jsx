import { useState } from 'react'
import Navbar from '../components/Navbar'

const Custom500 = () => {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="min-h-screen bg-deedchain-navy">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="card max-w-2xl mx-auto">
          <div className="text-8xl mb-8">🚨</div>
          
          <h1 className="text-4xl font-bold text-white mb-4">Server Error</h1>
          
          <p className="text-xl text-gray-300 mb-6">
            Something went wrong on our end. Please try again later.
          </p>
          
          <div className="space-y-4 mb-6">
            <button
              onClick={() => window.location.reload()}
              className="w-full btn-primary"
            >
              Try Again
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="w-full btn-secondary"
            >
              Go Back
            </button>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-accent-teal hover:underline text-sm"
            >
              {showDetails ? 'Hide' : 'Show'} Technical Details
            </button>
            
            {showDetails && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg text-left">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                  Error: 500 - Internal Server Error{'\n'}
                  Time: {new Date().toISOString()}{'\n'}
                  Path: {typeof window !== 'undefined' ? window.location.pathname : ''}{'\n'}
                  User Agent: {typeof navigator !== 'undefined' ? navigator.userAgent : ''}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Custom500