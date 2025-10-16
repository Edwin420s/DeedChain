import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { useWallet } from '../context/WalletContext'
import { propertyAPI } from '../utils/api'

// Properties list page (Pages Router)
// Displays all properties owned by the connected user with links to detail pages
export default function Properties() {
  const { isConnected, address } = useWallet()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      if (!isConnected || !address) return
      try {
        setLoading(true)
        const res = await propertyAPI.list({ owner: address })
        setItems(res.data?.properties || [])
      } catch (e) {
        // Development fallback
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

  return (
    <div className="min-h-screen bg-deedchain-navy">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">My Properties</h1>
          <Link href="/register" className="btn-primary">Register Property</Link>
        </div>

        {!isConnected ? (
          <div className="glass-effect rounded-xl p-6 text-center text-gray-300">
            Connect your wallet to view your properties.
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-teal"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="glass-effect rounded-xl p-6 text-center text-gray-300">
            No properties found.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {items.map((p) => (
              <Link key={p.tokenId} href={`/property/${p.tokenId}`} className="card hover:shadow-2xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-white">Token #{p.tokenId}</h3>
                  <span className="text-xs px-2 py-1 rounded-full border border-primary-teal/30 text-primary-teal">
                    {p.status}
                  </span>
                </div>
                <p className="text-gray-300">{p.location}</p>
                <p className="text-gray-400 text-sm mt-1">Area: {p.area} acres</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
