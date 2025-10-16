import { useState } from 'react'
import { useErrorHandler } from '../hooks/useErrorHandler'
import Modal from './Modal'

const ErrorDisplay = () => {
  const { errors, lastError, clearError, clearLastError } = useErrorHandler()
  const [showDetails, setShowDetails] = useState(false)
  const [showAllErrors, setShowAllErrors] = useState(false)

  if (!lastError && errors.length === 0) {
    return null
  }

  const getErrorColor = (error) => {
    const errorCode = error?.code || ''
    
    if (errorCode.includes('NETWORK') || errorCode.includes('TIMEOUT')) {
      return 'bg-yellow-500'
    }
    
    if (errorCode.includes('UNAUTHORIZED') || errorCode.includes('FORBIDDEN')) {
      return 'bg-orange-500'
    }
    
    if (errorCode.includes('INSUFFICIENT_FUNDS') || errorCode.includes('TRANSACTION')) {
      return 'bg-purple-500'
    }
    
    return 'bg-red-500'
  }

  const getErrorIcon = (error) => {
    const errorCode = error?.code || ''
    
    if (errorCode.includes('NETWORK')) {
      return '📡'
    }
    
    if (errorCode.includes('WALLET')) {
      return '👛'
    }
    
    if (errorCode.includes('TRANSACTION')) {
      return '⚡'
    }
    
    if (errorCode.includes('UNAUTHORIZED')) {
      return '🔒'
    }
    
    return '🚨'
  }

  const ErrorCard = ({ error, onClose, showCloseButton = true }) => (
    <div className={`${getErrorColor(error)} text-white p-4 rounded-lg shadow-lg mb-3`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <span className="text-xl mt-1">{getErrorIcon(error)}</span>
          <div className="flex-1">
            <h4 className="font-semibold mb-1">{error.message}</h4>
            <p className="text-sm opacity-90">
              Error code: {error.code}
            </p>
            {showDetails && error.details && (
              <pre className="text-xs mt-2 opacity-75 whitespace-pre-wrap">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            )}
          </div>
        </div>
        
        {showCloseButton && (
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 ml-2"
          >
            ×
          </button>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-3 text-xs">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-white hover:text-gray-200 underline"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
        
        <span className="opacity-75">
          {new Date(error.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  )

  return (
    <>
      {/* Floating Error Indicator */}
      {errors.length > 0 && (
        <button
          onClick={() => setShowAllErrors(true)}
          className="fixed top-4 left-4 z-50 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
        >
          {errors.length}
        </button>
      )}

      {/* Last Error Toast */}
      {lastError && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <ErrorCard 
            error={lastError} 
            onClose={clearLastError}
          />
        </div>
      )}

      {/* All Errors Modal */}
      <Modal 
        isOpen={showAllErrors} 
        onClose={() => setShowAllErrors(false)}
        title="Error History"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-300 text-sm">
              {errors.length} error{errors.length !== 1 ? 's' : ''} recorded
            </span>
            <button
              onClick={() => {
                errors.forEach(error => clearError(error.code))
                setShowAllErrors(false)
              }}
              className="text-sm text-accent-teal hover:underline"
            >
              Clear All
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-3">
            {errors.map((error, index) => (
              <ErrorCard
                key={index}
                error={error}
                onClose={() => clearError(error.code)}
                showCloseButton={true}
              />
            ))}
          </div>

          {errors.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No errors recorded
            </div>
          )}

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <h5 className="text-blue-400 font-medium mb-2">Error Information</h5>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>• Errors are automatically reported for debugging</li>
              <li>• No personal information is included in error reports</li>
              <li>• Clear errors to improve performance monitoring</li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default ErrorDisplay