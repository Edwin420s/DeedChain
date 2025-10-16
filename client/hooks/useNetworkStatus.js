import { useState, useEffect } from 'react'

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true)
  const [isSlow, setIsSlow] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Network speed detection
    const checkNetworkSpeed = async () => {
      const startTime = Date.now()
      try {
        await fetch('/api/health', {
          method: 'HEAD',
          cache: 'no-cache'
        })
        const duration = Date.now() - startTime
        setIsSlow(duration > 2000) // Consider slow if > 2 seconds
      } catch (error) {
        setIsSlow(true)
      }
    }

    // Initial check
    checkNetworkSpeed()

    // Regular checks
    const interval = setInterval(checkNetworkSpeed, 30000)

    // Event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  return {
    isOnline,
    isSlow,
    status: isOnline ? (isSlow ? 'slow' : 'healthy') : 'offline'
  }
}