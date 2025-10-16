import { useState, useEffect } from 'react'

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      setLoading(false)
      return
    }

    const handleSuccess = (position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      })
      setLoading(false)
    }

    const handleError = (error) => {
      setError(error.message)
      setLoading(false)
    }

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      options
    )
  }, [options])

  return { location, error, loading }
}