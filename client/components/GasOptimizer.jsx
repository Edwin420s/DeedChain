import { useState, useEffect } from 'react'
import { useProvider } from 'wagmi'
import { ethers } from 'ethers'
import Modal from './Modal'

const GasOptimizer = ({ isOpen, onClose, transactionData }) => {
  const provider = useProvider()
  const [gasPrice, setGasPrice] = useState(null)
  const [gasLimit, setGasLimit] = useState(null)
  const [priority, setPriority] = useState('medium')
  const [estimation, setEstimation] = useState(null)
  const [loading, setLoading] = useState(false)

  const priorityLevels = {
    low: { name: 'Low', multiplier: 0.9, description: 'Slower, cheaper' },
    medium: { name: 'Medium', multiplier: 1.0, description: 'Balanced' },
    high: { name: 'High', multiplier: 1.1, description: 'Faster, expensive' },
    urgent: { name: 'Urgent', multiplier: 1.3, description: 'Fastest, most expensive' }
  }

  useEffect(() => {
    if (isOpen) {
      fetchGasData()
    }
  }, [isOpen])

  const fetchGasData = async () => {
    setLoading(true)
    try {
      // Get current gas price from provider
      const feeData = await provider.getFeeData()
      setGasPrice(feeData.gasPrice)

      // Estimate gas limit for the transaction
      if (transactionData) {
        const estimatedGas = await provider.estimateGas(transactionData)
        setGasLimit(estimatedGas)
      }

      calculateEstimation(feeData.gasPrice, gasLimit)
    } catch (error) {
      console.error('Failed to fetch gas data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateEstimation = (baseGasPrice, baseGasLimit) => {
    if (!baseGasPrice || !baseGasLimit) return

    const multiplier = priorityLevels[priority].multiplier
    const adjustedGasPrice = baseGasPrice.mul(Math.floor(multiplier * 100)).div(100)
    const gasCost = adjustedGasPrice.mul(baseGasLimit)
    const maticCost = ethers.utils.formatEther(gasCost)
    const usdCost = parseFloat(maticCost) * 0.75 // Mock MATIC price

    setEstimation({
      gasPrice: adjustedGasPrice,
      gasLimit: baseGasLimit,
      maticCost,
      usdCost,
      timeEstimate: getTimeEstimate(priority)
    })
  }

  const getTimeEstimate = (priority) => {
    const times = {
      low: '1-5 minutes',
      medium: '30-60 seconds',
      high: '15-30 seconds',
      urgent: '5-15 seconds'
    }
    return times[priority]
  }

  const handlePriorityChange = (newPriority) => {
    setPriority(newPriority)
    if (gasPrice && gasLimit) {
      calculateEstimation(gasPrice, gasLimit)
    }
  }

  const formatGasPrice = (price) => {
    if (!price) return '...'
    return `${ethers.utils.formatUnits(price, 'gwei')} Gwei`
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gas Optimizer">
      <div className="space-y-6">
        {/* Transaction Summary */}
        {transactionData && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Transaction Summary</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <div>Type: {transactionData.functionName || 'Contract Interaction'}</div>
              <div>Network: Polygon Mainnet</div>
              <div>Gas Limit: {gasLimit ? gasLimit.toString() : 'Estimating...'}</div>
            </div>
          </div>
        )}

        {/* Priority Selection */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Transaction Speed</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(priorityLevels).map(([key, level]) => (
              <button
                key={key}
                onClick={() => handlePriorityChange(key)}
                className={`p-4 rounded-lg border transition-all text-left ${
                  priority === key
                    ? 'bg-accent-teal/20 border-accent-teal transform scale-105'
                    : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                }`}
              >
                <div className="text-white font-semibold mb-1">{level.name}</div>
                <div className="text-gray-300 text-sm mb-2">{level.description}</div>
                <div className="text-accent-teal text-xs font-medium">
                  {estimation ? getTimeEstimate(key) : '...'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cost Estimation */}
        {estimation && (
          <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 border border-blue-700 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Cost Estimation</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Gas Price</div>
                <div className="text-white font-semibold">
                  {formatGasPrice(estimation.gasPrice)}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Network Cost</div>
                <div className="text-white font-semibold">
                  {parseFloat(estimation.maticCost).toFixed(6)} MATIC
                </div>
              </div>
              <div>
                <div className="text-gray-400">USD Equivalent</div>
                <div className="text-white font-semibold">
                  {formatCurrency(estimation.usdCost)}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Estimated Time</div>
                <div className="text-green-400 font-semibold">
                  {estimation.timeEstimate}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gas Price Chart Placeholder */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Network Conditions</h4>
          <div className="h-32 flex items-center justify-center bg-gray-700 rounded">
            <p className="text-gray-400 text-sm">Gas price chart would appear here</p>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Low: 30 Gwei</span>
            <span>Current: {gasPrice ? formatGasPrice(gasPrice) : '...'}</span>
            <span>High: 150 Gwei</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Pass optimized gas settings back to transaction
              onClose(estimation)
            }}
            disabled={!estimation}
            className="flex-1 btn-primary disabled:opacity-50"
          >
            Use Optimized Settings
          </button>
        </div>

        {/* Tips */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <h5 className="text-yellow-400 font-medium mb-2">Gas Saving Tips</h5>
          <ul className="text-yellow-400 text-xs space-y-1">
            <li>• Use lower priority for non-urgent transactions</li>
            <li>• Avoid peak network hours (9 AM - 5 PM UTC)</li>
            <li>• Batch multiple operations when possible</li>
            <li>• Monitor gas prices with our optimizer</li>
          </ul>
        </div>
      </div>
    </Modal>
  )
}

export default GasOptimizer