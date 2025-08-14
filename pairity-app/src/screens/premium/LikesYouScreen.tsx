import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';

import {
  setLikesYouProfiles,
  removeLikesYouProfile,
} from '@/store/slices/premiumSlice';
import { LikesYouProfile, PremiumFeature } from '@/types/premium';

const LikesYouScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const { likesYouProfiles, features } = useSelector((state: RootState) => state.premium);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'nearby'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'distance'>('recent');

  const hasLikesYouFeature = features.includes(PremiumFeature.LIKES_YOU);

  useEffect(() => {
    if (hasLikesYouFeature) {
      loadLikesYouProfiles();
    }
  }, [hasLikesYouFeature]);

  const loadLikesYouProfiles = () => {
    // Mock data - in real app this would come from API
    const mockProfiles: LikesYouProfile[] = [
      {
        id: '1',
        name: 'Sarah',
        age: 28,
        photos: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400'],
        bio: 'Love hiking and good coffee ☕',
        distance: 2.5,
        isOnline: true,
        likedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        commonInterests: ['hiking', 'coffee', 'photography'],
        mutualFriends: 3,
        verified: true,
        hasLikedBack: false,
      },
      {
        id: '2',
        name: 'Emma',
        age: 25,
        photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'],
        bio: 'Artist and dog lover 🎨🐕',
        distance: 1.8,
        isOnline: false,
        lastSeen: new Date(Date.now() - 30 * 60 * 1000),
        likedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        commonInterests: ['art', 'dogs', 'music'],
        verified: false,
        hasLikedBack: false,
      },
    ];
    
    dispatch(setLikesYouProfiles(mockProfiles));
  };

  const getFilteredProfiles = () => {
    let filtered = [...likesYouProfiles];
    
    switch (selectedFilter) {
      case 'recent':
        filtered = filtered.filter(profile => {
          const hoursSinceLiked = (Date.now() - profile.likedAt.getTime()) / (1000 * 60 * 60);
          return hoursSinceLiked <= 24;
        });
        break;
      case 'nearby':
        filtered = filtered.filter(profile => profile.distance <= 5);
        break;
    }
    
    // Sort profiles
    filtered.sort((a, b) => {
      if (sortBy === 'recent') {
        return b.likedAt.getTime() - a.likedAt.getTime();
      } else {
        return a.distance - b.distance;
      }
    });
    
    return filtered;
  };

  const handleLikeBack = (profile: LikesYouProfile) => {
    Alert.alert(
      'It\'s a Match!',
      `You and ${profile.name} liked each other!`,
      [
        {
          text: 'Send Message',
          onPress: () => {
            dispatch(removeLikesYouProfile(profile.id));
            navigation.navigate('Chat' as never, { userId: profile.id, userName: profile.name } as never);
          },
        },
        {
          text: 'Keep Swiping',
          onPress: () => {
            dispatch(removeLikesYouProfile(profile.id));
          },
        },
      ]
    );
  };

  const handlePass = (profile: LikesYouProfile) => {
    dispatch(removeLikesYouProfile(profile.id));
  };

  const handleViewProfile = (profile: LikesYouProfile) => {
    navigation.navigate('UserProfile' as never, { userId: profile.id } as never);
  };

  const renderProfile = ({ item }: { item: LikesYouProfile }) => (
    <TouchableOpacity
      style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleViewProfile(item)}
      activeOpacity={0.9}
    >
      <View style={styles.profileImageContainer}>
        <Image source={{ uri: item.photos[0] }} style={styles.profileImage} />
        
        {item.isOnline && (
          <View style={[styles.onlineIndicator, { backgroundColor: '#4CAF50' }]} />
        )}
        
        {item.verified && (
          <View style={styles.verifiedBadge}>
            <Icon name="verified" size={16} color="#4285F4" />
          </View>
        )}
      </View>
      
      <View style={styles.profileInfo}>
        <View style={styles.nameRow}>
          <Text style={[styles.profileName, { color: theme.colors.text }]}>
            {item.name}, {item.age}
          </Text>
          <Text style={[styles.distance, { color: theme.colors.textSecondary }]}>
            {item.distance.toFixed(1)} km away
          </Text>
        </View>
        
        <Text 
          style={[styles.bio, { color: theme.colors.textSecondary }]} 
          numberOfLines={2}
        >
          {item.bio}
        </Text>
        
        {item.commonInterests.length > 0 && (
          <View style={styles.interestsContainer}>
            {item.commonInterests.slice(0, 2).map((interest, index) => (
              <View 
                key={index} 
                style={[styles.interestTag, { backgroundColor: theme.colors.primaryLight }]}
              >
                <Text style={[styles.interestText, { color: theme.colors.primary }]}>
                  {interest}
                </Text>
              </View>
            ))}
            {item.commonInterests.length > 2 && (
              <Text style={[styles.moreInterests, { color: theme.colors.textSecondary }]}>
                +{item.commonInterests.length - 2} more
              </Text>
            )}
          </View>
        )}
        
        {item.mutualFriends && item.mutualFriends > 0 && (
          <Text style={[styles.mutualFriends, { color: theme.colors.accent }]}>
            {item.mutualFriends} mutual friend{item.mutualFriends > 1 ? 's' : ''}
          </Text>
        )}
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={() => handlePass(item)}
        >
          <Icon name="close" size={20} color="#FF5722" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => handleLikeBack(item)}
        >
          <Icon name="favorite" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="favorite-border" size={64} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No one has liked you yet
      </Text>
      <Text style={[styles.emptyMessage, { color: theme.colors.textSecondary }]}>
        When someone likes your profile, you'll see them here
      </Text>
    </View>
  );

  const filteredProfiles = getFilteredProfiles();

  if (!hasLikesYouFeature) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.upgradePrompt}>
          <Icon name="lock" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.upgradeTitle, { color: theme.colors.text }]}>
            Premium Feature
          </Text>
          <Text style={[styles.upgradeMessage, { color: theme.colors.textSecondary }]}>
            Upgrade to Premium to see who likes you
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
          Likes You ({likesYouProfiles.length})
        </Text>
        <TouchableOpacity style={styles.sortButton}>
          <Icon name="sort" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterTabs, { backgroundColor: theme.colors.surface }]}>
        {[
          { key: 'all', label: 'All' },
          { key: 'recent', label: 'Recent' },
          { key: 'nearby', label: 'Nearby' },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              selectedFilter === filter.key && { backgroundColor: theme.colors.primaryLight },
            ]}
            onPress={() => setSelectedFilter(filter.key as any)}
          >
            <Text
              style={[
                styles.filterTabText,
                {
                  color: selectedFilter === filter.key 
                    ? theme.colors.primary 
                    : theme.colors.textSecondary,
                },
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Profiles List */}
      <FlatList
        data={filteredProfiles}
        renderItem={renderProfile}
        keyExtractor={(item) => item.id}
        numColumns={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          filteredProfiles.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={renderEmptyState}
      />
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
  sortButton: {
    padding: 8,
    borderRadius: 8,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
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
  profileCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  onlineIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
  },
  profileInfo: {
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
  },
  distance: {
    fontSize: 14,
  },
  bio: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  interestsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  interestTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interestText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreInterests: {
    fontSize: 12,
  },
  mutualFriends: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  passButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#FF5722',
  },
  likeButton: {
    // backgroundColor set dynamically
  },
});

export default LikesYouScreen;