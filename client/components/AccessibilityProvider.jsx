import { createContext, useContext, useEffect, useState } from 'react'
import { accessibility } from '../utils/accessibility'

const AccessibilityContext = createContext()

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

export const AccessibilityProvider = ({ children }) => {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [fontSize, setFontSize] = useState('normal')

  useEffect(() => {
    // Check user's system preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handleChange = (e) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)

    // Load user preferences from localStorage
    const savedHighContrast = localStorage.getItem('deedchain-high-contrast') === 'true'
    const savedFontSize = localStorage.getItem('deedchain-font-size') || 'normal'
    
    setHighContrast(savedHighContrast)
    setFontSize(savedFontSize)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    // Apply accessibility preferences to document
    document.documentElement.setAttribute('data-reduced-motion', reducedMotion.toString())
    document.documentElement.setAttribute('data-high-contrast', highContrast.toString())
    document.documentElement.setAttribute('data-font-size', fontSize)
  }, [reducedMotion, highContrast, fontSize])

  const toggleReducedMotion = () => {
    const newValue = !reducedMotion
    setReducedMotion(newValue)
  }

  const toggleHighContrast = () => {
    const newValue = !highContrast
    setHighContrast(newValue)
    localStorage.setItem('deedchain-high-contrast', newValue.toString())
  }

  const changeFontSize = (size) => {
    setFontSize(size)
    localStorage.setItem('deedchain-font-size', size)
  }

  const announce = (message, priority = 'polite') => {
    accessibility.aria.announce(message, priority)
  }

  const value = {
    reducedMotion,
    highContrast,
    fontSize,
    toggleReducedMotion,
    toggleHighContrast,
    changeFontSize,
    announce
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}