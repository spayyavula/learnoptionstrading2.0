import React, { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import SeoHelmet from './components/SeoHelmet'
import ErrorBoundary from './components/ErrorBoundary'
import Disclaimer from './components/Disclaimer'
import ErrorDisplay from './components/ErrorDisplay'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import { OptionsProvider } from './context/OptionsContext'
import { TradingProvider } from './context/TradingContext'
import { OptionsDataProvider } from './context/OptionsDataContext'

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
                      <Route path="/data-manager" element={<OptionsDataManager />} />
                    </Routes>
                  </Layout>
                } />
              </Routes>
            </Suspense>
          </OptionsDataProvider>
        </OptionsProvider>
      </ErrorBoundary>
    </TradingProvider>
  )
}

export default App