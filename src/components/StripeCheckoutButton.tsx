import React, { useState } from 'react'
import { CreditCard, Loader2, AlertCircle } from 'lucide-react'
import { StripeService } from '../services/stripeService'

interface StripeCheckoutButtonProps {
  plan: 'monthly' | 'yearly' | 'pro' | 'enterprise'
  className?: string
  children?: React.ReactNode
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'success'
}

export default function StripeCheckoutButton({ 
  plan, 
  className = '', 
  children, 
  disabled = false,
  variant = 'primary'
}: StripeCheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  }

  const handleClick = async () => {
    if (disabled || loading) return

    setLoading(true)
    setError(null)
    
    try {
      console.log('🛒 Initiating checkout for plan:', plan)
      
      // Use StripeService to handle checkout
      await StripeService.redirectToCheckout(plan)
      
    } catch (error) {
      console.error('❌ Checkout error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to start checkout'
      setError(errorMessage)
      
      // Show error to user
      alert(`Checkout Error\n\n${errorMessage}\n\nPlease try again or contact support.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        className={`
          w-full flex items-center justify-center
          ${variantClasses[variant]}
          disabled:bg-gray-400 disabled:cursor-not-allowed
          font-semibold py-3 px-6 rounded-lg
          transition-colors duration-200
          ${className}
        `}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : error ? (
          <>
            <AlertCircle className="h-4 w-4 mr-2" />
            Try Again
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            {children || 'Subscribe Now'}
          </>
        )}
      </button>
      
      {error && (
        <p className="text-sm text-red-600 text-center">
          {error}
        </p>
      )}
    </div>
  )
}