// Comprehensive error handling utilities
class AppError extends Error {
  constructor(code, message, details = null) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
    this.timestamp = new Date().toISOString()
  }
}

// Error codes and messages
export const ERROR_CODES = {
  // Wallet errors
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  WRONG_NETWORK: 'WRONG_NETWORK',
  TRANSACTION_REJECTED: 'TRANSACTION_REJECTED',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  
  // Property errors
  PROPERTY_NOT_FOUND: 'PROPERTY_NOT_FOUND',
  PROPERTY_ALREADY_REGISTERED: 'PROPERTY_ALREADY_REGISTERED',
  PROPERTY_NOT_VERIFIED: 'PROPERTY_NOT_VERIFIED',
  PROPERTY_ALREADY_VERIFIED: 'PROPERTY_ALREADY_VERIFIED',
  INVALID_PROPERTY_DATA: 'INVALID_PROPERTY_DATA',
  
  // User errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  
  // Validation errors
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_WALLET_ADDRESS: 'INVALID_WALLET_ADDRESS',
  INVALID_COORDINATES: 'INVALID_COORDINATES',
  
  // File errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // System errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONTRACT_ERROR: 'CONTRACT_ERROR'
}

export const ERROR_MESSAGES = {
  [ERROR_CODES.WALLET_NOT_CONNECTED]: 'Please connect your wallet to continue',
  [ERROR_CODES.WRONG_NETWORK]: 'Please switch to the correct network',
  [ERROR_CODES.TRANSACTION_REJECTED]: 'Transaction was rejected by user',
  [ERROR_CODES.TRANSACTION_FAILED]: 'Transaction failed on the blockchain',
  [ERROR_CODES.INSUFFICIENT_FUNDS]: 'Insufficient funds for transaction',
  [ERROR_CODES.PROPERTY_NOT_FOUND]: 'Property not found',
  [ERROR_CODES.PROPERTY_ALREADY_REGISTERED]: 'Property is already registered',
  [ERROR_CODES.PROPERTY_NOT_VERIFIED]: 'Property is not verified',
  [ERROR_CODES.PROPERTY_ALREADY_VERIFIED]: 'Property is already verified',
  [ERROR_CODES.INVALID_PROPERTY_DATA]: 'Invalid property data provided',
  [ERROR_CODES.UNAUTHORIZED]: 'You are not authorized to perform this action',
  [ERROR_CODES.FORBIDDEN]: 'Access to this resource is forbidden',
  [ERROR_CODES.USER_NOT_FOUND]: 'User not found',
  [ERROR_CODES.INVALID_INPUT]: 'Invalid input provided',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Required field is missing',
  [ERROR_CODES.INVALID_EMAIL]: 'Invalid email address',
  [ERROR_CODES.INVALID_WALLET_ADDRESS]: 'Invalid wallet address',
  [ERROR_CODES.INVALID_COORDINATES]: 'Invalid coordinates provided',
  [ERROR_CODES.FILE_TOO_LARGE]: 'File size exceeds maximum limit',
  [ERROR_CODES.INVALID_FILE_TYPE]: 'File type is not supported',
  [ERROR_CODES.UPLOAD_FAILED]: 'File upload failed',
  [ERROR_CODES.NETWORK_ERROR]: 'Network connection error',
  [ERROR_CODES.TIMEOUT]: 'Request timeout',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
  [ERROR_CODES.UNKNOWN_ERROR]: 'An unknown error occurred',
  [ERROR_CODES.DATABASE_ERROR]: 'Database error occurred',
  [ERROR_CODES.CONTRACT_ERROR]: 'Smart contract error occurred'
}

// Error handler class
export class ErrorHandler {
  static handle(error, context = {}) {
    const errorInfo = this.normalizeError(error)
    
    // Log error
    this.logError(errorInfo, context)
    
    // Show user-friendly message
    this.showUserMessage(errorInfo)
    
    // Track error analytics
    this.trackError(errorInfo, context)
    
    return errorInfo
  }
  
