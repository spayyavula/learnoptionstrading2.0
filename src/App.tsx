import React, { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
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
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'))
const PricingPage = lazy(() => import('./pages/PricingPage'))
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
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/construction" element={<Construction />} />
                  <Route path="/demo" element={<Demo />} />
                  <Route path="/agent" element={<AgentDashboard />} />
                  <Route path="/subscribe" element={<SubscriptionPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/success" element={<Success />} /> {/* Add Success route */}
                  <Route path="/cancel" element={<CancelPage />} />
                  {/* Standalone trading route for direct access */}
                  <Route path="/trading" element={
                    <Layout>
                      <OptionsTrading />
                    </Layout>
                  } />
                  <Route path="/app" element={
                    <Layout>
                      <Dashboard />
                    </Layout>
                  } />
                  <Route path="/app/*" element={
                    <Layout>
                      <Routes>
                        <Route path="/portfolio" element={<OptionsPortfolio />} />
                        <Route path="/trading" element={<OptionsTrading />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/watchlist" element={<OptionsChain />} />
                        <Route path="/regime" element={<RegimeAnalysis />} />
                        <Route path="/arbitrage" element={<OptionsArbitrage />} />
                        <Route path="/learning" element={<OptionsLearning />} />
                        <Route path="/journal" element={<TradingJournal />} />
                        <Route path="/strategies" element={<OptionsStrategies />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/community" element={<Community />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                        <Route path="/data-manager" element={<OptionsDataManager />} />
                        <Route path="/profile" element={<UserProfile />} />
                      </Routes>
                    </Layout>
                  } />
                </Routes>
              </Suspense>
            </OptionsDataProvider>
          </OptionsProvider>
        </ErrorBoundary>
      </Elements>
    </TradingProvider>
  )
}

export default App