import { useState, useEffect } from 'react'
import { useNetwork } from 'wagmi'

const NetworkStatus = () => {
  const { chain } = useNetwork()
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const getNetworkStatus = () => {
    if (!isOnline) {
      return { status: 'offline', message: 'Offline', color: 'bg-red-500' }
    }

    if (!chain) {
      return { status: 'disconnected', message: 'Disconnected', color: 'bg-yellow-500' }
    }

    if (chain.unsupported) {
      return { status: 'unsupported', message: 'Wrong Network', color: 'bg-red-500' }
    }

    return { status: 'connected', message: 'Connected', color: 'bg-green-500' }
  }

  const networkStatus = getNetworkStatus()

  if (networkStatus.status === 'connected') {
    return null // Don't show when everything is fine
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg border ${networkStatus.color} bg-opacity-90 text-white`}>
        <div className={`w-2 h-2 rounded-full ${networkStatus.color.replace('bg-', 'bg-')}`} />
        <span className="text-sm font-medium">{networkStatus.message}</span>
        {chain && chain.unsupported && (
          <button
            onClick={() => {
              // Switch network logic would go here
            }}
            className="text-sm underline ml-2"
          >
            Switch Network
          </button>
        )}
      </div>
    </div>
  )
}

export default NetworkStatus