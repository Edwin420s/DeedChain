// Performance monitoring utilities
export const performanceMetrics = {
  startTime: null,
  marks: new Map(),

  start: (name = 'default') => {
    if (typeof window !== 'undefined' && window.performance) {
      performanceMetrics.marks.set(`${name}_start`, performance.now())
    }
  },

  end: (name = 'default') => {
    if (typeof window !== 'undefined' && window.performance) {
      const start = performanceMetrics.marks.get(`${name}_start`)
      if (start) {
        const duration = performance.now() - start
        performanceMetrics.marks.delete(`${name}_start`)
        
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
        }
        
        // Send to analytics in production
        if (process.env.NODE_ENV === 'production') {
          // Send to your analytics service
          // analytics.track('performance_metric', { name, duration })
        }
        
        return duration
      }
    }
    return 0
  },

  measure: async (name, fn) => {
    performanceMetrics.start(name)
    const result = await fn()
    performanceMetrics.end(name)
    return result
  }
}

// Resource loading utilities
export const preloadResource = (url, as = 'script') => {
  if (typeof document !== 'undefined') {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = url
    link.as = as
    document.head.appendChild(link)
  }
}

export const prefetchResource = (url) => {
  if (typeof document !== 'undefined') {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    document.head.appendChild(link)
  }
}

// Memory management
export const memoryUtils = {
  clearLargeCaches: () => {
    try {
      // Clear large cached data that might be consuming memory
      if (typeof caches !== 'undefined') {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('deedchain-large')) {
              caches.delete(name)
            }
          })
        })
      }
    } catch (error) {
      console.warn('Error clearing caches:', error)
    }
  },

  estimateMemory: () => {
    if (typeof performance !== 'undefined' && performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      }
    }
    return null
  }
}