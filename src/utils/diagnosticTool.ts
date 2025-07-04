import { StripeService } from '../services/stripeService'
import { JsonDebugger } from './jsonDebugger'

/**
 * Diagnostic utility to help identify subscription and JSON parsing issues
 */
export class DiagnosticTool {
  /**
   * Run comprehensive diagnostics
   */
  static async runDiagnostics() {
    console.log('🔍 Running Subscription Diagnostics...')
    console.log('═'.repeat(60))
    
    // 1. Environment Variables Check
    console.log('📋 1. Environment Variables:')
    const envCheck = {
      NODE_ENV: import.meta.env.MODE,
      DEV_MODE: import.meta.env.DEV,
      STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? '✅ Present' : '❌ Missing',
      STRIPE_SECRET_KEY: import.meta.env.VITE_STRIPE_SECRET_KEY ? '✅ Present' : '❌ Missing',
      MONTHLY_PRICE_ID: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID || '❌ Missing',
      YEARLY_PRICE_ID: import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID || '❌ Missing',
      PRO_PRICE_ID: import.meta.env.VITE_STRIPE_PRICE_ID_PRO || '❌ Missing',
      ENTERPRISE_PRICE_ID: import.meta.env.VITE_STRIPE_PRICE_ID_ENTERPRISE || '❌ Missing',
      COFFEE_PRICE_ID: import.meta.env.VITE_STRIPE_COFFEE_PRICE_ID || '❌ Missing',
      SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? '✅ Present' : '❌ Missing',
      SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing'
    }
    console.table(envCheck)
    
    // 2. localStorage Health Check
    console.log('💾 2. LocalStorage Health Check:')
    try {
      const testKey = 'diagnostic_test'
      const testData = { test: true, timestamp: Date.now() }
      
      // Test write
      localStorage.setItem(testKey, JSON.stringify(testData))
      console.log('✅ localStorage write: OK')
      
      // Test read
      const retrieved = JSON.parse(localStorage.getItem(testKey) || '{}')
      console.log('✅ localStorage read: OK')
      
      // Test cleanup
      localStorage.removeItem(testKey)
      console.log('✅ localStorage cleanup: OK')
      
      // Check existing subscription data
      const mockSub = localStorage.getItem('mock_subscription')
      if (mockSub) {
        try {
          const parsed = JSON.parse(mockSub)
          console.log('✅ Mock subscription data: Valid JSON')
          console.log('📊 Subscription details:', {
            id: parsed.id,
            plan: parsed.plan,
            status: parsed.status,
            hasCustomerId: !!parsed.customer_id
          })
        } catch (error) {
          console.error('❌ Mock subscription data: Corrupted JSON')
          console.error('Raw data:', mockSub)
        }
      } else {
        console.log('ℹ️ No mock subscription data found')
      }
      
    } catch (error) {
      console.error('❌ localStorage error:', error)
    }
    
    // 3. Stripe Integration Test
    console.log('💳 3. Stripe Integration Test:')
    try {
      const stripe = await StripeService.initializeStripe()
      if (stripe) {
        console.log('✅ Stripe.js loaded successfully')
      } else {
        console.log('⚠️ Stripe.js not loaded (expected in dev mode)')
      }
    } catch (error) {
      console.error('❌ Stripe initialization error:', error)
    }
    
    // 4. Network Connectivity Test
    console.log('🌐 4. Network Connectivity Test:')
    try {
      // Test basic connectivity
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch('https://api.stripe.com/v1', {
        method: 'HEAD',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      console.log(`✅ Stripe API reachable (${response.status})`)
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('❌ Network timeout - connection too slow')
        } else {
          console.error('❌ Network error:', error.message)
        }
      }
    }
    
    // 5. JSON Debugger Report
    console.log('🔍 5. JSON Debugger Report:')
    JsonDebugger.exportLog()
    
    console.log('═'.repeat(60))
    console.log('🎯 Diagnostics Complete!')
    console.log('💡 If you see any ❌ errors above, those need to be fixed.')
    console.log('📋 Copy the entire output and share it for further debugging.')
  }
  
  /**
   * Test subscription flow without actual payment
   */
  static async testSubscriptionFlow(plan: 'monthly' | 'yearly' | 'pro' | 'enterprise' = 'monthly') {
    console.log(`🧪 Testing ${plan} subscription flow...`)
    
    try {
      // This will trigger the mock flow in development
      await StripeService.redirectToCheckout(plan, 'test@example.com', undefined, false)
      console.log('✅ Subscription flow test completed')
    } catch (error) {
      console.error('❌ Subscription flow test failed:', error)
    }
  }
  
  /**
   * Clear all subscription data for clean testing
   */
  static clearAllSubscriptionData() {
    console.log('🧹 Clearing all subscription data...')
    
    const keysToRemove = [
      'mock_subscription',
      'mock_coffee_payment',
      'terms_accepted',
      'coupon_usage'
    ]
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key)
        console.log(`✅ Cleared ${key}`)
      } catch (error) {
        console.error(`❌ Failed to clear ${key}:`, error)
      }
    })
    
    console.log('🎯 Subscription data cleared. You can now test fresh flows.')
  }
}

// Make available globally for easy debugging
if (typeof window !== 'undefined') {
  (window as any).DiagnosticTool = DiagnosticTool
  console.log('🔧 DiagnosticTool available globally.')
  console.log('📝 Usage:')
  console.log('  DiagnosticTool.runDiagnostics() - Full system check')
  console.log('  DiagnosticTool.testSubscriptionFlow() - Test subscription')
  console.log('  DiagnosticTool.clearAllSubscriptionData() - Reset data')
}

// Auto-initialize when imported
console.log('🔧 DiagnosticTool loaded and ready')
