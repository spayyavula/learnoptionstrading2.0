import React from 'react'
import { 
  TrendingUp, 
  BookOpen, 
  Users, 
  Info,
  Shield, 
  CheckCircle, 
  Bot,
  Star,
  Play,
  ArrowRight,
  DollarSign,
  BarChart3,
  Target,
  Award,
  Coffee,
  Mail,
  Tag,
  CreditCard
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { ConstantContactService } from '../services/constantContactService'
import { StripeService } from '../services/stripeService'
import { BASE_PRICES } from '../utils/priceSync'
import { useState, useEffect, useRef } from 'react'
import Disclaimer from '../components/Disclaimer'
import { BuyMeCoffeeService } from '../services/buyMeCoffeeService'
import { YEARLY_SAVINGS_PERCENT, formatPrice } from '../utils/priceSync'
import { CouponService } from '../services/couponService'
import DealsSection from '../components/DealsSection'
import CouponInput from '../components/CouponInput'
import TermsAgreement from '../components/TermsAgreement'

export default function Landing() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('spayyavula@gmail.com')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailMessage, setEmailMessage] = useState('')
  const [selectedDeal, setSelectedDeal] = useState<any>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [showDeals, setShowDeals] = useState(false)
  const [testResults, setTestResults] = useState<string | null>(null)
  const [testError, setTestError] = useState<string | null>(null)
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [pendingSubscription, setPendingSubscription] = useState<{plan: 'monthly' | 'yearly' | 'pro' | 'enterprise', couponCode?: string} | null>(null)
  const errorLogRef = useRef<HTMLDivElement>(null)

  // Initialize coupon system
  React.useEffect(() => {
    // Force refresh coupon data in development to get latest test coupons
    if (import.meta.env.DEV) {
      CouponService.refreshDefaultData()
      // Debug: Log available coupons
      console.log('Available coupons:', CouponService.getCoupons().map(c => ({ code: c.code, description: c.description })))
    } else {
      CouponService.initializeDefaultData()
    }
    setShowDeals(CouponService.hasActiveDeals())
    
    // Check for subscription success in URL
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('subscription') === 'success') {
      setSubscriptionSuccess(true)
      // Remove the query parameters from the URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const handleSubscribe = async (plan: 'monthly' | 'yearly' | 'pro' | 'enterprise') => {
    console.log('🚀 Subscribe button clicked for plan:', plan)
    
    // Show terms agreement before proceeding
    setPendingSubscription({ 
      plan, 
      couponCode: selectedDeal?.couponCode || (appliedCoupon?.coupon?.code)
    })
    setShowTermsModal(true)
  }

  const handleTermsAccepted = async () => {
    if (!pendingSubscription) return
    
    try {
      // Apply coupon if selected deal or manual coupon
      const { plan, couponCode } = pendingSubscription

      console.log('🚀 Starting checkout process with:', { plan, couponCode })
      await StripeService.redirectToCheckout(plan, undefined, couponCode)
    } catch (error) {
      console.error('❌ Failed to create checkout session:', error)
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Checkout Error\n\n${errorMessage}\n\nPlease try again or contact support if the problem persists.`)
    } finally {
      setShowTermsModal(false)
      setPendingSubscription(null)
    }
  }

  const handleTermsDeclined = () => {
    setShowTermsModal(false)
    setPendingSubscription(null)
  }

  const runSubscriptionTests = async () => {
    console.log('🧪 Starting subscription tests...')
    setIsRunningTests(true)
    setTestResults(null)
    setTestError(null)
    
    try {
      // Run the subscription tests
      const response = await fetch('/api/run-subscription-tests', {
        method: 'POST',
      });
      
      console.log('📡 Test API response status:', response.status)
      console.log('📡 Test API response headers:', response.headers.get('content-type'))
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText)
        throw new Error(`Failed to run tests: ${errorText}`);
      }
      
      // Check if response has content
      const responseText = await response.text();
      console.log('📝 Raw response text:', responseText)
      
      if (!responseText.trim()) {
        throw new Error('Empty response from test API');
      }
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError)
        console.error('❌ Response text that failed to parse:', responseText)
        throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
      }
      
      setTestResults(JSON.stringify(result, null, 2));
      console.log('✅ Subscription test results:', result);
    } catch (error) {
      console.error('❌ Error running subscription tests:', error);
      setTestError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsRunningTests(false);
    }
  };

  const runE2ETests = async () => {
    console.log('🧪 Starting E2E tests...')
    setIsRunningTests(true)
    setTestResults(null)
    setTestError(null)
    
    try {
      // Run the E2E tests
      const response = await fetch('/api/run-e2e-tests', {
        method: 'POST',
      });
      
      console.log('📡 E2E API response status:', response.status)
      console.log('📡 E2E API response headers:', response.headers.get('content-type'))
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ E2E API error response:', errorText)
        throw new Error(`Failed to run tests: ${errorText}`);
      }
      
      // Check if response has content
      const responseText = await response.text();
      console.log('📝 E2E Raw response text:', responseText)
      
      if (!responseText.trim()) {
        throw new Error('Empty response from E2E test API');
      }
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ E2E JSON parse error:', parseError)
        console.error('❌ E2E Response text that failed to parse:', responseText)
        throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
      }
      
      setTestResults(JSON.stringify(result, null, 2));
      console.log('✅ E2E test results:', result);
    } catch (error) {
      console.error('❌ Error running E2E tests:', error);
      setTestError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setEmailMessage('')
    
    try {
      const result = await ConstantContactService.subscribeEmail(email)
      setIsSubscribed(result.success)
      setEmailMessage(result.message)
      
      // Debug logging in development
      if (import.meta.env.DEV) {
        console.log('Email subscription result:', result)
      }
    } catch (error) {
      console.error('Failed to subscribe:', error)
      setEmailMessage('Failed to subscribe. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleDonate = async (amount: number) => {
    console.log('handleDonate called with amount:', amount)
    
    try {
      if (import.meta.env.DEV) {
        console.log('In development mode, showing mock donation dialog')
        
        // Enhanced mock donation for development
        const confirmed = window.confirm(`Mock Donation\n\nAmount: $${amount}\nService: Buy Me a Coffee\n\nProceed with mock donation?`)
        console.log('User confirmed:', confirmed)
        
        if (confirmed) {
          // Store mock donation
          const mockDonation = {
            id: `coffee_mock_${Date.now()}`,
            amount: amount,
            currency: 'USD',
            status: 'completed',
            created: new Date().toISOString(),
            message: `Thanks for the $${amount} coffee! ☕`
          }
          
          console.log('Created mock donation:', mockDonation)
          
          try {
            const existingDonations = JSON.parse(localStorage.getItem('mock_coffee_payments') || '[]')
            const updatedDonations = [...existingDonations, mockDonation]
            localStorage.setItem('mock_coffee_payments', JSON.stringify(updatedDonations))
            
            console.log('Stored donations:', updatedDonations)
          } catch (parseError) {
            console.error('❌ Error parsing donation data, resetting:', parseError)
            // Reset corrupted data
            localStorage.setItem('mock_coffee_payments', JSON.stringify([mockDonation]))
          }
          
          window.alert(`Thank you for the $${amount} donation! ☕ (Development Mode)\n\nYour support means a lot to us!`)
          console.log('Mock donation process completed successfully')
        }
      } else {
        console.log('In production mode, calling BuyMeCoffeeService')
        await BuyMeCoffeeService.openBuyMeCoffeePage(`Thank you for supporting us with $${amount}!`)
      }
    } catch (error) {
      console.error('Failed to process donation:', error)
      window.alert('Sorry, there was an error processing your donation. Please try again.')
    }
  }

  const handleSelectDeal = (deal: any) => {
    setSelectedDeal(deal)
    setAppliedCoupon(null) // Clear manual coupon if deal is selected
  }

  const handleClaimDeal = async (deal: any) => {
    try {
      await handleSubscribe(deal.plan)
    } catch (error) {
      console.error('Failed to claim deal:', error)
      alert('Failed to process deal. Please try again.')
    }
  }

  const handleCouponApplied = (validation: any) => {
    setAppliedCoupon(validation)
    setSelectedDeal(null) // Clear deal if manual coupon is applied
  }

  const handleCouponRemoved = () => {
    setAppliedCoupon(null)
  }

  const getDiscountPrice = (plan: 'monthly' | 'yearly' | 'pro' | 'enterprise', originalPrice: number) => {
    if (selectedDeal && selectedDeal.plan === plan) {
      return selectedDeal.discountedPrice
    }
    if (appliedCoupon && appliedCoupon.isValid && appliedCoupon.coupon) {
      // Recalculate discount for this specific plan and price
      const validation = CouponService.validateCoupon(
        appliedCoupon.coupon.code,
        plan,
        originalPrice,
        true
      )
      return validation.isValid ? validation.finalAmount : originalPrice
    }
    return originalPrice
  }

  const getDiscountInfo = (plan: 'monthly' | 'yearly' | 'pro' | 'enterprise') => {
    if (selectedDeal && selectedDeal.plan === plan) {
      return {
        hasDiscount: selectedDeal.discountPercentage > 0,
        discountText: `${selectedDeal.discountPercentage}% OFF`,
        savings: selectedDeal.originalPrice - selectedDeal.discountedPrice
      }
    }
    if (appliedCoupon && appliedCoupon.isValid && appliedCoupon.coupon) {
      // Recalculate discount info for this specific plan
      const originalPrice = plan === 'monthly' ? BASE_PRICES.monthly :
                           plan === 'yearly' ? BASE_PRICES.yearly :
                           plan === 'pro' ? BASE_PRICES.pro : BASE_PRICES.enterprise
      
      const validation = CouponService.validateCoupon(
        appliedCoupon.coupon.code,
        plan,
        originalPrice,
        true
      )
      
      if (validation.isValid) {
        return {
          hasDiscount: true,
          discountText: CouponService.formatDiscount(appliedCoupon.coupon),
          savings: validation.discountAmount
        }
      }
    }
    return { hasDiscount: false }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      {/* Development Mode Banner */}
      {import.meta.env.DEV && (
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 px-4 text-center relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center space-x-2">
              <div className="flex items-center space-x-1">
                <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
                <span className="font-bold">🧪 DEVELOPMENT MODE</span>
                <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
              </div>
            </div>
            <p className="text-sm mt-1 opacity-90">
              All features are mocked and simulated for testing purposes. No real payments, emails, or data will be processed.
            </p>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <header className="relative overflow-hidden" id="home">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          {subscriptionSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
              <strong className="font-bold">Success! </strong>
              <span className="block sm:inline">Thank you for subscribing to Options World! Your account has been activated.</span>
            </div>
          )}
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Learn Options Trading Academy
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-6 max-w-3xl mx-auto">
              Advanced analytics, real-time data, and AI-powered insights to develop your options trading expertise
            </p>
            {import.meta.env.DEV && (
              <div className="max-w-2xl mx-auto mb-6 p-3 bg-cyan-900/30 border border-cyan-500/50 rounded-lg">
                <p className="text-sm text-cyan-300">
                  🧪 <strong>Dev Mode:</strong> Navigation buttons below lead to demo/pricing pages. Some routes may be under construction.
                </p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/pricing" 
                onClick={() => console.log('View Pricing clicked - navigating to /pricing')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center"
              >
                <Play className="mr-2 h-5 w-5" />
                View Pricing
                {import.meta.env.DEV && <span className="ml-2 text-xs opacity-75">(Mock)</span>}
              </Link>
              <Link 
                to="/demo" 
                onClick={() => console.log('View Demo clicked - navigating to /demo')}
                className="border border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center"
              >
                <Info className="mr-2 h-5 w-5" />
                View Demo
                {import.meta.env.DEV && <span className="ml-2 text-xs opacity-75">(Mock)</span>}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-gray-900" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to Learn
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Professional-grade tools and insights that help you develop trading expertise
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-750 transition-colors">
              <TrendingUp className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Real-Time Analytics</h3>
              <p className="text-gray-400">
                Learn technical analysis with advanced charting tools and real-time market data
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-750 transition-colors">
              <Target className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Strategy Builder</h3>
              <p className="text-gray-400">
                Learn to create and test complex options strategies with our intuitive builder
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-750 transition-colors">
              <Shield className="h-12 w-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Risk Management</h3>
              <p className="text-gray-400">
                Master risk analysis and portfolio protection techniques
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-750 transition-colors">
              <BarChart3 className="h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Performance Tracking</h3>
              <p className="text-gray-400">
                Track your learning progress with detailed performance analytics
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-750 transition-colors">
              <BookOpen className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Educational Resources</h3>
              <p className="text-gray-400">
                Comprehensive learning materials designed for traders at all levels
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-750 transition-colors">
              <Users className="h-12 w-12 text-indigo-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Community</h3>
              <p className="text-gray-400">
                Learn from other traders and share your trading journey
              </p>
            </div>
            
            <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-750 transition-colors">
              <Bot className="h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Agent API</h3>
              <p className="text-gray-400">
                Explore automated trading concepts with our educational API
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Special Deals Section */}
      {showDeals && (
        <section className="py-20 bg-gray-800" id="deals">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center mb-4">
                <Tag className="h-8 w-8 text-red-500 mr-3" />
                <h2 className="text-4xl font-bold text-white">
                  Limited Time Deals
                </h2>
              </div>
              <p className="text-xl text-gray-400">
                Don't miss out on these exclusive offers
              </p>
            </div>

            <DealsSection 
              onSelectDeal={handleSelectDeal}
              onClaimDeal={handleClaimDeal}
              className="max-w-4xl mx-auto"
            />
          </div>
        </section>
      )}

      {/* Pricing Section */}
      <section className="py-20 bg-gray-800" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-400 mb-2">
              Start free, upgrade when you're ready to deepen your knowledge
            </p>
            <p className="text-sm text-blue-400 mb-2">
              💰 Use coupon codes below for instant savings on any plan
            </p>
            {import.meta.env.DEV && (
              <div className="max-w-2xl mx-auto mt-4 p-3 bg-blue-900/30 border border-blue-500/50 rounded-lg">
                <p className="text-xs text-blue-300">
                  🧪 <strong>Dev Mode:</strong> All checkout processes are simulated. Click any plan to test the subscription flow without real payments.
                </p>
              </div>
            )}
          </div>

          {/* Coupon Input */}
          <div className="max-w-md mx-auto mb-8">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Have a Coupon Code?</h3>
              <p className="text-sm text-gray-400 mb-3">
                Enter your coupon code below to get instant savings
              </p>
              {/* Temporary debug button for development */}
              {import.meta.env.DEV && (
                <div className="mb-3 p-2 bg-green-900/30 border border-green-500/50 rounded">
                  <p className="text-xs text-green-300 mb-2">
                    🧪 <strong>Testing Mode:</strong> Coupon system is fully functional with mock data
                  </p>
                  <button 
                    onClick={() => {
                      CouponService.clearData()
                      CouponService.refreshDefaultData()
                      window.location.reload()
                    }}
                    className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
                    🔄 Reset Coupons
                  </button>
                </div>
              )}
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer hover:text-gray-300 transition-colors">
                  💡 Click here to see test coupon codes
                </summary>
                <div className="mt-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="text-left space-y-1">
                    <div><code className="bg-gray-700 px-2 py-1 rounded">TEST10</code> - 10% off any plan</div>
                    <div><code className="bg-gray-700 px-2 py-1 rounded">DEMO20</code> - 20% off any plan</div>
                    <div><code className="bg-gray-700 px-2 py-1 rounded">WELCOME50</code> - 50% off monthly (first-time)</div>
                    <div><code className="bg-gray-700 px-2 py-1 rounded">STUDENT</code> - 30% off any plan</div>
                  </div>
                </div>
              </details>
            </div>
            <CouponInput
              plan="monthly"
              originalAmount={29}
              onCouponApplied={handleCouponApplied}
              onCouponRemoved={handleCouponRemoved}
              appliedCoupon={appliedCoupon}
            />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Monthly Plan */}
            <div className="bg-gray-900 p-8 rounded-xl border border-gray-700">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Monthly</h3>
                {getDiscountInfo('monthly').hasDiscount && (
                  <div className="mb-2">
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                      {getDiscountInfo('monthly').discountText}
                    </span>
                  </div>
                )}
                <div className="text-4xl font-bold text-white mb-2">
                  <span className="text-2xl">$</span>{getDiscountPrice('monthly', BASE_PRICES.monthly)}
                  <span className="text-lg text-gray-400">/month</span>
                </div>
                {getDiscountInfo('monthly').hasDiscount && (
                  <div className="text-sm text-gray-400 line-through mb-2">
                    Was ${BASE_PRICES.monthly}/month
                  </div>
                )}
                <p className="text-gray-400">Perfect for learning the basics</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Educational market data
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Basic learning modules
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  5 practice portfolios
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Learning support
                </li>
              </ul>

              <button 
                onClick={() => {
                  console.log('Get Started button clicked - navigating to /subscribe?plan=monthly')
                  navigate('/subscribe?plan=monthly')
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Get Started
                {import.meta.env.DEV && <span className="ml-2 text-xs opacity-75">(Mock)</span>}
              </button>
              {getDiscountInfo('monthly').hasDiscount && (
                <p className="text-center text-green-400 text-sm mt-2">
                  Save ${getDiscountInfo('monthly').savings} with this deal!
                </p>
              )}
            </div>

            {/* Annual Plan */}
            <div className="bg-gray-900 p-8 rounded-xl border-2 border-green-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Best Value
                </span>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Annual</h3>
                {getDiscountInfo('yearly').hasDiscount && (
                  <div className="mb-2">
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                      {getDiscountInfo('yearly').discountText}
                    </span>
                  </div>
                )}
                {!getDiscountInfo('yearly').hasDiscount && (
                  <div className="mb-2">
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-sm font-bold">
                      Save {YEARLY_SAVINGS_PERCENT}%
                    </span>
                  </div>
                )}
                <div className="text-4xl font-bold text-white mb-2">
                  <span className="text-2xl">$</span>{Math.round(getDiscountPrice('yearly', BASE_PRICES.yearly) / 12)}
                  <span className="text-lg text-gray-400">/month</span>
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  Billed annually at ${getDiscountPrice('yearly', BASE_PRICES.yearly)}
                </div>
                {!getDiscountInfo('yearly').hasDiscount && (
                  <div className="text-sm text-gray-400 line-through mb-2">
                    Was ${BASE_PRICES.monthly}/month
                  </div>
                )}
                {getDiscountInfo('yearly').hasDiscount && (
                  <div className="text-sm text-gray-400 line-through mb-2">
                    Was ${BASE_PRICES.yearly}/year
                  </div>
                )}
                <p className="text-gray-400">Everything in Monthly + savings</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Everything in Monthly
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  2 months free
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Priority support
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Early access to features
                </li>
              </ul>

              <button 
                onClick={() => navigate('/subscribe?plan=yearly')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Save with Annual
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-gray-900 p-8 rounded-xl border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                {getDiscountInfo('pro').hasDiscount && (
                  <div className="mb-2">
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                      {getDiscountInfo('pro').discountText}
                    </span>
                  </div>
                )}
                <div className="text-4xl font-bold text-white mb-2">
                  <span className="text-2xl">$</span>{getDiscountPrice('pro', BASE_PRICES.pro)}
                  <span className="text-lg text-gray-400">/month</span>
                </div>
                {getDiscountInfo('pro').hasDiscount && (
                  <div className="text-sm text-gray-400 line-through mb-2">
                    Was ${BASE_PRICES.pro}/month
                  </div>
                )}
                <p className="text-gray-400">For dedicated learners</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Everything in Monthly
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Advanced learning modules
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Unlimited practice portfolios
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Strategy learning tools
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Priority learning support
                </li>
              </ul>

              <button 
                onClick={() => navigate('/subscribe?plan=pro')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Upgrade to Pro
              </button>
              {getDiscountInfo('pro').hasDiscount && (
                <p className="text-center text-green-400 text-sm mt-2">
                  Save ${getDiscountInfo('pro').savings} with this deal!
                </p>
              )}
            </div>

            {/* Enterprise Plan */}
            <div className="bg-gray-900 p-8 rounded-xl border border-gray-700">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                {getDiscountInfo('enterprise').hasDiscount && (
                  <div className="mb-2">
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                      {getDiscountInfo('enterprise').discountText}
                    </span>
                  </div>
                )}
                <div className="text-4xl font-bold text-white mb-2">
                  <span className="text-2xl">$</span>{getDiscountPrice('enterprise', BASE_PRICES.enterprise)}
                  <span className="text-lg text-gray-400">/month</span>
                </div>
                {getDiscountInfo('enterprise').hasDiscount && (
                  <div className="text-sm text-gray-400 line-through mb-2">
                    Was ${BASE_PRICES.enterprise}/month
                  </div>
                )}
                <p className="text-gray-400">For educational institutions</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Everything in Pro
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Custom learning paths
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Dedicated instructor support
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Educational white-label options
                </li>
              </ul>

              <button 
                onClick={() => navigate('/subscribe?plan=enterprise')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Contact Sales
              </button>
              {getDiscountInfo('enterprise').hasDiscount && (
                <p className="text-center text-green-400 text-sm mt-2">
                  Save ${getDiscountInfo('enterprise').savings} with this deal!
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gray-900" id="newsletter">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Mail className="h-16 w-16 text-blue-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Get the latest market insights and trading tips delivered to your inbox
          </p>
          {import.meta.env.DEV && (
            <div className="max-w-md mx-auto mb-6 p-3 bg-purple-900/30 border border-purple-500/50 rounded-lg">
              <p className="text-xs text-purple-300">
                🧪 <strong>Dev Mode:</strong> Email subscription is simulated. No actual emails will be sent.
              </p>
            </div>
          )}

          {!isSubscribed ? (
            <>
              <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
              {emailMessage && !isSubscribed && (
                <div className="mt-4 text-red-400 text-sm">
                  {emailMessage}
                </div>
              )}
            </>
          ) : (
            <div className="text-green-400 text-lg">
              <CheckCircle className="h-6 w-6 inline mr-2" />
              {emailMessage || 'Thanks for subscribing!'}
              {import.meta.env.DEV && (
                <div className="text-xs text-gray-500 mt-2">
                  (Development mode - no actual email sent)
                  <br />
                  <button 
                    onClick={() => {
                      setIsSubscribed(false)
                      setEmailMessage('')
                      try {
                        const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]')
                        console.log('Stored subscribers:', subscribers)
                      } catch (parseError) {
                        console.error('❌ Error parsing subscriber data:', parseError)
                        localStorage.removeItem('newsletter_subscribers')
                      }
                    }}
                    className="mt-2 text-xs bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded"
                  >
                    Reset & View Subscribers
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Test Buttons Section */}
      <section className="py-12 bg-gray-800" id="testing">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Testing Tools
          </h2>
          <p className="text-xl text-gray-400 mb-4">
            Run subscription and E2E tests to verify functionality
          </p>
          {import.meta.env.DEV && (
            <div className="max-w-2xl mx-auto mb-6 p-4 bg-indigo-900/30 border border-indigo-500/50 rounded-lg">
              <p className="text-sm text-indigo-300">
                🧪 <strong>Development Testing Suite:</strong> All tests run against mock services and simulated data. 
                Perfect for verifying application functionality without affecting real systems.
              </p>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={runSubscriptionTests}
              disabled={isRunningTests}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunningTests ? 'Running Tests...' : 'Run Subscription Tests'}
            </button>
            <button
              onClick={runE2ETests}
              disabled={isRunningTests}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunningTests ? 'Running Tests...' : 'Run E2E Tests'}
            </button>
            <button
              onClick={async () => {
                try {
                  console.log('🧪 Testing customer portal...')
                  const { testCustomerPortal } = await import('../utils/testCustomerPortal')
                  const result = await testCustomerPortal()
                  if (result.success) {
                    alert(`✅ Customer Portal Test Successful!\n\nPortal URL: ${result.portalUrl}\nCustomer ID: ${result.subscription.customer_id}`)
                  } else {
                    alert(`❌ Customer Portal Test Failed:\n${result.error}`)
                  }
                } catch (error) {
                  console.error('Portal test error:', error)
                  alert('Failed to run portal test')
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Test Customer Portal
            </button>
            <button
              onClick={async () => {
                try {
                  console.log('🧪 Testing checkout flow directly...')
                  const { StripeService } = await import('../services/stripeService')
                  await StripeService.redirectToCheckout('monthly', undefined, undefined, false)
                  console.log('✅ Checkout flow completed successfully')
                } catch (error) {
                  console.error('❌ Checkout test failed:', error)
                  alert(`❌ Checkout Test Failed:\n${error instanceof Error ? error.message : 'Unknown error'}`)
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Test Direct Checkout
            </button>
          </div>

          {testResults && (
            <div className="bg-gray-900 p-4 rounded-lg text-left overflow-auto max-h-96 mb-6">
              <h3 className="text-lg font-semibold text-green-400 mb-2">Test Results:</h3>
              <pre className="text-green-300 text-sm whitespace-pre-wrap">{testResults}</pre>
            </div>
          )}

          {testError && (
            <div className="bg-gray-900 p-4 rounded-lg text-left overflow-auto max-h-96 mb-6" ref={errorLogRef}>
              <h3 className="text-lg font-semibold text-red-400 mb-2">Test Error:</h3>
              <pre className="text-red-300 text-sm whitespace-pre-wrap">{testError}</pre>
            </div>
          )}
        </div>
      </section>

      {/* Support Section */}
      <section className="py-20 bg-gray-800" id="support">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Coffee className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Support Our Work
          </h2>
          <p className="text-xl text-gray-400 mb-4">
            Help us continue building amazing trading tools
          </p>
          {import.meta.env.DEV && (
            <div className="max-w-2xl mx-auto mb-6 p-3 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
              <p className="text-sm text-yellow-300">
                🧪 <strong>Dev Mode:</strong> Donation buttons are fully functional with mock processing. 
                Test the user experience without real payments.
              </p>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                console.log('$5 button clicked')
                handleDonate(5)
              }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center hover:transform hover:scale-105"
            >
              <Coffee className="mr-2 h-5 w-5" />
              Buy us a coffee - $5
              {import.meta.env.DEV && <span className="ml-2 text-xs opacity-75">(Mock)</span>}
            </button>
            <button
              onClick={() => {
                console.log('$10 button clicked')
                handleDonate(10)
              }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center hover:transform hover:scale-105"
            >
              <Coffee className="mr-2 h-5 w-5" />
              Support us - $10
              {import.meta.env.DEV && <span className="ml-2 text-xs opacity-75">(Mock)</span>}
            </button>
            <button
              onClick={() => {
                console.log('$25 button clicked')
                handleDonate(25)
              }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center hover:transform hover:scale-105"
            >
              <Award className="mr-2 h-5 w-5" />
              Sponsor us - $25
              {import.meta.env.DEV && <span className="ml-2 text-xs opacity-75">(Mock)</span>}
            </button>
          </div>
          
          {import.meta.env.DEV && (
            <div className="mt-6 space-y-2">
              <button
                onClick={() => {
                  console.log('Test button clicked')
                  window.alert('Test button is working!')
                }}
                className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded mr-2"
              >
                Test Alert (Debug)
              </button>
              <button
                onClick={() => {
                  try {
                    const donations = JSON.parse(localStorage.getItem('mock_coffee_payments') || '[]')
                    if (donations.length > 0) {
                      console.log('All mock donations:', donations)
                      const total = donations.reduce((sum: number, d: any) => sum + d.amount, 0)
                      window.alert(`Mock Donations Summary:\n\nTotal Donations: ${donations.length}\nTotal Amount: $${total}\n\nCheck console for details.`)
                    } else {
                      window.alert('No mock donations yet. Try clicking a donation button!')
                    }
                  } catch (parseError) {
                    console.error('❌ Error parsing donation data:', parseError)
                    window.alert('Error reading donation data. Resetting...')
                    localStorage.removeItem('mock_coffee_payments')
                  }
                }}
                className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
              >
                View Mock Donations
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12" id="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Learn Options Trading Academy</h3>
              <p className="text-gray-400">
                Professional options trading platform for serious traders
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/app" onClick={() => console.log('Features clicked')} className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/app/trading" onClick={() => console.log('Trading Platform clicked')} className="hover:text-white transition-colors">Trading Platform</Link></li>
                <li><Link to="/app/learning" onClick={() => console.log('Learning Resources clicked')} className="hover:text-white transition-colors">Learning Resources</Link></li>
                <li><Link to="/app/strategies" onClick={() => console.log('Strategy Library clicked')} className="hover:text-white transition-colors">Strategy Library</Link></li>
                <li><Link to="/agent" onClick={() => console.log('Agent API clicked')} className="hover:text-white transition-colors">Agent API</Link></li>
                <li><Link to="/testing" onClick={() => console.log('Testing Tools clicked')} className="hover:text-white transition-colors">Testing Tools</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/construction" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/construction" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/construction" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/construction" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/app/community" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link to="/construction" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/construction" className="hover:text-white transition-colors">Status</Link></li>
                <li><Link to="/construction" className="hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            {import.meta.env.DEV && (
              <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg max-w-4xl mx-auto">
                <p className="text-yellow-300 text-sm">
                  🧪 <strong>Development Environment Active</strong> - All features are running in simulation mode for testing and development purposes.
                </p>
              </div>
            )}
            <p>&copy; {new Date().getFullYear()} Learn Options Trading Academy. All rights reserved.</p>
            <p className="mt-2 text-sm">
              <strong>Risk Disclaimer:</strong> Options trading involves substantial risk and is not suitable for all investors. 
              You may lose all of your invested capital. Past performance is not indicative of future results.
            </p>
            <div className="flex justify-center space-x-4 mt-4">
              <a href="#home" className="text-gray-500 hover:text-white transition-colors">Home</a>
              <a href="#features" className="text-gray-500 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-gray-500 hover:text-white transition-colors">Pricing</a>
              <a href="#testing" className="text-gray-500 hover:text-white transition-colors">Testing</a>
              <a href="#support" className="text-gray-500 hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={handleTermsDeclined} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <TermsAgreement 
                  onAccept={handleTermsAccepted}
                  onDecline={handleTermsDeclined}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}