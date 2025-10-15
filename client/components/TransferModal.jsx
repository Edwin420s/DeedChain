import { useState } from 'react'
import { useWallet } from '../context/WalletContext'
import Modal from './Modal'

const TransferModal = ({ isOpen, onClose, property }) => {
  const { address } = useWallet()
  const [recipient, setRecipient] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)

  const handleTransfer = async (e) => {
    e.preventDefault()
    if (!recipient) return

    setIsTransferring(true)
    try {
      // Transfer logic would go here
      await new Promise(resolve => setTimeout(resolve, 3000))
      alert('Transfer initiated successfully!')
      onClose()
    } catch (error) {
      console.error('Transfer failed:', error)
      alert('Transfer failed. Please try again.')
    } finally {
      setIsTransferring(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transfer Property Ownership">
      <div className="space-y-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2">Property Details</h4>
          <p className="text-gray-300 text-sm">{property?.location}</p>
          <p className="text-gray-300 text-sm">Token ID: #{property?.tokenId}</p>
        </div>

        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Recipient Wallet Address
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="input-field"
              required
            />
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <p className="text-yellow-400 text-sm">
              <strong>Warning:</strong> This action cannot be undone. Once transferred, 
              you will no longer own this property.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={isTransferring}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isTransferring || !recipient}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {isTransferring ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-deedchain-navy border-t-transparent rounded-full animate-spin mr-2"></div>
                  Transferring...
                </div>
              ) : (
                'Confirm Transfer'
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default TransferModal