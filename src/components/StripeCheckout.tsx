import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { StripeService } from '../services/stripeService'
import { CouponService } from '../services/couponService'
import CouponInput from './CouponInput'
import TermsAgreement from './TermsAgreement'
import { CheckCircle, CreditCard, ShieldCheck, AlertTriangle } from 'lucide-react'
import { formatPrice, BASE_PRICES } from '../utils/priceSync'

type PlanType = 'monthly' | 'yearly' | 'enterprise' | 'pro'

interface StripeCheckoutProps {
  plan: PlanType
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  plan,
  onSuccess,
  onCancel,
  className = ''
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [showTerms, setShowTerms] = useState(false)
  
  // Get correct pricing based on plan
  const getOriginalPrice = (planType: PlanType): number => {
    switch (planType) {
      case 'monthly':
        return BASE_PRICES.monthly
      case 'yearly':
        return BASE_PRICES.yearly
      case 'enterprise':
        return BASE_PRICES.enterprise
      case 'pro':
        return BASE_PRICES.pro
      default:
        return BASE_PRICES.monthly
    }
  }
  
  const originalPrice = getOriginalPrice(plan)
  
  // Calculate discounted price if coupon applied
  const finalPrice = appliedCoupon?.isValid 
    ? appliedCoupon.finalAmount 
    : originalPrice

  // Ensure finalPrice is valid
  const displayPrice = finalPrice || originalPrice || 0

  const handleCheckout = async () => {
    console.log('💳 Checkout button clicked, showing terms modal...')
    setShowTerms(true)
  }
  
  const handleTermsAccepted = async () => {
    console.log('✅ Terms accepted, proceeding with checkout:', { plan, appliedCoupon })
    
    setLoading(true)
    setError(null)
    
    try {
      // Create checkout session with coupon if applied
      const couponCode = appliedCoupon?.coupon?.code
      console.log('🛒 Initiating checkout with:', { plan, couponCode })
      
      try {
        await StripeService.redirectToCheckout(plan, undefined, couponCode)
        console.log('✅ Checkout redirect successful')
      } catch (err: any) {
        console.error('❌ Checkout error details:', err)
        
        // Parse error messages more carefully
        let errorMessage = 'Unknown checkout error'
        
        if (err instanceof Error) {
          errorMessage = err.message
        } else if (typeof err === 'string') {
          errorMessage = err
        } else if (err?.message) {
          errorMessage = err.message
        }
        
        // Check for specific error patterns
        if (errorMessage.includes('JSON')) {
          setError('Payment system error. Please try again or contact support.')
        } else if (errorMessage.includes('Invalid payment method')) {
          setError('Invalid payment method')
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          setError('Network error. Please check your connection and try again.')
        } else {
          setError(`Checkout failed: ${errorMessage}`)
        }
      }
    } catch (err) {
      console.error('❌ Outer checkout error:', err)
      setError(`Failed to initialize checkout: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
      setShowTerms(false)
    }
  }
  
  const handleTermsDeclined = () => {
    setShowTerms(false)
  }
  
  const handleCouponApplied = (validation: any) => {
    setAppliedCoupon(validation)
  }
  
  const handleCouponRemoved = () => {
    setAppliedCoupon(null)
  }

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 ${className}`}>
      {/* Plan Details */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {plan === 'monthly' ? 'Monthly Plan' : 
           plan === 'yearly' ? 'Annual Plan' :
           plan === 'enterprise' ? 'Enterprise Plan' :
           plan === 'pro' ? 'Pro Plan' : 'Plan'}
        </h3>
        <div className="flex items-center mb-4">
          <div className="text-3xl font-bold text-gray-900">
            ${displayPrice}
            <span className="text-sm text-gray-500 ml-1">
              /{plan === 'yearly' ? 'year' : 'month'}
            </span>
          </div>
          
          {appliedCoupon?.isValid && (
            <div className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              {CouponService.formatDiscount(appliedCoupon.coupon)}
            </div>
          )}
        </div>
        
        {appliedCoupon?.isValid && (
          <div className="text-sm text-gray-500 mb-4">
            <span className="line-through">${originalPrice}</span>
            {' → '}
            <span className="text-green-600 font-medium">${displayPrice}</span>
            {' '}
            <span>({CouponService.formatDiscount(appliedCoupon.coupon)})</span>
          </div>
        )}
        
        <div className="space-y-2 mb-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-gray-700">Full access to all trading features</p>
          </div>
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-gray-700">Advanced analytics and reporting</p>
          </div>
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-gray-700">Community integration features</p>
          </div>
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-gray-700">Priority support</p>
          </div>
        </div>
      </div>
      
      {/* Coupon Input */}
      <div className="mb-6">
        <CouponInput
          plan={plan}
          originalAmount={originalPrice}
          onCouponApplied={handleCouponApplied}
          onCouponRemoved={handleCouponRemoved}
          appliedCoupon={appliedCoupon}
        />
      </div>
      
      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Proceed to Checkout
          </>
        )}
      </button>
      
      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      {/* Secure Payment Notice */}
      <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
        <ShieldCheck className="h-4 w-4 mr-1 text-gray-400" />
        <span>Secure payment powered by Stripe</span>
      </div>
      
      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleTermsDeclined}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <TermsAgreement
                onAccept={handleTermsAccepted}
                onDecline={handleTermsDeclined}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StripeCheckout