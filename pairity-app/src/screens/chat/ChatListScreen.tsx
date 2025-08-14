import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { useTheme } from '@/components/ThemeProvider';

interface Chat {
  id: string;
  user: {
    id: string;
    name: string;
    photo: string;
    isOnline: boolean;
    isPremium?: boolean;
  };
  lastMessage: {
    text: string;
    timestamp: string;
    sender: 'me' | 'them';
    type: 'text' | 'image' | 'video' | 'voice' | 'gif' | 'location';
  };
  unreadCount: number;
  isTyping?: boolean;
}

const ChatListScreen: React.FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      // Mock chat data
      const mockChats: Chat[] = [
        {
          id: '1',
          user: {
            id: '1',
            name: 'Sarah Johnson',
            photo: 'https://i.pravatar.cc/300?img=1',
            isOnline: true,
            isPremium: true,
          },
          lastMessage: {
            text: "That sounds amazing! I'd love to hear more about your hiking trip",
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            sender: 'them',
            type: 'text',
          },
          unreadCount: 2,
          isTyping: false,
        },
        {
          id: '2',
          user: {
            id: '2',
            name: 'Emily Davis',
            photo: 'https://i.pravatar.cc/300?img=2',
            isOnline: false,
            isPremium: false,
          },
          lastMessage: {
            text: 'Photo',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            sender: 'me',
            type: 'image',
          },
          unreadCount: 0,
        },
        {
          id: '3',
          user: {
            id: '3',
            name: 'Jessica Wilson',
            photo: 'https://i.pravatar.cc/300?img=3',
            isOnline: true,
            isPremium: true,
          },
          lastMessage: {
            text: 'Thanks for the recommendation! 😊',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            sender: 'them',
            type: 'text',
          },
          unreadCount: 1,
          isTyping: true,
        },
        {
          id: '4',
          user: {
            id: '4',
            name: 'Amanda Brown',
            photo: 'https://i.pravatar.cc/300?img=4',
            isOnline: false,
            isPremium: false,
          },
          lastMessage: {
            text: 'Voice message',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
            sender: 'them',
            type: 'voice',
          },
          unreadCount: 0,
        },
        {
          id: '5',
          user: {
            id: '5',
            name: 'Rachel Martinez',
            photo: 'https://i.pravatar.cc/300?img=5',
            isOnline: true,
            isPremium: true,
          },
          lastMessage: {
            text: 'Looking forward to meeting you!',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            sender: 'me',
            type: 'text',
          },
          unreadCount: 0,
        },
      ];

      setChats(mockChats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatLastMessage = (message: Chat['lastMessage']) => {
    switch (message.type) {
      case 'image':
        return '📷 Photo';
      case 'video':
        return '🎥 Video';
      case 'voice':
        return '🎤 Voice message';
      case 'gif':
        return '🎞️ GIF';
      case 'location':
        return '📍 Location';
      default:
        return message.text;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = moment();
    const messageTime = moment(timestamp);
    
    if (now.diff(messageTime, 'minutes') < 1) {
      return 'now';
    } else if (now.diff(messageTime, 'hours') < 1) {
      return `${now.diff(messageTime, 'minutes')}m`;
    } else if (now.diff(messageTime, 'days') < 1) {
      return `${now.diff(messageTime, 'hours')}h`;
    } else if (now.diff(messageTime, 'days') < 7) {
      return messageTime.format('ddd');
    } else {
      return messageTime.format('MMM D');
    }
  };

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={[styles.chatItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => navigation.navigate('Chat', { matchId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.user.photo }} style={styles.avatar} />
        {item.user.isOnline && <View style={styles.onlineIndicator} />}
        {item.user.isPremium && (
          <View style={styles.premiumBadge}>
            <Icon name="stars" size={12} color="#FFD700" />
          </View>
        )}
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={[styles.userName, { color: theme.colors.text }]} numberOfLines={1}>
            {item.user.name}
          </Text>
          <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
            {formatTimestamp(item.lastMessage.timestamp)}
          </Text>
        </View>

        <View style={styles.messageRow}>
          <Text
            style={[
              styles.lastMessage,
              { color: theme.colors.textSecondary },
              item.unreadCount > 0 && styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {item.isTyping ? 'typing...' : formatLastMessage(item.lastMessage)}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.surface,
    },
    searchContainer: {
      backgroundColor: theme.colors.surface,
    },
    searchInput: {
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
    },
    emptyContainer: {
      backgroundColor: theme.colors.background,
    },
    emptyText: {
      color: theme.colors.textSecondary,
    },
    emptySubtext: {
      color: theme.colors.textSecondary,
    },
  });

  if (isLoading) {
    return (
      <View style={[dynamicStyles.container, styles.centerContent]}>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Loading chats...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* Header */}
      <View style={[styles.header, dynamicStyles.header]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Messages</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="edit" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, dynamicStyles.searchContainer]}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, dynamicStyles.searchInput]}
            placeholder="Search messages..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Chat List */}
      {filteredChats.length > 0 ? (
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={[styles.emptyContainer, dynamicStyles.emptyContainer]}>
          <Icon name="chat-bubble-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, dynamicStyles.emptyText]}>No messages yet</Text>
          <Text style={[styles.emptySubtext, dynamicStyles.emptySubtext]}>
            Start a conversation with your matches
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContainer: {
    paddingVertical: 8,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  premiumBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1A1A1D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '500',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
    fontWeight: '400',
  },
  unreadMessage: {
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: '#FF7979',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ChatListScreen;