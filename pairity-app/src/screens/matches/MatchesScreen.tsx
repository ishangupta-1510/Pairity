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

interface Conversation {
  id: string;
  match: Match;
  messages: number;
  lastActivity: string;
}

const MatchesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [matches, setMatches] = useState<Match[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'matches' | 'messages'>('matches');
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

      const mockConversations: Conversation[] = mockMatches
        .filter(m => m.lastMessage)
        .map(m => ({
          id: m.id,
          match: m,
          messages: Math.floor(Math.random() * 50) + 1,
          lastActivity: m.lastMessage!.timestamp,
        }));

      setMatches(mockMatches);
      setConversations(mockConversations);
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
    setConversations(prev => prev.filter(c => c.match.id !== matchId));
  }, []);

  const renderNewMatches = () => {
    const newMatches = matches.filter(
      m => !m.lastMessage && moment().diff(moment(m.matchedAt), 'hours') < 24
    );

    if (newMatches.length === 0) return null;

    return (
      <View style={styles.newMatchesSection}>
        <Text style={styles.sectionTitle}>New Matches</Text>
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
              <Text style={styles.newMatchName} numberOfLines={1}>
                {match.user.name}
              </Text>
              <Text style={styles.matchTime}>
                {moment(match.matchedAt).fromNow()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const { match } = item;
    return (
      <TouchableOpacity
        style={styles.conversationCard}
        onPress={() => navigation.navigate('Chat', { matchId: match.id })}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: match.user.photos[0] }}
            style={styles.conversationAvatar}
          />
          {match.user.isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <View style={styles.nameRow}>
              <Text style={styles.conversationName}>{match.user.name}</Text>
              {match.user.isPremium && (
                <Icon name="star" size={16} color="#FFD43B" style={styles.premiumIcon} />
              )}
            </View>
            <Text style={styles.conversationTime}>
              {moment(match.lastMessage?.timestamp).fromNow()}
            </Text>
          </View>

          {match.lastMessage && (
            <View style={styles.messagePreview}>
              {match.lastMessage.sender === 'me' && (
                <Icon
                  name={match.lastMessage.isRead ? 'done-all' : 'done'}
                  size={14}
                  color={match.lastMessage.isRead ? '#339AF0' : '#999'}
                  style={styles.readIndicator}
                />
              )}
              <Text
                style={[
                  styles.messageText,
                  match.hasNewMessage && styles.unreadMessage,
                ]}
                numberOfLines={1}
              >
                {match.lastMessage.text}
              </Text>
            </View>
          )}
        </View>

        {match.hasNewMessage && <View style={styles.newMessageBadge} />}

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(match.id)}
        >
          <Icon
            name={match.isFavorite ? 'star' : 'star-border'}
            size={20}
            color={match.isFavorite ? '#FFD43B' : '#999'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderMatch = ({ item }: { item: Match }) => {
    if (item.lastMessage) return null; // Already in conversations

    return (
      <TouchableOpacity
        style={styles.matchGrid}
        onPress={() => navigation.navigate('Chat', { matchId: item.id })}
      >
        <Image
          source={{ uri: item.user.photos[0] }}
          style={styles.matchGridPhoto}
        />
        {item.user.isOnline && <View style={styles.onlineIndicatorGrid} />}
        <View style={styles.matchGridInfo}>
          <Text style={styles.matchGridName}>{item.user.name}</Text>
          <Text style={styles.matchGridTime}>
            {moment(item.matchedAt).fromNow()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  const filteredMatches = filterFavorites
    ? matches.filter(m => m.isFavorite)
    : matches;

  const filteredConversations = filterFavorites
    ? conversations.filter(c => c.match.isFavorite)
    : conversations;

  return (
    <View style={styles.container}>
      {/* Header Tabs */}
      <View style={styles.header}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'matches' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('matches')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'matches' && styles.activeTabText,
              ]}
            >
              Matches ({filteredMatches.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'messages' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('messages')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'messages' && styles.activeTabText,
              ]}
            >
              Messages ({filteredConversations.length})
            </Text>
            {conversations.some(c => c.match.hasNewMessage) && (
              <View style={styles.tabBadge} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterFavorites(!filterFavorites)}
        >
          <Icon
            name={filterFavorites ? 'star' : 'star-border'}
            size={24}
            color={filterFavorites ? '#FFD43B' : '#666'}
          />
        </TouchableOpacity>
      </View>

      {activeTab === 'matches' ? (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {renderNewMatches()}

          {filteredMatches.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="favorite-border" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No matches yet</Text>
              <Text style={styles.emptySubtitle}>
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
      ) : (
        <SectionList
          sections=[
            {
              title: 'Messages',
              data: filteredConversations,
            },
          ]}
          renderItem={renderConversation}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="chat-bubble-outline" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySubtitle}>
                When you match with people, your messages will appear here
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabs: {
    flex: 1,
    flexDirection: 'row',
  },
  tab: {
    marginRight: 24,
    paddingVertical: 8,
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF6B6B',
  },
  tabBadge: {
    position: 'absolute',
    top: 8,
    right: -8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
  },
  filterButton: {
    padding: 8,
  },
  newMatchesSection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 16,
    marginBottom: 12,
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
  newMatchName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  matchTime: {
    fontSize: 12,
    color: '#999',
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  conversationAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  premiumIcon: {
    marginLeft: 6,
  },
  conversationTime: {
    fontSize: 12,
    color: '#999',
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readIndicator: {
    marginRight: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#333',
  },
  newMessageBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B6B',
    marginLeft: 8,
  },
  favoriteButton: {
    padding: 8,
    marginLeft: 8,
  },
  matchesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  matchGrid: {
    width: (screenWidth - 32) / 3,
    margin: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
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
  matchGridName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  matchGridTime: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MatchesScreen;