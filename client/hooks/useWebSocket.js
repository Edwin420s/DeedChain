import { useEffect, useRef, useState, useCallback } from 'react'

export const useWebSocket = (url, options = {}) => {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const [reconnectCount, setReconnectCount] = useState(0)
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef()

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url)
      
      ws.onopen = () => {
        setIsConnected(true)
        setReconnectCount(0)
        options.onOpen?.()
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        setLastMessage(data)
        options.onMessage?.(data)
      }

      ws.onclose = (event) => {
        setIsConnected(false)
        options.onClose?.(event)

        // Exponential backoff reconnect
        if (options.shouldReconnect !== false) {
          const delay = Math.min(1000 * Math.pow(2, reconnectCount), 30000)
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectCount(prev => prev + 1)
            connect()
          }, delay)
        }
      }

      ws.onerror = (error) => {
        options.onError?.(error)
      }

      wsRef.current = ws
    } catch (error) {
      options.onError?.(error)
    }
  }, [url, options, reconnectCount])

  const send = useCallback((message) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [isConnected])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
    }
  }, [])

  useEffect(() => {
    connect()
    return disconnect
  }, [connect, disconnect])

  return {
    isConnected,
    lastMessage,
    send,
    disconnect,
    reconnectCount
  }
}