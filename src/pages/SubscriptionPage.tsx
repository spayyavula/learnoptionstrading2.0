import React, { useState, useEffect } from 'react'
import { CheckCircle, CreditCard, Settings, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StripeService } from '../services/stripeService'
import { BASE_PRICES } from '../utils/priceSync'
import StripeCheckoutButton from '../components/StripeCheckoutButton'

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
              <Link 
                to="/pricing"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                View Pricing Plans
              </Link>
            </div>
          )}
        </div>

        {/* Available Plans */}
        {!subscriptionStatus?.active && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Plans</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Monthly Plan */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Monthly</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  ${BASE_PRICES.monthly}
                  <span className="text-base text-gray-500">/month</span>
                </p>
                <p className="text-gray-600 text-sm mb-4">Perfect for getting started</p>
                <StripeCheckoutButton plan="monthly" className="w-full">
                  Subscribe Monthly
                </StripeCheckoutButton>
              </div>

              {/* Yearly Plan */}
              <div className="border-2 border-green-500 rounded-lg p-4 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Best Value
                  </span>
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Yearly</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  ${Math.round(BASE_PRICES.yearly / 12)}
                  <span className="text-base text-gray-500">/month</span>
                </p>
                <p className="text-gray-600 text-sm mb-4">Billed annually (${BASE_PRICES.yearly})</p>
                <StripeCheckoutButton plan="yearly" variant="success" className="w-full">
                  Subscribe Yearly
                </StripeCheckoutButton>
              </div>

              {/* Pro Plan */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Pro</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  ${BASE_PRICES.pro}
                  <span className="text-base text-gray-500">/month</span>
                </p>
                <p className="text-gray-600 text-sm mb-4">Advanced features included</p>
                <StripeCheckoutButton plan="pro" className="w-full">
                  Subscribe Pro
                </StripeCheckoutButton>
              </div>

              {/* Enterprise Plan */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Enterprise</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  ${BASE_PRICES.enterprise}
                  <span className="text-base text-gray-500">/month</span>
                </p>
                <p className="text-gray-600 text-sm mb-4">For teams and institutions</p>
                <StripeCheckoutButton plan="enterprise" className="w-full">
                  Subscribe Enterprise
                </StripeCheckoutButton>
              </div>
            </div>
          </div>
        )}

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