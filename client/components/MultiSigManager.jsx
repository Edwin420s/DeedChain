import { useState } from 'react'
import { useWallet } from '../context/WalletContext'
import Modal from './Modal'

const MultiSigManager = ({ isOpen, onClose, property }) => {
  const { address } = useWallet()
  const [signers, setSigners] = useState([address])
  const [requiredSignatures, setRequiredSignatures] = useState(1)
  const [isDeploying, setIsDeploying] = useState(false)

  const addSigner = () => {
    setSigners(prev => [...prev, ''])
  }

  const removeSigner = (index) => {
    setSigners(prev => prev.filter((_, i) => i !== index))
  }

  const updateSigner = (index, value) => {
    setSigners(prev => prev.map((signer, i) => i === index ? value : signer))
  }

  const validateSigners = () => {
    const validSigners = signers.filter(signer => 
      signer && /^0x[a-fA-F0-9]{40}$/.test(signer)
    )
    return validSigners.length >= requiredSignatures && requiredSignatures > 0
  }

  const deployMultiSig = async () => {
    if (!validateSigners()) return

    setIsDeploying(true)
    try {
      // Simulate multi-sig deployment
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // In real implementation, this would deploy a multi-sig wallet
      console.log('Deploying multi-sig with:', {
        signers: signers.filter(s => s),
        requiredSignatures
      })
      
      alert('Multi-signature wallet deployed successfully!')
      onClose()
    } catch (error) {
      console.error('Multi-sig deployment failed:', error)
      alert('Failed to deploy multi-signature wallet')
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Multi-Signature Wallet Setup">
      <div className="space-y-6">
        {/* Property Info */}
        {property && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Property Details</h4>
            <div className="text-sm text-gray-300">
              <div>{property.location}</div>
              <div>Token ID: #{property.tokenId}</div>
            </div>
          </div>
        )}

        {/* Signers Configuration */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Authorized Signers</h4>
          <div className="space-y-3">
            {signers.map((signer, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={signer}
                  onChange={(e) => updateSigner(index, e.target.value)}
                  placeholder="0x..."
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-teal transition-colors"
                />
                {signers.length > 1 && (
                  <button
                    onClick={() => removeSigner(index)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            
            <button
              onClick={addSigner}
              className="flex items-center space-x-2 text-accent-teal hover:text-accent-teal/80 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Signer</span>
            </button>
          </div>
        </div>

        {/* Required Signatures */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Required Signatures</h4>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max={signers.length}
              value={requiredSignatures}
              onChange={(e) => setRequiredSignatures(parseInt(e.target.value))}
              className="flex-1"
            />
            <div className="text-white font-semibold min-w-12 text-center">
              {requiredSignatures} of {signers.length}
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            {requiredSignatures === 1 
              ? 'Single signature required for transactions'
              : `${requiredSignatures} signatures required to approve transactions`
            }
          </p>
        </div>

        {/* Security Configuration */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Security Settings</h4>
          <div className="space-y-3 text-sm">
            <label className="flex items-center justify-between">
              <span className="text-gray-300">Daily transfer limit</span>
              <input
                type="number"
                placeholder="No limit"
                className="w-32 px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-300">Transaction timeout</span>
              <select className="w-32 px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white">
                <option>24 hours</option>
                <option>48 hours</option>
                <option>7 days</option>
                <option>No timeout</option>
              </select>
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-300">Enable recovery module</span>
              <input type="checkbox" className="w-4 h-4 text-accent-teal" />
            </label>
          </div>
        </div>

        {/* Deployment Cost */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">Deployment Information</h4>
          <div className="text-sm text-gray-300 space-y-1">
            <div>Estimated gas cost: 0.02 - 0.05 MATIC</div>
            <div>Network: Polygon Mainnet</div>
            <div>Signers: {signers.filter(s => s).length} addresses</div>
            <div>Threshold: {requiredSignatures} signatures required</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary"
            disabled={isDeploying}
          >
            Cancel
          </button>
          <button
            onClick={deployMultiSig}
            disabled={!validateSigners() || isDeploying}
            className="flex-1 btn-primary disabled:opacity-50"
          >
            {isDeploying ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-deedchain-navy border-t-transparent rounded-full animate-spin mr-2"></div>
                Deploying...
              </div>
            ) : (
              'Deploy Multi-Sig Wallet'
            )}
          </button>
        </div>

        {/* Benefits */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <h5 className="text-green-400 font-medium mb-2">Multi-Signature Benefits</h5>
          <ul className="text-green-400 text-xs space-y-1">
            <li>• Enhanced security through multiple approvals</li>
            <li>• Prevents single point of failure</li>
            <li>• Ideal for joint property ownership</li>
            <li>• Customizable approval thresholds</li>
          </ul>
        </div>
      </div>
    </Modal>
  )
}

export default MultiSigManager