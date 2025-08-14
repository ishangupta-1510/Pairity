export interface PremiumSubscription {
  id: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  nextBillingDate?: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  cancelReason?: string;
  pausedAt?: Date;
  resumeDate?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  isTrialActive: boolean;
  autoRenew: boolean;
  platform: 'ios' | 'android' | 'web';
  originalTransactionId?: string;
  receipt?: string;
  price: number;
  currency: string;
  discountAmount?: number;
  promotionalCode?: string;
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PAST_DUE = 'past_due',
  PAUSED = 'paused',
  TRIALING = 'trialing',
  PENDING = 'pending',
  INCOMPLETE = 'incomplete',
  REFUNDED = 'refunded',
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  features: PremiumFeature[];
  price: number;
  originalPrice?: number;
  currency: string;
  billingPeriod: 'monthly' | 'quarterly' | '6-month' | 'yearly';
  billingCycles: number; // -1 for unlimited
  trialDays?: number;
  isPopular: boolean;
  savingsPercentage?: number;
  badge?: string;
  platform: 'ios' | 'android' | 'both';
  productId: string; // App Store/Google Play product ID
  offerType?: 'introductory' | 'promotional' | 'standard';
}

export enum PremiumFeature {
  UNLIMITED_SWIPES = 'unlimited_swipes',
  LIKES_YOU = 'likes_you',
  ADVANCED_FILTERS = 'advanced_filters',
  READ_RECEIPTS = 'read_receipts',
  PRIORITY_LIKES = 'priority_likes',
  PROFILE_BOOST = 'profile_boost',
  TRAVEL_MODE = 'travel_mode',
  REWIND_SWIPE = 'rewind_swipe',
  BROWSE_INVISIBLY = 'browse_invisibly',
  MESSAGE_BEFORE_MATCH = 'message_before_match',
  SUPER_LIKES = 'super_likes',
  HD_VIDEO_CALLS = 'hd_video_calls',
  UNLIMITED_CALL_DURATION = 'unlimited_call_duration',
  PREMIUM_STICKERS = 'premium_stickers',
  EXCLUSIVE_FRAMES = 'exclusive_frames',
  VIP_SUPPORT = 'vip_support',
  EARLY_ACCESS = 'early_access',
  NO_ADS = 'no_ads',
  PROFILE_INSIGHTS = 'profile_insights',
  VERIFIED_PROFILE = 'verified_profile',
}

export interface PremiumState {
  subscription?: PremiumSubscription;
  availablePlans: SubscriptionPlan[];
  features: PremiumFeature[];
  boosts: BoostCredit[];
  superLikes: SuperLikeCredit[];
  receipts: PurchaseReceipt[];
  promoCode?: PromoCode;
  isLoading: boolean;
  error?: string;
  trialOffer?: TrialOffer;
}

export interface BoostCredit {
  id: string;
  purchaseDate: Date;
  expiryDate: Date;
  used: boolean;
  usedDate?: Date;
  boostDurationMinutes: number;
  price: number;
  currency: string;
}

export interface SuperLikeCredit {
  id: string;
  purchaseDate: Date;
  expiryDate?: Date;
  used: boolean;
  usedDate?: Date;
  targetUserId?: string;
  price: number;
  currency: string;
}

export interface PurchaseReceipt {
  id: string;
  transactionId: string;
  productId: string;
  purchaseDate: Date;
  price: number;
  currency: string;
  platform: 'ios' | 'android';
  receipt: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  refundDate?: Date;
  refundReason?: string;
}

export interface PromoCode {
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_trial' | 'feature_unlock';
  value: number; // percentage (0-100) or fixed amount
  description: string;
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number;
  usedCount: number;
  applicablePlans: string[];
  features?: PremiumFeature[];
  isActive: boolean;
  isUsed: boolean;
  usedDate?: Date;
}

export interface TrialOffer {
  id: string;
  planId: string;
  trialDays: number;
  originalPrice: number;
  trialPrice: number;
  currency: string;
  description: string;
  features: PremiumFeature[];
  validUntil: Date;
  isEligible: boolean;
  hasTriedBefore: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'apple_pay' | 'google_pay' | 'paypal';
  last4?: string;
  brand?: string; // visa, mastercard, amex, etc.
  expiryMonth?: number;
  expiryYear?: number;
  holderName?: string;
  isDefault: boolean;
  billingAddress?: BillingAddress;
  platform: 'ios' | 'android' | 'web';
}

export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PurchaseFlow {
  step: PurchaseStep;
  selectedPlan?: SubscriptionPlan;
  selectedPaymentMethod?: PaymentMethod;
  billingAddress?: BillingAddress;
  promoCode?: string;
  agreesToTerms: boolean;
  orderSummary?: OrderSummary;
  isProcessing: boolean;
  error?: string;
}

