import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { setupGlobalErrorHandlers } from './utils/errorLogger'
import { setupMockApi } from './setupMockApi'
import { JsonDebugger } from './utils/jsonDebugger'
import { DiagnosticTool } from './utils/diagnosticTool'

// Lazy initialize services
const initializeServices = async () => {
  try {
    // 🔍 Enhanced debugging for environment and JSON issues
    console.log('🚀 Initializing services...')
    console.log('Environment check:', {
      DEV: import.meta.env.DEV,
      MODE: import.meta.env.MODE,
      STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? '✅ Present' : '❌ Missing',
      SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? '✅ Present' : '❌ Missing',
      SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing'
    })
    
    // Initialize JSON debugger
    JsonDebugger.clearLog()
    console.log('🔧 JSON Debugger initialized')
    
    // DiagnosticTool will auto-initialize when imported
    console.log('🔧 DiagnosticTool imported and ready')
    
    // Setup global error handler for debugging
    window.addEventListener('error', (event) => {
      console.error('🚨 Global error caught:', event.error)
      if (event.error?.message?.includes('JSON') || event.error?.message?.includes('Unexpected end of JSON input')) {
        console.error('🚨 JSON-related error detected:', {
          message: event.error.message,
          stack: event.error.stack,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        })
        
        // Additional debugging for JSON errors
        console.error('💡 Common causes of JSON errors:')
        console.error('  - Empty or malformed API responses')
        console.error('  - Network timeouts or connectivity issues') 
        console.error('  - Corrupted localStorage data')
        console.error('  - Invalid Stripe API responses')
        
        // Try to identify the source
        if (event.filename?.includes('stripe')) {
          console.error('🔍 Stripe-related JSON error detected')
        }
        
        // Prevent error from crashing the app
        event.preventDefault()
      }
    })
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled promise rejection:', event.reason)
      if (event.reason?.message?.includes('JSON') || event.reason?.message?.includes('Unexpected end of JSON input')) {
        console.error('🚨 JSON-related promise rejection:', event.reason)
        console.error('💡 This might be related to network requests or data parsing')
        
        // Prevent unhandled rejection from crashing the app
        event.preventDefault()
      }
    })
    
    // Setup mock API in development
    if (import.meta.env.DEV) {
      setupMockApi()
    }
    
    // Import services dynamically
    const { OptionsDataScheduler } = await import('./services/optionsDataScheduler')
    const { LearningService } = await import('./services/learningService')
    const { CommunityService } = await import('./services/communityService')
    
    // Initialize the options data scheduler
    const scheduler = OptionsDataScheduler.getInstance()
    scheduler.start()
    
    // Initialize learning data
    LearningService.initializeDefaultData()
    
    // Initialize community data
    CommunityService.initializeData()
    
    console.log('Services initialized successfully')
  } catch (error) {
    console.error('Error initializing services:', error)
  }
  setupGlobalErrorHandlers();
}

// Initialize services before rendering
initializeServices().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  )
})