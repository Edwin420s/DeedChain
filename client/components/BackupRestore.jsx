import { useState } from 'react'
import { useWallet } from '../context/WalletContext'
import { backupUtils, autoBackup } from '../utils/backup'
import Modal from './Modal'

const BackupRestore = ({ isOpen, onClose }) => {
  const { address } = useWallet()
  const [activeTab, setActiveTab] = useState('backup')
  const [backupPassword, setBackupPassword] = useState('')
  const [restorePassword, setRestorePassword] = useState('')
  const [restoreFile, setRestoreFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCreateBackup = async () => {
    if (!address) return
    
    setIsProcessing(true)
    try {
      // Get user data for backup
      const userData = await getUserData()
      
      if (backupPassword) {
        await backupUtils.createEncryptedBackup(userData, backupPassword)
      } else {
        await backupUtils.createBackup(userData)
      }
      
      alert('Backup created successfully!')
      setBackupPassword('')
    } catch (error) {
      console.error('Backup failed:', error)
      alert('Backup failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRestoreBackup = async () => {
    if (!restoreFile) return
    
    setIsProcessing(true)
    try {
      let userData
      
      if (restorePassword) {
        userData = await backupUtils.restoreEncryptedBackup(restoreFile, restorePassword)
      } else {
        userData = await backupUtils.restoreBackup(restoreFile)
      }
      
      // Apply restored data
      await applyRestoredData(userData)
      
      alert('Backup restored successfully!')
      setRestoreFile(null)
      setRestorePassword('')
      onClose()
    } catch (error) {
      console.error('Restore failed:', error)
      alert('Restore failed. Please check your password and try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const getUserData = async () => {
    // This would fetch user data from the backend
    const response = await fetch(`/api/user/${address}/backup-data`)
    return await response.json()
  }

  const applyRestoredData = async (userData) => {
    // This would send restored data to the backend
    await fetch(`/api/user/${address}/restore-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    })
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setRestoreFile(file)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Backup & Restore">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'backup'
                ? 'border-accent-teal text-accent-teal'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Create Backup
          </button>
          <button
            onClick={() => setActiveTab('restore')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'restore'
                ? 'border-accent-teal text-accent-teal'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Restore Backup
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-accent-teal text-accent-teal'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Settings
          </button>
        </div>

        {/* Backup Tab */}
        {activeTab === 'backup' && (
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-2">Create Data Backup</h4>
              <p className="text-blue-300 text-sm">
                Download a backup of your properties, transactions, and settings. 
                Keep this file safe as it contains your important data.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Encryption Password (Optional)
              </label>
              <input
                type="password"
                value={backupPassword}
                onChange={(e) => setBackupPassword(e.target.value)}
                placeholder="Leave empty for unencrypted backup"
                className="input-field"
              />
              <p className="text-gray-400 text-xs mt-1">
                If set, you'll need this password to restore the backup
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-yellow-400 text-xs">
                <strong>Important:</strong> Store your backup file in a secure location. 
                Without the backup file, you may lose access to your data.
              </p>
            </div>

            <button
              onClick={handleCreateBackup}
              disabled={isProcessing}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isProcessing ? 'Creating Backup...' : 'Download Backup'}
            </button>
          </div>
        )}

        {/* Restore Tab */}
        {activeTab === 'restore' && (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="text-green-400 font-medium mb-2">Restore from Backup</h4>
              <p className="text-green-300 text-sm">
                Restore your data from a previous backup file. This will replace your current data.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Backup File
              </label>
              <input
                type="file"
                accept=".json,.enc"
                onChange={handleFileSelect}
                className="input-field"
              />
            </div>

            {restoreFile && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Backup Password (if encrypted)
                </label>
                <input
                  type="password"
                  value={restorePassword}
                  onChange={(e) => setRestorePassword(e.target.value)}
                  placeholder="Enter backup password"
                  className="input-field"
                />
              </div>
            )}

            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-xs">
                <strong>Warning:</strong> Restoring from a backup will overwrite your current data. 
                This action cannot be undone.
              </p>
            </div>

            <button
              onClick={handleRestoreBackup}
              disabled={!restoreFile || isProcessing}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg disabled:opacity-50 transition-colors"
            >
              {isProcessing ? 'Restoring...' : 'Restore from Backup'}
            </button>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <h4 className="text-purple-400 font-medium mb-2">Backup Settings</h4>
              <p className="text-purple-300 text-sm">
                Configure automatic backup settings to protect your data.
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <div className="text-white font-medium">Auto Backup</div>
                <div className="text-gray-300 text-sm">
                  Automatically create backups every 24 hours
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoBackup.isEnabled()}
                  onChange={(e) => {
                    if (e.target.checked) {
                      autoBackup.enable()
                    } else {
                      autoBackup.disable()
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-teal"></div>
              </label>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h5 className="text-white font-medium mb-3">Backup Information</h5>
              <div className="text-sm text-gray-300 space-y-2">
                <div>Last backup: Never</div>
                <div>Backup size: 0 KB</div>
                <div>Items included: Properties, Transactions, Settings</div>
              </div>
            </div>

            <button
              onClick={() => autoBackup.createBackup()}
              className="w-full btn-secondary"
            >
              Create Manual Backup Now
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default BackupRestore