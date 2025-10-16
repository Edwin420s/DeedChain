import { useState } from 'react'
import { useWallet } from '../context/WalletContext'
import Modal from './Modal'

const BatchOperations = ({ isOpen, onClose, selectedProperties = [] }) => {
  const { address } = useWallet()
  const [operation, setOperation] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedItems, setSelectedItems] = useState(selectedProperties)

  const operations = [
    {
      id: 'bulk_verify',
      name: 'Bulk Verification Request',
      description: 'Submit multiple properties for verification at once',
      icon: '✅',
      requiresSelection: true
    },
    {
      id: 'bulk_transfer',
      name: 'Bulk Ownership Transfer',
      description: 'Transfer multiple properties to new owners',
      icon: '🔄',
      requiresSelection: true
    },
    {
      id: 'bulk_tokenize',
      name: 'Bulk Tokenization',
      description: 'Tokenize multiple properties simultaneously',
      icon: '💰',
      requiresSelection: true
    },
    {
      id: 'export_selected',
      name: 'Export Selected Properties',
      description: 'Export data for selected properties',
      icon: '📤',
      requiresSelection: true
    }
  ]

  const handleOperationSelect = (opId) => {
    setOperation(opId)
  }

  const executeOperation = async () => {
    if (!operation || selectedItems.length === 0) return

    setIsProcessing(true)
    try {
      // Simulate batch operation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // In real implementation, this would call the batch operation API
      console.log(`Executing ${operation} for ${selectedItems.length} properties`)
      
      alert(`Batch operation completed for ${selectedItems.length} properties!`)
      onClose()
    } catch (error) {
      console.error('Batch operation failed:', error)
      alert('Batch operation failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const getSelectedOperation = () => {
    return operations.find(op => op.id === operation)
  }

  const selectedOperation = getSelectedOperation()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Batch Operations">
      <div className="space-y-6">
        {/* Operation Selection */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Select Operation</h3>
          <div className="grid grid-cols-1 gap-3">
            {operations.map((op) => (
              <button
                key={op.id}
                onClick={() => handleOperationSelect(op.id)}
                disabled={op.requiresSelection && selectedItems.length === 0}
                className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors text-left ${
                  operation === op.id
                    ? 'bg-accent-teal/20 border-accent-teal'
                    : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                } ${op.requiresSelection && selectedItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="text-2xl">{op.icon}</span>
                <div className="flex-1">
                  <div className="text-white font-semibold">{op.name}</div>
                  <div className="text-gray-300 text-sm">{op.description}</div>
                </div>
                {operation === op.id && (
                  <div className="w-3 h-3 bg-accent-teal rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Selection Summary */}
        {selectedItems.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Selected Properties</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <div>Total selected: {selectedItems.length}</div>
              <div>Estimated gas: {selectedItems.length * 0.01} MATIC</div>
              <div>Estimated time: {selectedItems.length * 2} seconds</div>
            </div>
            
            {/* Selected Items Preview */}
            <div className="mt-3 max-h-32 overflow-y-auto custom-scrollbar">
              {selectedItems.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between py-1 text-xs">
                  <span className="text-gray-300 truncate">{item.location}</span>
                  <span className="text-gray-400">#{item.tokenId}</span>
                </div>
              ))}
              {selectedItems.length > 5 && (
                <div className="text-gray-400 text-xs text-center mt-1">
                  ... and {selectedItems.length - 5} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Operation Details */}
        {selectedOperation && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Operation Details</h4>
            <div className="text-sm text-gray-300 space-y-2">
              <p>{selectedOperation.description}</p>
              
              {selectedOperation.id === 'bulk_transfer' && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-teal"
                  />
                </div>
              )}

              {selectedOperation.id === 'bulk_tokenize' && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Token Name Prefix
                    </label>
                    <input
                      type="text"
                      placeholder="Property Share"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Price per Token (USD)
                    </label>
                    <input
                      type="number"
                      placeholder="1.00"
                      step="0.01"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-teal"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={executeOperation}
            disabled={!operation || selectedItems.length === 0 || isProcessing}
            className="flex-1 btn-primary disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-deedchain-navy border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : (
              `Execute (${selectedItems.length})`
            )}
          </button>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <p className="text-yellow-400 text-xs">
            <strong>Note:</strong> Batch operations are executed as individual transactions. 
            Gas fees will be charged for each property in the batch.
          </p>
        </div>
      </div>
    </Modal>
  )
}

export default BatchOperations