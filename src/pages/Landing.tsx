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
import { useState, useEffect, useRef } from 'react'
import Disclaimer from '../components/Disclaimer'
import { BuyMeCoffeeService } from '../services/buyMeCoffeeService'
import { CouponService } from '../services/couponService'
import DealsSection from '../components/DealsSection'
import CouponInput from '../components/CouponInput'
import TermsAgreement from '../components/TermsAgreement'
import { BASE_PRICES, YEARLY_SAVINGS_PERCENT, formatPrice } from '../utils/priceSync'

export default function Landing() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('spayyavula@gmail.com')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<any>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [showDeals, setShowDeals] = useState(false)
  const [testResults, setTestResults] = useState<string | null>(null)
  const [testError, setTestError] = useState<string | null>(null)
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [pendingSubscription, setPendingSubscription] = useState<{plan: 'monthly' | 'yearly', couponCode?: string} | null>(null)
  const errorLogRef = useRef<HTMLDivElement>(null)

  // Initialize coupon system
  React.useEffect(() => {
    CouponService.initializeDefaultData()
    setShowDeals(CouponService.hasActiveDeals())
    
    // Check for subscription success in URL
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('subscription') === 'success') {
      setSubscriptionSuccess(true)
      // Remove the query parameters from the URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
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

      const { url } = await StripeService.createCheckoutSession(plan, couponCode)
      window.location.href = url
    } catch (error) {
      console.error('Failed to create checkout session:', error)
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
    setIsRunningTests(true)
    setTestResults(null)
    setTestError(null)
    
    try {
      // Run the subscription tests
      const response = await fetch('/api/run-subscription-tests', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to run tests: ${errorText}`);
      }
      
      const result = await response.json();
      setTestResults(JSON.stringify(result, null, 2));
      console.log('Subscription test results:', result);
    } catch (error) {
      console.error('Error running subscription tests:', error);
      setTestError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsRunningTests(false);
    }
  };

  const runE2ETests = async () => {
    setIsRunningTests(true)
    setTestResults(null)
    setTestError(null)
    
    try {
      // Run the E2E tests
      const response = await fetch('/api/run-e2e-tests', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to run tests: ${errorText}`);
      }
      
      const result = await response.json();
      setTestResults(JSON.stringify(result, null, 2));
      console.log('E2E test results:', result);
    } catch (error) {
      console.error('Error running E2E tests:', error);
      setTestError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await ConstantContactService.subscribeEmail(email)
      setIsSubscribed(true)
    } catch (error) {
      console.error('Failed to subscribe:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDonate = async (amount: number) => {
    try {
      await BuyMeCoffeeService.openBuyMeCoffeePage()
    } catch (error) {
      console.error('Failed to create donation:', error)
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

  const getDiscountedPrice = (originalPrice: number, plan: 'monthly' | 'yearly') => {
    if (selectedDeal && selectedDeal.plan === plan) {
      return selectedDeal.discountedPrice
    }
    if (appliedCoupon && appliedCoupon.isValid && typeof appliedCoupon.finalAmount === 'number') {
      return appliedCoupon.finalAmount
    }
    return originalPrice
  }

  const getDiscountInfo = (plan: 'monthly' | 'yearly') => {
    if (selectedDeal && selectedDeal.plan === plan) {
      return {
        hasDiscount: selectedDeal.discountPercentage > 0,
        discountText: `${selectedDeal.discountPercentage}% OFF`,
        savings: selectedDeal.originalPrice - selectedDeal.discountedPrice
      }
    }
    if (appliedCoupon && appliedCoupon.isValid && typeof appliedCoupon.discountAmount === 'number' && appliedCoupon.discountAmount > 0) {
      return {
        hasDiscount: true,
        discountText: CouponService.formatDiscount(appliedCoupon.coupon),
        savings: appliedCoupon.discountAmount
      }
    }
    return { hasDiscount: false }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
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
              Learn to Be an Expert Trader
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Advanced analytics, real-time data, and AI-powered insights to develop your options trading expertise
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/app" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Trading Now
              </Link>
              <Link 
                to="/demo" 
                className="border border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center"
              >
                <Info className="mr-2 h-5 w-5" />
                View Demo
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
            <p className="text-xl text-gray-400">
              Start free, upgrade when you're ready to deepen your knowledge
            </p>
          </div>

          {/* Coupon Input */}
          <div className="max-w-md mx-auto mb-8">
            <CouponInput
              plan="monthly"
              originalAmount={29}
              onCouponApplied={handleCouponApplied}
              onCouponRemoved={handleCouponRemoved}
              appliedCoupon={appliedCoupon}
            />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <div className="bg-gray-900 p-8 rounded-xl border border-gray-700">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Basic</h3>
                <div className="text-4xl font-bold text-white mb-2">
                  <span className="text-2xl">$</span>{BASE_PRICES.monthly}
                  <span className="text-lg text-gray-400">/month</span>
                </div>
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
                onClick={() => navigate('/subscribe')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Get Started
              </button>
              {getDiscountInfo('monthly').hasDiscount && (
                <p className="text-center text-green-400 text-sm mt-2">
                  Save ${getDiscountInfo('monthly').savings} with this deal!
                </p>
              )}
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
                {getDiscountInfo('yearly').hasDiscount && (
                  <div className="mb-2">
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                      {getDiscountInfo('yearly').discountText}
                    </span>
                  </div>
                )}
                <div className="text-4xl font-bold text-white mb-2">
                  <span className="text-2xl">$</span>{BASE_PRICES.enterprise}
                  <span className="text-lg text-gray-400">/month</span>
                </div>
                {getDiscountInfo('monthly').hasDiscount && (
                  <div className="text-sm text-gray-400 line-through mb-2">
                    Was ${BASE_PRICES.enterprise}/month
                  </div>
                )}
                <p className="text-gray-400">For dedicated learners</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Everything in Basic
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
                onClick={() => navigate('/subscribe')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Upgrade to Pro
              </button>
              {getDiscountInfo('monthly').hasDiscount && (
                <p className="text-center text-green-400 text-sm mt-2">
                  Save ${getDiscountInfo('monthly').savings} with this deal!
                </p>
              )}
            </div>

            {/* Enterprise Plan */}
            <div className="bg-gray-900 p-8 rounded-xl border border-gray-700">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                {getDiscountInfo('yearly').hasDiscount && (
                  <div className="mb-2">
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                      {getDiscountInfo('yearly').discountText}
                    </span>
                  </div>
                )}
                <div className="text-4xl font-bold text-white mb-2">
                  <span className="text-2xl">$</span>{BASE_PRICES.yearly / 12}
                  <span className="text-lg text-gray-400">/month</span>
                </div>
                {getDiscountInfo('yearly').hasDiscount && (
                  <div className="text-sm text-gray-400 line-through mb-2">
                    Was ${BASE_PRICES.yearly / 12}/month
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
                onClick={() => navigate('/subscribe?plan=yearly')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Contact Sales
              </button>
              {getDiscountInfo('yearly').hasDiscount && (
                <p className="text-center text-green-400 text-sm mt-2">
                  Save ${getDiscountInfo('yearly').savings} with this deal!
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

          {!isSubscribed ? (
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
          ) : (
            <div className="text-green-400 text-lg">
              <CheckCircle className="h-6 w-6 inline mr-2" />
              Thanks for subscribing!
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
          <p className="text-xl text-gray-400 mb-8">
            Run subscription and E2E tests to verify functionality
          </p>

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
          <p className="text-xl text-gray-400 mb-8">
            Help us continue building amazing trading tools
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => handleDonate(5)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
            >
              <Coffee className="mr-2 h-5 w-5" />
              Buy us a coffee - $5
            </button>
            <button
              onClick={() => handleDonate(10)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
            >
              <Coffee className="mr-2 h-5 w-5" />
              Support us - $10
            </button>
            <button
              onClick={() => handleDonate(25)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
            >
              <Award className="mr-2 h-5 w-5" />
              Sponsor us - $25
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12" id="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Options World</h3>
              <p className="text-gray-400">
                Professional options trading platform for serious traders
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/app" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/app/trading" className="hover:text-white transition-colors">Trading Platform</Link></li>
                <li><Link to="/app/learning" className="hover:text-white transition-colors">Learning Resources</Link></li>
                <li><Link to="/app/strategies" className="hover:text-white transition-colors">Strategy Library</Link></li>
                <li><Link to="/agent" className="hover:text-white transition-colors">Agent API</Link></li>
                <li><Link to="/testing" className="hover:text-white transition-colors">Testing Tools</Link></li>
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
            <p>&copy; {new Date().getFullYear()} Options World. All rights reserved.</p>
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