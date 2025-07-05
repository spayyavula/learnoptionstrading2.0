import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import SeoHelmet from './components/SeoHelmet'
import ErrorBoundary from './components/ErrorBoundary'
import Disclaimer from './components/Disclaimer'
import ErrorDisplay from './components/ErrorDisplay'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import AdminRoute from './components/AdminRoute'
import { OptionsProvider } from './context/OptionsContext'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { TradingProvider } from './context/TradingContext'
import { OptionsDataProvider } from './context/OptionsDataContext'
import PricingPage from './pages/PricingPage'
import SubscriptionPage from './pages/SubscriptionPage'
import Success from './pages/Success'
import AppLayout from './components/AppLayout'

// Initialize Stripe conditionally - only if publishable key is available
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
const stripePromise = publishableKey ? loadStripe(publishableKey) : Promise.resolve(null)

// Log Stripe initialization status
if (import.meta.env.DEV) {
  if (publishableKey) {
    console.log('🔧 Stripe initialized globally with key:', publishableKey.substring(0, 8) + '...')
  } else {
    console.log('🔧 Stripe NOT initialized - no publishable key (using mock mode)')
  }
}

// Lazy load page components
const Dashboard = lazy(() => import('./pages/Dashboard'))
const AgentDashboard = lazy(() => import('./pages/AgentDashboard'))
const Demo = lazy(() => import('./pages/Demo'))
const OptionsPortfolio = lazy(() => import('./pages/OptionsPortfolio'))
const OptionsTrading = lazy(() => import('./pages/OptionsTrading'))
const Orders = lazy(() => import('./pages/Orders'))
const OptionsChain = lazy(() => import('./pages/OptionsChain'))
const RegimeAnalysis = lazy(() => import('./pages/RegimeAnalysis'))
const Analytics = lazy(() => import('./pages/Analytics'))
const OptionsArbitrage = lazy(() => import('./pages/OptionsArbitrage'))
const OptionsLearning = lazy(() => import('./pages/OptionsLearning'))
const TradingJournal = lazy(() => import('./pages/TradingJournal'))
const OptionsStrategies = lazy(() => import('./pages/OptionsStrategies'))
const Community = lazy(() => import('./pages/Community'))
const Settings = lazy(() => import('./pages/Settings'))
const OptionsDataManager = lazy(() => import('./pages/OptionsDataManager'))
const Construction = lazy(() => import('./pages/Construction'))
const SubscriptionPageLazy = lazy(() => import('./pages/SubscriptionPage'))
const PricingPageLazy = lazy(() => import('./pages/PricingPage'))
const SuccessPage = lazy(() => import('./pages/SuccessPage'))
const CancelPage = lazy(() => import('./pages/CancelPage'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const UserProfile = lazy(() => import('./pages/UserProfile'))
const Success = lazy(() => import('./pages/Success')) // Import Success page

// Loading component for Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
)
function App() {
  return (
    <TradingProvider>
      <Elements stripe={stripePromise}>
        <ErrorBoundary>
          <SeoHelmet />
          <Disclaimer variant="banner" />
          {import.meta.env.DEV && <ErrorDisplay />}
          <OptionsProvider>
            <OptionsDataProvider>
              <Router>
                <div className="App">
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Landing />} />
                      <Route path="/pricing" element={<PricingPage />} />
                      <Route path="/subscription" element={<SubscriptionPage />} />
                      <Route path="/success" element={<Success />} />
                      
                      {/* App Routes */}
                      <Route path="/app" element={<AppLayout />}>
                        {/* Add your app sub-routes here */}
                      </Route>
                      
                      {/* Catch-all redirect */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </div>
              </Router>
            </OptionsDataProvider>
          </OptionsProvider>
        </ErrorBoundary>
      </Elements>
    </TradingProvider>
  )
}

export default App