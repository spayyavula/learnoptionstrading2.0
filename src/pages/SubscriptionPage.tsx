import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { 
  CheckCircle, 
  CreditCard, 
  Shield, 
  Tag, 
  AlertTriangle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import StripeCheckout from '../components/StripeCheckout'
import DealsSection from '../components/DealsSection'
import { StripeService } from '../services/stripeService'
import { CouponService } from '../services/couponService'
import { BASE_PRICES, YEARLY_SAVINGS_PERCENT, formatPrice, getPlanDetails } from '../utils/priceSync'

type PlanType = 'monthly' | 'yearly' | 'enterprise' | 'pro'

export default function SubscriptionPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get the plan from URL parameters, default to 'monthly' if not specified
  const getInitialPlan = (): PlanType => {
    const urlParams = new URLSearchParams(location.search)
    const planParam = urlParams.get('plan')
    
    // Validate that the plan parameter is one of our supported types
    if (planParam && ['monthly', 'yearly', 'enterprise', 'pro'].includes(planParam)) {
      return planParam as PlanType
    }
    
    return 'monthly' // Default fallback
  }
  
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(getInitialPlan())
  const [showDeals, setShowDeals] = useState(false)
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<any>(null)
  const [successDetails, setSuccessDetails] = useState<{plan?: string, coupon?: string, isDeal?: boolean}>({})
  
  useEffect(() => {
    // Update selected plan if URL changes
    const urlParams = new URLSearchParams(location.search)
    const planParam = urlParams.get('plan')
    
    if (planParam && ['monthly', 'yearly', 'enterprise', 'pro'].includes(planParam)) {
      setSelectedPlan(planParam as PlanType)
    }
    
    // Check for subscription success in URL
    if (urlParams.get('subscription') === 'success') {
      setSubscriptionSuccess(true)
      const details = {
        plan: urlParams.get('plan') || undefined,
        coupon: urlParams.get('coupon') || undefined,
        isDeal: urlParams.get('deal') === 'true'
      }
      setSuccessDetails(details)
      
      // Delay clearing the URL to ensure state is set
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname)
      }, 100)
    }
    
    // Check if there are active deals
    setShowDeals(CouponService.hasActiveDeals())
  }, [location])
  
  const handleSelectDeal = (deal: any) => {
    setSelectedDeal(deal)
    setSelectedPlan(deal.plan)
  }
  
  const handleClaimDeal = async (deal: any) => {
    try {
      // Redirect to checkout with the deal's coupon code
      await StripeService.redirectToCheckout(deal.plan, undefined, deal.couponCode, true)
    } catch (error) {
      console.error('Failed to claim deal:', error)
      alert('Failed to process deal. Please try again.')
    }
  }

  // Get plan details for the selected plan
  const planDetails = getPlanDetails(selectedPlan)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
        </div>
        
        {subscriptionSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg relative mb-6" role="alert">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="block sm:inline font-medium text-lg">
                {successDetails.isDeal ? 'Deal Claimed Successfully!' : 'Subscription Activated!'}
              </span>
            </div>
            <div className="ml-7">
              <p className="text-green-800 mb-2">
                {successDetails.isDeal 
                  ? `Congratulations! You've successfully claimed your special deal and subscribed to the ${successDetails.plan} plan.`
                  : 'Thank you for subscribing to Learn Options Trading Academy!'
                } Your account has been activated and you now have access to all premium features.
              </p>
              
              {successDetails.coupon && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
                  <div className="flex items-center text-sm">
                    <Tag className="h-4 w-4 mr-2 text-green-600" />
                    <span className="font-medium text-green-800">Deal Applied: {successDetails.coupon}</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    {successDetails.isDeal 
                      ? 'Your special deal discount has been applied to your subscription.'
                      : 'Your coupon discount has been applied to your subscription.'
                    }
                  </p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                <Link 
                  to="/app" 
                  className="inline-flex items-center text-sm bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  <ArrowRight className="mr-1 h-3 w-3" />
                  Start Trading Now
                </Link>
                <Link 
                  to="/app/settings" 
                  className="inline-flex items-center text-sm bg-green-100 text-green-800 px-4 py-2 rounded-md hover:bg-green-200 transition-colors border border-green-300"
                >
                  View Subscription Details
                </Link>
              </div>
            </div>
          </div>
        )}
        
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Subscription Plan</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Get full access to all features and take your trading skills to the next level
          </p>
        </div>
        
        {/* Plan Selection Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm">
            {[
              { id: 'monthly', label: 'Monthly', description: `$${BASE_PRICES.monthly}/month`, recommended: false },
              { id: 'yearly', label: 'Annual', description: `Save ${YEARLY_SAVINGS_PERCENT}%`, recommended: true },
              { id: 'pro', label: 'Pro', description: `$${BASE_PRICES.pro}/month`, recommended: false },
              { id: 'enterprise', label: 'Enterprise', description: `$${BASE_PRICES.enterprise}/month`, recommended: false }
            ].map((plan, index) => {
              const isSelected = selectedPlan === plan.id
              const isFirstButton = index === 0
              const isLastButton = index === 3
              
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => {
                    setSelectedPlan(plan.id as PlanType)
                  }}
                  className={`relative inline-flex flex-col items-center px-4 py-3 ${
                    isFirstButton ? 'rounded-l-md' : ''
                  } ${
                    isLastButton ? 'rounded-r-md' : ''
                  } border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 z-10'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  } ${!isFirstButton ? '-ml-px' : ''}`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Recommended
                      </span>
                    </div>
                  )}
                  <span className="font-medium">{plan.label}</span>
                  <span className={`text-xs ${
                    isSelected ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {plan.description}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <StripeCheckout 
              plan={selectedPlan}
              onSuccess={() => setSubscriptionSuccess(true)}
            />
          </div>
          
          {/* Plan Features */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {planDetails.name} Features
            </h3>
            
            <div className="space-y-4">
              {planDetails.features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">{feature}</h4>
                    <p className="text-sm text-gray-600">
                      {(() => {
                        const descriptions = {
                          0: 'Access all trading features, including options trading, portfolio management, and advanced analytics',
                          1: 'Get detailed insights into your trading performance and portfolio allocation',
                          2: 'Share trades and insights with the community across multiple platforms',
                          3: 'Get help when you need it with our responsive support team',
                          4: 'Access exclusive educational content to improve your trading skills',
                          5: selectedPlan === 'enterprise' 
                            ? 'Get personalized assistance from our dedicated team'
                            : selectedPlan === 'pro'
                            ? 'Advanced features and priority access to new tools'
                            : 'Get personalized assistance from our dedicated team',
                          6: selectedPlan === 'enterprise' 
                            ? 'Custom branding and white-label options for your organization'
                            : 'Dedicated account manager for premium support'
                        }
                        return descriptions[index as keyof typeof descriptions] || ''
                      })()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-800">Satisfaction Guarantee</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Not satisfied? Contact us within 14 days for a full refund, no questions asked.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Special Deals Section */}
        {showDeals && (
          <div className="mt-12">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Tag className="h-6 w-6 text-red-500 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Special Offers
                </h2>
              </div>
              <p className="text-lg text-gray-600">
                Limited time deals to help you save on your subscription
              </p>
            </div>
            
            <DealsSection 
              onSelectDeal={handleSelectDeal}
              onClaimDeal={handleClaimDeal}
              selectedPlan={selectedPlan}
              className="max-w-4xl mx-auto"
            />
          </div>
        )}
        
        {/* Disclaimer */}
        <div className="mt-12 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-4xl mx-auto">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-800">Important Information</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Options World is for educational purposes only. Our platform is designed to help you learn and develop trading skills, not to provide financial advice. Options trading involves significant risk and requires proper education.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}