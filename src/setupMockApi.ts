import { runSubscriptionTests, runE2ETests } from './api/testRunner';

/**
 * Sets up mock API endpoints for development mode
 */
export function setupMockApi() {
  // Create a mock fetch handler
  const originalFetch = window.fetch;
  
  window.fetch = async function(input, init) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    
    // Mock API endpoints
    if (url === '/api/run-subscription-tests' && init?.method === 'POST') {
      try {
        const results = await runSubscriptionTests();
        return new Response(JSON.stringify(results), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    if (url === '/api/run-e2e-tests' && init?.method === 'POST') {
      try {
        const results = await runE2ETests();
        return new Response(JSON.stringify(results), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Pass through to original fetch for all other requests
    return originalFetch(input, init);
  };
  
  console.log('Mock API endpoints set up for development mode');
}