import React from 'react';

const StripeDebug: React.FC = () => {
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  const monthlyPriceId = import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID;
  
  return (
    <div className="bg-yellow-100 border border-yellow-400 p-4 m-4 rounded">
      <h3 className="font-bold text-yellow-800">🐛 Stripe Debug Info (Development Only)</h3>
      <div className="mt-2 text-sm">
        <p><strong>Stripe Key:</strong> {stripeKey || '(empty - GOOD for dev mode)'}</p>
        <p><strong>Monthly Price ID:</strong> {monthlyPriceId || '(empty - GOOD for dev mode)'}</p>
        <p><strong>Expected Behavior:</strong> {!stripeKey ? '✅ Mock checkout should work' : '❌ Will try real Stripe'}</p>
        <p className="mt-2 text-yellow-700">
          {!stripeKey 
            ? '✅ Environment is correctly configured for mock checkout!' 
            : '⚠️ Stripe keys detected - may attempt real checkout instead of mock!'
          }
        </p>
      </div>
    </div>
  );
};

export default StripeDebug;
