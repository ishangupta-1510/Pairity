import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  PremiumState,
  PremiumSubscription,
  SubscriptionPlan,
  PremiumFeature,
  BoostCredit,
  SuperLikeCredit,
  PurchaseReceipt,
  PromoCode,
  TrialOffer,
  PaymentMethod,
  PurchaseFlow,
  PurchaseStep,
  OrderSummary,
  LikesYouProfile,
  AdvancedFilter,
  SavedFilterPreset,
  BoostSession,
  TravelModeLocation,
  GiftCode,
  VirtualGift,
  SentGift,
  ReceivedGift,
  SupportTicket,
  RefundRequest,
} from '@/types/premium';

const defaultSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Premium Monthly',
    description: 'All premium features for one month',
    features: [
      PremiumFeature.UNLIMITED_SWIPES,
      PremiumFeature.LIKES_YOU,
      PremiumFeature.ADVANCED_FILTERS,
      PremiumFeature.READ_RECEIPTS,
      PremiumFeature.PRIORITY_LIKES,
      PremiumFeature.PROFILE_BOOST,
      PremiumFeature.REWIND_SWIPE,
    ],
    price: 19.99,
    currency: 'USD',
    billingPeriod: 'monthly',
    billingCycles: -1,
    isPopular: false,
    platform: 'both',
    productId: 'pairity_premium_monthly',
    offerType: 'standard',
  },
  {
    id: 'quarterly',
    name: 'Premium 3-Month',
    description: 'Save 20% with quarterly billing',
    features: [
      PremiumFeature.UNLIMITED_SWIPES,
      PremiumFeature.LIKES_YOU,
      PremiumFeature.ADVANCED_FILTERS,
      PremiumFeature.READ_RECEIPTS,
      PremiumFeature.PRIORITY_LIKES,
      PremiumFeature.PROFILE_BOOST,
      PremiumFeature.REWIND_SWIPE,
      PremiumFeature.TRAVEL_MODE,
    ],
    price: 47.97,
    originalPrice: 59.97,
    currency: 'USD',
    billingPeriod: 'quarterly',
    billingCycles: -1,
    isPopular: true,
    savingsPercentage: 20,
    badge: 'Most Popular',
    platform: 'both',
    productId: 'pairity_premium_quarterly',
    offerType: 'standard',
  },
  {
    id: 'yearly',
    name: 'Premium Annual',
    description: 'Best value - Save 40% yearly',
    features: [
      PremiumFeature.UNLIMITED_SWIPES,
      PremiumFeature.LIKES_YOU,
      PremiumFeature.ADVANCED_FILTERS,
      PremiumFeature.READ_RECEIPTS,
      PremiumFeature.PRIORITY_LIKES,
      PremiumFeature.PROFILE_BOOST,
      PremiumFeature.REWIND_SWIPE,
      PremiumFeature.TRAVEL_MODE,
      PremiumFeature.BROWSE_INVISIBLY,
      PremiumFeature.MESSAGE_BEFORE_MATCH,
      PremiumFeature.HD_VIDEO_CALLS,
    ],
    price: 143.88,
    originalPrice: 239.88,
    currency: 'USD',
    billingPeriod: 'yearly',
    billingCycles: -1,
    isPopular: false,
    savingsPercentage: 40,
    badge: 'Best Value',
    platform: 'both',
    productId: 'pairity_premium_yearly',
    offerType: 'standard',
  },
];

const initialState: PremiumState & {
  likesYouProfiles: LikesYouProfile[];
  availableFilters: AdvancedFilter[];
  savedFilterPresets: SavedFilterPreset[];
  activeBoostSession?: BoostSession;
  boostHistory: BoostSession[];
  travelLocations: TravelModeLocation[];
  paymentMethods: PaymentMethod[];
  purchaseFlow: PurchaseFlow;
  virtualGifts: VirtualGift[];
  sentGifts: SentGift[];
  receivedGifts: ReceivedGift[];
  supportTickets: SupportTicket[];
  refundRequests: RefundRequest[];
  giftCodes: GiftCode[];
} = {
  subscription: undefined,
  availablePlans: defaultSubscriptionPlans,
  features: [],
  boosts: [],
  superLikes: [],
  receipts: [],
  promoCode: undefined,
  isLoading: false,
  error: undefined,
  trialOffer: undefined,
  likesYouProfiles: [],
  availableFilters: [],
  savedFilterPresets: [],
  boostHistory: [],
  travelLocations: [],
  paymentMethods: [],
  purchaseFlow: {
    step: PurchaseStep.PLAN_SELECTION,
    agreesToTerms: false,
    isProcessing: false,
  },
  virtualGifts: [],
  sentGifts: [],
  receivedGifts: [],
  supportTickets: [],
  refundRequests: [],
  giftCodes: [],
};

