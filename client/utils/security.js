// Security utilities for the frontend
export const security = {
  // XSS prevention
  sanitize: {
    html: (input) => {
      if (typeof input !== 'string') return ''
      
      const div = document.createElement('div')
      div.textContent = input
      return div.innerHTML
    },
    
    url: (url) => {
      try {
        const parsed = new URL(url)
        const allowedProtocols = ['https:', 'http:', 'ipfs:']
        
        if (!allowedProtocols.includes(parsed.protocol)) {
          return null
        }
        
        return parsed.toString()
      } catch {
        return null
      }
    },
    
    walletAddress: (address) => {
      if (typeof address !== 'string') return null
      
      // Basic Ethereum address validation
      const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/
      return ethAddressRegex.test(address) ? address.toLowerCase() : null
    }
  },

  // Input validation
  validation: {
    email: (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },
    
    phone: (phone) => {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
      return phoneRegex.test(phone)
    },
    
    coordinates: (lat, lng) => {
      return (
        lat >= -90 && lat <= 90 &&
        lng >= -180 && lng <= 180
      )
    },
    
    fileType: (file, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']) => {
      return allowedTypes.includes(file.type)
    },
    
    fileSize: (file, maxSizeMB = 10) => {
      return file.size <= maxSizeMB * 1024 * 1024
    }
  },

  // Rate limiting
  rateLimit: {
    createLimiter: (maxRequests, timeWindow) => {
      const requests = new Map()
      
      return (identifier) => {
        const now = Date.now()
        const windowStart = now - timeWindow
        
        // Clean old entries
        for (const [key, timestamp] of requests.entries()) {
          if (timestamp < windowStart) {
            requests.delete(key)
          }
        }
        
        const userRequests = Array.from(requests.values())
          .filter(timestamp => timestamp > windowStart)
          .length
        
        if (userRequests >= maxRequests) {
          return false
        }
        
        requests.set(identifier, now)
        return true
      }
    }
  },

  // Cryptography utilities
  crypto: {
    generateNonce: () => {
      return Math.random().toString(36).substring(2) + Date.now().toString(36)
    },
    
    hashString: async (str) => {
      const encoder = new TextEncoder()
      const data = encoder.encode(str)
      const hash = await crypto.subtle.digest('SHA-256', data)
      return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    }
  }
}

// Content Security Policy helper
export const csp = {
  generateNonce: () => {
    return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))))
  },
  
  validateNonce: (nonce) => {
    try {
      return atob(nonce).length === 16
    } catch {
      return false
    }
  }
}

// Security headers configuration
export const securityHeaders = {
  contentSecurityPolicy: `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https: ipfs:;
    connect-src 'self' https://polygon-rpc.com https://api.deedchain.com wss://api.deedchain.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s+/g, ' ').trim()
}