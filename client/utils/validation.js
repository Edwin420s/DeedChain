import { ethers } from 'ethers'
import { VALIDATION_RULES } from './constants'

// Enhanced validation utilities
export const validation = {
  // Basic validators
  required: (value) => {
    if (value === null || value === undefined || value === '') {
      return 'This field is required'
    }
    return null
  },

  email: (value) => {
    if (!value) return null
    if (!VALIDATION_RULES.EMAIL.test(value)) {
      return 'Please enter a valid email address'
    }
    return null
  },

  phone: (value) => {
    if (!value) return null
    if (!VALIDATION_RULES.PHONE.test(value.replace(/\s/g, ''))) {
      return 'Please enter a valid phone number'
    }
    return null
  },

  // Wallet address validation
  walletAddress: (value) => {
    if (!value) return 'Wallet address is required'
    
    try {
      if (!ethers.utils.isAddress(value)) {
        return 'Please enter a valid wallet address'
      }
      return null
    } catch {
      return 'Invalid wallet address format'
    }
  },

  // Property validation
  property: {
    location: (value) => {
      const error = validation.required(value)
      if (error) return error
      
      if (value.length < 5) {
        return 'Location must be at least 5 characters long'
      }
      
      if (value.length > 200) {
        return 'Location must be less than 200 characters'
      }
      
      return null
    },

    area: (value) => {
      const error = validation.required(value)
      if (error) return error
      
      const area = parseFloat(value)
      if (isNaN(area) || area <= 0) {
        return 'Area must be a positive number'
      }
      
      if (area > 1000000) {
        return 'Area seems too large. Please verify the value'
      }
      
      return null
    },

    surveyNumber: (value) => {
      const error = validation.required(value)
      if (error) return error
      
      if (!VALIDATION_RULES.SURVEY_NUMBER.test(value)) {
        return 'Survey number can only contain letters, numbers, hyphens, and underscores'
      }
      
      if (value.length > 50) {
        return 'Survey number must be less than 50 characters'
      }
      
      return null
    },

    coordinates: (coordinates) => {
      if (!coordinates) return null
      
      const { lat, lng } = coordinates
      
      if (lat === '' && lng === '') return null
      
      if (lat === '' || lng === '') {
        return 'Both latitude and longitude are required if coordinates are provided'
      }
      
      const latNum = parseFloat(lat)
      const lngNum = parseFloat(lng)
      
      if (isNaN(latNum) || isNaN(lngNum)) {
        return 'Coordinates must be valid numbers'
      }
      
      if (latNum < -90 || latNum > 90) {
        return 'Latitude must be between -90 and 90 degrees'
      }
      
      if (lngNum < -180 || lngNum > 180) {
        return 'Longitude must be between -180 and 180 degrees'
      }
      
      return null
    }
  },

  // File validation
  file: {
    type: (file, allowedTypes) => {
      if (!file) return null
      
      if (!allowedTypes.includes(file.type)) {
        const allowedExtensions = allowedTypes.map(type => 
          type.split('/')[1].toUpperCase()
        ).join(', ')
        
        return `File type not supported. Allowed types: ${allowedExtensions}`
      }
      
      return null
    },

    size: (file, maxSizeMB) => {
      if (!file) return null
      
      const maxSizeBytes = maxSizeMB * 1024 * 1024
      if (file.size > maxSizeBytes) {
        return `File size must be less than ${maxSizeMB}MB`
      }
      
      return null
    },

    multiple: (files, options = {}) => {
      if (!files || files.length === 0) {
        return options.required ? 'At least one file is required' : null
      }
      
      if (options.maxCount && files.length > options.maxCount) {
        return `Maximum ${options.maxCount} files allowed`
      }
      
      for (const file of files) {
        const typeError = validation.file.type(file, options.allowedTypes || [])
        if (typeError) return typeError
        
        const sizeError = validation.file.size(file, options.maxSizeMB || 10)
        if (sizeError) return sizeError
      }
      
      return null
    }
  },

  // Form validation
  form: {
    validate: (data, rules) => {
      const errors = {}
      
      for (const [field, fieldRules] of Object.entries(rules)) {
        const value = data[field]
        
        for (const rule of fieldRules) {
          const error = typeof rule === 'function' 
            ? rule(value, data) 
            : validation[rule](value)
          
          if (error) {
            errors[field] = error
            break
          }
        }
      }
      
      return {
        isValid: Object.keys(errors).length === 0,
        errors
      }
    },

    // Common validation rulesets
    rulesets: {
      propertyRegistration: {
        location: [validation.required, validation.property.location],
        area: [validation.required, validation.property.area],
        surveyNumber: [validation.required, validation.property.surveyNumber],
        coordinates: [validation.property.coordinates],
        documents: [(files) => validation.file.multiple(files, { 
          required: true, 
          maxCount: 10, 
          maxSizeMB: 10,
          allowedTypes: ['image/jpeg', 'image/png', 'application/pdf']
        })]
      },

      propertyTransfer: {
        recipient: [validation.required, validation.walletAddress],
        propertyId: [validation.required]
      },

      tokenization: {
        tokenName: [validation.required, (value) => {
          if (value.length < 3) return 'Token name must be at least 3 characters'
          if (value.length > 50) return 'Token name must be less than 50 characters'
          return null
        }],
        tokenSymbol: [validation.required, (value) => {
          if (value.length < 2) return 'Token symbol must be at least 2 characters'
          if (value.length > 10) return 'Token symbol must be less than 10 characters'
          if (!/^[A-Z]+$/.test(value)) return 'Token symbol must contain only uppercase letters'
          return null
        }],
        totalSupply: [validation.required, (value) => {
          const num = parseFloat(value)
          if (isNaN(num) || num <= 0) return 'Total supply must be a positive number'
          if (num > 1000000000) return 'Total supply seems too large'
          return null
        }],
        pricePerToken: [validation.required, (value) => {
          const num = parseFloat(value)
          if (isNaN(num) || num <= 0) return 'Price must be a positive number'
          if (num > 1000000) return 'Price seems too high'
          return null
        }],
        reservePercentage: [validation.required, (value) => {
          const num = parseFloat(value)
          if (isNaN(num) || num < 0 || num > 100) {
            return 'Reserve percentage must be between 0 and 100'
          }
          return null
        }]
      }
    }
  },

  // Async validators
  async: {
    isPropertyUnique: async (surveyNumber, currentTokenId = null) => {
      // This would typically call an API endpoint
      try {
        const response = await fetch(`/api/properties/check-unique?surveyNumber=${surveyNumber}&currentTokenId=${currentTokenId}`)
        const data = await response.json()
        
        if (!data.isUnique) {
          return 'A property with this survey number already exists'
        }
        
        return null
      } catch {
        return 'Unable to verify property uniqueness'
      }
    },

    isWalletValid: async (address) => {
      try {
        // Check if address is valid and not a contract (simplified)
        const isValid = ethers.utils.isAddress(address)
        if (!isValid) return 'Invalid wallet address'
        
        // Additional checks could be added here
        return null
      } catch {
        return 'Unable to validate wallet address'
      }
    }
  }
}

// Export individual validators for easier imports
export const {
  required,
  email,
  phone,
  walletAddress,
  property: propertyValidators,
  file: fileValidators,
  form: formValidators,
  async: asyncValidators
} = validation

export default validation