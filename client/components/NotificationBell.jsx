import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletContext'
import Modal from './Modal'

const NotificationBell = () => {
  const { address } = useWallet()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (address) {
      fetchNotifications()
    }
  }, [address])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/notifications/${address}`)
      const data = await response.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      })
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch(`/api/notifications/${address}/read-all`, {
        method: 'PUT'
      })
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const getNotificationIcon = (type) => {
    const icons = {
      verification: '✅',
      transfer: '🔄',
      tokenization: '💰',
      system: '🔔',
      warning: '⚠️',
      success: '🎉'
    }
    return icons[type] || '🔔'
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-4.66-7.5 1 1 0 00-.68-1.21 1 1 0 00-1.21.68A7.97 7.97 0 008 12.5v.5H6a2 2 0 00-2 2v4a2 2 0 002 2h8a2 2 0 002-2v-4a2 2 0 00-2-2h-2v-.5c0-.83.13-1.63.38-2.39z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Notifications">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">
              {unreadCount} unread notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-accent-teal hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-3 p-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length > 0 ? (
            <div className="max-h-96 overflow-y-auto space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                    notification.read 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-blue-900/20 border-blue-700'
                  }`}
                >
                  <div className="text-xl">{getNotificationIcon(notification.type)}</div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm mb-1">
                      {notification.message}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {new Date(notification.timestamp).toLocaleDateString()} • {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                    
                    {notification.actionUrl && (
                      <a
                        href={notification.actionUrl}
                        className="text-accent-teal hover:underline text-xs mt-1 inline-block"
                      >
                        View Details
                      </a>
                    )}
                  </div>

                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-gray-400 hover:text-white text-xs"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔔</div>
              <p className="text-gray-400">No notifications</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}

export default NotificationBell