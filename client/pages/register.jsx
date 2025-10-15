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
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-