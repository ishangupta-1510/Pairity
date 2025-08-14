import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';

import {
  updatePurchaseFlow,
  setPurchaseStep,
  setPaymentMethod,
  addPaymentMethod,
  setPurchaseError,
  setSubscription,
} from '@/store/slices/premiumSlice';
import { 
  PaymentMethod, 
  PurchaseStep, 
  PremiumSubscription, 
  SubscriptionStatus, 
  PremiumFeature 
} from '@/types/premium';

const PremiumCheckoutScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const { 
    purchaseFlow, 
    paymentMethods, 
    trialOffer,
    isLoading,
    error 
  } = useSelector((state: RootState) => state.premium);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(
    paymentMethods[0] || null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (!purchaseFlow.selectedPlan) {
      navigation.goBack();
    }
  }, [purchaseFlow.selectedPlan, navigation]);

  const selectedPlan = purchaseFlow.selectedPlan;
  const isTrialEligible = trialOffer && trialOffer.isEligible && 
    trialOffer.planId === selectedPlan?.id;

  const getTotalPrice = () => {
    if (isTrialEligible) {
      return trialOffer.trialPrice;
    }
    return selectedPlan?.price || 0;
  };

  const getDisplayPrice = () => {
    if (isTrialEligible) {
      return `Free for ${trialOffer.trialDays} days, then $${selectedPlan?.price}`;
    }
    return `$${selectedPlan?.price}`;
  };

  const getBillingPeriod = () => {
    switch (selectedPlan?.billingPeriod) {
      case 'monthly': return 'month';
      case 'quarterly': return '3 months';
      case '6-month': return '6 months';
      case 'yearly': return 'year';
      default: return selectedPlan?.billingPeriod;
    }
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    dispatch(setPaymentMethod(method));
  };

  const handleAddPaymentMethod = () => {
    // Mock adding a new payment method
    const newMethod: PaymentMethod = {
      id: `pm_${Date.now()}`,
      type: 'card',
      last4: '4242',
      brand: 'visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: false,
      billingAddress: {
        line1: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'US',
      },
    };

    dispatch(addPaymentMethod(newMethod));
    setSelectedPaymentMethod(newMethod);
    Alert.alert('Success', 'Payment method added successfully!');
  };

  const handlePurchase = async () => {
    if (!selectedPaymentMethod || !agreedToTerms) {
      Alert.alert('Error', 'Please select a payment method and agree to terms');
      return;
    }

    if (!selectedPlan) {
      Alert.alert('Error', 'No plan selected');
      return;
    }

    setIsProcessing(true);
    dispatch(setPurchaseError(null));

    try {
      // Mock purchase process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create mock subscription
      const mockSubscription: PremiumSubscription = {
        id: `sub_${Date.now()}`,
        planId: selectedPlan.id,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + (selectedPlan.billingPeriod === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        isTrialPeriod: isTrialEligible || false,
        trialEnd: isTrialEligible ? new Date(Date.now() + (trialOffer?.trialDays || 0) * 24 * 60 * 60 * 1000) : undefined,
        autoRenew: true,
        paymentMethodId: selectedPaymentMethod.id,
        lastPaymentAmount: getTotalPrice(),
        lastPaymentDate: new Date(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        features: [
          PremiumFeature.UNLIMITED_SWIPES,
          PremiumFeature.LIKES_YOU,
          PremiumFeature.ADVANCED_FILTERS,
          PremiumFeature.PRIORITY_LIKES,
          PremiumFeature.REWIND,
          PremiumFeature.TRAVEL_MODE,
          PremiumFeature.BROWSE_INVISIBLY,
          PremiumFeature.SUPER_LIKES,
          PremiumFeature.PROFILE_BOOST,
          PremiumFeature.READ_RECEIPTS,
          PremiumFeature.MESSAGE_BEFORE_MATCH,
          PremiumFeature.HD_PHOTOS,
        ],
        subscriptionHistory: [],
      };

      dispatch(setSubscription(mockSubscription));
      dispatch(updatePurchaseFlow({
        step: PurchaseStep.CONFIRMATION,
        purchaseSuccess: true,
      }));

      Alert.alert(
        'Success!',
        isTrialEligible 
          ? `Your ${trialOffer?.trialDays}-day free trial has started!`
          : 'Welcome to Premium! Your subscription is now active.',
        [
          {
            text: 'Start Using Premium',
            onPress: () => {
              navigation.navigate('Main' as never);
            },
          },
        ]
      );

    } catch (error) {
      console.error('Purchase failed:', error);
      dispatch(setPurchaseError('Purchase failed. Please try again.'));
      Alert.alert('Error', 'Purchase failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethod,
        {
          backgroundColor: theme.colors.surface,
          borderColor: selectedPaymentMethod?.id === method.id 
            ? theme.colors.premium 
            : 'transparent',
        },
      ]}
      onPress={() => handlePaymentMethodSelect(method)}
    >
      <View style={styles.paymentMethodInfo}>
        <Icon 
          name={method.type === 'card' ? 'credit-card' : 'account-balance-wallet'} 
          size={24} 
          color={theme.colors.text} 
        />
        <View style={styles.paymentMethodDetails}>
          <Text style={[styles.paymentMethodText, { color: theme.colors.text }]}>
            {method.brand?.toUpperCase()} •••• {method.last4}
          </Text>
          <Text style={[styles.paymentMethodExpiry, { color: theme.colors.textSecondary }]}>
            Expires {method.expiryMonth}/{method.expiryYear}
          </Text>
        </View>
      </View>
      
      {selectedPaymentMethod?.id === method.id && (
        <Icon name="check-circle" size={20} color={theme.colors.premium} />
      )}
    </TouchableOpacity>
  );

  if (!selectedPlan) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            No plan selected
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Complete Purchase
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Plan Summary */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Plan Summary
          </Text>
          
          <View style={styles.planSummary}>
            <View style={styles.planInfo}>
              <Text style={[styles.planName, { color: theme.colors.text }]}>
                {selectedPlan.name}
              </Text>
              <Text style={[styles.planDescription, { color: theme.colors.textSecondary }]}>
                {selectedPlan.description}
              </Text>
            </View>
            
            <View style={styles.planPricing}>
              <Text style={[styles.planPrice, { color: theme.colors.premium }]}>
                {getDisplayPrice()}
              </Text>
              <Text style={[styles.planPeriod, { color: theme.colors.textSecondary }]}>
                per {getBillingPeriod()}
              </Text>
            </View>
          </View>

          {isTrialEligible && (
            <View style={[styles.trialNotice, { backgroundColor: theme.colors.primaryLight }]}>
              <Icon name="access-time" size={20} color={theme.colors.primary} />
              <Text style={[styles.trialNoticeText, { color: theme.colors.primary }]}>
                Start your {trialOffer.trialDays}-day free trial today
              </Text>
            </View>
          )}
        </View>

        {/* Payment Methods */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Payment Method
          </Text>
          
          <View style={styles.paymentMethods}>
            {paymentMethods.map(renderPaymentMethod)}
            
            <TouchableOpacity
              style={[styles.addPaymentMethod, { borderColor: theme.colors.textSecondary }]}
              onPress={handleAddPaymentMethod}
            >
              <Icon name="add" size={24} color={theme.colors.textSecondary} />
              <Text style={[styles.addPaymentMethodText, { color: theme.colors.textSecondary }]}>
                Add Payment Method
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={styles.termsCheckbox}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
          >
            <Icon
              name={agreedToTerms ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color={agreedToTerms ? theme.colors.premium : theme.colors.textSecondary}
            />
            <Text style={[styles.termsText, { color: theme.colors.textSecondary }]}>
              I agree to the{' '}
              <Text style={[styles.termsLink, { color: theme.colors.primary }]}>
                Terms of Service
              </Text>
              {' '}and{' '}
              <Text style={[styles.termsLink, { color: theme.colors.primary }]}>
                Privacy Policy
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={[styles.errorSection, { backgroundColor: '#FF572210' }]}>
            <Icon name="error" size={20} color="#FF5722" />
            <Text style={[styles.errorMessage, { color: '#FF5722' }]}>
              {error}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Purchase Button */}
      <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.purchaseButton,
            {
              backgroundColor: agreedToTerms && selectedPaymentMethod 
                ? theme.colors.premium 
                : theme.colors.textSecondary,
            },
          ]}
          onPress={handlePurchase}
          disabled={!agreedToTerms || !selectedPaymentMethod || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.purchaseButtonText}>
              {isTrialEligible 
                ? `Start ${trialOffer?.trialDays}-Day Free Trial`
                : `Subscribe for $${getTotalPrice()}`
              }
            </Text>
          )}
        </TouchableOpacity>
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
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  planSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  planPricing: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  planPeriod: {
    fontSize: 12,
    marginTop: 2,
  },
  trialNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  trialNoticeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodDetails: {
    marginLeft: 12,
    flex: 1,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '500',
  },
  paymentMethodExpiry: {
    fontSize: 12,
    marginTop: 2,
  },
  addPaymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    gap: 8,
  },
  addPaymentMethodText: {
    fontSize: 16,
    fontWeight: '500',
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  termsLink: {
    textDecorationLine: 'underline',
  },
  errorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorMessage: {
    fontSize: 14,
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  purchaseButton: {
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
  },
});

export default PremiumCheckoutScreen;