import { useState, useCallback } from 'react'
import { security } from '../utils/security'

export const useSecurity = () => {
  const [securityLog, setSecurityLog] = useState([])

  const logSecurityEvent = useCallback((event, details = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    setSecurityLog(prev => [logEntry, ...prev.slice(0, 99)]) // Keep last 100 entries
    
    // In production, send to security monitoring service
    if (process.env.NODE_ENV === 'production') {
      // securityAPI.logEvent(logEntry)
    }
  }, [])

  const sanitizeInput = useCallback((input, type = 'html') => {
    try {
      return security.sanitize[type](input)
    } catch (error) {
      logSecurityEvent('sanitization_error', { error: error.message, input, type })
      return null
    }
  }, [logSecurityEvent])

  const validateInput = useCallback((input, validator, context) => {
    try {
      const isValid = validator(input)
      if (!isValid) {
        logSecurityEvent('validation_failed', { input, validator: validator.name, context })
      }
      return isValid
    } catch (error) {
      logSecurityEvent('validation_error', { error: error.message, input, context })
      return false
    }
  }, [logSecurityEvent])

  // Rate limiting for specific actions
  const rateLimiters = useCallback(() => ({
    propertyRegistration: security.rateLimit.createLimiter(5, 60000), // 5 per minute
    transferRequests: security.rateLimit.createLimiter(10, 60000), // 10 per minute
    apiCalls: security.rateLimit.createLimiter(100, 60000) // 100 per minute
  }), [])

  return {
    securityLog,
    logSecurityEvent,
    sanitizeInput,
    validateInput,
    rateLimiters: rateLimiters(),
    securityUtils: security
  }
}