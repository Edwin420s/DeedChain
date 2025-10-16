import { useState, useEffect, useRef } from 'react'
import { useWallet } from '../context/WalletContext'

const RealTimeUpdates = () => {
  const { address } = useWallet()
  const [updates, setUpdates] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef(null)

  useEffect(() => {
    connectWebSocket()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [address])

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'wss://api.deedchain.com/ws')
      
      ws.onopen = () => {
        setIsConnected(true)
        console.log('WebSocket connected')
        
        // Subscribe to user-specific updates if address is available
        if (address) {
          ws.send(JSON.stringify({
            type: 'subscribe',
            address: address.toLowerCase()
          }))
        }
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        handleUpdate(data)
      }

      ws.onclose = () => {
        setIsConnected(false)
        console.log('WebSocket disconnected')
        
        // Attempt reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000)
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsConnected(false)
      }

      wsRef.current = ws
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
    }
  }

  const handleUpdate = (data) => {
    const newUpdate = {
      id: Date.now(),
      type: data.type,
      message: getUpdateMessage(data),
      timestamp: new Date().toISOString(),
      data: data
    }

    setUpdates(prev => [newUpdate, ...prev.slice(0, 9)]) // Keep last 10 updates

    // Show browser notification if permitted
    if (Notification.permission === 'granted' && document.hidden) {
      new Notification('DeedChain Update', {
        body: newUpdate.message,
        icon: '/icon.png'
      })
    }
  }

  const getUpdateMessage = (data) => {
    switch (data.type) {
      case 'property_verified':
        return `Property "${data.property.location}" has been verified`
      case 'transfer_completed':
        return `Ownership transferred for property #${data.property.tokenId}`
      case 'tokenization_complete':
        return `Property tokenized: ${data.property.tokenSymbol}`
      case 'new_bid':
        return `New bid received for ${data.property.location}`
      case 'market_update':
        return `Market update: ${data.message}`
      default:
        return data.message || 'New update available'
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  const clearUpdates = () => {
    setUpdates([])
  }

  if (updates.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm">
      {/* Connection Status */}
      <div className={`flex items-center space-x-2 mb-2 text-xs ${
        isConnected ? 'text-green-400' : 'text-yellow-400'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
        }`} />
        <span>{isConnected ? 'Live Updates' : 'Reconnecting...'}</span>
      </div>

      {/* Updates List */}
      <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
        {updates.map((update) => (
          <div
            key={update.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg animate-in slide-in-from-right"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-white text-sm mb-1">{update.message}</p>
                <p className="text-gray-400 text-xs">
                  {new Date(update.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => setUpdates(prev => prev.filter(u => u.id !== update.id))}
                className="text-gray-400 hover:text-white ml-2"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mt-2 text-xs">
        <button
          onClick={requestNotificationPermission}
          className="text-accent-teal hover:underline"
        >
          Enable Notifications
        </button>
        <button
          onClick={clearUpdates}
          className="text-gray-400 hover:text-white"
        >
          Clear All
        </button>
      </div>
    </div>
  )
}

export default RealTimeUpdates