import { BASE_PRICES } from '../utils/priceSync'
import { JsonDebugger } from '../utils/jsonDebugger'

// Add utility function for safe JSON parsing with enhanced debugging
function safeJsonParse(jsonString: string, fallback: any = null, context: string = 'StripeService') {
  return JsonDebugger.safeParse(jsonString, context) ?? fallback
}

// Add utility function for safe localStorage operations
function safeLocalStorageGet(key: string, fallback: any = null) {
  try {
    const item = localStorage.getItem(key)
    if (!item) return fallback
    return safeJsonParse(item, fallback, `localStorage.get(${key})`)
  } catch (error) {
    console.error(`❌ LocalStorage get failed for key "${key}":`, error)
    JsonDebugger.logJsonOperation('LOCALSTORAGE_GET_ERROR', { key, error: error instanceof Error ? error.message : 'Unknown' }, 'localStorage')
    // Clear corrupted data
    try {
      localStorage.removeItem(key)
    } catch (clearError) {
      console.error('❌ Failed to clear corrupted localStorage:', clearError)
    }
    return fallback
  }
}

function safeLocalStorageSet(key: string, value: any) {
  try {
    const jsonString = JsonDebugger.safeStringify(value, `localStorage.set(${key})`)
    if (!jsonString) {
      console.error(`❌ Failed to stringify value for localStorage key "${key}"`)
      return false
    }
    localStorage.setItem(key, jsonString)
    JsonDebugger.logJsonOperation('LOCALSTORAGE_SET_SUCCESS', { key, value }, 'localStorage')
    return true
  } catch (error) {
    console.error(`❌ LocalStorage set failed for key "${key}":`, error)
    JsonDebugger.logJsonOperation('LOCALSTORAGE_SET_ERROR', { key, error: error instanceof Error ? error.message : 'Unknown' }, 'localStorage')
    return false
  }
}

interface StripeCheckoutOptions {
  priceId: string
  successUrl?: string
  cancelUrl?: string
  customerEmail?: string
  metadata?: Record<string, string>
  couponCode?: string
}

interface StripeProduct {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval?: 'month' | 'year'
  type: 'subscription' | 'one_time'
}

export class StripeService {
  // Lazy load environment variables
  private static getEnvVars() {
    const envVars = {
      PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
      PRICE_ID_BASIC: import.meta.env.VITE_STRIPE_PRICE_ID_BASIC || '',
      PRICE_ID_PRO: import.meta.env.VITE_STRIPE_PRICE_ID_PRO || '',
      PRICE_ID_ENTERPRISE: import.meta.env.VITE_STRIPE_PRICE_ID_ENTERPRISE || '',
      MONTHLY_PRICE_ID: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID || '',
      YEARLY_PRICE_ID: import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID || '',
      COFFEE_PRICE_ID: import.meta.env.VITE_STRIPE_COFFEE_PRICE_ID || '',
      // Payment Links
      MONTHLY_PAYMENT_LINK: import.meta.env.VITE_STRIPE_MONTHLY_PAYMENT_LINK || '',
      YEARLY_PAYMENT_LINK: import.meta.env.VITE_STRIPE_YEARLY_PAYMENT_LINK || '',
      PRO_PAYMENT_LINK: import.meta.env.VITE_STRIPE_PRO_PAYMENT_LINK || '',
      ENTERPRISE_PAYMENT_LINK: import.meta.env.VITE_STRIPE_ENTERPRISE_PAYMENT_LINK || ''
    }
    
    console.log('🔧 Stripe Environment Variables Debug:', {
      DEV_MODE: import.meta.env.DEV,
      MODE: import.meta.env.MODE,
      PUBLISHABLE_KEY_LENGTH: envVars.PUBLISHABLE_KEY.length,
      PUBLISHABLE_KEY_PREFIX: envVars.PUBLISHABLE_KEY.substring(0, 8) || 'EMPTY',
      HAS_PAYMENT_LINKS: !!(envVars.MONTHLY_PAYMENT_LINK && envVars.YEARLY_PAYMENT_LINK)
    })
    
    return envVars
  }

  /**
   * Initialize Stripe (loads Stripe.js)
   */
  static async initializeStripe() {
    const { PUBLISHABLE_KEY } = this.getEnvVars()
    
    if (!PUBLISHABLE_KEY) {
      console.warn('Stripe not configured')
      return null
    }

    try {
      console.log('🔄 Loading Stripe.js...')
      const { loadStripe } = await import('@stripe/stripe-js')
      const stripe = await loadStripe(PUBLISHABLE_KEY)
      
      if (!stripe) {
        throw new Error('Stripe failed to initialize - returned null')
      }
      
      console.log('✅ Stripe.js loaded successfully')
      return stripe
    } catch (error) {
      console.error('❌ Failed to load Stripe:', error)
      return null
    }
  }

