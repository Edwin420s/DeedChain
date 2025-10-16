// Comprehensive formatting utilities
import { ethers } from 'ethers'

export const formatting = {
  // Currency formatting
  currency: {
    format: (amount, currency = 'USD', locale = 'en-US') => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
    },
    
    formatCrypto: (amount, decimals = 18, symbol = 'ETH') => {
      const formatted = ethers.utils.formatUnits(amount, decimals)
      const num = parseFloat(formatted)
      
      if (num === 0) return `0 ${symbol}`
      if (num < 0.001) return `< 0.001 ${symbol}`
      if (num < 1) return `${num.toFixed(4)} ${symbol}`
      if (num < 1000) return `${num.toFixed(2)} ${symbol}`
      
      return `${(num / 1000).toFixed(2)}K ${symbol}`
    },
    
    formatPercentage: (value, decimals = 2) => {
      return `${value.toFixed(decimals)}%`
    }
  },

  // Number formatting
  numbers: {
    format: (number, decimals = 0) => {
      if (number === null || number === undefined) return '0'
      
      const num = typeof number === 'string' ? parseFloat(number) : number
      
      if (isNaN(num)) return '0'
      if (num === 0) return '0'
      
      if (Math.abs(num) < 0.001) {
        return num.toExponential(2)
      }
      
      if (Math.abs(num) < 1) {
        return num.toFixed(4)
      }
      
      if (Math.abs(num) < 1000) {
        return num.toFixed(decimals)
      }
      
      const units = ['', 'K', 'M', 'B', 'T']
      const order = Math.floor(Math.log10(Math.abs(num)) / 3)
      const unit = units[Math.min(order, units.length - 1)]
      const scaled = num / Math.pow(1000, order)
      
      return `${scaled.toFixed(1)}${unit}`
    },
    
    formatWithCommas: (number) => {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    
    formatFileSize: (bytes) => {
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      let size = bytes
      let unitIndex = 0
      
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
      }
      
      return `${size.toFixed(1)} ${units[unitIndex]}`
    }
  },

  // Date and time formatting
  date: {
    format: (date, format = 'standard') => {
      const dateObj = new Date(date)
      
      const formats = {
        standard: {
          date: dateObj.toLocaleDateString('en-US'),
          time: dateObj.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        },
        short: dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        long: dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        relative: formatting.date.getRelativeTime(date)
      }
      
      return formats[format] || formats.standard
    },
    
    getRelativeTime: (date) => {
      const now = new Date()
      const diffInSeconds = Math.floor((now - new Date(date)) / 1000)
      
      if (diffInSeconds < 60) {
        return 'just now'
      }
      
      const diffInMinutes = Math.floor(diffInSeconds / 60)
      if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
      }
      
      const diffInHours = Math.floor(diffInMinutes / 60)
      if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
      }
      
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 30) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
      }
      
      const diffInMonths = Math.floor(diffInDays / 30)
      if (diffInMonths < 12) {
        return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`
      }
      
      const diffInYears = Math.floor(diffInMonths / 12)
      return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`
    },
    
    formatDuration: (seconds) => {
      const units = [
        { value: 31536000, label: 'year' },
        { value: 2592000, label: 'month' },
        { value: 86400, label: 'day' },
        { value: 3600, label: 'hour' },
        { value: 60, label: 'minute' },
        { value: 1, label: 'second' }
      ]
      
      for (const unit of units) {
        if (seconds >= unit.value) {
          const value = Math.floor(seconds / unit.value)
          return `${value} ${unit.label}${value > 1 ? 's' : ''}`
        }
      }
      
      return '0 seconds'
    }
  },

  // Text formatting
  text: {
    truncate: (text, maxLength = 50, suffix = '...') => {
      if (!text) return ''
      if (text.length <= maxLength) return text
      
      return text.substring(0, maxLength - suffix.length) + suffix
    },
    
    capitalize: (text) => {
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
    },
    
    titleCase: (text) => {
      return text.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      })
    },
    
    camelCaseToTitle: (text) => {
      return text
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim()
    },
    
    slugify: (text) => {
      return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }
  },

  // Address formatting
  address: {
    shorten: (address, startChars = 6, endChars = 4) => {
      if (!address) return ''
      if (address.length <= startChars + endChars) return address
      
      return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`
    },
    
    format: (address) => {
      if (!address) return ''
      return ethers.utils.getAddress(address)
    },
    
    isValid: (address) => {
      try {
        return ethers.utils.isAddress(address)
      } catch {
        return false
      }
    }
  },

  // Property-specific formatting
  property: {
    formatArea: (area, unit = 'acres') => {
      const areaNum = typeof area === 'string' ? parseFloat(area) : area
      
      if (areaNum < 0.01) {
        return `${(areaNum * 43560).toFixed(0)} sq ft`
      }
      
      if (areaNum < 1) {
        return `${areaNum.toFixed(2)} ${unit}`
      }
      
      if (areaNum < 1000) {
        return `${areaNum.toFixed(1)} ${unit}`
      }
      
      return `${formatting.numbers.format(areaNum)} ${unit}`
    },
    
    formatCoordinates: (coordinates) => {
      if (!coordinates) return 'N/A'
      
      const { lat, lng } = coordinates
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    },
    
    formatStatus: (status) => {
      const statusMap = {
        draft: 'Draft',
        pending: 'Pending Verification',
        under_review: 'Under Review',
        verified: 'Verified',
        rejected: 'Rejected',
        transferring: 'Transferring',
        tokenized: 'Tokenized',
        archived: 'Archived'
      }
      
      return statusMap[status] || formatting.text.capitalize(status)
    }
  },

  // Transaction formatting
  transaction: {
    formatType: (type) => {
      const typeMap = {
        registration: 'Property Registration',
        verification: 'Verification',
        transfer: 'Ownership Transfer',
        tokenization: 'Tokenization',
        burn: 'Token Burn',
        update: 'Property Update'
      }
      
      return typeMap[type] || formatting.text.capitalize(type)
    },
    
    formatGas: (gasUsed, gasPrice) => {
      if (!gasUsed || !gasPrice) return 'N/A'
      
      const gasCost = gasUsed.mul(gasPrice)
      const maticCost = ethers.utils.formatEther(gasCost)
      
      return `${parseFloat(maticCost).toFixed(6)} MATIC`
    }
  }
}

// Export individual functions for easier imports
export const {
  currency,
  numbers,
  date,
  text,
  address,
  property,
  transaction
} = formatting

export default formatting