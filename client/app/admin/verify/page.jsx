'use client'

/**
 * DeedChain: Admin Verification Queue (App Router)
 *
 * Purpose:
 * - Display pending property registrations for DAO/government verifiers.
 * - Allow Approve/Reject actions which trigger backend and on-chain workflows.
 *
 * API Contracts:
 * - GET `adminAPI.getPendingProperties()` -> { properties: Array<{ id, owner, location, area, ipfsCid }> }
 * - POST `adminAPI.verifyProperty({ id, approved })`
 *
 * Notes:
 * - Contains development fallback data if backend is unavailable.
 */

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { adminAPI } from '../../../utils/api'

export default function AdminVerifyPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const res = await adminAPI.getPendingProperties()
      setItems(res.data?.properties || [])
    } catch (e) {
      // Dev mock
      setItems([
        { id: 'req-1', owner: '0xabc...123', location: 'Westlands, Nairobi', area: 1.5, ipfsCid: 'bafy...' },
        { id: 'req-2', owner: '0xdef...456', location: 'Thika', area: 0.8, ipfsCid: 'bafy...' },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const act = async (id, approved) => {
    try {
      await adminAPI.verifyProperty({ id, approved })
      toast.success(approved ? 'Approved' : 'Rejected')
      await load()
    } catch (e) {
      console.error(e)
      toast.error('Action failed')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-teal"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Verification Queue</h1>
        {items.length === 0 ? (
          <div className="glass-effect rounded-xl p-6 text-text-secondary">No pending requests.</div>
        ) : (
          <div className="space-y-4">
            {items.map((x) => (
              <div key={x.id} className="glass-effect rounded-xl p-6 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{x.location}</div>
                  <div className="text-sm text-text-secondary">Owner: {x.owner} • Area: {x.area} acres • IPFS: {x.ipfsCid}</div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => act(x.id, true)} className="btn-primary">Approve</button>
                  <button onClick={() => act(x.id, false)} className="btn-secondary">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
