import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, CreditCard, Settings } from 'lucide-react'
import { StripeService } from '../services/stripeService'
import { supabase } from '../lib/supabase'

interface SubscriptionStatusProps {
  className?: string
}

export default function SubscriptionStatus({ className = '' }: SubscriptionStatusProps) {
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Function to fetch real subscription status from Supabase
  const fetchSubscriptionStatus = async () => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', supabase.auth.getUser())
          .order('created', { ascending: false })
          .limit(1)
          .single()
        
        if (error) {
          console.error('Error fetching subscription:', error)
          return null
        }
        
        if (data) {
          return {
            active: data.status === 'active',
            plan: data.price_id.includes('monthly') ? 'monthly' : 'yearly',
            subscription: data,
            termsAccepted: data.terms_accepted
          }
        }
      }
      return null
    } catch (error) {
      console.error('Error in fetchSubscriptionStatus:', error)
      return null
    }
  }

  useEffect(() => {
    checkSubscriptionStatus()
  }, [])

  const checkSubscriptionStatus = async () => {
    setLoading(true)
    
    try {
      // Try to get real subscription status first
      const realStatus = await fetchSubscriptionStatus()
      
      if (realStatus) {
        setSubscription(realStatus)
      } else {
        // Fall back to mock status for development
        const mockStatus = StripeService.getSubscriptionStatus()
        setSubscription(mockStatus)
      }
    } catch (error) {
      console.error('Error checking subscription status:', error)
      // Fall back to mock status
      const mockStatus = StripeService.getSubscriptionStatus()
      setSubscription(mockStatus)
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      if (subscription?.subscription?.customer_id) {
        const portalUrl = await StripeService.createCustomerPortalSession(subscription.subscription.customer_id)
        window.open(portalUrl, '_blank')
      } else {
        alert('Customer portal not available. Please contact support.')
      }
    } catch (error) {
      console.error('Portal error:', error)
      alert('Failed to open customer portal. Please try again.')
    }
  }

  const handleUpgrade = () => {
    window.location.href = '/subscribe'
  }

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Clock className="h-4 w-4 text-gray-400 animate-spin" />
        <span className="text-sm text-gray-500">Checking subscription...</span>
      </div>
    )
  }

  if (!subscription?.active) {
    return (
      <div className={`flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2">
          <XCircle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-800">Free Plan</span>
        </div>
        <button
          onClick={handleUpgrade}
          className="text-xs bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-700 transition-colors"
        >
          Upgrade
        </button>
      </div>
    )
  }

  const planName = subscription.plan === 'yearly' ? 'Pro Yearly' : 'Pro Monthly'
  const nextBilling = subscription.subscription?.current_period_end 
    ? new Date(subscription.subscription.current_period_end).toLocaleDateString()
    : 'Unknown'

  return (
    <div className={`p-3 bg-green-50 border border-green-200 rounded-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-green-800">{planName}</span>
              {subscription.termsAccepted && (
                <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                  Terms Accepted
                </span>
              )}
            </div>
            <p className="text-xs text-green-600">
              Next billing: {nextBilling}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleManageSubscription}
            className="text-xs bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors flex items-center"
          >
            <Settings className="h-3 w-3 mr-1" />
            Manage
          </button>
        </div>
      </div>
    </div>
  )
}