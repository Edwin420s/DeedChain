const CACHE_PREFIX = 'deedchain_'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const cache = {
  set: (key, data, duration = CACHE_DURATION) => {
    try {
      const item = {
        data,
        expiry: Date.now() + duration
      }
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item))
    } catch (error) {
      console.error('Cache set error:', error)
    }
  },

  get: (key) => {
    try {
      const item = localStorage.getItem(CACHE_PREFIX + key)
      if (!item) return null

      const parsed = JSON.parse(item)
      if (Date.now() > parsed.expiry) {
        localStorage.removeItem(CACHE_PREFIX + key)
        return null
      }

      return parsed.data
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(CACHE_PREFIX + key)
    } catch (error) {
      console.error('Cache remove error:', error)
    }
  },

  clear: () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  }
}

export const withCache = (fn, key, duration = CACHE_DURATION) => {
  return async (...args) => {
    const cacheKey = key + JSON.stringify(args)
    const cached = cache.get(cacheKey)
    
    if (cached) {
      return cached
    }

    const result = await fn(...args)
    cache.set(cacheKey, result, duration)
    return result
  }
}