import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';

import {
  setAvailablePlans,
  updatePurchaseFlow,
  setPurchaseStep,
  setTrialOffer,
} from '@/store/slices/premiumSlice';
import { SubscriptionPlan, PremiumFeature, PurchaseStep, TrialOffer } from '@/types/premium';

import PremiumFeatureCard from '@/components/premium/PremiumFeatureCard';
import SubscriptionPlanCard from '@/components/premium/SubscriptionPlanCard';
import FeatureComparisonTable from '@/components/premium/FeatureComparisonTable';
import TestimonialCarousel from '@/components/premium/TestimonialCarousel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PremiumLandingScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const { availablePlans, features: userFeatures, trialOffer, subscription } = useSelector(
    (state: RootState) => state.premium
  );
  
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    availablePlans.find(plan => plan.isPopular) || availablePlans[0] || null
  );
  const [showComparison, setShowComparison] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const heroAnimationValue = useRef(new Animated.Value(0)).current;

  const premiumBenefits = [
    {
      id: 1,
      icon: 'favorite',
      title: 'See Who Likes You',
      description: 'No more guessing games - see everyone who liked your profile',
      color: '#FF6B6B',
    },
    {
      id: 2,
      icon: 'all-inclusive',
      title: 'Unlimited Swipes',
      description: 'Swipe as much as you want without daily limits',
      color: '#4ECDC4',
    },
    {
      id: 3,
      icon: 'tune',
      title: 'Advanced Filters',
      description: 'Filter by lifestyle, interests, and detailed preferences',
      color: '#45B7D1',
    },
    {
      id: 4,
      icon: 'trending-up',
      title: 'Priority Likes',
      description: 'Your likes are shown first to increase match chances',
      color: '#96CEB4',
    },
    {
      id: 5,
      icon: 'flight',
      title: 'Travel Mode',
      description: 'Connect with people before you travel to a new city',
      color: '#FFEAA7',
    },
    {
      id: 6,
      icon: 'visibility-off',
      title: 'Browse Invisibly',
      description: 'Browse profiles privately without appearing in their stack',
      color: '#DDA0DD',
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Sarah M.',
      age: 28,
      text: "Premium changed everything! I found my perfect match within a month of upgrading.",
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    },
    {
      id: 2,
      name: 'Michael R.',
      age: 32,
      text: "The advanced filters saved me so much time. Only matching with compatible people now!",
      rating: 5,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    {
      id: 3,
      name: 'Emma L.',
      age: 25,
      text: "Being able to see who likes me first was a game changer. No more wasted time!",
      rating: 5,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    },
  ];

  useEffect(() => {
    startHeroAnimation();
    loadTrialOffer();
  }, []);

  const startHeroAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(heroAnimationValue, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(heroAnimationValue, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadTrialOffer = () => {
    // Mock trial offer - in real app this would come from API
    if (!subscription && !trialOffer) {
      const mockTrialOffer: TrialOffer = {
        id: 'trial_2024',
        planId: 'quarterly',
        trialDays: 7,
        originalPrice: 47.97,
        trialPrice: 0,
        currency: 'USD',
        description: '7 days free, then $47.97 every 3 months',
        features: [
          PremiumFeature.UNLIMITED_SWIPES,
          PremiumFeature.LIKES_YOU,
          PremiumFeature.ADVANCED_FILTERS,
          PremiumFeature.PRIORITY_LIKES,
        ],
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isEligible: true,
        hasTriedBefore: false,
      };
      dispatch(setTrialOffer(mockTrialOffer));
    }
  };

  const handleStartTrial = () => {
    if (trialOffer) {
      const plan = availablePlans.find(p => p.id === trialOffer.planId);
      if (plan) {
        dispatch(updatePurchaseFlow({
          selectedPlan: plan,
          step: PurchaseStep.PAYMENT_METHOD,
        }));
        navigation.navigate('PremiumCheckout' as never);
      }
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    dispatch(updatePurchaseFlow({
      selectedPlan: plan,
      step: PurchaseStep.PAYMENT_METHOD,
    }));
    navigation.navigate('PremiumCheckout' as never);
  };

  const handlePlanSelection = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  const renderBenefitCard = ({ item }: { item: typeof premiumBenefits[0] }) => (
    <PremiumFeatureCard
      icon={item.icon}
      title={item.title}
      description={item.description}
      color={item.color}
      style={styles.benefitCard}
    />
  );

  const heroGradientColors = heroAnimationValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      ['#FF6B6B', '#4ECDC4'],
      ['#4ECDC4', '#45B7D1'],
      ['#45B7D1', '#FF6B6B'],
    ],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Pairity Premium
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.premium]}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Find Your Perfect Match Faster</Text>
            <Text style={styles.heroSubtitle}>
              Join millions who found love with Premium features
            </Text>
            
            {/* Trial Offer Banner */}
            {trialOffer && trialOffer.isEligible && (
              <View style={styles.trialBanner}>
                <Icon name="access-time" size={20} color={theme.colors.premium} />
                <Text style={[styles.trialText, { color: theme.colors.premium }]}>
                  {trialOffer.trialDays} days free trial • No commitment
                </Text>
              </View>
            )}

            <View style={styles.heroCTAs}>
              {trialOffer && trialOffer.isEligible ? (
                <TouchableOpacity
                  style={[styles.primaryCTA, { backgroundColor: 'white' }]}
                  onPress={handleStartTrial}
                >
                  <Text style={[styles.primaryCTAText, { color: theme.colors.primary }]}>
                    Start Free Trial
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.primaryCTA, { backgroundColor: 'white' }]}
                  onPress={() => selectedPlan && handleSelectPlan(selectedPlan)}
                >
                  <Text style={[styles.primaryCTAText, { color: theme.colors.primary }]}>
                    Subscribe Now
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.secondaryCTA}
                onPress={() => setShowComparison(true)}
              >
                <Text style={styles.secondaryCTAText}>Compare Features</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Benefits Carousel */}
        <View style={styles.benefitsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Premium Benefits
          </Text>
          <FlatList
            data={premiumBenefits}
            renderItem={renderBenefitCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.benefitsCarousel}
            snapToInterval={SCREEN_WIDTH * 0.8 + 16}
            decelerationRate="fast"
          />
        </View>

        {/* Testimonials */}
        <View style={styles.testimonialsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Success Stories
          </Text>
          <TestimonialCarousel testimonials={testimonials} />
        </View>

        {/* Subscription Plans */}
        <View style={styles.plansSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Choose Your Plan
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Cancel anytime • No hidden fees
          </Text>
          
          <View style={styles.plansContainer}>
            {availablePlans.map((plan) => (
              <SubscriptionPlanCard
                key={plan.id}
                plan={plan}
                isSelected={selectedPlan?.id === plan.id}
                onSelect={() => handlePlanSelection(plan)}
                onSubscribe={() => handleSelectPlan(plan)}
                style={styles.planCard}
              />
            ))}
          </View>
        </View>

        {/* Feature Comparison */}
        {showComparison && (
          <View style={styles.comparisonSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Free vs Premium
            </Text>
            <FeatureComparisonTable />
          </View>
        )}

        {/* Trust Indicators */}
        <View style={[styles.trustSection, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.trustTitle, { color: theme.colors.text }]}>
            Trusted by millions worldwide
          </Text>
          
          <View style={styles.trustIndicators}>
            <View style={styles.trustItem}>
              <Icon name="security" size={24} color={theme.colors.primary} />
              <Text style={[styles.trustText, { color: theme.colors.textSecondary }]}>
                Bank-level security
              </Text>
            </View>
            
            <View style={styles.trustItem}>
              <Icon name="verified-user" size={24} color={theme.colors.primary} />
              <Text style={[styles.trustText, { color: theme.colors.textSecondary }]}>
                Privacy protected
              </Text>
            </View>
            
            <View style={styles.trustItem}>
              <Icon name="support" size={24} color={theme.colors.primary} />
              <Text style={[styles.trustText, { color: theme.colors.textSecondary }]}>
                24/7 support
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomCTA, { backgroundColor: theme.colors.surface }]}>
        {selectedPlan && (
          <>
            <View style={styles.selectedPlanInfo}>
              <Text style={[styles.selectedPlanName, { color: theme.colors.text }]}>
                {selectedPlan.name}
              </Text>
              <Text style={[styles.selectedPlanPrice, { color: theme.colors.textSecondary }]}>
                ${selectedPlan.price}/{selectedPlan.billingPeriod}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.bottomCTAButton, { backgroundColor: theme.colors.premium }]}
              onPress={() => handleSelectPlan(selectedPlan)}
            >
              <Text style={styles.bottomCTAText}>
                {trialOffer && trialOffer.isEligible ? 'Start Free Trial' : 'Subscribe Now'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    width: '100%',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
    gap: 6,
  },
  trialText: {
    fontSize: 14,
    fontWeight: '600',
  },
  heroCTAs: {
    width: '100%',
    gap: 12,
  },
  primaryCTA: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
  },
  primaryCTAText: {
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryCTA: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryCTAText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textDecorationLine: 'underline',
  },
  benefitsSection: {
    paddingVertical: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  benefitsCarousel: {
    paddingHorizontal: 16,
  },
  benefitCard: {
    width: SCREEN_WIDTH * 0.8,
    marginHorizontal: 8,
  },
  testimonialsSection: {
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  plansSection: {
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    marginBottom: 8,
  },
  comparisonSection: {
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  trustSection: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginHorizontal: 16,
    borderRadius: 16,
    marginVertical: 16,
  },
  trustTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  trustIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  trustItem: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  trustText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 100,
  },
  bottomCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedPlanInfo: {
    flex: 1,
  },
  selectedPlanName: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedPlanPrice: {
    fontSize: 14,
    marginTop: 2,
  },
  bottomCTAButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  bottomCTAText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PremiumLandingScreen;