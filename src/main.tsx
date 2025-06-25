import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { setupGlobalErrorHandlers } from './utils/errorLogger'
import { setupMockApi } from './setupMockApi'

// Lazy initialize services
const initializeServices = async () => {
  try {
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