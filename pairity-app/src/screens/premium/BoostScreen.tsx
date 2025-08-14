import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';

import {
  activateBoost,
  deactivateBoost,
  updateBoostCredits,
} from '@/store/slices/premiumSlice';
import { PremiumFeature, BoostType } from '@/types/premium';

interface BoostOption {
  type: BoostType;
  title: string;
  description: string;
  duration: number; // minutes
  credits: number;
  multiplier: number;
  icon: string;
  gradient: string[];
  benefits: string[];
}

const BoostScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const { 
    features, 
    boosts, 
    activeBoostSession,
    subscription 
  } = useSelector((state: RootState) => state.premium);

  const hasBoostFeature = features.includes(PremiumFeature.PROFILE_BOOST);
  const [selectedBoost, setSelectedBoost] = useState<BoostOption | null>(null);
  const [pulseAnimation] = useState(new Animated.Value(0));

  const boostOptions: BoostOption[] = [
    {
      type: BoostType.PROFILE_BOOST,
      title: 'Profile Boost',
      description: 'Get 10x more profile views for 30 minutes',
      duration: 30,
      credits: 1,
      multiplier: 10,
      icon: 'trending-up',
      gradient: ['#FF6B6B', '#FF8E53'],
      benefits: [
        '10x more profile visibility',
        'Appear in top profiles',
        'Increased match potential',
        '30 minutes duration',
      ],
    },
    {
      type: BoostType.SUPER_BOOST,
      title: 'Super Boost',
      description: 'Get 100x more views and be the #1 profile for 30 minutes',
      duration: 30,
      credits: 5,
      multiplier: 100,
      icon: 'flash-on',
      gradient: ['#FFD700', '#FFA500'],
      benefits: [
        '100x more profile visibility',
        'Be the #1 profile in your area',
        'Maximum match potential',
        '30 minutes of premium exposure',
      ],
    },
    {
      type: BoostType.PRIME_TIME,
      title: 'Prime Time Boost',
      description: 'Boost during peak hours (7-9 PM) for maximum impact',
      duration: 120,
      credits: 3,
      multiplier: 25,
      icon: 'schedule',
      gradient: ['#667eea', '#764ba2'],
      benefits: [
        '25x visibility during peak hours',
        'Automatic timing optimization',
        '2 hours active boost',
        'Maximum user activity window',
      ],
    },
  ];

  useEffect(() => {
    // Start pulse animation for active boost
    if (activeBoostSession) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
      
      return () => pulseLoop.stop();
    }
  }, [activeBoostSession]);

  const getTimeRemaining = () => {
    if (!activeBoostSession) return null;
    
    const now = new Date().getTime();
    const endTime = activeBoostSession.endTime.getTime();
    const remaining = Math.max(0, endTime - now);
    
    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleBoostActivation = (boostOption: BoostOption) => {
    if (activeBoostSession) {
      Alert.alert('Boost Active', 'You already have an active boost session.');
      return;
    }

    if (boosts.credits < boostOption.credits) {
      Alert.alert(
        'Insufficient Credits',
        `You need ${boostOption.credits} boost credits. Purchase more in settings.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Buy Credits',
            onPress: () => navigation.navigate('PremiumLanding' as never),
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Activate Boost',
      `Use ${boostOption.credits} credit(s) for a ${boostOption.duration}-minute ${boostOption.title}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Activate',
          onPress: () => {
            dispatch(activateBoost({
              type: boostOption.type,
              duration: boostOption.duration,
              multiplier: boostOption.multiplier,
            }));
            
            dispatch(updateBoostCredits(boosts.credits - boostOption.credits));
            
            Alert.alert(
              'Boost Activated!',
              `Your ${boostOption.title} is now active for ${boostOption.duration} minutes.`
            );
          },
        },
      ]
    );
  };

  const handleStopBoost = () => {
    Alert.alert(
      'Stop Boost',
      'Are you sure you want to stop your current boost? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Stop Boost',
          style: 'destructive',
          onPress: () => {
            dispatch(deactivateBoost());
            Alert.alert('Success', 'Boost session has been stopped.');
          },
        },
      ]
    );
  };

  const renderBoostOption = (option: BoostOption) => {
    const isSelected = selectedBoost?.type === option.type;
    const canAfford = boosts.credits >= option.credits;
    
    return (
      <TouchableOpacity
        key={option.type}
        style={[
          styles.boostOption,
          {
            borderColor: isSelected ? theme.colors.premium : 'transparent',
          },
        ]}
        onPress={() => setSelectedBoost(isSelected ? null : option)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={option.gradient}
          style={styles.boostGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.boostHeader}>
            <Icon name={option.icon} size={32} color="white" />
            <View style={styles.boostInfo}>
              <Text style={styles.boostTitle}>{option.title}</Text>
              <Text style={styles.boostDescription}>{option.description}</Text>
            </View>
            <View style={styles.boostCredits}>
              <Text style={styles.creditsText}>{option.credits}</Text>
              <Text style={styles.creditsLabel}>credit{option.credits > 1 ? 's' : ''}</Text>
            </View>
          </View>
        </LinearGradient>

        {isSelected && (
          <View style={[styles.boostDetails, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.benefitsTitle, { color: theme.colors.text }]}>
              What you get:
            </Text>
            {option.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Icon name="check" size={16} color={theme.colors.accent} />
                <Text style={[styles.benefitText, { color: theme.colors.textSecondary }]}>
                  {benefit}
                </Text>
              </View>
            ))}
            
            <TouchableOpacity
              style={[
                styles.activateButton,
                {
                  backgroundColor: canAfford ? theme.colors.premium : theme.colors.textSecondary,
                },
              ]}
              onPress={() => handleBoostActivation(option)}
              disabled={!canAfford || !!activeBoostSession}
            >
              <Text style={styles.activateButtonText}>
                {activeBoostSession 
                  ? 'Boost Active' 
                  : canAfford 
                    ? `Activate for ${option.credits} Credit${option.credits > 1 ? 's' : ''}` 
                    : 'Insufficient Credits'
                }
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (!hasBoostFeature) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Profile Boost
          </Text>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.upgradePrompt}>
          <Icon name="trending-up" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.upgradeTitle, { color: theme.colors.text }]}>
            Premium Feature
          </Text>
          <Text style={[styles.upgradeMessage, { color: theme.colors.textSecondary }]}>
            Upgrade to Premium to boost your profile visibility
          </Text>
          <TouchableOpacity
            style={[styles.upgradeButton, { backgroundColor: theme.colors.premium }]}
            onPress={() => navigation.navigate('PremiumLanding' as never)}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
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
          Profile Boost
        </Text>
        <View style={styles.creditsIndicator}>
          <Icon name="flash-on" size={16} color={theme.colors.premium} />
          <Text style={[styles.creditsCount, { color: theme.colors.premium }]}>
            {boosts.credits}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Active Boost Status */}
        {activeBoostSession && (
          <Animated.View 
            style={[
              styles.activeBoostCard,
              {
                backgroundColor: theme.colors.surface,
                opacity: pulseAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ]}
          >
            <LinearGradient
              colors={['#4CAF50', '#45A049']}
              style={styles.activeBoostGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.activeBoostContent}>
                <Icon name="flash-on" size={32} color="white" />
                <View style={styles.activeBoostInfo}>
                  <Text style={styles.activeBoostTitle}>
                    {boostOptions.find(b => b.type === activeBoostSession.type)?.title} Active
                  </Text>
                  <Text style={styles.activeBoostTime}>
                    Time remaining: {getTimeRemaining()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.stopBoostButton}
                  onPress={handleStopBoost}
                >
                  <Icon name="stop" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Boost Explanation */}
        <View style={[styles.explanationCard, { backgroundColor: theme.colors.surface }]}>
          <Icon name="info" size={24} color={theme.colors.primary} />
          <View style={styles.explanationContent}>
            <Text style={[styles.explanationTitle, { color: theme.colors.text }]}>
              How Boost Works
            </Text>
            <Text style={[styles.explanationText, { color: theme.colors.textSecondary }]}>
              Boost puts your profile at the front of the line, so more people see you and you get more matches.
            </Text>
          </View>
        </View>

        {/* Boost Options */}
        <View style={styles.boostOptions}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Choose Your Boost
          </Text>
          {boostOptions.map(renderBoostOption)}
        </View>

        {/* Purchase Credits */}
        <View style={[styles.purchaseSection, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Need More Credits?
          </Text>
          
          <View style={styles.creditPackages}>
            <TouchableOpacity 
              style={[styles.creditPackage, { backgroundColor: theme.colors.background }]}
              onPress={() => {
                Alert.alert('Purchase Credits', '5 Boost Credits for $4.99');
                // In real app, integrate with payment system
                dispatch(updateBoostCredits(boosts.credits + 5));
              }}
            >
              <Text style={[styles.packageCredits, { color: theme.colors.premium }]}>5</Text>
              <Text style={[styles.packagePrice, { color: theme.colors.text }]}>$4.99</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.creditPackage, { backgroundColor: theme.colors.background }]}
              onPress={() => {
                Alert.alert('Purchase Credits', '15 Boost Credits for $12.99');
                // In real app, integrate with payment system
                dispatch(updateBoostCredits(boosts.credits + 15));
              }}
            >
              <Text style={[styles.packageCredits, { color: theme.colors.premium }]}>15</Text>
              <Text style={[styles.packagePrice, { color: theme.colors.text }]}>$12.99</Text>
              <View style={[styles.popularBadge, { backgroundColor: theme.colors.accent }]}>
                <Text style={styles.popularText}>Popular</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.creditPackage, { backgroundColor: theme.colors.background }]}
              onPress={() => {
                Alert.alert('Purchase Credits', '30 Boost Credits for $19.99');
                // In real app, integrate with payment system
                dispatch(updateBoostCredits(boosts.credits + 30));
              }}
            >
              <Text style={[styles.packageCredits, { color: theme.colors.premium }]}>30</Text>
              <Text style={[styles.packagePrice, { color: theme.colors.text }]}>$19.99</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  creditsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  creditsCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  activeBoostCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  activeBoostGradient: {
    padding: 20,
  },
  activeBoostContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  activeBoostInfo: {
    flex: 1,
  },
  activeBoostTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  activeBoostTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  stopBoostButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  explanationCard: {
    flexDirection: 'row',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  explanationContent: {
    flex: 1,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 18,
  },
  boostOptions: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  boostOption: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  boostGradient: {
    padding: 20,
  },
  boostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  boostInfo: {
    flex: 1,
  },
  boostTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  boostDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  boostCredits: {
    alignItems: 'center',
  },
  creditsText: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  creditsLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  boostDetails: {
    padding: 20,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  benefitText: {
    fontSize: 14,
    flex: 1,
  },
  activateButton: {
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 16,
  },
  activateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  purchaseSection: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  creditPackages: {
    flexDirection: 'row',
    gap: 12,
  },
  creditPackage: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    position: 'relative',
  },
  packageCredits: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  popularBadge: {
    position: 'absolute',
    top: -6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  upgradePrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  upgradeTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  upgradeMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  upgradeButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BoostScreen;