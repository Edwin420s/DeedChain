import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletContext'
import { formatAddress, formatDate } from '../utils/formatters'
import Modal from './Modal'

const UserProfile = ({ isOpen, onClose }) => {
  const { address, userProfile } = useWallet()
  const [profile, setProfile] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    kycVerified: false
  })

  useEffect(() => {
    if (userProfile) {
      setProfile(userProfile)
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        kycVerified: userProfile.kycVerified || false
      })
    }
  }, [userProfile])

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setIsEditing(false)
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Profile">
      <div className="space-y-6">
        {/* Wallet Address */}
        <div className="bg-gray-800 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Wallet Address
          </label>
          <p className="text-white font-mono text-sm break-all">
            {address}
          </p>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter your phone number"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Profile Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Name
                </label>
                <p className="text-white">
                  {profile.name || 'Not provided'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <p className="text-white">
                  {profile.email || 'Not provided'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Phone
                </label>
                <p className="text-white">
                  {profile.phone || 'Not provided'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  KYC Status
                </label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  profile.kycVerified 
                    ? 'bg-green-500 text-white' 
                    : 'bg-yellow-500 text-black'
                }`}>
                  {profile.kycVerified ? 'Verified' : 'Pending'}
                </span>
              </div>

              {profile.registeredAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Member Since
                  </label>
                  <p className="text-white">
                    {formatDate(profile.registeredAt)}
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 btn-primary"
              >
                Edit Profile
              </button>
              
              {!profile.kycVerified && (
                <button className="flex-1 btn-secondary">
                  Complete KYC
                </button>
              )}
            </div>
          </>
        )}

        {/* Statistics */}
        {profile.stats && (
          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-white font-semibold">{profile.stats.properties || 0}</div>
                <div className="text-gray-400">Properties</div>
              </div>
              <div className="text-center">
                <div className="text-white font-semibold">{profile.stats.transfers || 0}</div>
                <div className="text-gray-400">Transfers</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default UserProfile