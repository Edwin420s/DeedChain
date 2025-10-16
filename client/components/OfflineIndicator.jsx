import { useNetworkStatus } from '../hooks/useNetworkStatus'

const OfflineIndicator = () => {
  const { isOnline, isSlow, status } = useNetworkStatus()

  if (isOnline && !isSlow) return null

  const statusConfig = {
    offline: {
      message: 'You are currently offline',
      color: 'bg-red-500',
      icon: '🔴'
    },
    slow: {
      message: 'Slow network connection detected',
      color: 'bg-yellow-500',
      icon: '🟡'
    }
  }

  const config = statusConfig[status]

  if (!config) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className={`${config.color} text-white py-2 px-4 text-center text-sm font-medium`}>
        <div className="flex items-center justify-center space-x-2">
          <span>{config.icon}</span>
          <span>{config.message}</span>
          {status === 'offline' && (
            <button
              onClick={() => window.location.reload()}
              className="underline ml-2"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default OfflineIndicator