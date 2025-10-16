'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import toast from 'react-hot-toast'
import { propertyAPI } from '../../utils/api'

export default function TransferPage() {
  const { isConnected, address } = useAccount()
  const [submitting, setSubmitting] = useState(false)
  const [tokenId, setTokenId] = useState('')
  const [to, setTo] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!isConnected) {
      toast.error('Connect wallet to continue')
      return
    }
    try {
      setSubmitting(true)
      await propertyAPI.transfer({ tokenId, from: address, to })
      toast.success('Transfer initiated. Await confirmation.')
      setTokenId('')
      setTo('')
    } catch (e) {
      console.error(e)
      toast.error('Transfer failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Transfer Ownership</h1>
        <form onSubmit={onSubmit} className="glass-effect rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Token ID</label>
            <input value={tokenId} onChange={(e) => setTokenId(e.target.value)} placeholder="e.g., 123" className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Recipient Address</label>
            <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="0x..." className="input-field" />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Initiate Transfer'}
          </button>
        </form>
        <div className="glass-effect rounded-xl p-6 mt-4 text-sm text-text-secondary">
          - Both parties must confirm on-chain. The registry updates upon finalization.
        </div>
      </div>
    </div>
  )
}
