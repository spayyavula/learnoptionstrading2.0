import { runSubscriptionTests, runE2ETests } from './api/testRunner';

/**
 * Sets up mock API endpoints for development mode
 */
export function setupMockApi() {
  // Create a mock fetch handler
  const originalFetch = window.fetch;
  
  window.fetch = async function(input, init) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    
    console.log('🌐 Fetch intercepted:', { url, method: init?.method })
    
    // Mock API endpoints
    if (url === '/api/run-subscription-tests' && init?.method === 'POST') {
      try {
        console.log('🧪 Running subscription tests...')
        const results = await runSubscriptionTests();
        console.log('✅ Subscription tests completed:', results)
        
        const response = new Response(JSON.stringify(results), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
        return response;
      } catch (error) {
        console.error('❌ Error running subscription tests:', error)
        const errorResponse = new Response(JSON.stringify({ 
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
        
        return errorResponse;
      }
    }
    
    if (url === '/api/run-e2e-tests' && init?.method === 'POST') {
      try {
        console.log('🧪 Running E2E tests...')
        const results = await runE2ETests();
        console.log('✅ E2E tests completed:', results)
        
        const response = new Response(JSON.stringify(results), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
        return response;
      } catch (error) {
        console.error('❌ Error running E2E tests:', error)
        const errorResponse = new Response(JSON.stringify({ 
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
        
        return errorResponse;
      }
    }
    
    // Log all other requests that might be causing issues
    if (url.includes('/api/')) {
      console.log('🚨 Unmocked API call detected:', { url, method: init?.method })
      
      // Return a 404 for unmocked API calls to help debug
      return new Response(JSON.stringify({ 
        error: 'API endpoint not implemented in development mode',
        url: url,
        method: init?.method || 'GET'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Pass through to original fetch for all other requests
    console.log('➡️ Passing through to original fetch for:', url)
    return originalFetch(input, init);
  };
  
  console.log('✅ Mock API endpoints set up for development mode');
}