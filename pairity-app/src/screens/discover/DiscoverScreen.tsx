import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import UserCardGrid from './components/UserCardGrid';
import UserCardList from './components/UserCardList';
import UserCardStack from './components/UserCardStack';
import FilterModal from './components/FilterModal';
import SearchBar from '@/components/SearchBar';
import { User, Filter, ViewMode } from '@/types/discover';

const { width: screenWidth } = Dimensions.get('window');

const DiscoverScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recommended' | 'distance' | 'active' | 'newest' | 'match' | 'popular'>('recommended');
  
  const [quickFilters, setQuickFilters] = useState({
    online: false,
    new: false,
    verified: false,
    nearby: false,
  });
  
  const [activeFilters, setActiveFilters] = useState<Filter>({
    ageRange: [18, 99],
    distance: 100,
    heightRange: [140, 220],
    bodyTypes: [],
    education: '',
    relationshipGoals: [],
    lifestyle: {
      smoking: '',
      drinking: '',
      exercise: '',
      diet: '',
    },
    children: '',
    religion: '',
    politics: '',
    languages: [],
    interests: [],
  });
  
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  useEffect(() => {
    loadUsers();
    loadSavedFilters();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchQuery, quickFilters, activeFilters, sortBy]);

  useEffect(() => {
    // Calculate active filter count
    let count = 0;
    if (quickFilters.online) count++;
    if (quickFilters.new) count++;
    if (quickFilters.verified) count++;
    if (quickFilters.nearby) count++;
    
    // Count non-default filters
    if (activeFilters.ageRange[0] !== 18 || activeFilters.ageRange[1] !== 99) count++;
    if (activeFilters.distance !== 100) count++;
    if (activeFilters.bodyTypes.length > 0) count++;
    if (activeFilters.education) count++;
    if (activeFilters.relationshipGoals.length > 0) count++;
    if (activeFilters.languages.length > 0) count++;
    if (activeFilters.interests.length > 0) count++;
    
    setActiveFilterCount(count);
  }, [quickFilters, activeFilters]);

  const loadUsers = async (pageNum = 1) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      // Simulate API call
      const mockUsers = generateMockUsers(pageNum);
      
      if (pageNum === 1) {
        setUsers(mockUsers);
      } else {
        setUsers(prev => [...prev, ...mockUsers]);
      }
      
      setHasMore(mockUsers.length === 20);
      setPage(pageNum);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load users',
        text2: 'Please try again',
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const generateMockUsers = (pageNum: number): User[] => {
    const baseId = (pageNum - 1) * 20;
    return Array.from({ length: 20 }, (_, i) => ({
      id: `${baseId + i}`,
      name: `User ${baseId + i}`,
      age: 18 + Math.floor(Math.random() * 40),
      photos: [
        `https://i.pravatar.cc/600?img=${(baseId + i) % 70}`,
        `https://i.pravatar.cc/600?img=${(baseId + i + 1) % 70}`,
      ],
      location: `${Math.floor(Math.random() * 50)} miles away`,
      distance: Math.floor(Math.random() * 50),
      bio: 'Adventure seeker, coffee enthusiast, and tech geek. Love hiking on weekends.',
      interests: ['Travel', 'Music', 'Photography', 'Cooking', 'Yoga'].slice(0, Math.floor(Math.random() * 5) + 1),
      isOnline: Math.random() > 0.5,
      isVerified: Math.random() > 0.6,
      lastActive: new Date(Date.now() - Math.random() * 86400000 * 7),
      matchPercentage: 60 + Math.floor(Math.random() * 40),
      isNew: Math.random() > 0.8,
      likes: Math.floor(Math.random() * 1000),
      height: 150 + Math.floor(Math.random() * 50),
      bodyType: ['Athletic', 'Average', 'Slim', 'Curvy'][Math.floor(Math.random() * 4)],
      education: ['High School', 'College', 'Bachelor\'s', 'Master\'s', 'PhD'][Math.floor(Math.random() * 5)],
      relationshipGoal: ['Serious', 'Casual', 'Friends', 'Marriage'][Math.floor(Math.random() * 4)],
      hasChildren: Math.random() > 0.7,
      wantsChildren: Math.random() > 0.5,
      religion: ['None', 'Christian', 'Jewish', 'Muslim', 'Buddhist', 'Hindu'][Math.floor(Math.random() * 6)],
      politics: ['Liberal', 'Conservative', 'Moderate', 'Apolitical'][Math.floor(Math.random() * 4)],
      languages: ['English', 'Spanish', 'French'].slice(0, Math.floor(Math.random() * 3) + 1),
      smoking: ['Never', 'Sometimes', 'Often'][Math.floor(Math.random() * 3)],
      drinking: ['Never', 'Socially', 'Often'][Math.floor(Math.random() * 3)],
    }));
  };

  const loadSavedFilters = async () => {
    try {
      const savedFilters = await AsyncStorage.getItem('savedFilters');
      if (savedFilters) {
        setActiveFilters(JSON.parse(savedFilters));
      }
    } catch (error) {
      console.error('Failed to load saved filters:', error);
    }
  };

  const saveFilters = async (filters: Filter) => {
    try {
      await AsyncStorage.setItem('savedFilters', JSON.stringify(filters));
      Toast.show({
        type: 'success',
        text1: 'Filters Saved',
        text2: 'Your filter preferences have been saved',
      });
    } catch (error) {
      console.error('Failed to save filters:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];
    
    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.interests.some(interest => 
          interest.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    // Apply quick filters
    if (quickFilters.online) {
      filtered = filtered.filter(user => user.isOnline);
    }
    if (quickFilters.new) {
      filtered = filtered.filter(user => user.isNew);
    }
    if (quickFilters.verified) {
      filtered = filtered.filter(user => user.isVerified);
    }
    if (quickFilters.nearby) {
      filtered = filtered.filter(user => user.distance <= 10);
    }
    
    // Apply advanced filters
    filtered = filtered.filter(user => {
      // Age filter
      if (user.age < activeFilters.ageRange[0] || user.age > activeFilters.ageRange[1]) {
        return false;
      }
      
      // Distance filter
      if (user.distance > activeFilters.distance) {
        return false;
      }
      
      // Height filter
      if (user.height < activeFilters.heightRange[0] || user.height > activeFilters.heightRange[1]) {
        return false;
      }
      
      // Body type filter
      if (activeFilters.bodyTypes.length > 0 && !activeFilters.bodyTypes.includes(user.bodyType)) {
        return false;
      }
      
      // Education filter
      if (activeFilters.education && user.education !== activeFilters.education) {
        return false;
      }
      
      // Relationship goals filter
      if (activeFilters.relationshipGoals.length > 0 && 
          !activeFilters.relationshipGoals.includes(user.relationshipGoal)) {
        return false;
      }
      
      // Languages filter
      if (activeFilters.languages.length > 0) {
        const hasLanguage = activeFilters.languages.some(lang => 
          user.languages.includes(lang)
        );
        if (!hasLanguage) return false;
      }
      
      // Interests filter
      if (activeFilters.interests.length > 0) {
        const hasInterest = activeFilters.interests.some(interest => 
          user.interests.includes(interest)
        );
        if (!hasInterest) return false;
      }
      
      return true;
    });
    
    // Apply sorting
    filtered = sortUsers(filtered);
    
    setFilteredUsers(filtered);
  };

  const sortUsers = (usersToSort: User[]) => {
    const sorted = [...usersToSort];
    
    switch (sortBy) {
      case 'distance':
        return sorted.sort((a, b) => a.distance - b.distance);
      case 'active':
        return sorted.sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime());
      case 'newest':
        return sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      case 'match':
        return sorted.sort((a, b) => b.matchPercentage - a.matchPercentage);
      case 'popular':
        return sorted.sort((a, b) => b.likes - a.likes);
      case 'recommended':
      default:
        // Complex algorithm-based sorting would go here
        return sorted.sort((a, b) => {
          const scoreA = a.matchPercentage * 0.5 + (100 - a.distance) * 0.3 + (a.isVerified ? 20 : 0);
          const scoreB = b.matchPercentage * 0.5 + (100 - b.distance) * 0.3 + (b.isVerified ? 20 : 0);
          return scoreB - scoreA;
        });
    }
  };

  const toggleQuickFilter = (filter: keyof typeof quickFilters) => {
    setQuickFilters(prev => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };

  const clearFilter = (filterKey: string) => {
    if (filterKey in quickFilters) {
      setQuickFilters(prev => ({
        ...prev,
        [filterKey]: false,
      }));
    } else {
      // Reset specific advanced filter
      setActiveFilters(prev => ({
        ...prev,
        [filterKey]: getDefaultFilterValue(filterKey),
      }));
    }
  };

  const getDefaultFilterValue = (key: string) => {
    const defaults: any = {
      ageRange: [18, 99],
      distance: 100,
      heightRange: [140, 220],
      bodyTypes: [],
      education: '',
      relationshipGoals: [],
      lifestyle: {
        smoking: '',
        drinking: '',
        exercise: '',
        diet: '',
      },
      children: '',
      religion: '',
      politics: '',
      languages: [],
      interests: [],
    };
    return defaults[key];
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadUsers(1);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadUsers(page + 1);
    }
  };

  const handleUserPress = (user: User) => {
    navigation.navigate('UserProfile' as never, { userId: user.id } as never);
  };

  const handleLike = async (user: User) => {
    // API call to like user
    Toast.show({
      type: 'success',
      text1: 'Liked!',
      text2: `You liked ${user.name}`,
    });
  };

  const handleSuperLike = async (user: User) => {
    // API call to super like user
    Toast.show({
      type: 'success',
      text1: 'Super Liked!',
      text2: `You super liked ${user.name}`,
    });
  };

  const handlePass = async (user: User) => {
    // Remove user from list
    setFilteredUsers(prev => prev.filter(u => u.id !== user.id));
  };

  const renderViewModeButton = (mode: ViewMode, icon: string) => (
    <TouchableOpacity
      style={[styles.viewModeButton, viewMode === mode && styles.viewModeButtonActive]}
      onPress={() => setViewMode(mode)}
    >
      <Icon 
        name={icon} 
        size={20} 
        color={viewMode === mode ? '#FF6B6B' : '#666'} 
      />
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Finding matches...</Text>
        </View>
      );
    }

    if (filteredUsers.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="search-off" size={64} color="#ddd" />
          <Text style={styles.emptyTitle}>No Users Found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your filters or search criteria
          </Text>
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={() => {
              setQuickFilters({
                online: false,
                new: false,
                verified: false,
                nearby: false,
              });
              setActiveFilters(getDefaultFilterValue('all'));
              setSearchQuery('');
            }}
          >
            <Text style={styles.clearFiltersText}>Clear All Filters</Text>
          </TouchableOpacity>
        </View>
      );
    }

    switch (viewMode) {
      case 'grid':
        return (
          <FlatList
            data={filteredUsers}
            renderItem={({ item }) => (
              <UserCardGrid
                user={item}
                onPress={() => handleUserPress(item)}
                onLike={() => handleLike(item)}
              />
            )}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.gridContainer}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator size="small" color="#FF6B6B" style={styles.loadingMore} />
              ) : null
            }
          />
        );
      
      case 'list':
        return (
          <FlatList
            data={filteredUsers}
            renderItem={({ item }) => (
              <UserCardList
                user={item}
                onPress={() => handleUserPress(item)}
                onLike={() => handleLike(item)}
                onMessage={() => navigation.navigate('Chat' as never, { userId: item.id } as never)}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator size="small" color="#FF6B6B" style={styles.loadingMore} />
              ) : null
            }
          />
        );
      
      case 'stack':
        return (
          <UserCardStack
            users={filteredUsers}
            onLike={handleLike}
            onSuperLike={handleSuperLike}
            onPass={handlePass}
            onProfile={handleUserPress}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications' as never)}>
            <Icon name="notifications" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by name, interests..."
      />

      {/* Filter Bar */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {/* Quick Filters */}
          <TouchableOpacity
            style={[styles.filterChip, quickFilters.online && styles.filterChipActive]}
            onPress={() => toggleQuickFilter('online')}
          >
            <Icon name="circle" size={8} color={quickFilters.online ? '#fff' : '#51CF66'} />
            <Text style={[styles.filterChipText, quickFilters.online && styles.filterChipTextActive]}>
              Online
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, quickFilters.new && styles.filterChipActive]}
            onPress={() => toggleQuickFilter('new')}
          >
            <Icon name="new-releases" size={16} color={quickFilters.new ? '#fff' : '#FFD43B'} />
            <Text style={[styles.filterChipText, quickFilters.new && styles.filterChipTextActive]}>
              New
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, quickFilters.verified && styles.filterChipActive]}
            onPress={() => toggleQuickFilter('verified')}
          >
            <Icon name="verified" size={16} color={quickFilters.verified ? '#fff' : '#339AF0'} />
            <Text style={[styles.filterChipText, quickFilters.verified && styles.filterChipTextActive]}>
              Verified
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, quickFilters.nearby && styles.filterChipActive]}
            onPress={() => toggleQuickFilter('nearby')}
          >
            <Icon name="near-me" size={16} color={quickFilters.nearby ? '#fff' : '#666'} />
            <Text style={[styles.filterChipText, quickFilters.nearby && styles.filterChipTextActive]}>
              Nearby
            </Text>
          </TouchableOpacity>

          {/* Advanced Filters Button */}
          <TouchableOpacity
            style={[styles.filterChip, styles.advancedFilterChip]}
            onPress={() => setShowFilterModal(true)}
          >
            <Icon name="tune" size={16} color="#FF6B6B" />
            <Text style={[styles.filterChipText, { color: '#FF6B6B' }]}>
              Filters
            </Text>
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* View Mode Toggle */}
        <View style={styles.viewModeContainer}>
          {renderViewModeButton('grid', 'grid-view')}
          {renderViewModeButton('list', 'view-list')}
          {renderViewModeButton('stack', 'style')}
        </View>
      </View>

      {/* Results Count & Sort */}
      <View style={styles.resultsBar}>
        <Text style={styles.resultsCount}>
          {filteredUsers.length} {filteredUsers.length === 1 ? 'person' : 'people'} found
        </Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => navigation.navigate('SortOptions' as never, { 
            currentSort: sortBy,
            onSelect: setSortBy,
          } as never)}
        >
          <Icon name="sort" size={16} color="#666" />
          <Text style={styles.sortText}>
            {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {renderContent()}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={activeFilters}
        onApply={(filters) => {
          setActiveFilters(filters);
          saveFilters(filters);
          setShowFilterModal(false);
        }}
        onReset={() => {
          const defaultFilters = getDefaultFilterValue('all');
          setActiveFilters(defaultFilters);
          saveFilters(defaultFilters);
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  filterChipActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  advancedFilterChip: {
    borderColor: '#FF6B6B',
  },
  filterBadge: {
    marginLeft: 6,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  viewModeContainer: {
    flexDirection: 'row',
    paddingRight: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
    paddingLeft: 12,
  },
  viewModeButton: {
    padding: 8,
    marginLeft: 4,
  },
  viewModeButtonActive: {
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
  },
  resultsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sortText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  gridContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  listContainer: {
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  loadingMore: {
    paddingVertical: 20,
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
  clearFiltersButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#FF6B6B',
  },
  clearFiltersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default DiscoverScreen;