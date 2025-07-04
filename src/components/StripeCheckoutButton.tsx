import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { ShieldCheck, CreditCard, AlertTriangle } from 'lucide-react';

interface StripeCheckoutButtonProps {
  priceId: string;
  buttonText?: string;
  className?: string;
  planName?: string;
  couponCode?: string;
  onError?: (error: Error) => void;
  onCheckoutStarted?: () => void;
}

// Only initialize Stripe if we have a valid publishable key
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = publishableKey ? loadStripe(publishableKey) : Promise.resolve(null);

const StripeCheckoutButton: React.FC<StripeCheckoutButtonProps> = ({
  priceId,
  buttonText = 'Subscribe Now',
  className = '',
  planName = 'subscription',
  couponCode,
  onError,
  onCheckoutStarted
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (onCheckoutStarted) {
        onCheckoutStarted();
      }

      // Check if we're in development mode or Stripe is not available
      console.log('🔧 StripeCheckoutButton Debug:', {
        DEV: import.meta.env.DEV,
        publishableKey: publishableKey || '(empty)',
        condition: (import.meta.env.DEV || !publishableKey),
        planName,
        priceId,
        couponCode
      });
      
      if (import.meta.env.DEV || !publishableKey) {
        console.log('🧪 StripeCheckoutButton: Using mock checkout in development mode');
        
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          // Use StripeService for consistent mock checkout
          const { StripeService } = await import('../services/stripeService');
          
          // Determine plan type from priceId or planName
          let plan: 'monthly' | 'yearly' | 'pro' | 'enterprise' = 'monthly';
          if (planName?.toLowerCase().includes('yearly')) plan = 'yearly';
          else if (planName?.toLowerCase().includes('pro')) plan = 'pro';
          else if (planName?.toLowerCase().includes('enterprise')) plan = 'enterprise';
          
          console.log('🧪 StripeCheckoutButton: Calling StripeService.redirectToCheckout with plan:', plan);
          await StripeService.redirectToCheckout(plan, undefined, couponCode, false);
          console.log('🧪 StripeCheckoutButton: Mock checkout completed successfully');
          return;
        } catch (mockError) {
          console.error('❌ StripeCheckoutButton: Mock checkout failed:', mockError);
          throw new Error(`Mock checkout failed: ${mockError instanceof Error ? mockError.message : 'Unknown error'}`);
        }
      }

      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe not available - please refresh and try again');
      }

      // Create checkout session on the server (this would need a backend)
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          couponCode,
          successUrl: `${window.location.origin}/success?plan=${planName}`,
          cancelUrl: `${window.location.origin}/cancel`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session - server error');
      }

      const session = await response.json();
      
      if (!session || !session.id) {
        throw new Error('Invalid checkout session response');
      }

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (err) {
      console.error('Error starting checkout:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      
      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            {buttonText}
          </>
        )}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
        <ShieldCheck className="h-4 w-4 mr-1 text-gray-400" />
        <span>Secure payment powered by Stripe</span>
      </div>
    </div>
  );
};

export default StripeCheckoutButton;