import { StripeService } from '../services/stripeService'
import { JsonDebugger } from './jsonDebugger'

interface DiagnosticResult {
  category: string
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: any
}

/**
 * Diagnostic utility to help identify subscription and JSON parsing issues
 */
export class DiagnosticTool {
  private static results: DiagnosticResult[] = []

  /**
   * Run all diagnostic checks
   */
  static async runDiagnostics(): Promise<DiagnosticResult[]> {
    this.results = []
    
    console.log('🔍 Running diagnostic checks...')
    
    // Environment checks
    this.checkEnvironmentVariables()
    
    // Browser compatibility
    this.checkBrowserCompatibility()
    
    // LocalStorage
    this.checkLocalStorage()
    
    // Network connectivity
    await this.checkNetworkConnectivity()
    
    // Service availability
    await this.checkServices()
    
    console.log('✅ Diagnostic checks complete:', this.results)
    return this.results
  }

  /**
   * Check environment variables
   */
  private static checkEnvironmentVariables(): void {
    const requiredEnvVars = [
      { key: 'VITE_STRIPE_PUBLISHABLE_KEY', name: 'Stripe Publishable Key' },
      { key: 'VITE_CONSTANT_CONTACT_API_KEY', name: 'Constant Contact API Key' },
      { key: 'VITE_CONSTANT_CONTACT_ACCESS_TOKEN', name: 'Constant Contact Access Token' }
    ]

    for (const envVar of requiredEnvVars) {
      const value = import.meta.env[envVar.key]
      
      if (!value) {
        this.addResult('Environment', envVar.name, 'fail', `${envVar.key} is not set`)
      } else if (value.length < 10) {
        this.addResult('Environment', envVar.name, 'warning', `${envVar.key} seems too short`)
      } else {
        this.addResult('Environment', envVar.name, 'pass', `${envVar.key} is configured`)
      }
    }
  }

  /**
   * Check browser compatibility
   */
  private static checkBrowserCompatibility(): void {
    // Check for required APIs
    const requiredAPIs = [
      { name: 'localStorage', check: () => typeof Storage !== 'undefined' },
      { name: 'fetch', check: () => typeof fetch !== 'undefined' },
      { name: 'Promise', check: () => typeof Promise !== 'undefined' },
      { name: 'URLSearchParams', check: () => typeof URLSearchParams !== 'undefined' }
    ]

    for (const api of requiredAPIs) {
      if (api.check()) {
        this.addResult('Browser', api.name, 'pass', `${api.name} is supported`)
      } else {
        this.addResult('Browser', api.name, 'fail', `${api.name} is not supported`)
      }
    }
  }

  /**
   * Check localStorage functionality
   */
  private static checkLocalStorage(): void {
    try {
      const testKey = 'diagnostic_test'
      const testValue = { test: true, timestamp: Date.now() }
      
      // Test write
      localStorage.setItem(testKey, JSON.stringify(testValue))
      
      // Test read
      const retrieved = localStorage.getItem(testKey)
      if (!retrieved) {
        throw new Error('Failed to retrieve test data')
      }
      
      // Test parse
      const parsed = JSON.parse(retrieved)
      if (parsed.test !== true) {
        throw new Error('Data corruption detected')
      }
      
      // Cleanup
      localStorage.removeItem(testKey)
      
      this.addResult('Storage', 'localStorage', 'pass', 'localStorage is working correctly')
    } catch (error) {
      this.addResult('Storage', 'localStorage', 'fail', `localStorage error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Check network connectivity
   */
  private static async checkNetworkConnectivity(): Promise<void> {
    try {
      // Test basic connectivity
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
        timeout: 5000
      } as any)
      
      if (response.ok) {
        this.addResult('Network', 'Internet Connectivity', 'pass', 'Internet connection is working')
      } else {
        this.addResult('Network', 'Internet Connectivity', 'warning', `HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      this.addResult('Network', 'Internet Connectivity', 'fail', `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Check service availability
   */
  private static async checkServices(): Promise<void> {
    // Check Stripe
    try {
      const { loadStripe } = await import('@stripe/stripe-js')
      this.addResult('Services', 'Stripe SDK', 'pass', 'Stripe SDK loaded successfully')
    } catch (error) {
      this.addResult('Services', 'Stripe SDK', 'fail', `Stripe SDK error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Check JsonDebugger
    try {
      JsonDebugger.safeParse('{"test": true}', 'diagnostic')
      this.addResult('Services', 'JsonDebugger', 'pass', 'JsonDebugger is working')
    } catch (error) {
      this.addResult('Services', 'JsonDebugger', 'fail', `JsonDebugger error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Add a diagnostic result
   */
  private static addResult(category: string, name: string, status: 'pass' | 'fail' | 'warning', message: string, details?: any): void {
    this.results.push({
      category,
      name,
      status,
      message,
      details
    })
  }

  /**
   * Get results summary
   */
  static getSummary(): { total: number; passed: number; failed: number; warnings: number } {
    return {
      total: this.results.length,
      passed: this.results.filter(r => r.status === 'pass').length,
      failed: this.results.filter(r => r.status === 'fail').length,
      warnings: this.results.filter(r => r.status === 'warning').length
    }
  }

  /**
   * Export results as JSON
   */
  static exportResults(): string {
    return JsonDebugger.safeStringify({
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: this.getSummary(),
      environment: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        mode: import.meta.env.MODE
      }
    }, 'diagnostic-export') || '{}'
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
