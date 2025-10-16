import { useState, useCallback } from 'react'
import { ErrorHandler, ERROR_CODES, createError } from '../utils/errorHandler'

export const useErrorHandler = () => {
  const [errors, setErrors] = useState([])
  const [lastError, setLastError] = useState(null)

  const handleError = useCallback((error, context = {}) => {
    const normalizedError = ErrorHandler.handle(error, context)
    
    setErrors(prev => [normalizedError, ...prev.slice(0, 9)]) // Keep last 10 errors
    setLastError(normalizedError)
    
    return normalizedError
  }, [])

  const clearError = useCallback((errorCode = null) => {
    if (errorCode) {
      setErrors(prev => prev.filter(error => error.code !== errorCode))
      if (lastError?.code === errorCode) {
        setLastError(null)
      }
    } else {
      setErrors([])
      setLastError(null)
    }
  }, [lastError])

  const clearLastError = useCallback(() => {
    setLastError(null)
  }, [])

  const hasError = useCallback((errorCode = null) => {
    if (errorCode) {
      return errors.some(error => error.code === errorCode)
    }
    return errors.length > 0
  }, [errors])

  const getError = useCallback((errorCode) => {
    return errors.find(error => error.code === errorCode)
  }, [errors])

  // Higher-order function for async operations
  const withErrorHandling = useCallback((asyncFunction, context = {}) => {
    return async (...args) => {
      try {
        clearLastError()
        return await asyncFunction(...args)
      } catch (error) {
        throw handleError(error, context)
      }
    }
  }, [handleError, clearLastError])

  return {
    errors,
    lastError,
    handleError,
    clearError,
    clearLastError,
    hasError,
    getError,
    withErrorHandling,
    ERROR_CODES,
    createError
  }
}