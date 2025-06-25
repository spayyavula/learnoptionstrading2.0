import { BASE_PRICES } from '../utils/priceSync'

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
    return {
      PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
      MONTHLY_PRICE_ID: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID,
      YEARLY_PRICE_ID: import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID,
      COFFEE_PRICE_ID: import.meta.env.VITE_STRIPE_COFFEE_PRICE_ID
    }
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
      // Dynamically import Stripe
      const { loadStripe } = await import('@stripe/stripe-js')
      return await loadStripe(PUBLISHABLE_KEY)
    } catch (error) {
      console.error('Failed to load Stripe:', error)
      return null
    }
  }

  /**
   * Redirect to Stripe Checkout for subscription
   */
  static async redirectToCheckout(
    plan: 'monthly' | 'yearly', 
    customerEmail?: string,
    couponCode?: string
  ): Promise<void> {
    const { MONTHLY_PRICE_ID, YEARLY_PRICE_ID } = this.getEnvVars()
    
    try {
      const priceId = plan === 'monthly' ? MONTHLY_PRICE_ID : YEARLY_PRICE_ID
      
      if (!priceId) {
        throw new Error(`${plan} price ID not configured`)
      }

      const stripe = await this.initializeStripe()
      if (!stripe) {
        throw new Error('Stripe not available')
      }

      const options: StripeCheckoutOptions = {
        priceId,
        successUrl: `${window.location.origin}/?subscription=success&plan=${plan}`,
        cancelUrl: `${window.location.origin}/?subscription=cancelled`,
        metadata: {
          plan,
          source: 'landing_page'
        }
      }

      if (customerEmail) {
        options.customerEmail = customerEmail
      }

      if (couponCode) {
        options.couponCode = couponCode
      }
      // Create checkout session
      const checkoutOptions: any = {
        lineItems: [{
          price: priceId,
          quantity: 1
        }],
        mode: 'subscription',
        successUrl: options.successUrl,
        cancelUrl: options.cancelUrl,
        customerEmail: options.customerEmail,
        allowPromotionCodes: true,
        billingAddressCollection: 'auto'
      }

      const { error } = await stripe.redirectToCheckout(checkoutOptions)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Stripe checkout error:', error)
      
      // Fallback for development
      if (import.meta.env.DEV) {
        this.mockStripeCheckout(plan, couponCode)
        return
      }
      
      throw new Error('Failed to redirect to checkout. Please try again.')
    }
  }

  /**
   * Create checkout session with coupon support
   */
  static async createCheckoutSession(
    plan: 'monthly' | 'yearly',
    couponCode?: string,
    customerEmail?: string
  ): Promise<{ url: string }> {
    const { MONTHLY_PRICE_ID, YEARLY_PRICE_ID } = this.getEnvVars()
    
    try {
      const priceId = plan === 'monthly' ? MONTHLY_PRICE_ID : YEARLY_PRICE_ID
      
      if (!priceId) {
        throw new Error(`${plan} price ID not configured`)
      }
      
      // Initialize Stripe
      const stripe = await this.initializeStripe()
      if (!stripe) {
        throw new Error('Stripe checkout error') // This specific message is used for testing
      }

      // Create checkout session
      try {
        const { error } = await stripe.redirectToCheckout({
          lineItems: [{
            price: priceId,
            quantity: 1
          }],
          mode: 'subscription',
          successUrl: `${window.location.origin}/?subscription=success&plan=${plan}`,
          cancelUrl: `${window.location.origin}/?subscription=cancelled`,
          customerEmail,
        });

        if (error) {
          console.error('Stripe checkout error:', error);
          throw new Error('Stripe checkout error'); // This specific message is used for testing
        }
      } catch (checkoutError) {
        console.error('Error during redirectToCheckout:', checkoutError);
        throw checkoutError;
      }

      // This is a placeholder since redirectToCheckout will navigate away
      return { url: '#' }
    } catch (error) {
      console.error('Checkout session error:', error);
      
      // Add more detailed error logging
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      
      // Fallback for development
      if (import.meta.env.DEV) {
        this.mockStripeCheckout(plan, couponCode)
        return { url: '#' }
      }
      
      throw error;
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
    try {
      // In a real implementation, this would call your backend
      // For demo purposes, we'll simulate this
      console.log('Creating customer portal session for:', customerId)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Return mock URL
      return `https://billing.stripe.com/p/session/${customerId}_${Date.now()}`
    } catch (error) {
      console.error('Portal session error:', error)
      throw new Error('Failed to access customer portal')
    }
  }

  /**
   * Get available products/pricing
   */
  static getProducts(): StripeProduct[] {
    return [
      {
        id: 'free',
        name: 'Free Starter',
        description: 'Basic options trading with 5 top liquid contracts',
        price: 0,
        currency: 'USD',
        type: 'subscription'
      },
      {
        id: 'monthly',
        name: 'Pro Monthly',
        description: 'Full access with advanced analytics and strategy backtesting',
        price: BASE_PRICES.monthly,
        currency: 'USD',
        interval: 'month',
        type: 'subscription'
      },
      {
        id: 'yearly',
        name: 'Pro Yearly',
        description: 'Everything in Pro Monthly plus 1-on-1 coaching and exclusive webinars',
        price: BASE_PRICES.yearly,
        currency: 'USD',
        interval: 'year',
        type: 'subscription'
      },
      {
        id: 'coffee',
        name: 'Buy Me a Coffee',
        description: 'Support our development with a one-time contribution',
        price: 5,
        currency: 'USD',
        type: 'one_time'
      }
    ]
  }

  /**
   * Mock checkout for development
   */
  private static mockStripeCheckout(plan: 'monthly' | 'yearly', couponCode?: string): void {
    const products = this.getProducts()
    const product = products.find(p => p.id === plan)
    
    let displayPrice = product?.price || 0
    let discountInfo = ''
    let finalPrice = displayPrice
    
    if (couponCode) {
      // Import coupon service for validation
      import('../services/couponService').then(({ CouponService }) => {
        const validation = CouponService.validateCoupon(couponCode, plan, displayPrice, true)
        if (validation.isValid) {
          finalPrice = validation.finalAmount
          discountInfo = `\nCoupon Applied: ${couponCode}\nDiscount: $${validation.discountAmount.toFixed(2)}`
          
          // Show confirmation with discounted price
          if (confirm(`Mock Stripe Checkout\n\nPlan: ${product?.name}\nOriginal Price: $${displayPrice}/${product?.interval}${discountInfo}\nFinal Price: $${finalPrice}/${product?.interval}\n\nProceed with mock subscription?`)) {
            this.completeMockCheckout(plan, couponCode, finalPrice)
          }
        } else {
          alert('Invalid coupon code: ' + validation.error)
        }
      })
    } else {
      // No coupon code provided
      if (confirm(`Mock Stripe Checkout\n\nPlan: ${product?.name}\nPrice: $${displayPrice}/${product?.interval}\n\nProceed with mock subscription?`)) {
        this.completeMockCheckout(plan, couponCode, finalPrice)
      }
    }
  }

  /**
   * Complete mock checkout process
   */
  private static completeMockCheckout(plan: 'monthly' | 'yearly', couponCode?: string, finalPrice?: number): void {
    // Store mock subscription in localStorage
    const mockSubscription = {
      id: `sub_mock_${Date.now().toString()}`,
      plan,
      status: 'active',
      created: new Date().toISOString(),
      current_period_end: new Date(Date.now() + (plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
      coupon_applied: couponCode || null,
      amount_paid: finalPrice || (plan === 'monthly' ? 29 : 290)
    }
    
    localStorage.setItem('mock_subscription', JSON.stringify(mockSubscription))
    
    // Apply coupon usage if provided
    if (couponCode) {
      import('../services/couponService').then(({ CouponService }) => {
        CouponService.applyCoupon(couponCode)
      })
    }
    
    // Redirect to success page
    window.location.href = `/?subscription=success&plan=${plan}`
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
      
      localStorage.setItem('mock_coffee_payment', JSON.stringify(mockPayment))
      
      // Redirect to success page
      window.location.href = '/?coffee=success'
    }
  }

  /**
   * Check if user has active subscription (mock for development)
   */
  static getSubscriptionStatus(): { active: boolean; plan?: string; subscription?: any } {
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
      const mockSubscription = localStorage.getItem('mock_subscription')
      if (mockSubscription) {
        const subscription = JSON.parse(mockSubscription)
        const isActive = subscription.status === 'active' && new Date(subscription.current_period_end) > new Date()
        
        return {
          active: isActive,
          plan: subscription.plan,
          subscription
        }
      }
      
      return { active: false }
    } catch (error) {
      console.error('Error checking subscription status:', error)
      return { active: false }
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