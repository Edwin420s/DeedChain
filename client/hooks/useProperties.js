import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletContext'
import { propertyAPI } from '../utils/api'

export const useProperties = (filters = {}) => {
  const { isConnected, address } = useWallet()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchProperties = async (customFilters = {}) => {
    if (!isConnected) return
    
    setLoading(true)
    setError(null)
    try {
      const finalFilters = { ...filters, ...customFilters }
      const response = await propertyAPI.list(finalFilters)
      setProperties(response.data.properties || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch properties')
      console.error('Error fetching properties:', err)
    } finally {
      setLoading(false)
    }
  }

  const registerProperty = async (propertyData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await propertyAPI.register(propertyData)
      await fetchProperties() // Refresh the list
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register property')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const transferProperty = async (transferData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await propertyAPI.transfer(transferData)
      await fetchProperties() // Refresh the list
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to transfer property')
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [isConnected, address])

  return {
    properties,
    loading,
    error,
    fetchProperties,
    registerProperty,
    transferProperty,
    refetch: fetchProperties
  }
}