  /**
   * Redirect to Stripe Checkout using Payment Links
   */
  static async redirectToCheckout(
    plan: 'monthly' | 'yearly' | 'pro' | 'enterprise'
  ): Promise<void> {
    console.log('🛒 Starting checkout process:', { plan })
    
    const { 
      MONTHLY_PAYMENT_LINK,
      YEARLY_PAYMENT_LINK,
      PRO_PAYMENT_LINK,
      ENTERPRISE_PAYMENT_LINK,
      PUBLISHABLE_KEY 
    } = this.getEnvVars()
    
    try {
      // Force mock checkout in development mode
      if (import.meta.env.DEV || !PUBLISHABLE_KEY) {
        console.log('🧪 Development mode or missing keys - Using mock checkout')
        await this.mockStripeCheckoutAsync(plan)
        return
      }
      
      // Use Payment Links for production
      console.log('💳 Using Stripe Payment Links...')
      
      const paymentLinks = {
        monthly: MONTHLY_PAYMENT_LINK,
        yearly: YEARLY_PAYMENT_LINK,
        pro: PRO_PAYMENT_LINK,
        enterprise: ENTERPRISE_PAYMENT_LINK
      }
      
      const paymentLink = paymentLinks[plan]
      if (!paymentLink) {
        throw new Error(`Payment link not configured for plan: ${plan}`)
      }
      
      console.log('🚀 Redirecting to Stripe Payment Link:', paymentLink)
      
      // Redirect to Payment Link
      window.location.href = paymentLink
      
    } catch (error) {
      console.error('❌ Checkout error:', error)
      
      // Fallback to mock in development
      if (import.meta.env.DEV) {
        console.log('🧪 Falling back to mock checkout due to error')
        await this.mockStripeCheckoutAsync(plan)
        return
      }
      
      throw new Error(`Failed to redirect to checkout: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get available products/pricing
   */
  static getProducts(): StripeProduct[] {
    return [
      {
        id: 'monthly',
        name: 'Monthly Plan',
        description: 'Basic options trading with monthly billing',
        price: BASE_PRICES.monthly,
        currency: 'USD',
        interval: 'month',
        type: 'subscription'
      },
      {
        id: 'yearly',
        name: 'Annual Plan',
        description: 'Annual billing with significant savings',
        price: BASE_PRICES.yearly,
        currency: 'USD',
        interval: 'year',
        type: 'subscription'
      },
      {
        id: 'pro',
        name: 'Pro',
        description: 'Full access with advanced analytics and strategy testing',
        price: BASE_PRICES.pro,
        currency: 'USD',
        interval: 'month',
        type: 'subscription'
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Everything in Pro plus team features and API access',
        price: BASE_PRICES.enterprise,
        currency: 'USD',
        interval: 'month',
        type: 'subscription'
      }
    ]
  }

  /**
   * Async wrapper for mock checkout
   */
  private static async mockStripeCheckoutAsync(plan: 'monthly' | 'yearly' | 'pro' | 'enterprise'): Promise<void> {
    console.log('🧪 Mock checkout (async) initiated:', { plan })
    
    return new Promise((resolve, reject) => {
      try {
        const products = this.getProducts()
        const product = products.find(p => p.id === plan)
        
        if (!product) {
          reject(new Error(`Invalid plan: ${plan}`))
          return
        }
        
        const userConfirmed = confirm(
          `Mock Stripe Checkout\n\n` +
          `Plan: ${product.name}\n` +
          `Price: $${product.price}/${product.interval}\n\n` +
          `Proceed with mock subscription?`
        )
        
        if (userConfirmed) {
          this.completeMockCheckout(plan, product.price)
          resolve()
        } else {
          reject(new Error('User cancelled checkout'))
        }
      } catch (error) {
        reject(new Error(`Mock checkout failed: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    })
  }

  /**
   * Complete mock checkout process
   */
  private static completeMockCheckout(plan: 'monthly' | 'yearly' | 'pro' | 'enterprise', finalPrice: number): void {
    console.log('✅ Completing mock checkout:', { plan, finalPrice })
    
    const mockSubscription = {
      id: `sub_mock_${Date.now().toString()}`,
      plan,
      status: 'active',
      created: new Date().toISOString(),
      current_period_end: new Date(Date.now() + (plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
      amount_paid: finalPrice,
      customer_id: `cus_mock_${Date.now().toString()}`
    }
    
    const success = safeLocalStorageSet('mock_subscription', mockSubscription)
    if (!success) {
      throw new Error('Failed to save subscription data')
    }
    
    // Redirect to success page
    window.location.href = `/success?plan=${plan}`
  }

  /**
   * Create customer portal session
   */
  static async createCustomerPortalSession(customerId: string): Promise<string> {
    console.log('🏪 Creating customer portal session for:', customerId)
    
    if (import.meta.env.DEV) {
      const userChoice = confirm(
        `🧪 MOCK CUSTOMER PORTAL (Development Mode)\n\n` +
        `Customer ID: ${customerId}\n\n` +
        `In production, this opens Stripe's customer portal.\n\n` +
        `Simulate opening portal?`
      )
      
      if (userChoice) {
        return `https://billing.stripe.com/p/session/mock_${customerId}_${Date.now()}`
      } else {
        throw new Error('Customer portal access cancelled')
      }
    }
    
    // In production, this should call your backend
    throw new Error('Customer portal requires backend integration')
  }

  /**
   * Check subscription status
   */
  static getSubscriptionStatus(): { active: boolean; plan?: string; subscription?: any; termsAccepted?: boolean } {
    try {
      const subscription = safeLocalStorageGet('mock_subscription')
      if (subscription && typeof subscription === 'object') {
        const isActive = subscription.status === 'active' && new Date(subscription.current_period_end) > new Date()
        
        return {
          active: isActive,
          plan: subscription.plan,
          subscription,
          termsAccepted: subscription.terms_accepted || false
        }
      }
      
      return { active: false, termsAccepted: false }
    } catch (error) {
      console.error('❌ Error checking subscription status:', error)
      return { active: false, termsAccepted: false }
    }
  }
}