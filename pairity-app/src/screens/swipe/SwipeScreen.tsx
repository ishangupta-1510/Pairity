import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Vibration,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import SwipeCardStack from './components/SwipeCardStack';
import MatchModal from './components/MatchModal';
import DailyLimitModal from './components/DailyLimitModal';
import { SwipeProfile, SwipeAction, MatchData } from '@/types/matching';
import { useMatching } from '@/hooks/useMatching';
import { useSwipeQueue } from '@/hooks/useSwipeQueue';

const SwipeScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { isPremium } = useSelector((state: RootState) => state.user);
  
  const [profiles, setProfiles] = useState<SwipeProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<MatchData | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  
  // Daily limits
  const [dailySwipes, setDailySwipes] = useState(0);
  const [dailySuperLikes, setDailySuperLikes] = useState(0);
  const [canRewind, setCanRewind] = useState(false);
  const [lastAction, setLastAction] = useState<{ profile: SwipeProfile; action: SwipeAction } | null>(null);
  
  const MAX_DAILY_SWIPES = isPremium ? Infinity : 100;
  const MAX_DAILY_SUPER_LIKES = isPremium ? 5 : 1;
  
  const { checkMatch, recordSwipe } = useMatching();
  const { loadQueue, saveToQueue, removeFromQueue } = useSwipeQueue();

  useEffect(() => {
    loadProfiles();
    loadDailyLimits();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      // Load from queue first
      const queuedProfiles = await loadQueue();
      if (queuedProfiles.length > 0) {
        setProfiles(queuedProfiles);
      } else {
        // Fetch new profiles from API
        const newProfiles = await fetchNewProfiles();
        setProfiles(newProfiles);
        await saveToQueue(newProfiles);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load profiles',
        text2: 'Please check your connection',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNewProfiles = async (): Promise<SwipeProfile[]> => {
    // Simulate API call
    return Array.from({ length: 10 }, (_, i) => ({
      id: `profile_${Date.now()}_${i}`,
      name: `User ${i + 1}`,
      age: 22 + Math.floor(Math.random() * 20),
      photos: [
        `https://i.pravatar.cc/600?img=${i + 10}`,
        `https://i.pravatar.cc/600?img=${i + 11}`,
        `https://i.pravatar.cc/600?img=${i + 12}`,
      ],
      bio: 'Adventure seeker, coffee enthusiast, and book lover. Looking for someone to explore the city with!',
      location: `${Math.floor(Math.random() * 50)} miles away`,
      distance: Math.floor(Math.random() * 50),
      interests: ['Travel', 'Music', 'Photography', 'Cooking', 'Yoga'].slice(0, Math.floor(Math.random() * 5) + 1),
      prompts: [
        {
          question: 'My perfect Sunday involves...',
          answer: 'Sleeping in, brunch with friends, and a good movie',
        },
        {
          question: 'The way to my heart is...',
          answer: 'Through good food and genuine laughter',
        },
      ],
      isVerified: Math.random() > 0.6,
      matchPercentage: 60 + Math.floor(Math.random() * 40),
      hasInstagram: Math.random() > 0.5,
      hasSpotify: Math.random() > 0.5,
      instagramPhotos: [],
      spotifyArtists: ['Taylor Swift', 'The Weeknd', 'Drake'].slice(0, Math.floor(Math.random() * 3) + 1),
      work: 'Software Engineer at Tech Co',
      education: 'BS Computer Science',
      height: `${5 + Math.floor(Math.random() * 2)}'${Math.floor(Math.random() * 12)}"`,
    }));
  };

  const loadDailyLimits = async () => {
    try {
      const today = new Date().toDateString();
      const limitsKey = `dailyLimits_${today}`;
      const limits = await AsyncStorage.getItem(limitsKey);
      
      if (limits) {
        const parsed = JSON.parse(limits);
        setDailySwipes(parsed.swipes || 0);
        setDailySuperLikes(parsed.superLikes || 0);
      } else {
        // Reset for new day
        await saveDailyLimits(0, 0);
      }
    } catch (error) {
      console.error('Failed to load daily limits:', error);
    }
  };

  const saveDailyLimits = async (swipes: number, superLikes: number) => {
    try {
      const today = new Date().toDateString();
      const limitsKey = `dailyLimits_${today}`;
      await AsyncStorage.setItem(limitsKey, JSON.stringify({
        swipes,
        superLikes,
        date: today,
      }));
      setDailySwipes(swipes);
      setDailySuperLikes(superLikes);
    } catch (error) {
      console.error('Failed to save daily limits:', error);
    }
  };

  const handleSwipe = async (profile: SwipeProfile, action: SwipeAction) => {
    // Check daily limits
    if (!isPremium && dailySwipes >= MAX_DAILY_SWIPES) {
      setShowLimitModal(true);
      return false;
    }
    
    if (action === 'superlike' && dailySuperLikes >= MAX_DAILY_SUPER_LIKES) {
      Toast.show({
        type: 'info',
        text1: 'No Super Likes Left',
        text2: isPremium ? 'You\'ve used all your Super Likes today' : 'Upgrade to Premium for more Super Likes',
      });
      return false;
    }
    
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Vibration.vibrate(10);
    }
    
    // Record the action
    setLastAction({ profile, action });
    setCanRewind(isPremium);
    
    // Update daily limits
    const newSwipes = dailySwipes + 1;
    const newSuperLikes = action === 'superlike' ? dailySuperLikes + 1 : dailySuperLikes;
    await saveDailyLimits(newSwipes, newSuperLikes);
    
    // Record swipe
    await recordSwipe(profile.id, action);
    
    // Check for match
    if (action === 'like' || action === 'superlike') {
      const isMatch = await checkMatch(profile.id);
      if (isMatch) {
        setCurrentMatch({
          id: `match_${Date.now()}`,
          user: profile,
          matchedAt: new Date(),
          hasMessaged: false,
        });
        setShowMatchModal(true);
      }
    }
    
    // Remove from queue
    await removeFromQueue(profile.id);
    
    // Load more profiles if needed
    if (currentIndex >= profiles.length - 3) {
      const newProfiles = await fetchNewProfiles();
      setProfiles(prev => [...prev, ...newProfiles]);
      await saveToQueue(newProfiles);
    }
    
    setCurrentIndex(prev => prev + 1);
    return true;
  };

  const handleRewind = async () => {
    if (!canRewind || !lastAction) {
      Toast.show({
        type: 'info',
        text1: 'Cannot Rewind',
        text2: isPremium ? 'No action to undo' : 'Upgrade to Premium to undo swipes',
      });
      return;
    }
    
    // Restore the profile
    setCurrentIndex(prev => Math.max(0, prev - 1));
    setCanRewind(false);
    
    // Update daily limits
    const newSwipes = Math.max(0, dailySwipes - 1);
    const newSuperLikes = lastAction.action === 'superlike' 
      ? Math.max(0, dailySuperLikes - 1) 
      : dailySuperLikes;
    await saveDailyLimits(newSwipes, newSuperLikes);
    
    Toast.show({
      type: 'success',
      text1: 'Rewound!',
      text2: 'Your last action has been undone',
    });
    
    setLastAction(null);
  };

  const handleBoost = () => {
    if (!isPremium) {
      navigation.navigate('Premium' as never);
      return;
    }
    
    Alert.alert(
      'Boost Your Profile',
      'Be one of the top profiles in your area for 30 minutes',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Boost',
          onPress: async () => {
            // API call to boost profile
            Toast.show({
              type: 'success',
              text1: 'Profile Boosted!',
              text2: 'You\'re now a top profile for 30 minutes',
            });
          },
        },
      ]
    );
  };

  const currentProfile = profiles[currentIndex];
  const remainingSwipes = MAX_DAILY_SWIPES - dailySwipes;
  const showSwipeCounter = !isPremium && remainingSwipes <= 10;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Finding amazing people...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Icon name="explore" size={64} color="#ddd" />
          <Text style={styles.emptyTitle}>No More Profiles</Text>
          <Text style={styles.emptySubtitle}>
            Check back later for more matches!
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadProfiles}
          >
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Settings' as never)}>
          <Icon name="tune" size={24} color="#666" />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Pairity</Text>
          {showSwipeCounter && (
            <View style={styles.swipeCounter}>
              <Icon name="favorite" size={12} color="#FF6B6B" />
              <Text style={styles.swipeCounterText}>{remainingSwipes}</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity onPress={() => navigation.navigate('Matches' as never)}>
          <Icon name="chat" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Card Stack */}
      <View style={styles.cardContainer}>
        <SwipeCardStack
          profiles={profiles.slice(currentIndex, currentIndex + 5)}
          onSwipe={handleSwipe}
          isPremium={isPremium}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rewindButton, !canRewind && styles.buttonDisabled]}
          onPress={handleRewind}
          disabled={!canRewind}
        >
          <Icon name="replay" size={24} color={canRewind ? '#FFD43B' : '#ccc'} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={() => currentProfile && handleSwipe(currentProfile, 'pass')}
        >
          <Icon name="close" size={32} color="#FF6B6B" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={() => currentProfile && handleSwipe(currentProfile, 'superlike')}
        >
          <Icon name="star" size={28} color="#339AF0" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => currentProfile && handleSwipe(currentProfile, 'like')}
        >
          <Icon name="favorite" size={28} color="#51CF66" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.boostButton]}
          onPress={handleBoost}
        >
          <Icon name="flash-on" size={24} color="#9C27B0" />
        </TouchableOpacity>
      </View>

      {/* Match Modal */}
      {currentMatch && (
        <MatchModal
          visible={showMatchModal}
          onClose={() => setShowMatchModal(false)}
          match={currentMatch}
          onMessage={() => {
            setShowMatchModal(false);
            navigation.navigate('Chat' as never, { userId: currentMatch.user.id } as never);
          }}
        />
      )}

      {/* Daily Limit Modal */}
      <DailyLimitModal
        visible={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onUpgrade={() => {
          setShowLimitModal(false);
          navigation.navigate('Premium' as never);
        }}
      />

      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  swipeCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  swipeCounterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B6B',
    marginLeft: 4,
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 40,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rewindButton: {
    borderWidth: 2,
    borderColor: '#FFD43B',
  },
  passButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  superLikeButton: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: '#339AF0',
  },
  likeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#51CF66',
  },
  boostButton: {
    borderWidth: 2,
    borderColor: '#9C27B0',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  refreshButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#FF6B6B',
  },
  refreshText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default SwipeScreen;