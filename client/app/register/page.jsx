'use client'

/**
 * DeedChain: Register Property Page (App Router)
 *
 * Purpose:
 * - Provide a guided UI for land/property registration.
 * - Upload supporting documents to IPFS (via Web3.Storage) and obtain a CID.
 * - Submit a registration payload to the backend API which continues the flow
 *   (persist metadata, trigger on-chain mint or a verification workflow).
 *
 * Data Flow:
 * - User selects local documents -> `uploadToIPFS(files)` -> returns IPFS CID
 * - Form data + `owner` (from wallet) + `ipfsCid` POSTed to `propertyAPI.register()`
 * - Backend is expected to (later) mint a pending deed NFT or enqueue verification
 *
 * Key Dependencies:
 * - wagmi `useAccount` for wallet state
 * - RainbowKit `ConnectButton` for wallet connection UI
 * - `utils/ipfs` for IPFS upload (Web3.Storage)
 * - `utils/api` for REST calls
 *
 * Expected Environment Variables:
 * - NEXT_PUBLIC_WEB3_STORAGE_TOKEN: API token for Web3.Storage
 * - NEXT_PUBLIC_API_URL: Base URL for backend API
 *
 * Notes:
 * - This page is intentionally self-contained and framework-agnostic for the backend.
 * - Replace temporary toasts/mocks once the backend endpoints are available.
 */

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import toast from 'react-hot-toast'
import { uploadToIPFS } from '../../utils/ipfs'
import { propertyAPI } from '../../utils/api'

export default function RegisterPage() {
  // UI state for Web3 connection and form
  const { isConnected, address } = useAccount()
  const [submitting, setSubmitting] = useState(false)
  const [files, setFiles] = useState([])
  const [cid, setCid] = useState('')
  const [form, setForm] = useState({
    title: '',
    location: '',
    area: '',
    lat: '',
    lng: '',
    surveyNumber: '',
    description: '',
  })

  // Handle basic input changes
  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Handle local file selection; validation kept simple and user-friendly
  const onFileSelect = (e) => {
    const selected = Array.from(e.target.files || [])
    if (selected.length === 0) return
    setFiles(selected)
  }

  // Upload deed documents to IPFS via Web3.Storage
  const onUploadDocs = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one document to upload.')
      return
    }
    try {
      setSubmitting(true)
      // Web3.Storage client accepts File[]
      const uploadedCid = await uploadToIPFS(files)
      setCid(uploadedCid)
      toast.success('Documents uploaded to IPFS')
    } catch (err) {
      console.error(err)
      toast.error('Failed to upload to IPFS')
    } finally {
      setSubmitting(false)
    }
  }

  // Submit registration to backend and later to smart contract flow
  const onSubmit = async (e) => {
    e.preventDefault()
    if (!isConnected) {
      toast.error('Connect your wallet to continue')
      return
    }
    if (!cid) {
      toast.error('Upload documents to IPFS before submitting')
      return
    }

    const payload = {
      title: form.title || form.surveyNumber || form.location,
      description: form.description,
      location: form.location,
      coordinates: `${form.lat || ''},${form.lng || ''}`,
      size: parseFloat(form.area || '0'),
      ipfsCid: cid,
    }

    try {
      setSubmitting(true)
      await propertyAPI.register(payload)
      toast.success('Property registration submitted for verification')
      // Reset form
      setForm({ title: '', location: '', area: '', lat: '', lng: '', surveyNumber: '', description: '' })
      setFiles([])
      setCid('')
    } catch (err) {
      console.error(err)
      toast.error('Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Register Property</h1>
          <div className="bg-primary-teal text-primary-navy rounded-lg px-3 py-2">
            <ConnectButton />
          </div>
        </div>
        <p className="text-text-secondary mt-2">Create an on-chain deed by submitting property details and uploading documents to IPFS.</p>
      </div>

      {/* Registration Form */}
      <form onSubmit={onSubmit} className="max-w-3xl mx-auto glass-effect rounded-xl p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Property Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-text-secondary mb-1">Title *</label>
              <input name="title" value={form.title} onChange={onChange} placeholder="Parcel Title or Short Name" className="input-field" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-text-secondary mb-1">Location *</label>
              <input name="location" value={form.location} onChange={onChange} required placeholder="e.g., Karen, Nairobi" className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Area (acres) *</label>
              <input type="number" step="0.01" min="0" name="area" value={form.area} onChange={onChange} required placeholder="0.00" className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Survey Number *</label>
              <input name="surveyNumber" value={form.surveyNumber} onChange={onChange} required placeholder="Survey/Plot ID" className="input-field" />
            </div>
          </div>
        </div>

        {/* Coordinates */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Coordinates (optional)</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Latitude</label>
              <input name="lat" value={form.lat} onChange={onChange} placeholder="-1.2921" className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Longitude</label>
              <input name="lng" value={form.lng} onChange={onChange} placeholder="36.8219" className="input-field" />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <textarea name="description" value={form.description} onChange={onChange} rows={4} placeholder="Boundaries, notable features, history..." className="input-field" />
        </div>

        {/* IPFS Upload */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Documents</h2>
          <div className="space-y-3">
            <input type="file" multiple onChange={onFileSelect} className="block w-full text-sm" />
            <div className="flex items-center gap-3">
              <button type="button" onClick={onUploadDocs} disabled={submitting || files.length === 0} className="btn-secondary disabled:opacity-50">
                Upload to IPFS
              </button>
              {cid && (
                <span className="text-xs text-text-secondary break-all">CID: {cid}</span>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button type="submit" disabled={submitting || !cid} className="btn-primary disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Registration'}
          </button>
          <button type="button" onClick={() => { setForm({ location: '', area: '', lat: '', lng: '', surveyNumber: '', description: '' }); setFiles([]); setCid('') }} className="btn-secondary">
            Reset
          </button>
        </div>
      </form>

      {/* Process Notes */}
      <div className="max-w-3xl mx-auto mt-6 glass-effect rounded-xl p-6 border border-primary-teal/20">
        <h3 className="font-semibold mb-2">What happens next</h3>
        <ul className="text-text-secondary text-sm space-y-1">
          <li>- Your documents are stored on IPFS. The backend will reference the CID.</li>
          <li>- Validators review your submission. Once approved, the deed NFT is minted.</li>
          <li>- You can view status in your dashboard and property details page.</li>
        </ul>
      </div>
    </div>
  )
}
