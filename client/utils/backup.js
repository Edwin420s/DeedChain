// Backup and recovery utilities
export const backupUtils = {
  // Create backup of user data
  createBackup: async (userData) => {
    const backup = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: userData,
      checksum: await generateChecksum(JSON.stringify(userData))
    }

    const blob = new Blob([JSON.stringify(backup, null, 2)], { 
      type: 'application/json' 
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `deedchain-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return backup
  },

  // Restore from backup
  restoreBackup: async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const backup = JSON.parse(e.target.result)
          
          // Validate backup
          const isValid = await validateBackup(backup)
          if (!isValid) {
            throw new Error('Invalid backup file')
          }

          resolve(backup.data)
        } catch (error) {
          reject(new Error('Failed to parse backup file'))
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read backup file'))
      reader.readAsText(file)
    })
  },

  // Export encrypted backup
  createEncryptedBackup: async (userData, password) => {
    const backup = await createBackup(userData)
    const encrypted = await encryptData(JSON.stringify(backup), password)
    
    const blob = new Blob([encrypted], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `deedchain-encrypted-backup-${new Date().toISOString().split('T')[0]}.enc`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },

  // Restore encrypted backup
  restoreEncryptedBackup: async (file, password) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const decrypted = await decryptData(e.target.result, password)
          const backup = JSON.parse(decrypted)
          
          const isValid = await validateBackup(backup)
          if (!isValid) {
            throw new Error('Invalid backup file')
          }

          resolve(backup.data)
        } catch (error) {
          reject(new Error('Failed to decrypt backup file'))
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read backup file'))
      reader.readAsText(file)
    })
  }
}

// Helper functions
const generateChecksum = async (data) => {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const validateBackup = async (backup) => {
  if (!backup.version || !backup.timestamp || !backup.data || !backup.checksum) {
    return false
  }

  const calculatedChecksum = await generateChecksum(JSON.stringify(backup.data))
  return calculatedChecksum === backup.checksum
}

const encryptData = async (data, password) => {
  // Simplified encryption - in production, use a proper encryption library
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  
  // Generate key from password
  const passwordBuffer = encoder.encode(password)
  const keyBuffer = await crypto.subtle.digest('SHA-256', passwordBuffer)
  
  // Simple XOR encryption (not secure for production)
  const encryptedBuffer = new Uint8Array(dataBuffer.length)
  for (let i = 0; i < dataBuffer.length; i++) {
    encryptedBuffer[i] = dataBuffer[i] ^ keyBuffer[i % keyBuffer.byteLength]
  }
  
  return btoa(String.fromCharCode(...encryptedBuffer))
}

const decryptData = async (encryptedData, password) => {
  // Simplified decryption
  const encryptedBuffer = new Uint8Array(
    atob(encryptedData).split('').map(char => char.charCodeAt(0))
  )
  
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)
  const keyBuffer = await crypto.subtle.digest('SHA-256', passwordBuffer)
  
  const decryptedBuffer = new Uint8Array(encryptedBuffer.length)
  for (let i = 0; i < encryptedBuffer.length; i++) {
    decryptedBuffer[i] = encryptedBuffer[i] ^ keyBuffer[i % keyBuffer.byteLength]
  }
  
  return new TextDecoder().decode(decryptedBuffer)
}

// Auto-backup functionality
export const autoBackup = {
  isEnabled: () => {
    return localStorage.getItem('deedchain-auto-backup') === 'true'
  },

  enable: () => {
    localStorage.setItem('deedchain-auto-backup', 'true')
  },

  disable: () => {
    localStorage.setItem('deedchain-auto-backup', 'false')
  },

  schedule: (interval = 24 * 60 * 60 * 1000) => { // 24 hours
    if (autoBackup.isEnabled()) {
      setInterval(() => {
        autoBackup.createBackup()
      }, interval)
    }
  },

  createBackup: async () => {
    try {
      const userData = {
        properties: JSON.parse(localStorage.getItem('deedchain-properties') || '[]'),
        preferences: JSON.parse(localStorage.getItem('deedchain-preferences') || '{}'),
        transactions: JSON.parse(localStorage.getItem('deedchain-transactions') || '[]')
      }

      await backupUtils.createBackup(userData)
      console.log('Auto-backup created successfully')
    } catch (error) {
      console.error('Auto-backup failed:', error)
    }
  }
}