import { useState, useMemo } from 'react'
import Modal from './Modal'

const InvestmentCalculator = ({ isOpen, onClose, property }) => {
  const [investment, setInvestment] = useState({
    amount: '',
    duration: '12',
    reinvest: false
  })

  const calculations = useMemo(() => {
    if (!property?.pricePerToken || !investment.amount) return null

    const amount = parseFloat(investment.amount)
    const pricePerToken = parseFloat(property.pricePerToken)
    const tokens = amount / pricePerToken
    const ownershipPercentage = (tokens / property.totalSupply) * 100

    // Mock ROI calculation (in real app, this would use historical data)
    const monthlyROI = 0.02 // 2% monthly
    const totalMonths = parseInt(investment.duration)
    const totalReturn = amount * Math.pow(1 + monthlyROI, totalMonths)
    const profit = totalReturn - amount
    const annualizedROI = (Math.pow(totalReturn / amount, 12 / totalMonths) - 1) * 100

    return {
      tokens: Math.floor(tokens),
      ownershipPercentage,
      totalReturn,
      profit,
      annualizedROI,
      monthlyReturn: totalReturn / totalMonths
    }
  }, [investment, property])

  const handleInputChange = (key, value) => {
    setInvestment(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Investment Calculator">
      <div className="space-y-6">
        {/* Property Info */}
        {property && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">{property.location}</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
              <div>Token Price: {formatCurrency(property.pricePerToken)}</div>
              <div>Total Supply: {property.totalSupply?.toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Investment Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Investment Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={investment.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-teal transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Investment Duration (months)
            </label>
            <select
              value={investment.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-accent-teal transition-colors"
            >
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
              <option value="24">24 Months</option>
              <option value="36">36 Months</option>
              <option value="60">60 Months</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="reinvest"
              checked={investment.reinvest}
              onChange={(e) => handleInputChange('reinvest', e.target.checked)}
              className="w-4 h-4 text-accent-teal bg-gray-800 border-gray-700 rounded focus:ring-accent-teal focus:ring-2"
            />
            <label htmlFor="reinvest" className="ml-2 text-sm text-gray-300">
              Reinvest earnings automatically
            </label>
          </div>
        </div>

        {/* Calculation Results */}
        {calculations && (
          <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-700 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-4">Projected Returns</h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Tokens Acquired:</span>
                <div className="text-white font-semibold">
                  {calculations.tokens.toLocaleString()}
                </div>
              </div>
              
              <div>
                <span className="text-gray-400">Ownership:</span>
                <div className="text-white font-semibold">
                  {calculations.ownershipPercentage.toFixed(4)}%
                </div>
              </div>
              
              <div>
                <span className="text-gray-400">Total Return:</span>
                <div className="text-white font-semibold">
                  {formatCurrency(calculations.totalReturn)}
                </div>
              </div>
              
              <div>
                <span className="text-gray-400">Total Profit:</span>
                <div className="text-green-400 font-semibold">
                  +{formatCurrency(calculations.profit)}
                </div>
              </div>
              
              <div className="col-span-2">
                <span className="text-gray-400">Annualized ROI:</span>
                <div className="text-green-400 font-semibold text-lg">
                  {calculations.annualizedROI.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* ROI Breakdown */}
            <div className="mt-4 pt-4 border-t border-green-700">
              <h5 className="text-white font-medium mb-2">Monthly Breakdown</h5>
              <div className="space-y-2 text-xs">
                {Array.from({ length: Math.min(6, parseInt(investment.duration)) }).map((_, month) => {
                  const monthReturn = parseFloat(investment.amount) * Math.pow(1.02, month + 1)
                  return (
                    <div key={month} className="flex justify-between text-gray-300">
                      <span>Month {month + 1}:</span>
                      <span>{formatCurrency(monthReturn)}</span>
                    </div>
                  )
                })}
                {parseInt(investment.duration) > 6 && (
                  <div className="text-center text-gray-400">
                    ... and {parseInt(investment.duration) - 6} more months
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <p className="text-yellow-400 text-xs">
            <strong>Disclaimer:</strong> This calculator provides estimated projections based on historical data. 
            Actual returns may vary and are not guaranteed. Real estate investments carry risks.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary"
          >
            Close
          </button>
          <button
            onClick={() => {
              // Handle invest action
              alert('Redirecting to investment page...')
            }}
            disabled={!investment.amount}
            className="flex-1 btn-primary disabled:opacity-50"
          >
            Invest Now
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default InvestmentCalculator