const premiumSlice = createSlice({
  name: 'premium',
  initialState,
  reducers: {
    // Loading and error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | undefined>) => {
      state.error = action.payload;
    },

    // Subscription management
    setSubscription: (state, action: PayloadAction<PremiumSubscription | undefined>) => {
      state.subscription = action.payload;
      if (action.payload) {
        const plan = state.availablePlans.find(p => p.id === action.payload.planId);
        if (plan) {
          state.features = plan.features;
        }
      } else {
        state.features = [];
      }
    },

    updateSubscription: (state, action: PayloadAction<Partial<PremiumSubscription>>) => {
      if (state.subscription) {
        state.subscription = { ...state.subscription, ...action.payload };
      }
    },

    setAvailablePlans: (state, action: PayloadAction<SubscriptionPlan[]>) => {
      state.availablePlans = action.payload;
    },

    // Premium features
    addPremiumFeature: (state, action: PayloadAction<PremiumFeature>) => {
      if (!state.features.includes(action.payload)) {
        state.features.push(action.payload);
      }
    },

    removePremiumFeature: (state, action: PayloadAction<PremiumFeature>) => {
      state.features = state.features.filter(f => f !== action.payload);
    },

    setPremiumFeatures: (state, action: PayloadAction<PremiumFeature[]>) => {
      state.features = action.payload;
    },

    // Credits and purchases
    addBoostCredit: (state, action: PayloadAction<BoostCredit>) => {
      state.boosts.push(action.payload);
    },

    useBoostCredit: (state, action: PayloadAction<string>) => {
      const boost = state.boosts.find(b => b.id === action.payload);
      if (boost) {
        boost.used = true;
        boost.usedDate = new Date();
      }
    },

    addSuperLikeCredit: (state, action: PayloadAction<SuperLikeCredit>) => {
      state.superLikes.push(action.payload);
    },

    useSuperLikeCredit: (state, action: PayloadAction<{ creditId: string; targetUserId: string }>) => {
      const superLike = state.superLikes.find(s => s.id === action.payload.creditId);
      if (superLike) {
        superLike.used = true;
        superLike.usedDate = new Date();
        superLike.targetUserId = action.payload.targetUserId;
      }
    },

    // Receipts and purchases
    addPurchaseReceipt: (state, action: PayloadAction<PurchaseReceipt>) => {
      state.receipts.push(action.payload);
    },

    updateReceiptStatus: (state, action: PayloadAction<{ id: string; status: PurchaseReceipt['status'] }>) => {
      const receipt = state.receipts.find(r => r.id === action.payload.id);
      if (receipt) {
        receipt.status = action.payload.status;
      }
    },

    // Promo codes
    setPromoCode: (state, action: PayloadAction<PromoCode | undefined>) => {
      state.promoCode = action.payload;
    },

    usePromoCode: (state) => {
      if (state.promoCode) {
        state.promoCode.isUsed = true;
        state.promoCode.usedDate = new Date();
        state.promoCode.usedCount += 1;
      }
    },

    // Trial offers
    setTrialOffer: (state, action: PayloadAction<TrialOffer | undefined>) => {
      state.trialOffer = action.payload;
    },

    // Likes you profiles
    setLikesYouProfiles: (state, action: PayloadAction<LikesYouProfile[]>) => {
      state.likesYouProfiles = action.payload;
    },

    addLikesYouProfile: (state, action: PayloadAction<LikesYouProfile>) => {
      const existing = state.likesYouProfiles.findIndex(p => p.id === action.payload.id);
      if (existing >= 0) {
        state.likesYouProfiles[existing] = action.payload;
      } else {
        state.likesYouProfiles.unshift(action.payload);
      }
    },

    removeLikesYouProfile: (state, action: PayloadAction<string>) => {
      state.likesYouProfiles = state.likesYouProfiles.filter(p => p.id !== action.payload);
    },

    // Advanced filters
    setAvailableFilters: (state, action: PayloadAction<AdvancedFilter[]>) => {
      state.availableFilters = action.payload;
    },

    updateFilterValue: (state, action: PayloadAction<{ filterId: string; value: any }>) => {
      const filter = state.availableFilters.find(f => f.id === action.payload.filterId);
      if (filter) {
        filter.currentValue = action.payload.value;
      }
    },

    // Filter presets
    saveFilterPreset: (state, action: PayloadAction<SavedFilterPreset>) => {
      const existing = state.savedFilterPresets.findIndex(p => p.id === action.payload.id);
      if (existing >= 0) {
        state.savedFilterPresets[existing] = action.payload;
      } else {
        state.savedFilterPresets.push(action.payload);
      }
    },

    deleteFilterPreset: (state, action: PayloadAction<string>) => {
      state.savedFilterPresets = state.savedFilterPresets.filter(p => p.id !== action.payload);
    },

    // Boost sessions
    setActiveBoostSession: (state, action: PayloadAction<BoostSession | undefined>) => {
      state.activeBoostSession = action.payload;
      if (action.payload) {
        const existing = state.boostHistory.findIndex(b => b.id === action.payload.id);
        if (existing >= 0) {
          state.boostHistory[existing] = action.payload;
        } else {
          state.boostHistory.unshift(action.payload);
        }
      }
    },

    updateBoostSession: (state, action: PayloadAction<Partial<BoostSession>>) => {
      if (state.activeBoostSession) {
        state.activeBoostSession = { ...state.activeBoostSession, ...action.payload };
      }
    },

    addBoostToHistory: (state, action: PayloadAction<BoostSession>) => {
      const existing = state.boostHistory.findIndex(b => b.id === action.payload.id);
      if (existing >= 0) {
        state.boostHistory[existing] = action.payload;
      } else {
        state.boostHistory.unshift(action.payload);
      }
    },

    // Travel mode
    addTravelLocation: (state, action: PayloadAction<TravelModeLocation>) => {
      const existing = state.travelLocations.findIndex(l => l.id === action.payload.id);
      if (existing >= 0) {
        state.travelLocations[existing] = action.payload;
      } else {
        state.travelLocations.push(action.payload);
      }
    },

    updateTravelLocation: (state, action: PayloadAction<{ id: string; updates: Partial<TravelModeLocation> }>) => {
      const location = state.travelLocations.find(l => l.id === action.payload.id);
      if (location) {
        Object.assign(location, action.payload.updates);
      }
    },

    removeTravelLocation: (state, action: PayloadAction<string>) => {
      state.travelLocations = state.travelLocations.filter(l => l.id !== action.payload);
    },

    // Payment methods
    addPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      const existing = state.paymentMethods.findIndex(p => p.id === action.payload.id);
      if (existing >= 0) {
        state.paymentMethods[existing] = action.payload;
      } else {
        state.paymentMethods.push(action.payload);
      }
    },

    removePaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethods = state.paymentMethods.filter(p => p.id !== action.payload);
    },

    setDefaultPaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethods.forEach(method => {
        method.isDefault = method.id === action.payload;
      });
    },

    // Purchase flow
    updatePurchaseFlow: (state, action: PayloadAction<Partial<PurchaseFlow>>) => {
      state.purchaseFlow = { ...state.purchaseFlow, ...action.payload };
    },

    setPurchaseStep: (state, action: PayloadAction<PurchaseStep>) => {
      state.purchaseFlow.step = action.payload;
    },

    resetPurchaseFlow: (state) => {
      state.purchaseFlow = {
        step: PurchaseStep.PLAN_SELECTION,
        agreesToTerms: false,
        isProcessing: false,
      };
    },

    // Virtual gifts
    setVirtualGifts: (state, action: PayloadAction<VirtualGift[]>) => {
      state.virtualGifts = action.payload;
    },

    addSentGift: (state, action: PayloadAction<SentGift>) => {
      state.sentGifts.unshift(action.payload);
    },

    addReceivedGift: (state, action: PayloadAction<ReceivedGift>) => {
      state.receivedGifts.unshift(action.payload);
    },

    markGiftAsViewed: (state, action: PayloadAction<{ id: string; type: 'sent' | 'received' }>) => {
      const gifts = action.payload.type === 'sent' ? state.sentGifts : state.receivedGifts;
      const gift = gifts.find(g => g.id === action.payload.id);
      if (gift) {
        gift.isViewed = true;
        gift.viewedDate = new Date();
      }
    },

    // Support and refunds
    addSupportTicket: (state, action: PayloadAction<SupportTicket>) => {
      state.supportTickets.unshift(action.payload);
    },

    updateSupportTicket: (state, action: PayloadAction<{ id: string; updates: Partial<SupportTicket> }>) => {
      const ticket = state.supportTickets.find(t => t.id === action.payload.id);
      if (ticket) {
        Object.assign(ticket, action.payload.updates, { lastUpdated: new Date() });
      }
    },

    addRefundRequest: (state, action: PayloadAction<RefundRequest>) => {
      state.refundRequests.unshift(action.payload);
    },

    updateRefundRequest: (state, action: PayloadAction<{ id: string; updates: Partial<RefundRequest> }>) => {
      const request = state.refundRequests.find(r => r.id === action.payload.id);
      if (request) {
        Object.assign(request, action.payload.updates);
      }
    },

    // Gift codes
    addGiftCode: (state, action: PayloadAction<GiftCode>) => {
      state.giftCodes.push(action.payload);
    },

    redeemGiftCode: (state, action: PayloadAction<string>) => {
      const giftCode = state.giftCodes.find(g => g.code === action.payload);
      if (giftCode) {
        giftCode.isRedeemed = true;
        giftCode.redeemedAt = new Date();
      }
    },

    // Utility actions
    hasPremiumFeature: (state, action: PayloadAction<PremiumFeature>) => {
      return state.features.includes(action.payload);
    },

    getAvailableBoosts: (state) => {
      return state.boosts.filter(boost => !boost.used && boost.expiryDate > new Date());
    },

    getAvailableSuperLikes: (state) => {
      return state.superLikes.filter(sl => !sl.used && (!sl.expiryDate || sl.expiryDate > new Date()));
    },

    isSubscriptionActive: (state) => {
      return state.subscription?.status === 'active' || state.subscription?.status === 'trialing';
    },

    canAccessFeature: (state, action: PayloadAction<PremiumFeature>) => {
      const feature = action.payload;
      const hasSubscription = state.subscription?.status === 'active' || state.subscription?.status === 'trialing';
      const hasFeature = state.features.includes(feature);
      
      return hasSubscription && hasFeature;
    },
  },
});

export const {
  setLoading,
  setError,
  setSubscription,
  updateSubscription,
  setAvailablePlans,
  addPremiumFeature,
  removePremiumFeature,
  setPremiumFeatures,
  addBoostCredit,
  useBoostCredit,
  addSuperLikeCredit,
  useSuperLikeCredit,
  addPurchaseReceipt,
  updateReceiptStatus,
  setPromoCode,
  usePromoCode,
  setTrialOffer,
  setLikesYouProfiles,
  addLikesYouProfile,
  removeLikesYouProfile,
  setAvailableFilters,
  updateFilterValue,
  saveFilterPreset,
  deleteFilterPreset,
  setActiveBoostSession,
  updateBoostSession,
  addBoostToHistory,
  addTravelLocation,
  updateTravelLocation,
  removeTravelLocation,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  updatePurchaseFlow,
  setPurchaseStep,
  resetPurchaseFlow,
  setVirtualGifts,
  addSentGift,
  addReceivedGift,
  markGiftAsViewed,
  addSupportTicket,
  updateSupportTicket,
  addRefundRequest,
  updateRefundRequest,
  addGiftCode,
  redeemGiftCode,
} = premiumSlice.actions;

export default premiumSlice.reducer;