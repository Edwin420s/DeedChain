import { useState, useEffect, useRef } from 'react'

const MapView = ({ coordinates, onCoordinatesChange, readOnly = false }) => {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [marker, setMarker] = useState(null)

  useEffect(() => {
    // Initialize map
    const loadMap = async () => {
      if (typeof window !== 'undefined' && window.L) {
        const mapInstance = window.L.map(mapRef.current).setView(
          coordinates || [-1.2921, 36.8219], // Default to Nairobi
          13
        )

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance)

        setMap(mapInstance)

        // Add marker if coordinates exist
        if (coordinates) {
          const newMarker = window.L.marker([coordinates.lat, coordinates.lng])
            .addTo(mapInstance)
          setMarker(newMarker)
        }

        // Add click handler for new markers
        if (!readOnly) {
          mapInstance.on('click', (e) => {
            const { lat, lng } = e.latlng
            
            if (marker) {
              mapInstance.removeLayer(marker)
            }

            const newMarker = window.L.marker([lat, lng]).addTo(mapInstance)
            setMarker(newMarker)

            if (onCoordinatesChange) {
              onCoordinatesChange({ lat, lng })
            }
          })
        }
      }
    }

    loadMap()

    return () => {
      if (map) {
        map.remove()
      }
    }
  }, [])

  useEffect(() => {
    if (map && coordinates) {
      map.setView([coordinates.lat, coordinates.lng], 13)
      
      if (marker) {
        map.removeLayer(marker)
      }
      
      const newMarker = window.L.marker([coordinates.lat, coordinates.lng]).addTo(map)
      setMarker(newMarker)
    }
  }, [coordinates, map])

  return (
    <div className="space-y-4">
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-lg border border-gray-700"
        style={{ minHeight: '256px' }}
      />
      
      {coordinates && (
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <span>Selected coordinates:</span>
          <span className="font-mono">
            {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
          </span>
        </div>
      )}
      
      {!readOnly && (
        <p className="text-sm text-gray-400">
          Click on the map to set property location coordinates
        </p>
      )}
    </div>
  )
}

export default MapView