import { useState } from 'react'
import { useWallet } from '../context/WalletContext'
import Modal from './Modal'

const TokenizationWizard = ({ isOpen, onClose, property }) => {
  const { address } = useWallet()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    tokenName: '',
    tokenSymbol: '',
    totalSupply: '',
    pricePerToken: '',
    reservePercentage: '20'
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const nextStep = () => setStep(prev => prev + 1)
  const prevStep = () => setStep(prev => prev - 1)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsProcessing(true)
    try {
      // Tokenization logic would go here
      await new Promise(resolve => setTimeout(resolve, 3000))
      alert('Property tokenization successful!')
      onClose()
    } catch (error) {
      console.error('Tokenization failed:', error)
      alert('Tokenization failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const steps = [
    { number: 1, title: 'Token Details' },
    { number: 2, title: 'Pricing' },
    { number: 3, title: 'Confirmation' }
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tokenize Property">
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex justify-between items-center">
          {steps.map((stepItem, index) => (
            <div key={stepItem.number} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= stepItem.number 
                  ? 'bg-accent-teal text-deedchain-navy' 
                  : 'bg-gray-700 text-gray-300'
              }`}>
                {stepItem.number}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-1 mx-2 ${
                  step > stepItem.number ? 'bg-accent-teal' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Token Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Token Name
                </label>
                <input
                  type="text"
                  name="tokenName"
                  value={formData.tokenName}
                  onChange={handleInputChange}
                  placeholder="e.g., Nairobi Heights Land Share"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Token Symbol
                </label>
                <input
                  type="text"
                  name="tokenSymbol"
                  value={formData.tokenSymbol}
                  onChange={handleInputChange}
                  placeholder="e.g., NAIROBI"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Total Supply
                </label>
                <input
                  type="number"
                  name="totalSupply"
                  value={formData.totalSupply}
                  onChange={handleInputChange}
                  placeholder="e.g., 1000000"
                  className="input-field"
                  required
                />
                <p className="text-gray-400 text-xs mt-1">
                  Total number of tokens representing 100% ownership
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Pricing & Allocation</h3>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price per Token (USD)
                </label>
                <input
                  type="number"
                  name="pricePerToken"
                  value={formData.pricePerToken}
                  onChange={handleInputChange}
                  placeholder="e.g., 1.00"
                  step="0.01"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reserve Percentage
                </label>
                <select
                  name="reservePercentage"
                  value={formData.reservePercentage}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="10">10%</option>
                  <option value="20">20%</option>
                  <option value="30">30%</option>
                  <option value="40">40%</option>
                  <option value="50">50%</option>
                </select>
                <p className="text-gray-400 text-xs mt-1">
                  Percentage of tokens you wish to keep
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Confirmation</h3>
              <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Property:</span>
                  <span className="text-white">{property?.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Token Name:</span>
                  <span className="text-white">{formData.tokenName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Token Symbol:</span>
                  <span className="text-white">{formData.tokenSymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Supply:</span>
                  <span className="text-white">{formData.totalSupply}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Price per Token:</span>
                  <span className="text-white">${formData.pricePerToken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Your Reserve:</span>
                  <span className="text-white">{formData.reservePercentage}%</span>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-blue-400 text-sm">
                  <strong>Note:</strong> Tokenizing your property will lock the deed NFT 
                  and mint ERC-20 tokens. You'll be able to trade these tokens on the marketplace.
                </p>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 btn-secondary"
                disabled={isProcessing}
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 btn-primary"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-deedchain-navy border-t-transparent rounded-full animate-spin mr-2"></div>
                    Tokenizing...
                  </div>
                ) : (
                  'Confirm Tokenization'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default TokenizationWizard