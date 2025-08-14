import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  SectionList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { useTheme } from '@/components/ThemeProvider';

const { width: screenWidth } = Dimensions.get('window');

interface Match {
  id: string;
  user: {
    id: string;
    name: string;
    photos: string[];
    lastActive: string;
    isOnline: boolean;
    isPremium: boolean;
  };
  matchedAt: string;
  lastMessage?: {
    text: string;
    timestamp: string;
    isRead: boolean;
    sender: 'me' | 'them';
  };
  hasNewMessage: boolean;
  isFavorite: boolean;
}

// Removed Conversation interface - not needed since messages are in separate Chat tab

const MatchesScreen: React.FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const [matches, setMatches] = useState<Match[]>([]);
  // Removed conversations state - messages are handled in Chat tab
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewMatches, setShowNewMatches] = useState(true);
  const [filterFavorites, setFilterFavorites] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Simulate loading matches from API/storage
      const mockMatches: Match[] = [
        {
          id: '1',
          user: {
            id: 'user1',
            name: 'Sarah',
            photos: ['https://i.pravatar.cc/300?img=1'],
            lastActive: new Date().toISOString(),
            isOnline: true,
            isPremium: false,
          },
          matchedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
          lastMessage: {
            text: "Hey! How's your day going?",
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            isRead: false,
            sender: 'them',
          },
          hasNewMessage: true,
          isFavorite: false,
        },
        {
          id: '2',
          user: {
            id: 'user2',
            name: 'Emma',
            photos: ['https://i.pravatar.cc/300?img=2'],
            lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            isOnline: false,
            isPremium: true,
          },
          matchedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          lastMessage: {
            text: 'Looking forward to our date!',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
            isRead: true,
            sender: 'me',
          },
          hasNewMessage: false,
          isFavorite: true,
        },
        {
          id: '3',
          user: {
            id: 'user3',
            name: 'Olivia',
            photos: ['https://i.pravatar.cc/300?img=3'],
            lastActive: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            isOnline: true,
            isPremium: false,
          },
          matchedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          hasNewMessage: false,
          isFavorite: false,
        },
      ];

      setMatches(mockMatches);
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const toggleFavorite = useCallback((matchId: string) => {
    setMatches(prev =>
      prev.map(m =>
        m.id === matchId ? { ...m, isFavorite: !m.isFavorite } : m
      )
    );
  }, []);

  const unmatch = useCallback((matchId: string) => {
    setMatches(prev => prev.filter(m => m.id !== matchId));
  }, []);

  const renderNewMatches = () => {
    const newMatches = matches.filter(
      m => !m.lastMessage && moment().diff(moment(m.matchedAt), 'hours') < 24
    );

    if (newMatches.length === 0) return null;

    return (
      <View style={dynamicStyles.newMatchesSection}>
        <Text style={dynamicStyles.sectionTitle}>New Matches</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.newMatchesScroll}
        >
          {newMatches.map(match => (
            <TouchableOpacity
              key={match.id}
              style={styles.newMatchCard}
              onPress={() => navigation.navigate('Chat', { matchId: match.id })}
            >
              <Image
                source={{ uri: match.user.photos[0] }}
                style={styles.newMatchPhoto}
              />
              {match.user.isOnline && <View style={styles.onlineIndicator} />}
              <Text style={dynamicStyles.newMatchName} numberOfLines={1}>
                {match.user.name}
              </Text>
              <Text style={dynamicStyles.matchTime}>
                {moment(match.matchedAt).fromNow()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Removed renderConversation - messages are handled in separate Chat tab

  const renderMatch = ({ item }: { item: Match }) => {
    if (item.lastMessage) return null; // Already in conversations

    return (
      <TouchableOpacity
        style={dynamicStyles.matchGrid}
        onPress={() => navigation.navigate('Chat', { matchId: item.id })}
      >
        <Image
          source={{ uri: item.user.photos[0] }}
          style={styles.matchGridPhoto}
        />
        {item.user.isOnline && <View style={styles.onlineIndicatorGrid} />}
        <View style={styles.matchGridInfo}>
          <Text style={dynamicStyles.matchGridName}>{item.user.name}</Text>
          <Text style={dynamicStyles.matchGridTime}>
            {moment(item.matchedAt).fromNow()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    newMatchesSection: {
      backgroundColor: theme.colors.surface,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginLeft: 16,
      marginBottom: 12,
    },
    // Removed conversation-related styles - handled in Chat tab
    matchGrid: {
      width: (screenWidth - 32) / 3,
      margin: 4,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      overflow: 'hidden',
    },
    matchGridName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    matchGridTime: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    newMatchName: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 2,
    },
    matchTime: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
  });

  if (loading) {
    return (
      <View style={dynamicStyles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const filteredMatches = filterFavorites
    ? matches.filter(m => m.isFavorite)
    : matches;

  // Remove conversations filtering since we're not showing messages tab

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <View style={styles.headerContent}>
          <Text style={dynamicStyles.headerTitle}>Your Matches</Text>
          <Text style={dynamicStyles.headerSubtitle}>
            {filteredMatches.length} {filteredMatches.length === 1 ? 'match' : 'matches'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterFavorites(!filterFavorites)}
        >
          <Icon
            name={filterFavorites ? 'star' : 'star-border'}
            size={24}
            color={filterFavorites ? '#FFD700' : theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderNewMatches()}

        {filteredMatches.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="favorite-border" size={64} color={theme.colors.textSecondary} />
            <Text style={dynamicStyles.emptyTitle}>No matches yet</Text>
            <Text style={dynamicStyles.emptySubtitle}>
              Start swiping to find your perfect match!
            </Text>
          </View>
        ) : (
          <View style={styles.matchesGrid}>
            {filteredMatches.map(match => (
              <View key={match.id}>{renderMatch({ item: match })}</View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContent: {
    flex: 1,
  },
  filterButton: {
    padding: 8,
  },
  newMatchesScroll: {
    paddingHorizontal: 16,
  },
  newMatchCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  newMatchPhoto: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 8,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#51CF66',
    borderWidth: 2,
    borderColor: '#fff',
  },
  // Removed conversation-related styles - handled in Chat tab
  matchesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  matchGridPhoto: {
    width: '100%',
    height: (screenWidth - 32) / 3,
    resizeMode: 'cover',
  },
  onlineIndicatorGrid: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#51CF66',
    borderWidth: 2,
    borderColor: '#fff',
  },
  matchGridInfo: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
});

export default MatchesScreen;