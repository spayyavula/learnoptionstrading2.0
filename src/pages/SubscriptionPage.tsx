import React, { useState, useEffect } from 'react'
import { CheckCircle, CreditCard, Settings, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StripeService } from '../services/stripeService'
import { BASE_PRICES } from '../utils/priceSync'
import StripeCheckout from '../components/StripeCheckout'

export default function SubscriptionPage() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSubscriptionStatus()
  }, [])

  const checkSubscriptionStatus = () => {
    setLoading(true)
    try {
      const status = StripeService.getSubscriptionStatus()
      setSubscriptionStatus(status)
    } catch (error) {
      console.error('Failed to check subscription status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    if (!subscriptionStatus?.subscription?.customer_id) {
      alert('Unable to access subscription management. Please contact support.')
      return
    }

    try {
      const portalUrl = await StripeService.createCustomerPortalSession(subscriptionStatus.subscription.customer_id)
      window.open(portalUrl, '_blank')
    } catch (error) {
      console.error('Failed to open customer portal:', error)
      alert('Unable to open subscription management. Please contact support.')
    }
  }

  const handleCheckoutSuccess = () => {
    console.log('✅ Checkout completed successfully')
    // Refresh subscription status after successful checkout
    setTimeout(() => {
      checkSubscriptionStatus()
    }, 1000)
  }

  const handleCheckoutError = (error: string) => {
    console.error('❌ Checkout error:', error)
    alert(`Checkout Error: ${error}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            to="/app" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to App
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600 mt-2">Manage your Learn Options Trading Academy subscription</p>
        </div>

        {/* Current Subscription Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Status</h2>
          
          {subscriptionStatus?.active ? (
            <div className="space-y-4">
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Active Subscription</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Plan:</span>
                  <span className="ml-2 font-medium capitalize">{subscriptionStatus.plan}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className="ml-2 font-medium text-green-600">Active</span>
                </div>
                {subscriptionStatus.subscription?.current_period_end && (
                  <div>
                    <span className="text-gray-500">Next billing:</span>
                    <span className="ml-2 font-medium">
                      {new Date(subscriptionStatus.subscription.current_period_end).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {subscriptionStatus.subscription?.amount_paid && (
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <span className="ml-2 font-medium">${subscriptionStatus.subscription.amount_paid}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <button
                  onClick={handleManageSubscription}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Subscription
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-6">You don't have an active subscription.</p>
              <p className="text-gray-500 mb-6">Choose a plan below to get started:</p>
            </div>
          )}
        </div>

        {/* Available Plans - Always show, even if user has subscription */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {subscriptionStatus?.active ? 'Upgrade or Change Plan' : 'Choose Your Plan'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Monthly Plan */}
            <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
              <div className="text-center mb-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Monthly</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  ${BASE_PRICES.monthly}
                  <span className="text-base text-gray-500">/month</span>
                </p>
                <p className="text-gray-600 text-sm">Perfect for getting started</p>
              </div>
              
              <ul className="space-y-2 mb-6 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Educational market data
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Basic learning modules
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  5 practice portfolios
                </li>
              </ul>
              
              <StripeCheckout
                plan="monthly"
                onSuccess={handleCheckoutSuccess}
                onError={handleCheckoutError}
                className="w-full"
                disabled={subscriptionStatus?.plan === 'monthly'}
              >
                {subscriptionStatus?.plan === 'monthly' ? 'Current Plan' : 'Subscribe Monthly'}
              </StripeCheckout>
            </div>

            {/* Yearly Plan */}
            <div className="border-2 border-green-500 rounded-lg p-6 relative bg-green-50">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Best Value
                </span>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Yearly</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  ${Math.round(BASE_PRICES.yearly / 12)}
                  <span className="text-base text-gray-500">/month</span>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Billed annually at ${BASE_PRICES.yearly}
                </p>
                <p className="text-gray-600 text-sm">Save 2 months!</p>
              </div>
              
              <ul className="space-y-2 mb-6 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Everything in Monthly
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  2 months free
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Priority support
                </li>
              </ul>
              
              <StripeCheckout
                plan="yearly"
                onSuccess={handleCheckoutSuccess}
                onError={handleCheckoutError}
                className="w-full"
                variant="success"
                disabled={subscriptionStatus?.plan === 'yearly'}
              >
                {subscriptionStatus?.plan === 'yearly' ? 'Current Plan' : 'Subscribe Yearly'}
              </StripeCheckout>
            </div>

            {/* Pro Plan */}
            <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
              <div className="text-center mb-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Pro</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  ${BASE_PRICES.pro}
                  <span className="text-base text-gray-500">/month</span>
                </p>
                <p className="text-gray-600 text-sm">Advanced features</p>
              </div>
              
              <ul className="space-y-2 mb-6 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Everything in Monthly
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Advanced modules
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Unlimited portfolios
                </li>
              </ul>
              
              <StripeCheckout
                plan="pro"
                onSuccess={handleCheckoutSuccess}
                onError={handleCheckoutError}
                className="w-full"
                disabled={subscriptionStatus?.plan === 'pro'}
              >
                {subscriptionStatus?.plan === 'pro' ? 'Current Plan' : 'Subscribe Pro'}
              </StripeCheckout>
            </div>

            {/* Enterprise Plan */}
            <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
              <div className="text-center mb-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Enterprise</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  ${BASE_PRICES.enterprise}
                  <span className="text-base text-gray-500">/month</span>
                </p>
                <p className="text-gray-600 text-sm">For institutions</p>
              </div>
              
              <ul className="space-y-2 mb-6 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Everything in Pro
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Custom learning paths
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Dedicated support
                </li>
              </ul>
              
              <StripeCheckout
                plan="enterprise"
                onSuccess={handleCheckoutSuccess}
                onError={handleCheckoutError}
                className="w-full"
                disabled={subscriptionStatus?.plan === 'enterprise'}
              >
                {subscriptionStatus?.plan === 'enterprise' ? 'Current Plan' : 'Subscribe Enterprise'}
              </StripeCheckout>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Need help? Contact us at{' '}
            <a href="mailto:support@learnoptionstrading.academy" className="text-blue-600 hover:underline">
              support@learnoptionstrading.academy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}