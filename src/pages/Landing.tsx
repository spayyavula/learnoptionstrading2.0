import React from 'react'
import { 
  TrendingUp, 
  BookOpen, 
  Users, 
  Info,
  Shield, 
  CheckCircle, 
  Bot,
  Play,
  BarChart3,
  Target,
  Mail
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { ConstantContactService } from '../services/constantContactService'
import { StripeService } from '../services/stripeService'
import { BASE_PRICES } from '../utils/priceSync'
import { useState, useEffect } from 'react'
import { YEARLY_SAVINGS_PERCENT } from '../utils/priceSync'
import TermsAgreement from '../components/TermsAgreement'

export default function Landing() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailMessage, setEmailMessage] = useState('')
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [pendingSubscription, setPendingSubscription] = useState<{plan: 'monthly' | 'yearly' | 'pro' | 'enterprise'} | null>(null)

  // Clean up useEffect - remove coupon initialization
  React.useEffect(() => {
    // Check for subscription success in URL
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('subscription') === 'success') {
      setSubscriptionSuccess(true)
      // Remove the query parameters from the URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const handleSubscribe = async (plan: 'monthly' | 'yearly' | 'pro' | 'enterprise') => {
    // Show terms agreement before proceeding
    setPendingSubscription({ plan })
    setShowTermsModal(true)
  }

  const handleTermsAccepted = async () => {
    if (!pendingSubscription) return
    
    try {
      const { plan } = pendingSubscription
      await StripeService.redirectToCheckout(plan)
    } catch (error) {
      console.error('Failed to create checkout session:', error)
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setEmailMessage('')
    
    try {
      const result = await ConstantContactService.subscribeEmail(email)
      setIsSubscribed(result.success)
      setEmailMessage(result.message)
    } catch (error) {
      console.error('Failed to subscribe:', error)
      setEmailMessage('Failed to subscribe. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleTermsButtonClick = () => {
    setShowTermsModal(true)
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
              <span className="block sm:inline">Thank you for subscribing to Learn Options Trading Academy! Your account has been activated.</span>
            </div>
          )}
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Learn Options Trading Academy
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-6 max-w-3xl mx-auto">
              Advanced analytics, real-time data, and AI-powered insights to develop your options trading expertise
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/pricing" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center"
              >
                <Play className="mr-2 h-5 w-5" />
                View Pricing
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
          </div>
        </div>
      </section>

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
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Monthly Plan */}
            <div className="bg-gray-900 p-8 rounded-xl border border-gray-700">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Monthly</h3>
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
                onClick={() => handleSubscribe('monthly')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Get Started
              </button>
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
                <div className="mb-2">
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-sm font-bold">
                    Save {YEARLY_SAVINGS_PERCENT}%
                  </span>
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  <span className="text-2xl">$</span>{Math.round(BASE_PRICES.yearly / 12)}
                  <span className="text-lg text-gray-400">/month</span>
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  Billed annually at ${BASE_PRICES.yearly}
                </div>
                <div className="text-sm text-gray-400 line-through mb-2">
                  Was ${BASE_PRICES.monthly}/month
                </div>
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
                onClick={() => handleSubscribe('yearly')}
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
                <div className="text-4xl font-bold text-white mb-2">
                  <span className="text-2xl">$</span>{BASE_PRICES.pro}
                  <span className="text-lg text-gray-400">/month</span>
                </div>
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
                onClick={() => handleSubscribe('pro')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Upgrade to Pro
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-gray-900 p-8 rounded-xl border border-gray-700">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-white mb-2">
                  <span className="text-2xl">$</span>{BASE_PRICES.enterprise}
                  <span className="text-lg text-gray-400">/month</span>
                </div>
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
                onClick={() => handleSubscribe('enterprise')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Contact Sales
              </button>
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
            </div>
          )}
        </div>
      </section>

      {/* Footer Section */}
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
                <li><Link to="/app" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/app/trading" className="hover:text-white transition-colors">Trading Platform</Link></li>
                <li><Link to="/app/learning" className="hover:text-white transition-colors">Learning Resources</Link></li>
                <li><Link to="/app/strategies" className="hover:text-white transition-colors">Strategy Library</Link></li>
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
            <p>&copy; {new Date().getFullYear()} Learn Options Trading Academy. All rights reserved.</p>
            <p className="mt-2 text-sm">
              <strong>Risk Disclaimer:</strong> Options trading involves substantial risk and is not suitable for all investors. 
              You may lose all of your invested capital. Past performance is not indicative of future results.
            </p>
            <div className="flex justify-center space-x-4 mt-4">
              <a href="#home" className="text-gray-500 hover:text-white transition-colors">Home</a>
              <a href="#features" className="text-gray-500 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-gray-500 hover:text-white transition-colors">Pricing</a>
            </div>
            <div className="mt-4">
              <button onClick={handleTermsButtonClick} className="text-gray-500 hover:text-white transition-colors">
                Terms and Conditions
              </button>
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