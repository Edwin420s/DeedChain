// Accessibility utilities
export const accessibility = {
  // Focus management
  focus: {
    trap: (element) => {
      const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      
      if (focusableElements.length === 0) return
      
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      
      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus()
              e.preventDefault()
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus()
              e.preventDefault()
            }
          }
        }
      }
      
      element.addEventListener('keydown', handleTabKey)
      firstElement.focus()
      
      return () => element.removeEventListener('keydown', handleTabKey)
    },
    
    moveFocus: (selector) => {
      const element = document.querySelector(selector)
      if (element) {
        element.focus()
      }
    }
  },

  // ARIA utilities
  aria: {
    announce: (message, priority = 'polite') => {
      const announcer = document.getElementById('a11y-announcer') || createAnnouncer()
      announcer.setAttribute('aria-live', priority)
      announcer.textContent = message
    },
    
    toggleExpanded: (element) => {
      const expanded = element.getAttribute('aria-expanded') === 'true'
      element.setAttribute('aria-expanded', (!expanded).toString())
      return !expanded
    }
  },

  // Keyboard navigation
  keyboard: {
    isEnter: (event) => event.key === 'Enter',
    isSpace: (event) => event.key === ' ',
    isEscape: (event) => event.key === 'Escape',
    isArrowUp: (event) => event.key === 'ArrowUp',
    isArrowDown: (event) => event.key === 'ArrowDown',
    isArrowLeft: (event) => event.key === 'ArrowLeft',
    isArrowRight: (event) => event.key === 'ArrowRight'
  }
}

const createAnnouncer = () => {
  const announcer = document.createElement('div')
  announcer.id = 'a11y-announcer'
  announcer.setAttribute('aria-live', 'polite')
  announcer.setAttribute('aria-atomic', 'true')
  announcer.style.cssText = `
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  `
  document.body.appendChild(announcer)
  return announcer
}

// Color contrast checker
export const checkContrast = (color1, color2) => {
  // Simple contrast ratio calculation
  // In a real app, you'd use a proper color contrast algorithm
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) return 1

  const luminance1 = (0.299 * rgb1.r + 0.587 * rgb1.g + 0.114 * rgb1.b) / 255
  const luminance2 = (0.299 * rgb2.r + 0.587 * rgb2.g + 0.114 * rgb2.b) / 255

  return Math.max(luminance1, luminance2) / Math.min(luminance1, luminance2)
}