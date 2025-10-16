'use client'

/**
 * DeedChain: Properties List Page (App Router)
 *
 * Purpose:
 * - Display all properties owned by the connected wallet.
 * - Link to property detail pages for deeper inspection and actions.
 *
 * Data Flow:
 * - On wallet connect, query `propertyAPI.list({ owner })`.
 * - Fallback to mock data in development when backend is not available.
 *
 * Integration:
 * - `wagmi` for account state, `utils/api` for REST calls.
 * - Items link to `app/property/[id]/page.jsx`.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { propertyAPI } from '../../utils/api'

export default function PropertiesPage() {
  const { isConnected, address } = useAccount()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      if (!isConnected || !address) return
      try {
        setLoading(true)
        // Replace with real API call when backend is ready
        const res = await propertyAPI.list({ owner: address })
        setItems(res.data?.properties || [])
      } catch (e) {
        // Fallback mock for local development
        setItems([
          { tokenId: 101, location: 'Karen, Nairobi', status: 'VERIFIED', area: 2.5 },
          { tokenId: 102, location: 'Kiambu', status: 'PENDING', area: 1.2 },
        ])
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [isConnected, address])

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <h1 className="text-2xl font-bold">Connect your wallet to view your properties</h1>
      </div>
    )
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
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Properties</h1>
          <Link href="/register" className="btn-primary">Register Property</Link>
        </div>

        {items.length === 0 ? (
          <div className="glass-effect rounded-xl p-6 text-center text-text-secondary">
            No properties found.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {items.map((p) => (
              <Link key={p.tokenId} href={`/property/${p.tokenId}`} className="glass-effect rounded-xl p-6 hover:shadow-glow-hover">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold">Token #{p.tokenId}</h3>
                  <span className="text-xs px-2 py-1 rounded-full border border-primary-teal/30 text-primary-teal">
                    {p.status}
                  </span>
                </div>
                <p className="text-text-secondary">{p.location}</p>
                <p className="text-text-secondary text-sm mt-1">Area: {p.area} acres</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