  static normalizeError(error) {
    if (error instanceof AppError) {
      return error
    }
    
    if (error.code && ERROR_MESSAGES[error.code]) {
      return new AppError(error.code, ERROR_MESSAGES[error.code], error.details)
    }
    
    if (error.message?.includes('user rejected')) {
      return new AppError(ERROR_CODES.TRANSACTION_REJECTED, ERROR_MESSAGES[ERROR_CODES.TRANSACTION_REJECTED])
    }
    
    if (error.message?.includes('insufficient funds')) {
      return new AppError(ERROR_CODES.INSUFFICIENT_FUNDS, ERROR_MESSAGES[ERROR_CODES.INSUFFICIENT_FUNDS])
    }
    
    // Handle common blockchain errors
    if (error.message?.includes('execution reverted')) {
      return new AppError(ERROR_CODES.CONTRACT_ERROR, this.extractRevertReason(error.message))
    }
    
    return new AppError(ERROR_CODES.UNKNOWN_ERROR, error.message || 'An unexpected error occurred')
  }
  
  static extractRevertReason(errorMessage) {
    const revertMatch = errorMessage.match(/reverted with reason string '(.*)'/)
    if (revertMatch) {
      return revertMatch[1]
    }
    
    const customErrorMatch = errorMessage.match(/Error: (.*)/)
    if (customErrorMatch) {
      return customErrorMatch[1]
    }
    
    return 'Contract execution failed'
  }
  
  static logError(error, context) {
    const logEntry = {
      error: {
        code: error.code,
        message: error.message,
        stack: error.stack,
        details: error.details
      },
      context: {
        ...context,
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        timestamp: new Date().toISOString()
      }
    }
    
    console.error('Application Error:', logEntry)
    
    // Send to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(logEntry)
    }
  }
  
  static reportError(errorInfo) {
    // Send to error reporting service (e.g., Sentry, LogRocket)
    if (typeof window !== 'undefined' && window._sentry) {
      window._sentry.captureException(errorInfo.error, {
        extra: errorInfo.context
      })
    }
    
    // Send to backend for logging
    fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorInfo)
    }).catch(console.error)
  }
  
  static showUserMessage(error) {
    // Don't show messages for user-rejected transactions
    if (error.code === ERROR_CODES.TRANSACTION_REJECTED) {
      return
    }
    
    // Show user-friendly error message
    const message = ERROR_MESSAGES[error.code] || error.message
    
    // Use toast notification system
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast(message, 'error')
    } else {
      // Fallback to alert
      alert(message)
    }
  }
  
  static trackError(error, context) {
    if (typeof window !== 'undefined' && window.analytics) {
      window.analytics.track('error_occurred', {
        error_code: error.code,
        error_message: error.message,
        ...context
      })
    }
  }
  
  static createErrorBoundary(component) {
    return class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
      }
      
      static getDerivedStateFromError(error) {
        return { hasError: true, error }
      }
      
      componentDidCatch(error, errorInfo) {
        ErrorHandler.handle(error, {
          component: component,
          errorInfo: errorInfo
        })
      }
      
      render() {
        if (this.state.hasError) {
          return (
            <div className="error-boundary-fallback">
              <h3>Something went wrong</h3>
              <button onClick={() => this.setState({ hasError: false, error: null })}>
                Try Again
              </button>
            </div>
          )
        }
        
        return this.props.children
      }
    }
  }
}

// Utility functions
export const withErrorHandler = (fn, context = {}) => {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (error) {
      throw ErrorHandler.handle(error, context)
    }
  }
}

export const createError = (code, details = null) => {
  const message = ERROR_MESSAGES[code] || 'An error occurred'
  return new AppError(code, message, details)
}

// Global error handler for uncaught errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    ErrorHandler.handle(event.error, { type: 'unhandled_error' })
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    ErrorHandler.handle(event.reason, { type: 'unhandled_rejection' })
  })
}

export default ErrorHandler