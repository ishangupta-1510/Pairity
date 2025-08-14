import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { useTheme } from '@/components/ThemeProvider';
import EmojiPicker from './components/EmojiPicker';
import MessageBubble from './components/MessageBubble';
import ChatHeader from './components/ChatHeader';
import MediaPicker from './components/MediaPicker';
import VoiceRecorder from './components/VoiceRecorder';
import TypingIndicator from './components/TypingIndicator';

const { width: screenWidth } = Dimensions.get('window');

export interface Message {
  id: string;
  text?: string;
  sender: 'me' | 'them';
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  type: 'text' | 'image' | 'video' | 'voice' | 'gif' | 'location';
  media?: {
    uri: string;
    thumbnail?: string;
    duration?: number;
    width?: number;
    height?: number;
  };
  replyTo?: Message;
  reactions?: Array<{ emoji: string; userId: string }>;
  isDeleted?: boolean;
  editedAt?: string;
}

interface ChatUser {
  id: string;
  name: string;
  photo: string;
  isOnline: boolean;
  lastSeen?: string;
  isTyping?: boolean;
  isPremium?: boolean;
}

const ChatScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const theme = useTheme();
  const { matchId } = route.params as { matchId: string };

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [otherUser, setOtherUser] = useState<ChatUser>({
    id: matchId,
    name: 'Sarah',
    photo: 'https://i.pravatar.cc/300?img=1',
    isOnline: true,
    isTyping: false,
    isPremium: true,
  });

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    loadMessages();
    markMessagesAsRead();
    simulateTypingIndicator();
  }, []);

  const loadMessages = async () => {
    try {
      // Simulate loading messages
      const mockMessages: Message[] = [
        {
          id: '1',
          text: 'Hey! How are you doing? 😊',
          sender: 'them',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          status: 'read',
          type: 'text',
        },
        {
          id: '2',
          text: "I'm great! Just got back from hiking. How about you?",
          sender: 'me',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          status: 'read',
          type: 'text',
        },
        {
          id: '3',
          text: 'That sounds amazing! I love hiking too',
          sender: 'them',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: 'read',
          type: 'text',
          reactions: [{ emoji: '❤️', userId: 'me' }],
        },
        {
          id: '4',
          media: {
            uri: 'https://picsum.photos/400/300',
            width: 400,
            height: 300,
          },
          sender: 'me',
          timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
          status: 'read',
          type: 'image',
        },
        {
          id: '5',
          text: 'Wow! Beautiful view! Where is this?',
          sender: 'them',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          status: 'read',
          type: 'text',
        },
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    // Mark all messages as read
    setMessages(prev =>
      prev.map(msg =>
        msg.sender === 'them' ? { ...msg, status: 'read' } : msg
      )
    );
  };

  const simulateTypingIndicator = () => {
    // Simulate typing indicator
    setTimeout(() => {
      setOtherUser(prev => ({ ...prev, isTyping: true }));
      setTimeout(() => {
        setOtherUser(prev => ({ ...prev, isTyping: false }));
      }, 3000);
    }, 5000);
  };

  const sendMessage = useCallback(() => {
    if (!inputText.trim() && !replyingTo) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'me',
      timestamp: new Date().toISOString(),
      status: 'sending',
      type: 'text',
      replyTo: replyingTo || undefined,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setReplyingTo(null);

    // Simulate message sent
    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );

      // Simulate delivered
      setTimeout(() => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
          )
        );

        // Simulate read
        setTimeout(() => {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
            )
          );
        }, 1000);
      }, 500);
    }, 500);

    // Simulate response
    if (Math.random() > 0.5) {
      setTimeout(() => {
        const responses = [
          'That\'s interesting!',
          'Tell me more about that',
          'I totally agree!',
          'Haha, that\'s funny 😄',
          'Really? That\'s amazing!',
        ];
        const response: Message = {
          id: (Date.now() + 1).toString(),
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: 'them',
          timestamp: new Date().toISOString(),
          status: 'delivered',
          type: 'text',
        };
        setMessages(prev => [...prev, response]);
      }, 2000 + Math.random() * 3000);
    }
  }, [inputText, replyingTo]);

  const handleMediaSelect = useCallback((media: any) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      timestamp: new Date().toISOString(),
      status: 'sending',
      type: media.type,
      media: {
        uri: media.uri,
        thumbnail: media.thumbnail,
        duration: media.duration,
        width: media.width,
        height: media.height,
      },
    };

    setMessages(prev => [...prev, newMessage]);
    setShowMediaPicker(false);

    // Simulate upload
    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );
    }, 1500);
  }, []);

  const handleVoiceMessage = useCallback((voiceUri: string, duration: number) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      timestamp: new Date().toISOString(),
      status: 'sending',
      type: 'voice',
      media: {
        uri: voiceUri,
        duration,
      },
    };

    setMessages(prev => [...prev, newMessage]);
    setIsRecording(false);
  }, []);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  }, []);

  const handleReaction = useCallback((messageId: string, emoji: string) => {
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || [];
          const existingReaction = reactions.find(r => r.userId === 'me');
          
          if (existingReaction) {
            if (existingReaction.emoji === emoji) {
              // Remove reaction
              return {
                ...msg,
                reactions: reactions.filter(r => r.userId !== 'me'),
              };
            } else {
              // Update reaction
              return {
                ...msg,
                reactions: reactions.map(r =>
                  r.userId === 'me' ? { ...r, emoji } : r
                ),
              };
            }
          } else {
            // Add reaction
            return {
              ...msg,
              reactions: [...reactions, { emoji, userId: 'me' }],
            };
          }
        }
        return msg;
      })
    );
  }, []);

  const handleDeleteMessage = useCallback((messageId: string) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete for me',
          onPress: () => {
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
          },
        },
        {
          text: 'Delete for everyone',
          onPress: () => {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === messageId
                  ? { ...msg, isDeleted: true, text: undefined, media: undefined }
                  : msg
              )
            );
          },
          style: 'destructive',
        },
      ]
    );
  }, []);

  const handleMessageLongPress = useCallback((messageId: string) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedMessages([messageId]);
    }
  }, [isSelectionMode]);

  const handleMessagePress = useCallback((messageId: string) => {
    if (isSelectionMode) {
      setSelectedMessages(prev => {
        if (prev.includes(messageId)) {
          const newSelection = prev.filter(id => id !== messageId);
          if (newSelection.length === 0) {
            setIsSelectionMode(false);
          }
          return newSelection;
        } else {
          return [...prev, messageId];
        }
      });
    }
  }, [isSelectionMode]);

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble
      message={item}
      onReaction={handleReaction}
      onReply={() => setReplyingTo(item)}
      onDelete={() => handleDeleteMessage(item.id)}
      onLongPress={() => handleMessageLongPress(item.id)}
      onPress={() => handleMessagePress(item.id)}
      isSelected={selectedMessages.includes(item.id)}
      showActions={!isSelectionMode}
    />
  );

  const renderDateSeparator = (date: string) => (
    <View style={styles.dateSeparator}>
      <View style={styles.dateLine} />
      <Text style={styles.dateText}>
        {moment(date).calendar(null, {
          sameDay: '[Today]',
          lastDay: '[Yesterday]',
          lastWeek: 'dddd',
          sameElse: 'MMM D, YYYY',
        })}
      </Text>
      <View style={styles.dateLine} />
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

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
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    textInput: {
      flex: 1,
      maxHeight: 120,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      borderRadius: 20,
      marginHorizontal: 8,
    },
    replyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    replyText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    replyLabel: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '600',
      marginBottom: 2,
    },
  });

  if (isLoading) {
    return (
      <View style={dynamicStyles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <ChatHeader
        user={otherUser}
        onBack={() => navigation.goBack()}
        onVideoCall={() => navigation.navigate('VideoCall', { userId: otherUser.id })}
        onInfo={() => navigation.navigate('ChatInfo', { matchId })}
      />

      <KeyboardAvoidingView
        style={styles.messagesContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          inverted
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        {otherUser.isTyping && <TypingIndicator />}

        {replyingTo && (
          <View style={dynamicStyles.replyContainer}>
            <View style={styles.replyContent}>
              <Text style={dynamicStyles.replyLabel}>Replying to {replyingTo.sender === 'me' ? 'yourself' : otherUser.name}</Text>
              <Text style={dynamicStyles.replyText} numberOfLines={1}>
                {replyingTo.text || 'Media message'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <Icon name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        <View style={dynamicStyles.inputContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowMediaPicker(true)}
          >
            <Icon name="add" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={dynamicStyles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            maxLength={1000}
          />

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Icon name="mood" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {inputText.trim() ? (
            <TouchableOpacity style={[styles.sendButton, { backgroundColor: theme.colors.primary }]} onPress={sendMessage}>
              <Icon name="send" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setIsRecording(true)}
            >
              <Icon name="mic" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      {showEmojiPicker && (
        <EmojiPicker
          onSelect={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {showMediaPicker && (
        <MediaPicker
          onSelect={handleMediaSelect}
          onClose={() => setShowMediaPicker(false)}
        />
      )}

      {isRecording && (
        <VoiceRecorder
          onSend={handleVoiceMessage}
          onCancel={() => setIsRecording(false)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 12,
    fontWeight: '500',
  },
  replyContent: {
    flex: 1,
    marginRight: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatScreen;