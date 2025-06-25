/**
 * Price Synchronization Utility
 * 
 * This utility ensures consistent pricing across the application,
 * particularly between the Landing page and Subscription page.
 */

// Base prices for all subscription plans
export const BASE_PRICES = {
  monthly: 29,
  yearly: 290,
  enterprise: 199
};

// Calculate yearly savings percentage
export const YEARLY_SAVINGS_PERCENT = Math.round(
  ((BASE_PRICES.monthly * 12 - BASE_PRICES.yearly) / (BASE_PRICES.monthly * 12)) * 100
);

/**
 * Get the formatted price for display
 * @param price - The price to format
 * @param currency - The currency to use (default: USD)
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: price % 1 === 0 ? 0 : 2
  }).format(price);
}

/**
 * Calculate discounted price
 * @param basePrice - The original price
 * @param discountPercent - The discount percentage
 * @returns The discounted price
 */
export function calculateDiscountedPrice(basePrice: number, discountPercent: number): number {
  return basePrice * (1 - discountPercent / 100);
}

/**
 * Format discount percentage for display
 * @param percent - The discount percentage
 * @returns Formatted discount string
 */
export function formatDiscount(percent: number): string {
  return `${percent}% OFF`;
}

/**
 * Get savings amount between original and discounted price
 * @param originalPrice - The original price
 * @param discountedPrice - The discounted price
 * @returns The savings amount
 */
export function getSavingsAmount(originalPrice: number, discountedPrice: number): number {
  return originalPrice - discountedPrice;
}

/**
 * Get plan details including pricing information
 * @param planId - The plan ID ('monthly', 'yearly', or 'enterprise')
 * @returns Plan details object
 */
export function getPlanDetails(planId: 'monthly' | 'yearly' | 'enterprise') {
  const basePrice = BASE_PRICES[planId];
  
  return {
    id: planId,
    name: planId === 'monthly' 
      ? 'Monthly Plan' 
      : planId === 'yearly' 
        ? 'Annual Plan' 
        : 'Enterprise Plan',
    price: basePrice,
    interval: planId === 'enterprise' ? 'month' : planId,
    features: [
      'Full access to all trading features',
      'Advanced analytics and reporting',
      'Community integration features',
      'Priority support',
      ...(planId === 'yearly' || planId === 'enterprise' ? ['Exclusive webinars and tutorials'] : []),
      ...(planId === 'enterprise' ? ['Custom branding options', 'Dedicated account manager'] : [])
    ]
  };
}