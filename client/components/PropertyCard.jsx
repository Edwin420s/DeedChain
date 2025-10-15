import Link from 'next/link'
import { formatAddress, formatDate, formatArea } from '../utils/formatters'

const PropertyCard = ({ property }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'rejected':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'verified':
        return 'Verified'
      case 'pending':
        return 'Pending Verification'
      case 'rejected':
        return 'Rejected'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="card hover:shadow-2xl transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-white truncate">
          {property.location || 'Unknown Location'}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
          {getStatusText(property.status)}
        </span>
      </div>
      
      <div className="space-y-2 text-sm text-gray-300">
        <div className="flex justify-between">
          <span>Token ID:</span>
          <span className="text-white font-mono">#{property.tokenId}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Area:</span>
          <span className="text-white">{formatArea(property.area)}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Registered:</span>
          <span className="text-white">{formatDate(property.registeredAt)}</span>
        </div>
        
        {property.coordinates && (
          <div className="flex justify-between">
            <span>Coordinates:</span>
            <span className="text-white text-xs font-mono">
              {property.coordinates.lat}, {property.coordinates.lng}
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex space-x-3">
        <Link 
          href={`/property/${property.tokenId}`}
          className="flex-1 btn-secondary text-center py-2"
        >
          View Details
        </Link>
        
        {property.status === 'verified' && (
          <button className="flex-1 btn-primary py-2">
            Transfer
          </button>
        )}
      </div>
    </div>
  )
}

export default PropertyCard