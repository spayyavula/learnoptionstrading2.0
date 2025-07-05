import React, { useState } from 'react'
import { 
  ArrowRight, 
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
  Mail,
  Star,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { ConstantContactService } from '../services/constantContactService'
import { StripeService } from '../services/stripeService'
import { BASE_PRICES, YEARLY_SAVINGS_PERCENT } from '../utils/priceSync'
import TermsAgreement from '../components/TermsAgreement'
import StripeCheckout from '../components/StripeCheckout'

export default function Landing() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailMessage, setEmailMessage] = useState('')
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [pendingSubscription, setPendingSubscription] = useState<{plan: 'monthly' | 'yearly' | 'pro' | 'enterprise'} | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')

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

  const handleCheckoutSuccess = () => {
    console.log('✅ Checkout completed successfully from Landing page')
  }

  const handleCheckoutError = (error: string) => {
    console.error('❌ Checkout error from Landing page:', error)
    // Show user-friendly error message
    alert(`Checkout Error: ${error}\n\nPlease try again or contact support.`)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold">Learn Options Trading</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/pricing"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Pricing
              </Link>
              <Link
                to="/app"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Master Options Trading
              <span className="block text-blue-400">Risk-Free</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Learn options trading with our comprehensive educational platform. 
              Practice with virtual money before risking real capital.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/app"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center"
              >
                Start Learning Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/pricing"
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to learn options trading safely and effectively
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Educational Content</h3>
              <p className="text-gray-600">
                Comprehensive lessons from basics to advanced strategies
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Practice Trading</h3>
              <p className="text-gray-600">
                Virtual trading with real market data to practice safely
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Risk Management</h3>
              <p className="text-gray-600">
                Learn proper risk management before using real money
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-200">Students Learning</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-200">Educational Modules</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-200">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your learning goals
            </p>
          </div>
          
          {/* Plan Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  selectedPlan === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  selectedPlan === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  Save {YEARLY_SAVINGS_PERCENT}%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Monthly Plan */}
            <div className={`bg-white rounded-2xl shadow-lg p-8 border-2 ${
              selectedPlan === 'monthly' ? 'border-blue-500' : 'border-gray-200'
            }`}>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Monthly Plan</h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">
                  ${BASE_PRICES.monthly}
                  <span className="text-lg text-gray-500">/month</span>
                </div>
                <p className="text-gray-600">Perfect for getting started</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Educational market data</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Basic learning modules</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>5 practice portfolios</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Email support</span>
                </li>
              </ul>

              <StripeCheckout
                plan="monthly"
                onSuccess={handleCheckoutSuccess}
                onError={handleCheckoutError}
                className="w-full"
                disabled={selectedPlan !== 'monthly'}
              >
                Get Started Monthly
              </StripeCheckout>
            </div>

            {/* Yearly Plan */}
            <div className={`bg-white rounded-2xl shadow-lg p-8 border-2 relative ${
              selectedPlan === 'yearly' ? 'border-green-500' : 'border-gray-200'
            }`}>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  Best Value
                </span>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Yearly Plan</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  ${Math.round(BASE_PRICES.yearly / 12)}
                  <span className="text-lg text-gray-500">/month</span>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  Billed annually at ${BASE_PRICES.yearly}
                </div>
                <p className="text-gray-600">Best value for committed learners</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Everything in Monthly</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>2 months free</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Early access to new features</span>
                </li>
              </ul>

              <StripeCheckout
                plan="yearly"
                onSuccess={handleCheckoutSuccess}
                onError={handleCheckoutError}
                className="w-full"
                variant="success"
                disabled={selectedPlan !== 'yearly'}
              >
                Save with Yearly Plan
              </StripeCheckout>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Students Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "This platform helped me understand options trading without risking real money. The educational content is top-notch!"
              </p>
              <div className="font-semibold">- Sarah J.</div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "The practice trading feature is incredible. I learned so much before putting real money at risk."
              </p>
              <div className="font-semibold">- Mike T.</div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Best investment I've made in my trading education. The risk management lessons alone are worth it."
              </p>
              <div className="font-semibold">- Lisa R.</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are mastering options trading safely and effectively.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/app"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              to="/pricing"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              View All Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Learn Options Trading</h3>
              <p className="text-gray-400">
                Master options trading with our comprehensive educational platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/app" className="hover:text-white">Trading Simulator</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/app/lessons" className="hover:text-white">Lessons</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="mailto:support@learnoptionstrading.academy" className="hover:text-white">Contact</a></li>
                <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="/disclaimer" className="hover:text-white">Disclaimer</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Learn Options Trading Academy. All rights reserved.</p>
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