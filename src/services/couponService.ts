import { formatPrice } from '../utils/priceSync'

interface Coupon {
  id: string
  code: string
  name: string
  description: string
  type: 'percentage' | 'fixed_amount'
  value: number
  minAmount?: number
  maxDiscount?: number
  validFrom: Date
  validUntil: Date
  usageLimit?: number
  usedCount: number
  isActive: boolean
  applicablePlans: string[]
  isFirstTimeOnly: boolean
  createdAt: Date
}

interface CouponValidation {
  isValid: boolean
  coupon?: Coupon
  discountAmount: number
  finalAmount: number
  error?: string
}

interface Deal {
  id: string
  name: string
  description: string
  couponCode: string
  originalPrice: number
  discountedPrice: number
  discountPercentage: number
  validFrom: Date
  validUntil: Date
  isActive: boolean
  isFeatured: boolean
  plan: 'monthly' | 'yearly'
}

export class CouponService {
  private static readonly STORAGE_KEY = 'coupons_data'
  private static readonly DEALS_KEY = 'active_deals'

  /**
   * Get all available coupons
   */
  static getCoupons(): Coupon[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const coupons = JSON.parse(stored)
        return coupons.map((coupon: any) => ({
          ...coupon,
          validFrom: new Date(coupon.validFrom),
          validUntil: new Date(coupon.validUntil),
          createdAt: new Date(coupon.createdAt)
        }))
      }
      return this.getDefaultCoupons()
    } catch (error) {
      console.error('Error loading coupons:', error)
      return this.getDefaultCoupons()
    }
  }

  /**
   * Get active deals
   */
  static getActiveDeals(): Deal[] {
    try {
      const stored = localStorage.getItem(this.DEALS_KEY)
      if (stored) {
        const deals = JSON.parse(stored)
        return deals.map((deal: any) => ({
          ...deal,
          validFrom: new Date(deal.validFrom),
          validUntil: new Date(deal.validUntil)
        })).filter((deal: Deal) => deal.isActive && new Date() <= deal.validUntil)
      }
      return this.getDefaultDeals()
    } catch (error) {
      console.error('Error loading deals:', error)
      return this.getDefaultDeals()
    }
  }

  /**
   * Validate coupon code
   */
  static validateCoupon(
    code: string, 
    plan: 'monthly' | 'yearly', 
    amount: number,
    isFirstTime: boolean = false
  ): CouponValidation {
    const coupons = this.getCoupons()
    const coupon = coupons.find(c => 
      c.code.toLowerCase() === code.toLowerCase() && 
      c.isActive
    )

    if (!coupon) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: amount,
        error: 'Invalid coupon code'
      }
    }

    // Check if coupon is expired
    const now = new Date()
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: amount,
        error: 'Coupon has expired'
      }
    }

    // Check if coupon applies to this plan
    if (coupon.applicablePlans.length > 0 && !coupon.applicablePlans.includes(plan)) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: amount,
        error: `Coupon not valid for ${plan} plan`
      }
    }

    // Check first-time only restriction
    if (coupon.isFirstTimeOnly && !isFirstTime) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: amount,
        error: 'Coupon is only valid for first-time subscribers'
      }
    }

    // Check minimum amount
    if (coupon.minAmount && amount < coupon.minAmount) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: amount,
        error: `Minimum order amount is $${coupon.minAmount}`
      }
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: amount,
        error: 'Coupon usage limit reached'
      }
    }

    // Calculate discount
    let discountAmount = 0
    if (coupon.type === 'percentage') {
      discountAmount = amount * (coupon.value / 100)
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount)
      }
    } else {
      // Fixed amount discount
      discountAmount = coupon.value
    }

    // Ensure discount doesn't exceed amount
    discountAmount = Math.min(discountAmount, amount)
    const finalAmount = Math.max(0, amount - discountAmount)

    return {
      isValid: true,
      coupon,
      discountAmount,
      finalAmount
    }
  }

  /**
   * Apply coupon (increment usage count)
   */
  static applyCoupon(code: string): void {
    const coupons = this.getCoupons()
    const couponIndex = coupons.findIndex(c => c.code.toLowerCase() === code.toLowerCase())
    
    if (couponIndex !== -1) {
      coupons[couponIndex].usedCount += 1
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(coupons))
    }
  }

  /**
   * Create new coupon
   */
  static createCoupon(couponData: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>): Coupon {
    const coupons = this.getCoupons()
    const newCoupon: Coupon = {
      ...couponData,
      id: `coupon_${Date.now()}`,
      usedCount: 0,
      createdAt: new Date()
    }
    
    coupons.push(newCoupon)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(coupons))
    return newCoupon
  }

  /**
   * Get coupon by code
   */
  static getCouponByCode(code: string): Coupon | null {
    const coupons = this.getCoupons()
    return coupons.find(c => c.code.toLowerCase() === code.toLowerCase()) || null
  }

  /**
   * Get featured deal
   */
  static getFeaturedDeal(): Deal | null {
    const deals = this.getActiveDeals()
    return deals.find(deal => deal.isFeatured) || null
  }

  /**
   * Check if there are any active deals
   */
  static hasActiveDeals(): boolean {
    return this.getActiveDeals().length > 0
  }

  /**
   * Get deal by plan
   */
  static getDealByPlan(plan: 'monthly' | 'yearly'): Deal | null {
    const deals = this.getActiveDeals()
    return deals.find(deal => deal.plan === plan) || null
  }

  /**
   * Format discount display
   */
  static formatDiscount(coupon: Coupon): string {
    if (coupon.type === 'percentage') {
      return `${coupon.value}% OFF`
    } else {
      return `${formatPrice(coupon.value)} OFF`
    }
  }

  /**
   * Get default coupons for demo
   */
  private static getDefaultCoupons(): Coupon[] {
    const now = new Date()
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    return [
      {
        id: 'welcome50',
        code: 'WELCOME50',
        name: 'Welcome Discount',
        description: '50% off your first month',
        type: 'percentage',
        value: 50,
        validFrom: now,
        validUntil: nextMonth,
        usageLimit: 1000,
        usedCount: 245,
        isActive: true,
        applicablePlans: ['monthly'],
        isFirstTimeOnly: true,
        createdAt: now
      },
      {
        id: 'blackfriday',
        code: 'BLACKFRIDAY',
        name: 'Black Friday Special',
        description: '70% off yearly subscription',
        type: 'percentage',
        value: 70,
        validFrom: now,
        validUntil: nextWeek,
        usageLimit: 500,
        usedCount: 123,
        isActive: true,
        applicablePlans: ['yearly'],
        isFirstTimeOnly: false,
        createdAt: now
      },
      {
        id: 'save20',
        code: 'SAVE20',
        name: 'Save $20',
        description: '$20 off any plan',
        type: 'fixed_amount',
        value: 20,
        minAmount: 50,
        validFrom: now,
        validUntil: nextMonth,
        usageLimit: 200,
        usedCount: 67,
        isActive: true,
        applicablePlans: [],
        isFirstTimeOnly: false,
        createdAt: now
      },
      {
        id: 'student',
        code: 'STUDENT',
        name: 'Student Discount',
        description: '30% off for students',
        type: 'percentage',
        value: 30,
        maxDiscount: 50,
        validFrom: now,
        validUntil: nextMonth,
        isActive: true,
        applicablePlans: [],
        isFirstTimeOnly: false,
        usedCount: 89,
        createdAt: now
      }
    ]
  }

  /**
   * Get default deals for demo
   */
  private static getDefaultDeals(): Deal[] {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    return [
      {
        id: 'blackfriday_monthly',
        name: 'Black Friday - Monthly',
        description: 'Limited time: 50% off your first 3 months',
        couponCode: 'BLACKFRIDAY50',
        originalPrice: 29,
        discountedPrice: 14.50,
        discountPercentage: 50,
        validFrom: now,
        validUntil: nextWeek,
        isActive: true,
        isFeatured: true,
        plan: 'monthly'
      },
      {
        id: 'blackfriday_yearly',
        name: 'Black Friday - Yearly',
        description: 'Massive savings: 70% off yearly subscription',
        couponCode: 'BLACKFRIDAY70',
        originalPrice: 290,
        discountedPrice: 87,
        discountPercentage: 70,
        validFrom: now,
        validUntil: nextWeek,
        isActive: true,
        isFeatured: false,
        plan: 'yearly'
      },
      {
        id: 'welcome_deal',
        name: 'Welcome Deal',
        description: 'New user special: 40% off first month',
        couponCode: 'WELCOME40',
        originalPrice: 29,
        discountedPrice: 17.40,
        discountPercentage: 40,
        validFrom: now,
        validUntil: nextMonth,
        isActive: true,
        isFeatured: false,
        plan: 'monthly'
      }
    ]
  }

  /**
   * Initialize default data if not exists
   */
  static initializeDefaultData(): void {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.getDefaultCoupons()))
    }
    if (!localStorage.getItem(this.DEALS_KEY)) {
      localStorage.setItem(this.DEALS_KEY, JSON.stringify(this.getDefaultDeals()))
    }
  }

  /**
   * Clear all coupon data (for testing)
   */
  static clearData(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.DEALS_KEY)
  }
}