import React, { useState, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface DisclaimerProps {
  className?: string
  variant?: 'banner' | 'footer' | 'modal'
  showCloseButton?: boolean
  persistent?: boolean
}

const Disclaimer: React.FC<DisclaimerProps> = ({
  className = '',
  variant = 'banner',
  showCloseButton = true,
  persistent = false
}) => {
  const [isVisible, setIsVisible] = useState(true)
  
  useEffect(() => {
    // Check if user has previously dismissed the disclaimer
    if (!persistent) {
      const hasSeenDisclaimer = localStorage.getItem('disclaimerDismissed')
      if (hasSeenDisclaimer) {
        setIsVisible(false)
      }
    }
  }, [persistent])
  
  const handleDismiss = () => {
    setIsVisible(false)
    if (!persistent) {
      localStorage.setItem('disclaimerDismissed', 'true')
    }
  }
  
  if (!isVisible) return null
  
  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={showCloseButton ? handleDismiss : undefined}></div>
          
          <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            {showCloseButton && (
              <button 
                onClick={handleDismiss}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Risk Disclaimer</h3>
                <div className="mt-2 text-sm text-gray-500 space-y-2">
                  <p className="font-medium">
                    <strong>Options World is for educational purposes only.</strong> Our platform is designed to help you learn and develop trading skills, not to provide financial advice.
                  </p>
                  <p>
                    Options trading involves significant risk and requires proper education. This platform uses simulated trading to help you learn without risking real money.
                  </p>
                  <p>
                    Our focus is on helping you develop trading expertise through education, practice, and analysis. Always continue learning and developing your skills before trading with real money.
                  </p>
                </div>
                
                {showCloseButton && (
                  <div className="mt-4">
                    <button
                      onClick={handleDismiss}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      I Understand
                    </button>
                    <p className="text-sm text-blue-700">
                      <strong>Learning Disclaimer:</strong> Options World is designed to help you learn trading skills. Focus on developing expertise, not on profits. Trading involves risk.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (variant === 'footer') {
    return (
      <div className={`bg-gray-800 text-white py-3 px-4 text-sm ${className}`}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-yellow-400 mr-2" />
            <span>
              <strong>Disclaimer:</strong> Options World is for educational purposes only. Our focus is on learning, not profits. Trading involves risk.
            </span>
          </div>
          
          {showCloseButton && (
            <button 
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }
  
  // Default banner variant
  return (
    <div className={`bg-yellow-50 border-t border-b border-yellow-200 py-3 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Disclaimer:</strong> Options World is for educational purposes only. Not financial advice. Trading involves risk.
              </p>
            </div>
          </div>
          
          {showCloseButton && (
            <button 
              onClick={handleDismiss}
              className="ml-auto flex-shrink-0 text-yellow-600 hover:text-yellow-800"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Disclaimer