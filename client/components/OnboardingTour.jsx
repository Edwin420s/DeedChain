import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Modal from './Modal'

const OnboardingTour = () => {
  const { isConnected, address } = useWallet()
  const [completedTours, setCompletedTours] = useLocalStorage('deedchain-tours', [])
  const [currentTour, setCurrentTour] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)

  const tours = {
    welcome: {
      title: 'Welcome to DeedChain!',
      steps: [
        {
          title: 'Get Started',
          content: 'DeedChain helps you securely register, verify, and tokenize property ownership on the blockchain.',
          target: null,
          position: 'center'
        },
        {
          title: 'Connect Your Wallet',
          content: 'Start by connecting your Web3 wallet to access all features.',
          target: '.connect-wallet-button',
          position: 'bottom'
        },
        {
          title: 'Explore Dashboard',
          content: 'Your dashboard shows all your properties and quick actions.',
          target: '[href="/dashboard"]',
          position: 'bottom'
        }
      ]
    },
    propertyRegistration: {
      title: 'Register Your First Property',
      steps: [
        {
          title: 'Property Registration',
          content: 'Register your property by providing details and uploading documents.',
          target: '[href="/register"]',
          position: 'bottom'
        },
        {
          title: 'Document Upload',
          content: 'Upload property documents that will be stored securely on IPFS.',
          target: null,
          position: 'center'
        },
        {
          title: 'Verification Process',
          content: 'Your property will be verified by trusted validators before becoming active.',
          target: null,
          position: 'center'
        }
      ]
    },
    marketplace: {
      title: 'Explore the Marketplace',
      steps: [
        {
          title: 'Browse Properties',
          content: 'Discover verified properties available for investment.',
          target: '[href="/marketplace"]',
          position: 'bottom'
        },
        {
          title: 'Advanced Search',
          content: 'Use filters to find properties by location, price, and type.',
          target: '.search-filters',
          position: 'bottom'
        },
        {
          title: 'Investment Options',
          content: 'Invest in tokenized properties or make direct purchases.',
          target: '.investment-section',
          position: 'top'
        }
      ]
    }
  }

  useEffect(() => {
    // Check if user needs onboarding
    if (isConnected && address && !completedTours.includes('welcome')) {
      startTour('welcome')
    }
  }, [isConnected, address, completedTours])

  const startTour = (tourName) => {
    setCurrentTour(tourName)
    setCurrentStep(0)
  }

  const endTour = () => {
    if (currentTour) {
      setCompletedTours(prev => [...prev, currentTour])
    }
    setCurrentTour(null)
    setCurrentStep(0)
  }

  const nextStep = () => {
    if (currentTour && currentStep < tours[currentTour].steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      endTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const getCurrentStep = () => {
    if (!currentTour) return null
    return tours[currentTour].steps[currentStep]
  }

  const currentStepData = getCurrentStep()

  if (!currentTour || !currentStepData) return null

  return (
    <Modal isOpen={true} onClose={endTour} hideCloseButton>
      <div className="text-center">
        <div className="w-16 h-16 bg-accent-teal/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🎯</span>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">
          {currentStepData.title}
        </h3>
        
        <p className="text-gray-300 mb-6">
          {currentStepData.content}
        </p>

        {/* Progress */}
        <div className="flex justify-center space-x-1 mb-6">
          {tours[currentTour].steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-accent-teal' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex space-x-3">
          {currentStep > 0 && (
            <button
              onClick={prevStep}
              className="flex-1 btn-secondary"
            >
              Back
            </button>
          )}
          
          <button
            onClick={nextStep}
            className={`${currentStep > 0 ? 'flex-1' : 'w-full'} btn-primary`}
          >
            {currentStep === tours[currentTour].steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>

        {/* Skip Tour */}
        <button
          onClick={endTour}
          className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Skip Tour
        </button>
      </div>
    </Modal>
  )
}

export default OnboardingTour