import { useState } from 'react'
import { useAccessibility } from './AccessibilityProvider'
import Modal from './Modal'

const AccessibilityToolbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { 
    reducedMotion, 
    highContrast, 
    fontSize, 
    toggleReducedMotion, 
    toggleHighContrast, 
    changeFontSize,
    announce 
  } = useAccessibility()

  const fontSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'normal', label: 'Normal' },
    { value: 'large', label: 'Large' },
    { value: 'xlarge', label: 'Extra Large' }
  ]

  const handleFontSizeChange = (size) => {
    changeFontSize(size)
    announce(`Font size set to ${size}`)
  }

  const handleToggleMotion = () => {
    toggleReducedMotion()
    announce(`Reduced motion ${reducedMotion ? 'disabled' : 'enabled'}`)
  }

  const handleToggleContrast = () => {
    toggleHighContrast()
    announce(`High contrast mode ${highContrast ? 'disabled' : 'enabled'}`)
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 p-3 bg-accent-teal text-deedchain-navy rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-teal focus:ring-offset-2 focus:ring-offset-deedchain-navy"
        aria-label="Accessibility settings"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Accessibility Settings">
        <div className="space-y-6">
          {/* Font Size */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Font Size</h4>
            <div className="grid grid-cols-2 gap-2">
              {fontSizeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleFontSizeChange(option.value)}
                  className={`p-3 rounded-lg border transition-colors ${
                    fontSize === option.value
                      ? 'bg-accent-teal text-deedchain-navy border-accent-teal'
                      : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Motion Settings */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Motion</h4>
            <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
              <span className="text-white">Reduce Motion</span>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={handleToggleMotion}
                className="w-4 h-4 text-accent-teal bg-gray-800 border-gray-700 rounded focus:ring-accent-teal focus:ring-2"
              />
            </label>
          </div>

          {/* Contrast Settings */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Contrast</h4>
            <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
              <span className="text-white">High Contrast Mode</span>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={handleToggleContrast}
                className="w-4 h-4 text-accent-teal bg-gray-800 border-gray-700 rounded focus:ring-accent-teal focus:ring-2"
              />
            </label>
          </div>

          {/* Keyboard Shortcuts */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Keyboard Shortcuts</h4>
            <div className="bg-gray-800 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Open accessibility menu</span>
                <kbd className="px-2 py-1 bg-gray-700 text-white rounded text-xs">A</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Skip to main content</span>
                <kbd className="px-2 py-1 bg-gray-700 text-white rounded text-xs">S</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Focus search</span>
                <kbd className="px-2 py-1 bg-gray-700 text-white rounded text-xs">/</kbd>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => {
                handleFontSizeChange('normal')
                if (reducedMotion) handleToggleMotion()
                if (highContrast) handleToggleContrast()
                announce('All accessibility settings reset to default')
              }}
              className="flex-1 btn-secondary"
            >
              Reset to Default
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default AccessibilityToolbar