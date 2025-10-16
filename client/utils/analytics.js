// Analytics and tracking utilities
export const analytics = {
  // Page view tracking
  trackPageView: (page, properties = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_title: page,
        page_location: window.location.href,
        ...properties
      })
    }
    
    // Custom analytics
    logEvent('page_view', { page, ...properties })
  },

  // Event tracking
  trackEvent: (category, action, label, value) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      })
    }
    
    // Custom event logging
    logEvent('custom_event', { category, action, label, value })
  },

  // User behavior tracking
  trackUserBehavior: (action, details = {}) => {
    const event = {
      action,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...details
    }
    
    logEvent('user_behavior', event)
  },

  // Error tracking
  trackError: (error, context = {}) => {
    const errorEvent = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href
    }
    
    logEvent('error', errorEvent)
    
    // Send to error reporting service
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Sentry.captureException(error, { extra: context })
    }
  },

  // Performance tracking
  trackPerformance: (metric, value, metadata = {}) => {
    const perfEvent = {
      metric,
      value,
      timestamp: new Date().toISOString(),
      ...metadata
    }
    
    logEvent('performance', perfEvent)
  }
}

// Internal event logging
const logEvent = (type, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${type}:`, data)
  }
  
  // Send to your analytics backend
  if (process.env.NEXT_PUBLIC_API_URL) {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        data,
        session_id: getSessionId()
      })
    }).catch(console.error)
  }
}

// Session management
const getSessionId = () => {
  let sessionId = localStorage.getItem('deedchain-session-id')
  if (!sessionId) {
    sessionId = generateId()
    localStorage.setItem('deedchain-session-id', sessionId)
  }
  return sessionId
}

const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Performance metrics
export const performanceMetrics = {
  start: (name) => {
    performance.mark(`${name}-start`)
  },
  
  end: (name) => {
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
    
    const measures = performance.getEntriesByName(name)
    const duration = measures[0]?.duration || 0
    
    analytics.trackPerformance(name, duration)
    
    // Clean up
    performance.clearMarks(`${name}-start`)
    performance.clearMarks(`${name}-end`)
    performance.clearMeasures(name)
    
    return duration
  }
}