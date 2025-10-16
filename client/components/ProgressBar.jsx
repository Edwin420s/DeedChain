import { useEffect, useState } from 'react'

const ProgressBar = ({ steps, currentStep, className = '' }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const calculatedProgress = ((currentStep - 1) / (steps.length - 1)) * 100
    setProgress(calculatedProgress)
  }, [currentStep, steps.length])

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Line */}
      <div className="relative">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-accent-teal h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Steps */}
        <div className="flex justify-between mt-4">
          {steps.map((step, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber < currentStep
            const isCurrent = stepNumber === currentStep
            const isUpcoming = stepNumber > currentStep

            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-accent-teal text-deedchain-navy'
                      : isCurrent
                      ? 'bg-accent-teal text-deedchain-navy ring-4 ring-accent-teal/30'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                
                <span
                  className={`mt-2 text-xs font-medium text-center max-w-20 ${
                    isCompleted || isCurrent
                      ? 'text-accent-teal'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ProgressBar