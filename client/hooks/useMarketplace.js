import { useState, useEffect } from 'react'
import { marketplaceAPI } from '../utils/api'

export const useMarketplace = (filters = {}) => {
  const [properties, setProperties] = useState([])
  const [tokenizedProperties, setTokenizedProperties] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMarketplace = async (customFilters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const finalFilters = { ...filters, ...customFilters }
      const response = await marketplaceAPI.list(finalFilters)
      setProperties(response.data.properties || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch marketplace properties')
      console.error('Error fetching marketplace:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTokenizedProperties = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await marketplaceAPI.getTokenizedProperties()
      setTokenizedProperties(response.data.properties || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tokenized properties')
      console.error('Error fetching tokenized properties:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketplace()
  }, [])

  return {
    properties,
    tokenizedProperties,
    loading,
    error,
    fetchMarketplace,
    fetchTokenizedProperties,
    refetch: fetchMarketplace
  }
}