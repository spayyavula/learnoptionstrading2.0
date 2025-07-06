// src/utils/demandTracking.ts
export const trackPricingInterest = (plan: 'free' | 'pro' | 'enterprise') => {
  console.log(`🎯 Pricing interest: ${plan} plan`)
  
  // Store in localStorage for now
  const existing = JSON.parse(localStorage.getItem('pricingInterest') || '{}')
  const today = new Date().toISOString().split('T')[0]
  
  if (!existing[today]) {
    existing[today] = {}
  }
  
  existing[today][plan] = (existing[today][plan] || 0) + 1
  localStorage.setItem('pricingInterest', JSON.stringify(existing))
  
  // You can later send this to analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'pricing_interest', {
      plan_type: plan,
      event_category: 'engagement'
    })
  }
}