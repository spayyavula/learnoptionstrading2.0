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

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

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

      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Create checkout session on the server
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

      const session = await response.json();
      
      if (!session || !session.id) {
        throw new Error('Failed to create checkout session');
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