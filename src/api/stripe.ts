/**
 * Stripe API client for server-side operations
 * 
 * This file contains functions for interacting with the Stripe API
 * via our Supabase Edge Functions.
 */

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(
  priceId: string,
  couponCode?: string,
  customerEmail?: string,
  metadata?: Record<string, string>
) {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        couponCode,
        customerEmail,
        successUrl: `${window.location.origin}/success?plan=${priceId}`,
        cancelUrl: `${window.location.origin}/cancel`,
        metadata: {
          ...metadata,
          source: 'web_checkout',
          version: '1.0.0'
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Create a customer portal session
 */
export async function createCustomerPortalSession(customerId: string) {
  try {
    const response = await fetch('/api/customer-portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: customerId,
        return_url: `${window.location.origin}/app/settings`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create customer portal session');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    throw error;
  }
}

/**
 * Get subscription status from Supabase
 */
export async function getSubscriptionStatus() {
  try {
    // This would normally fetch from Supabase
    // For now, we'll use the mock implementation from stripeService
    const { StripeService } = await import('../services/stripeService');
    return StripeService.getSubscriptionStatus();
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return { active: false };
  }
}

/**
 * Apply coupon to subscription
 */
export async function applyCoupon(subscriptionId: string, couponId: string) {
  try {
    const response = await fetch('/api/apply-coupon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription_id: subscriptionId,
        coupon_id: couponId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to apply coupon');
    }

    return await response.json();
  } catch (error) {
    console.error('Error applying coupon:', error);
    throw error;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  try {
    const response = await fetch('/api/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription_id: subscriptionId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to cancel subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}