export enum PurchaseStep {
  PLAN_SELECTION = 'plan_selection',
  PAYMENT_METHOD = 'payment_method',
  BILLING_INFO = 'billing_info',
  ORDER_REVIEW = 'order_review',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export interface OrderSummary {
  planName: string;
  price: number;
  originalPrice?: number;
  discount: number;
  promoDiscount: number;
  tax: number;
  total: number;
  currency: string;
  billingPeriod: string;
  nextBillingDate?: Date;
  trialDays?: number;
}

export interface LikesYouProfile {
  id: string;
  name: string;
  age: number;
  photos: string[];
  bio: string;
  distance: number;
  isOnline: boolean;
  lastSeen?: Date;
  likedAt: Date;
  commonInterests: string[];
  mutualFriends?: number;
  verified: boolean;
  hasLikedBack: boolean;
}

export interface AdvancedFilter {
  id: string;
  name: string;
  type: 'range' | 'multi_select' | 'single_select' | 'toggle';
  category: 'demographics' | 'lifestyle' | 'preferences' | 'appearance' | 'interests';
  isPremium: boolean;
  options?: FilterOption[];
  minValue?: number;
  maxValue?: number;
  defaultValue?: any;
  currentValue?: any;
}

export interface FilterOption {
  id: string;
  label: string;
  value: any;
  isPremium?: boolean;
}

export interface SavedFilterPreset {
  id: string;
  name: string;
  filters: { [filterId: string]: any };
  createdDate: Date;
  lastUsed?: Date;
  useCount: number;
  isActive: boolean;
}

export interface BoostSession {
  id: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  profileViews: number;
  likes: number;
  matches: number;
  cost: number;
  currency: string;
  type: 'manual' | 'scheduled';
  scheduledTime?: Date;
  isActive: boolean;
}

export interface TravelModeLocation {
  id: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  profilesViewed: number;
  matches: number;
  isFavorite: boolean;
}

export interface PremiumAnalytics {
  period: 'day' | 'week' | 'month' | 'year';
  startDate: Date;
  endDate: Date;
  metrics: {
    revenue: number;
    subscriptions: number;
    cancellations: number;
    churnRate: number;
    conversionRate: number;
    averageRevenuePerUser: number;
    lifetimeValue: number;
    trialConversions: number;
    refunds: number;
    topPlans: PlanMetric[];
    revenueByRegion: RegionMetric[];
    paymentFailures: number;
  };
}

export interface PlanMetric {
  planId: string;
  planName: string;
  subscriptions: number;
  revenue: number;
  percentage: number;
}

export interface RegionMetric {
  country: string;
  revenue: number;
  subscriptions: number;
  currency: string;
}

export interface GiftCode {
  code: string;
  type: 'subscription' | 'credits' | 'features';
  value: any;
  description: string;
  validFrom: Date;
  validUntil: Date;
  isRedeemed: boolean;
  redeemedAt?: Date;
  redeemedBy?: string;
  giftedBy?: string;
  giftedAt?: Date;
  giftMessage?: string;
}

export interface VirtualGift {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  animationUrl?: string;
  price: number;
  currency: string;
  category: 'romantic' | 'playful' | 'luxury' | 'seasonal';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isPremium: boolean;
  isLimited?: boolean;
  availableUntil?: Date;
}

export interface SentGift {
  id: string;
  giftId: string;
  recipientId: string;
  recipientName: string;
  sendDate: Date;
  message?: string;
  isViewed: boolean;
  viewedDate?: Date;
  response?: 'liked' | 'loved' | 'thanked';
  responseDate?: Date;
}

export interface ReceivedGift {
  id: string;
  giftId: string;
  senderId: string;
  senderName: string;
  receiveDate: Date;
  message?: string;
  isViewed: boolean;
  viewedDate?: Date;
  hasResponded: boolean;
  response?: 'liked' | 'loved' | 'thanked';
  responseDate?: Date;
}

// Revenue optimization types
export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  priceModifier: number; // multiplier (0.8 = 20% discount, 1.2 = 20% premium)
  features: PremiumFeature[];
  isActive: boolean;
  userPercentage: number; // 0-100
  conversionRate?: number;
  revenue?: number;
}

export interface DynamicPricing {
  basePrice: number;
  currency: string;
  region: string;
  adjustments: PriceAdjustment[];
  currentPrice: number;
  lastUpdated: Date;
}

export interface PriceAdjustment {
  type: 'seasonal' | 'demand' | 'competition' | 'loyalty' | 'regional';
  multiplier: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  description: string;
}

// Customer support types
export interface SupportTicket {
  id: string;
  userId: string;
  category: 'billing' | 'subscription' | 'payment' | 'refund' | 'technical' | 'general';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  subject: string;
  description: string;
  createdDate: Date;
  lastUpdated: Date;
  assignedAgent?: string;
  resolution?: string;
  satisfaction?: number; // 1-5 rating
  isPremiumUser: boolean;
}

export interface FAQ {
  id: string;
  category: 'billing' | 'subscription' | 'features' | 'technical';
  question: string;
  answer: string;
  isPopular: boolean;
  helpfulVotes: number;
  notHelpfulVotes: number;
  lastUpdated: Date;
}

export interface RefundRequest {
  id: string;
  userId: string;
  subscriptionId: string;
  transactionId: string;
  reason: string;
  description: string;
  requestedAmount: number;
  currency: string;
  requestDate: Date;
  status: 'pending' | 'approved' | 'denied' | 'processed';
  processedDate?: Date;
  refundAmount?: number;
  refundMethod: 'original_payment' | 'store_credit' | 'promotional_credits';
  adminNotes?: string;
}