import { useState, useRef } from 'react'
import { uploadToIPFS } from '../utils/ipfs'

const UploadToIPFS = ({ onUploadComplete, label = "Upload Documents" }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const cid = await uploadToIPFS(files)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      onUploadComplete(cid, files)
      
      // Reset progress after success
      setTimeout(() => setUploadProgress(0), 1000)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      
      <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-accent-teal transition-colors">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          className="hidden"
        />
        
        {isUploading ? (
          <div className="space-y-2">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-accent-teal h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-400">Uploading... {uploadProgress}%</p>
          </div>
        ) : (
          <div>
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0l-3-3m3 3l3-3" />
            </svg>
            <div className="mt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary"
              >
                Select Files
              </button>
              <p className="mt-1 text-xs text-gray-400">
                PDF, JPG, PNG, DOC up to 10MB each
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadToIPFS