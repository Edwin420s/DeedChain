import { useState } from 'react'
import { useWallet } from '../context/WalletContext'
import Modal from './Modal'

const ExportData = ({ isOpen, onClose }) => {
  const { address } = useWallet()
  const [exportType, setExportType] = useState('properties')
  const [format, setFormat] = useState('csv')
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })
  const [exporting, setExporting] = useState(false)

  const exportOptions = [
    { value: 'properties', label: 'Property Portfolio', description: 'All your registered properties' },
    { value: 'transactions', label: 'Transaction History', description: 'Complete transaction records' },
    { value: 'investments', label: 'Investment Portfolio', description: 'Tokenized property investments' },
    { value: 'verifications', label: 'Verification History', description: 'Property verification records' }
  ]

  const handleExport = async () => {
    setExporting(true)
    try {
      const queryParams = new URLSearchParams({
        type: exportType,
        format,
        ...(dateRange.start && { start: dateRange.start }),
        ...(dateRange.end && { end: dateRange.end })
      })

      const response = await fetch(`/api/export/${address}?${queryParams}`)
      
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `deedchain_${exportType}_${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      onClose()
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const getFileSizeEstimate = () => {
    // Mock size estimates
    const sizes = {
      properties: '10-50KB',
      transactions: '50-200KB',
      investments: '20-100KB',
      verifications: '15-80KB'
    }
    return sizes[exportType] || 'Varies'
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Data">
      <div className="space-y-6">
        {/* Export Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Data to Export
          </label>
          <div className="space-y-2">
            {exportOptions.map(option => (
              <label key={option.value} className="flex items-start space-x-3 p-3 border border-gray-700 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors">
                <input
                  type="radio"
                  value={option.value}
                  checked={exportType === option.value}
                  onChange={(e) => setExportType(e.target.value)}
                  className="mt-1 text-accent-teal focus:ring-accent-teal"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">{option.label}</div>
                  <div className="text-gray-400 text-sm">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Export Format
          </label>
          <div className="flex space-x-4">
            {['csv', 'json', 'pdf'].map(formatOption => (
              <label key={formatOption} className="flex items-center space-x-2">
                <input
                  type="radio"
                  value={formatOption}
                  checked={format === formatOption}
                  onChange={(e) => setFormat(e.target.value)}
                  className="text-accent-teal focus:ring-accent-teal"
                />
                <span className="text-white text-sm">{formatOption.toUpperCase()}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date Range (Optional)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-accent-teal transition-colors"
              />
              <div className="text-xs text-gray-400 mt-1">From</div>
            </div>
            <div>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-accent-teal transition-colors"
              />
              <div className="text-xs text-gray-400 mt-1">To</div>
            </div>
          </div>
        </div>

        {/* Export Info */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">Export Information</h4>
          <div className="text-sm text-gray-300 space-y-1">
            <div>Estimated file size: {getFileSizeEstimate()}</div>
            <div>Format: {format.toUpperCase()}</div>
            <div>Includes: All {exportType} data{dateRange.start && ' within selected date range'}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary"
            disabled={exporting}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex-1 btn-primary disabled:opacity-50"
          >
            {exporting ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-deedchain-navy border-t-transparent rounded-full animate-spin mr-2"></div>
                Exporting...
              </div>
            ) : (
              'Export Data'
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ExportData