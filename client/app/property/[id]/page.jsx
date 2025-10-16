'use client'

/**
 * DeedChain: Property Detail Page (App Router)
 *
 * Purpose:
 * - Display a single property's on-chain/off-chain details for a given token ID.
 * - Show location, coordinates, area, IPFS CID, ownership, and history.
 *
 * Data Fetching:
 * - Attempts `propertyAPI.get(id)` to retrieve property details from backend indexing.
 * - Falls back to a development mock if backend is not yet available.
 *
 * Routing:
 * - Dynamic segment `[id]` via `useParams()`.
 */

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { propertyAPI } from '../../../utils/api'

export default function PropertyDetailPage() {
  const params = useParams()
  const id = params?.id
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      if (!id) return
      try {
        setLoading(true)
        const res = await propertyAPI.get(id)
        setData(res.data || null)
      } catch (e) {
        // Dev mock
        setData({
          tokenId: id,
          location: 'Karen, Nairobi',
          area: 2.5,
          status: 'VERIFIED',
          owner: '0x0000...0000',
          ipfsCid: 'bafybeigdyrandom',
          coordinates: { lat: -1.2921, lng: 36.8219 },
          history: [
            { event: 'REGISTERED', at: '2025-01-01' },
            { event: 'VERIFIED', at: '2025-01-05' },
          ],
        })
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-teal"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <p className="text-text-secondary">Property not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Token #{data.tokenId}</h1>
            <span className="text-xs px-2 py-1 rounded-full border border-primary-teal/30 text-primary-teal">{data.status}</span>
          </div>
          <p className="text-text-secondary mt-1">{data.location}</p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="glass-effect rounded-lg p-4">
              <h3 className="font-semibold mb-2">Details</h3>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>- Area: {data.area} acres</li>
                <li>- Owner: {data.owner}</li>
                <li>- Coordinates: {data.coordinates?.lat}, {data.coordinates?.lng}</li>
                <li>- IPFS: {data.ipfsCid}</li>
              </ul>
            </div>
            <div className="glass-effect rounded-lg p-4">
              <h3 className="font-semibold mb-2">History</h3>
              <ul className="text-sm text-text-secondary space-y-1">
                {data.history?.map((h, i) => (
                  <li key={i}>- {h.event} on {h.at}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
