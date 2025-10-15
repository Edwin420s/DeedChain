import { useState } from 'react'
import { useWallet } from '../context/WalletContext'
import { useContracts } from '../context/ContractContext'
import Navbar from '../components/Navbar'
import UploadToIPFS from '../components/UploadToIPFS'

const RegisterProperty = () => {
  const { isConnected, address } = useWallet()
  const { landRegistry, isInitialized } = useContracts()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [ipfsHash, setIpfsHash] = useState('')

  const [formData, setFormData] = useState({
    location: '',
    area: '',
    coordinates: { lat: '', lng: '' },
    surveyNumber: '',
    description: '',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'lat' || name === 'lng') {
      setFormData(prev => ({
        ...prev,
        coordinates: {
          ...prev.coordinates,
          [name]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleUploadComplete = (cid, files) => {
    setIpfsHash(cid)
    setUploadedFiles(files)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isConnected || !isInitialized) return

    setIsSubmitting(true)
    try {
      // Prepare metadata
      const metadata = {
        ...formData,
        owner: address,
        registeredAt: new Date().toISOString(),
        documents: uploadedFiles.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
        })),
      }

      // In a real implementation, you would:
      // 1. Upload metadata to IPFS
      // 2. Call the smart contract to register the property
      // 3. Wait for transaction confirmation
      
      console.log('Registering property with metadata:', metadata)
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert('Property registration submitted successfully! It will be reviewed by verifiers.')
      
      // Reset form
      setFormData({
        location: '',
        area: '',
        coordinates: { lat: '', lng: '' },
        surveyNumber: '',
        description: '',
      })
      setUploadedFiles([])
      setIpfsHash('')
      
    } catch (error) {
      console.error('Registration failed:', error)
      alert('Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-deedchain-navy">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Please Connect Your Wallet</h1>
          <p className="text-gray-300">Connect your wallet to register a new property</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-deedchain-navy">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <h1 className="text-3xl font-bold text-white mb-2">Register New Property</h1>
          <p className="text-gray-300 mb-8">
            Register your land or property as an NFT deed on the blockchain
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Property Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Enter full address or location description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Area (acres) *
                    </label>
                    <input
                      type="number"
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      min="0"
                      className="input-field"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Survey Number *
                    </label>
                    <input
                      type="text"
                      name="surveyNumber"
                      value={formData.surveyNumber}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Enter survey number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Latitude
                    </label>
                    <input
                      type="text"
                      name="lat"
                      value={formData.coordinates.lat}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="e.g., -1.2921"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Longitude
                    </label>
                    <input
                      type="text"
                      name="lng"
                      value={formData.coordinates.lng}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="e.g., 36.8219"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="input-field resize-vertical"
                    placeholder="Describe the property, boundaries, and any notable features..."
                  />
                </div>
              </div>
            </div>

            {/* Document Upload */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Property Documents</h3>
              <UploadToIPFS 
                onUploadComplete={handleUploadComplete}
                label="Upload Title Deed and Supporting Documents"
              />
              
              {uploadedFiles.length > 0 && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium text-white mb-2">Uploaded Files:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {uploadedFiles.map((file, index) => (
                      <li key={index}>• {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                className="flex-1 btn-secondary"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !ipfsHash}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-deedchain-navy border-t-transparent rounded-full animate-spin mr-2"></div>
                    Registering...
                  </div>
                ) : (
                  'Register Property'
                )}
              </button>
            </div>

            {!ipfsHash && (
              <p className="text-yellow-400 text-sm text-center">
                Please upload at least one document to continue
              </p>
            )}
          </form>
        </div>

        {/* Information Box */}
        <div className="card mt-6 bg-blue-900/20 border-blue-700">
          <h3 className="text-lg font-semibold text-white mb-2">Registration Process</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• Your property will be minted as an NFT representing ownership</li>
            <li>• Documents are stored securely on IPFS (decentralized storage)</li>
            <li>• Registration requires verification by trusted validators</li>
            <li>• Once verified, your property deed becomes active and transferable</li>
            <li>• All transactions are recorded on the blockchain for transparency</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default RegisterProperty