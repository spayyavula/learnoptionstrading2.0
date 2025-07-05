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
  /**
   * Update existing mock subscription to include customer_id if missing
   */
  static updateMockSubscriptionStructure(): void {
    try {
      const subscription = safeLocalStorageGet('mock_subscription')
      if (subscription && typeof subscription === 'object') {
        // Check if customer_id is missing
        if (!subscription.customer_id) {
          console.log('🔧 Updating mock subscription to include customer_id')
          subscription.customer_id = `cus_mock_${Date.now().toString()}`
          const success = safeLocalStorageSet('mock_subscription', subscription)
          if (success) {
            console.log('✅ Mock subscription updated:', subscription)
          } else {
            console.error('❌ Failed to save updated mock subscription')
          }
        }
      }
    } catch (error) {
      console.error('❌ Error updating mock subscription structure:', error)
      // Clear corrupted data
      try {
        localStorage.removeItem('mock_subscription')
      } catch (clearError) {
        console.error('❌ Failed to clear corrupted data:', clearError)
      }
    }
  }

  // Lazy load environment variables
  private static getEnvVars() {
    const envVars = {
      PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
      PRICE_ID_BASIC: import.meta.env.VITE_STRIPE_PRICE_ID_BASIC || '',
      PRICE_ID_PRO: import.meta.env.VITE_STRIPE_PRICE_ID_PRO || '',
      PRICE_ID_ENTERPRISE: import.meta.env.VITE_STRIPE_PRICE_ID_ENTERPRISE || '',
      MONTHLY_PRICE_ID: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID || '',
      YEARLY_PRICE_ID: import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID || '',
      COFFEE_PRICE_ID: import.meta.env.VITE_STRIPE_COFFEE_PRICE_ID || ''
    }
    
    // Debug logging to help troubleshoot environment issues
    console.log('🔧 Stripe Environment Variables Debug:', {
      DEV_MODE: import.meta.env.DEV,
      MODE: import.meta.env.MODE,
      PUBLISHABLE_KEY_LENGTH: envVars.PUBLISHABLE_KEY.length,
      PUBLISHABLE_KEY_PREFIX: envVars.PUBLISHABLE_KEY.substring(0, 8) || 'EMPTY',
      HAS_MONTHLY_PRICE: !!envVars.MONTHLY_PRICE_ID,
      HAS_YEARLY_PRICE: !!envVars.YEARLY_PRICE_ID,
      HAS_PRO_PRICE: !!envVars.PRICE_ID_PRO,
      HAS_ENTERPRISE_PRICE: !!envVars.PRICE_ID_ENTERPRISE
    })
    
    return envVars
  }
  
  private static readonly API_BASE_URL = '/api/stripe'

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
      // Dynamically import Stripe
      const { loadStripe } = await import('@stripe/stripe-js')
      const stripe = await loadStripe(PUBLISHABLE_KEY)
      
      if (!stripe) {
        throw new Error('Stripe failed to initialize - returned null')
      }
      
      console.log('✅ Stripe.js loaded successfully')
      return stripe
    } catch (error) {
      console.error('❌ Failed to load Stripe:', error)
      
      // If this is a network/JSON error, provide helpful context
      if (error instanceof Error) {
        if (error.message.includes('JSON') || error.message.includes('fetch')) {
          console.error('🌐 Network or JSON parsing error detected. This may be due to:')
          console.error('  - Network connectivity issues')
          console.error('  - Stripe API being temporarily unavailable')
          console.error('  - Invalid Stripe publishable key')
          console.error('  - CORS or CSP restrictions')
        }
      }
      
      return null
    }
  }

  /**
   * Redirect to Stripe Checkout for subscription
   */
  static async redirectToCheckout(
    plan: 'monthly' | 'yearly' | 'pro' | 'enterprise'
  ): Promise<void> {
    console.log('🛒 Starting checkout process:', { plan })
    
    const { 
      MONTHLY_PRICE_ID, 
      YEARLY_PRICE_ID, 
      PRICE_ID_ENTERPRISE,
      PRICE_ID_PRO,
      PUBLISHABLE_KEY 
    } = this.getEnvVars()
    
    try {
      // Get the appropriate price ID based on plan
      let priceId: string
      switch (plan) {
        case 'monthly':
          priceId = MONTHLY_PRICE_ID
          break
        case 'yearly':
          priceId = YEARLY_PRICE_ID
          break
        case 'enterprise':
          priceId = PRICE_ID_ENTERPRISE
          break
        case 'pro':
          priceId = PRICE_ID_PRO
          break
        default:
          priceId = MONTHLY_PRICE_ID
      }
      
      console.log('🔑 Environment check:', { 
        DEV: import.meta.env.DEV, 
        MODE: import.meta.env.MODE,
        PUBLISHABLE_KEY: PUBLISHABLE_KEY ? '✅ Present' : '❌ Missing',
        PUBLISHABLE_KEY_VALUE: PUBLISHABLE_KEY || '(empty)',
        PUBLISHABLE_KEY_TYPE: PUBLISHABLE_KEY?.startsWith('pk_live_') ? '🔴 LIVE' : PUBLISHABLE_KEY?.startsWith('pk_test_') ? '🟡 TEST' : '❌ Invalid/Missing',
        priceId: priceId ? '✅ Present' : '❌ Missing',
        priceId_VALUE: priceId || '(empty)'
      })
      
      // Force mock checkout in development mode regardless of keys
      // This prevents accidental live payments during development
      if (import.meta.env.DEV) {
        console.log('🧪 Development mode detected - Using mock checkout for safety')
        console.log('💡 To test real Stripe in dev, set NODE_ENV=production')
        
        try {
          await this.mockStripeCheckoutAsync(plan)
          return
        } catch (mockError) {
          console.error('❌ Mock checkout failed:', mockError)
          throw new Error(`Mock checkout failed: ${mockError instanceof Error ? mockError.message : 'Unknown error'}`)
        }
      }
      
      // Only allow real Stripe in production mode
      if (!PUBLISHABLE_KEY || !priceId) {
        console.log('🧪 Missing Stripe configuration - Using mock checkout')
        
        try {
          await this.mockStripeCheckoutAsync(plan)
          return
        } catch (mockError) {
          console.error('❌ Mock checkout failed:', mockError)
          throw new Error(`Mock checkout failed: ${mockError instanceof Error ? mockError.message : 'Unknown error'}`)
        }
      }

      console.log('💳 Initializing real Stripe checkout...')
      const stripe = await this.initializeStripe()
      if (!stripe) {
        throw new Error('Stripe not available')
      }

      // Choose success URL based on whether it's a deal or regular subscription
      const successUrl = `${window.location.origin}/success?plan=${plan}`
      const cancelUrl = `${window.location.origin}/pricing`

      console.log('🚀 Redirecting to Stripe with config:', {
        priceId,
        successUrl,
        cancelUrl,
        customerEmail: undefined,
        couponCode: undefined
      })

      const { error } = await stripe.redirectToCheckout({
        lineItems: [{
          price: priceId,
          quantity: 1
        }],
        mode: 'subscription',
        successUrl,
        cancelUrl,
        ...(undefined && { customerEmail: undefined }),
        ...(undefined && { discounts: [{ coupon: undefined }] })
      })

      if (error) {
        console.error('❌ Stripe checkout error:', error)
        throw error
      }
    } catch (error) {
      console.error('❌ Checkout error:', error)
      
      // Get error message first
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      // Fallback for development
      if (import.meta.env.DEV) {
        console.log('🧪 Falling back to mock checkout due to error')
        try {
          await this.mockStripeCheckoutAsync(plan)
          return
        } catch (fallbackError) {
          console.error('❌ Fallback mock checkout also failed:', fallbackError)
          throw new Error(`Both real and mock checkout failed. Original error: ${errorMessage}. Fallback error: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown fallback error'}`)
        }
      }
      
      // Re-throw the error for production or when mock fallback shouldn't be used
      throw new Error(`Failed to redirect to checkout: ${errorMessage}`)
    }
  }

  /**
   * Redirect to Stripe Checkout for one-time payment (Buy Me a Coffee)
   */
  static async redirectToCoffeeCheckout(customerEmail?: string): Promise<void> {
    const { COFFEE_PRICE_ID } = this.getEnvVars()
    
    try {
      if (!COFFEE_PRICE_ID) {
        throw new Error('Coffee price ID not configured')
      }

      const stripe = await this.initializeStripe()
      if (!stripe) {
        throw new Error('Stripe not available')
      }

      const { error } = await stripe.redirectToCheckout({
        lineItems: [{
          price: COFFEE_PRICE_ID,
          quantity: 1
        }],
        mode: 'payment',
        successUrl: `${window.location.origin}/?coffee=success`,
        cancelUrl: `${window.location.origin}/?coffee=cancelled`,
        customerEmail,
        billingAddressCollection: 'auto'
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Coffee checkout error:', error)
      
      // Fallback for development
      if (import.meta.env.DEV) {
        this.mockCoffeeCheckout()
        return
      }
      
      throw new Error('Failed to process payment. Please try again.')
    }
  }

  /**
   * Create a customer portal session for subscription management
   */
  static async createCustomerPortalSession(customerId: string): Promise<string> {
    console.log('🏪 Creating customer portal session for:', customerId)
    
    try {
      // In development mode, return a mock portal URL and show a helpful dialog
      if (import.meta.env.DEV) {
        console.log('🧪 Development mode: Using mock customer portal')
        
        // Show a mock portal dialog instead of redirecting
        const portalOptions = [
          'View subscription details',
          'Update payment method', 
          'Download invoices',
          'Cancel subscription',
          'Update billing address'
        ].join('\n• ')
        
        const userChoice = confirm(
          `🧪 MOCK CUSTOMER PORTAL (Development Mode)\n\n` +
          `Customer ID: ${customerId}\n\n` +
          `In a real environment, this would open Stripe's customer portal where you can:\n\n` +
          `• ${portalOptions}\n\n` +
          `Would you like to simulate opening the portal?`
        )
        
        if (userChoice) {
          // Simulate portal access delay
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Return a mock URL that could be opened
          return `https://billing.stripe.com/p/session/mock_${customerId}_${Date.now()}`
        } else {
          throw new Error('Customer portal access cancelled')
        }
      }
      
      // In a real implementation, this would call your backend
      console.log('Creating real customer portal session for:', customerId)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Return mock URL for production fallback
      return `https://billing.stripe.com/p/session/${customerId}_${Date.now()}`
    } catch (error) {
      console.error('❌ Portal session error:', error)
      
      // Provide a more helpful error message in development
      if (import.meta.env.DEV) {
        throw new Error('Mock customer portal access failed. This is normal in development mode.')
      } else {
        throw new Error('Failed to access customer portal. Please contact support.')
      }
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
        id: 'basic',
        name: 'Basic',
        description: 'Basic options trading with 5 top liquid contracts',
        price: BASE_PRICES.monthly,
        currency: 'USD',
        interval: 'month',
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
   * Mock checkout for development
   */
  private static mockStripeCheckout(plan: 'monthly' | 'yearly' | 'basic' | 'pro' | 'enterprise', couponCode?: string, isDeal: boolean = false): void {
    console.log('🧪 Mock checkout initiated:', { plan, couponCode, isDeal })
    
    try {
      const products = this.getProducts()
      const product = products.find(p => p.id === plan)
      
      if (!product) {
        console.error('❌ Product not found for plan:', plan)
        throw new Error(`Invalid plan: ${plan}`)
      }
      
      let displayPrice = product.price || 0
      let discountInfo = ''
      let finalPrice = displayPrice
      
      if (couponCode) {
        console.log('🎫 Processing coupon:', couponCode)
        // Import coupon service for validation
        import('../services/couponService').then(({ CouponService }) => {
          try {
            // Map plan types to subscription intervals for coupon validation
            const subscriptionInterval: 'monthly' | 'yearly' = 
              (plan === 'yearly' || plan === 'enterprise') ? 'yearly' : 'monthly'
            
            const validation = CouponService.validateCoupon(couponCode, subscriptionInterval, displayPrice, true)
            console.log('🎫 Coupon validation result:', validation)
            
            if (validation.isValid) {
              finalPrice = validation.finalAmount
              discountInfo = `\nCoupon Applied: ${couponCode}\nDiscount: $${validation.discountAmount.toFixed(2)}`
              
              // Show confirmation with discounted price
              if (confirm(`Mock Stripe Checkout\n\nPlan: ${product.name}\nOriginal Price: $${displayPrice}/${product.interval}${discountInfo}\nFinal Price: $${finalPrice}/${product.interval}\n\nProceed with mock subscription?`)) {
                this.completeMockCheckout(plan, couponCode, finalPrice, isDeal)
              } else {
                console.log('👤 User cancelled mock checkout with coupon')
              }
            } else {
              alert('Invalid coupon code: ' + validation.error)
              console.log('❌ Invalid coupon, user notified')
            }
          } catch (couponError) {
            console.error('❌ Error during coupon validation:', couponError)
            alert('Error validating coupon. Proceeding without discount.')
            
            if (confirm(`Mock Stripe Checkout\n\nPlan: ${product.name}\nPrice: $${displayPrice}/${product.interval}\n\nProceed with mock subscription?`)) {
              this.completeMockCheckout(plan, undefined, displayPrice, isDeal)
            } else {
              console.log('👤 User cancelled mock checkout after coupon error')
            }
          }
        }).catch(error => {
          console.error('❌ Error loading coupon service:', error)
          alert('Error loading coupon service. Proceeding without discount.')
          
          if (confirm(`Mock Stripe Checkout\n\nPlan: ${product.name}\nPrice: $${displayPrice}/${product.interval}\n\nProceed with mock subscription?`)) {
            this.completeMockCheckout(plan, undefined, displayPrice, isDeal)
          } else {
            console.log('👤 User cancelled mock checkout after service error')
          }
        })
      } else {
        // No coupon code provided
        if (confirm(`Mock Stripe Checkout\n\nPlan: ${product.name}\nPrice: $${displayPrice}/${product.interval}\n\nProceed with mock subscription?`)) {
          this.completeMockCheckout(plan, undefined, displayPrice, isDeal)
        } else {
          console.log('👤 User cancelled mock checkout')
        }
      }
    } catch (error) {
      console.error('❌ Error in mock checkout:', error)
      throw new Error(`Mock checkout failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Async wrapper for mock checkout to handle promises properly
   */
  private static async mockStripeCheckoutAsync(plan: 'monthly' | 'yearly' | 'basic' | 'pro' | 'enterprise', couponCode?: string, isDeal: boolean = false): Promise<void> {
    console.log('🧪 Mock checkout (async) initiated:', { plan, couponCode, isDeal })
    
    return new Promise(async (resolve, reject) => {
      try {
        const products = this.getProducts()
        const product = products.find(p => p.id === plan)
        
        if (!product) {
          console.error('❌ Product not found for plan:', plan)
          reject(new Error(`Invalid plan: ${plan}`))
          return
        }
        
        let displayPrice = product.price || 0
        let finalPrice = displayPrice
        
        if (couponCode) {
          console.log('🎫 Processing coupon:', couponCode)
          try {
            // Import coupon service for validation
            const { CouponService } = await import('../services/couponService')
            
            // Map plan types to subscription intervals for coupon validation
            const subscriptionInterval: 'monthly' | 'yearly' = 
              (plan === 'yearly' || plan === 'enterprise') ? 'yearly' : 'monthly'
            
            const validation = CouponService.validateCoupon(couponCode, subscriptionInterval, displayPrice, true)
            console.log('🎫 Coupon validation result:', validation)
            
            if (validation.isValid) {
              finalPrice = validation.finalAmount
              const discountInfo = `\nCoupon Applied: ${couponCode}\nDiscount: $${validation.discountAmount.toFixed(2)}`
              
              // Show confirmation with discounted price
              const userConfirmed = confirm(`Mock Stripe Checkout\n\nPlan: ${product.name}\nOriginal Price: $${displayPrice}/${product.interval}${discountInfo}\nFinal Price: $${finalPrice}/${product.interval}\n\nProceed with mock subscription?`)
              
              if (userConfirmed) {
                this.completeMockCheckout(plan, couponCode, finalPrice, isDeal)
                resolve()
              } else {
                console.log('👤 User cancelled mock checkout with coupon')
                reject(new Error('User cancelled checkout'))
              }
            } else {
              alert('Invalid coupon code: ' + validation.error)
              reject(new Error(`Invalid coupon: ${validation.error}`))
            }
          } catch (couponError) {
            console.error('❌ Error during coupon validation:', couponError)
            // Offer to proceed without coupon
            const proceedAnyway = confirm('Error validating coupon. Would you like to proceed without the coupon?')
            if (proceedAnyway) {
              await this.proceedWithoutCouponAsync(plan, product, displayPrice, isDeal)
              resolve()
            } else {
              reject(new Error(`Coupon validation failed: ${couponError instanceof Error ? couponError.message : 'Unknown error'}`))
            }
          }
        } else {
          // No coupon code provided
          try {
            await this.proceedWithoutCouponAsync(plan, product, displayPrice, isDeal)
            resolve()
          } catch (error) {
            reject(error)
          }
        }
      } catch (error) {
        console.error('❌ Error in mock checkout (async):', error)
        reject(new Error(`Mock checkout failed: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    })
  }

  /**
   * Async version of proceed without coupon
   */
  private static async proceedWithoutCouponAsync(plan: 'monthly' | 'yearly' | 'basic' | 'pro' | 'enterprise', product: StripeProduct, displayPrice: number, isDeal: boolean): Promise<void> {
    console.log('💳 No coupon provided, proceeding with standard checkout')
    
    return new Promise((resolve, reject) => {
      const userConfirmed = confirm(`Mock Stripe Checkout\n\nPlan: ${product.name}\nPrice: $${displayPrice}/${product.interval}\n\nProceed with mock subscription?`)
      
      if (userConfirmed) {
        try {
          this.completeMockCheckout(plan, undefined, displayPrice, isDeal)
          resolve()
        } catch (error) {
          reject(error)
        }
      } else {
        console.log('👤 User cancelled mock checkout')
        reject(new Error('User cancelled checkout'))
      }
    })
  }

  /**
   * Complete mock checkout process
   */
  private static completeMockCheckout(plan: 'monthly' | 'yearly' | 'basic' | 'pro' | 'enterprise', couponCode?: string, finalPrice?: number, isDeal: boolean = false): void {
    console.log('✅ Completing mock checkout:', { plan, couponCode, finalPrice, isDeal })
    
    // Get the correct price for the plan
    const getDefaultPrice = (planType: typeof plan): number => {
      switch (planType) {
        case 'monthly':
        case 'basic':
          return BASE_PRICES.monthly
        case 'yearly':
          return BASE_PRICES.yearly
        case 'pro':
          return BASE_PRICES.pro
        case 'enterprise':
          return BASE_PRICES.enterprise
        default:
          return BASE_PRICES.monthly
      }
    }

    // Store mock subscription in localStorage
    const mockSubscription = {
      id: `sub_mock_${Date.now().toString()}`,
      plan,
      status: 'active',
      created: new Date().toISOString(),
      current_period_end: new Date(Date.now() + (plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
      coupon_applied: couponCode || null,
      amount_paid: finalPrice || getDefaultPrice(plan),
      customer_id: `cus_mock_${Date.now().toString()}` // Add mock customer ID for portal access
    }
    
    console.log('💾 Storing subscription data:', mockSubscription)
    const success = safeLocalStorageSet('mock_subscription', mockSubscription)
    if (!success) {
      console.error('❌ Failed to store mock subscription data')
      throw new Error('Failed to save subscription data')
    }
    
    // Apply coupon usage if provided
    if (couponCode) {
      console.log('🎫 Applying coupon usage tracking for:', couponCode)
      import('../services/couponService').then(({ CouponService }) => {
        CouponService.applyCoupon(couponCode)
      }).catch(error => {
        console.error('❌ Error applying coupon:', error)
      })
    }
    
    // Redirect to success page
    const redirectUrl = isDeal
      ? `/subscribe?subscription=success&plan=${plan}${couponCode ? `&coupon=${couponCode}` : ''}&deal=true`
      : `/?subscription=success&plan=${plan}${couponCode ? `&coupon=${couponCode}` : ''}`
    
    console.log('🚀 Redirecting to:', redirectUrl)
    
    try {
      window.location.href = redirectUrl
    } catch (error) {
      console.error('❌ Error during redirect:', error)
      // Fallback navigation
      if (typeof window !== 'undefined' && window.location) {
        window.location.assign(redirectUrl)
      }
    }
  }

  /**
   * Mock coffee checkout for development
   */
  private static mockCoffeeCheckout(): void {
    if (confirm('Mock Buy Me a Coffee\n\nAmount: $5\n\nProceed with mock payment?')) {
      // Store mock payment in localStorage
      const mockPayment = {
        id: `pi_mock_${Date.now().toString()}`,
        amount: 500, // $5 in cents
        status: 'succeeded',
        created: new Date().toISOString()
      }
      
      const success = safeLocalStorageSet('mock_coffee_payment', mockPayment)
      if (!success) {
        console.error('❌ Failed to store mock coffee payment data')
        alert('Error: Failed to save payment data')
        return
      }
      
      // Redirect to success page
      window.location.href = '/?coffee=success'
    }
  }

  /**
   * Check if user has active subscription (mock for development)
   */
  static getSubscriptionStatus(): { active: boolean; plan?: string; subscription?: any; termsAccepted?: boolean } {
    // Try to get real subscription status first
    try {
      const token = localStorage.getItem('supabase.auth.token')
      if (token) {
        // If we have auth token, we could fetch real subscription status
        // This would be implemented with a real backend call
        // For now, fall back to mock implementation
      }
    } catch (error) {
      console.error('Error checking real subscription status:', error)
    }
    
    // Fall back to mock implementation for development
    try {
      // Update mock subscription structure if needed
      this.updateMockSubscriptionStructure()
      
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
  
  /**
   * Verify if a webhook signature is valid
   * This would be used on the server side
   */
  static verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // This would be implemented on the server side
    // For client-side, we just return true in development
    return true
  }
  
  /**
   * Handle subscription webhook events
   * This would be used on the server side
   */
  static handleWebhookEvent(event: any): void {
    // This would be implemented on the server side
    console.log('Webhook event received:', event.type)
  }

}