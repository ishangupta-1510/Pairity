import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chatService from '../../services/chatService';

const initialState = {
  conversations: [],
  activeConversation: null,
  messages: {},
  typingUsers: {},
  unreadCounts: {},
  isLoading: false,
  error: null,
  socketConnected: false,
};

// Async thunks
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatService.getConversations();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ matchId, before }, { rejectWithValue }) => {
    try {
      const response = await chatService.getMessages(matchId, before);
      return { matchId, messages: response.messages };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ matchId, content, type = 'text' }, { rejectWithValue }) => {
    try {
      const response = await chatService.sendMessage(matchId, content, type);
      return { matchId, message: response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'chat/markAsRead',
  async ({ matchId, messageIds }, { rejectWithValue }) => {
    try {
      await chatService.markAsRead(matchId, messageIds);
      return { matchId, messageIds };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    addMessage: (state, action) => {
      const { matchId, message } = action.payload;
      if (!state.messages[matchId]) {
        state.messages[matchId] = [];
      }
      state.messages[matchId].push(message);
      
      // Update conversation last message
      const conversation = state.conversations.find(c => c.matchId === matchId);
      if (conversation) {
        conversation.lastMessage = message;
        conversation.updatedAt = message.createdAt;
      }
    },
    setTypingUser: (state, action) => {
      const { matchId, userId, isTyping } = action.payload;
      if (!state.typingUsers[matchId]) {
        state.typingUsers[matchId] = {};
      }
      if (isTyping) {
        state.typingUsers[matchId][userId] = true;
      } else {
        delete state.typingUsers[matchId][userId];
      }
    },
    updateUnreadCount: (state, action) => {
      const { matchId, count } = action.payload;
      state.unreadCounts[matchId] = count;
    },
    incrementUnreadCount: (state, action) => {
      const { matchId } = action.payload;
      state.unreadCounts[matchId] = (state.unreadCounts[matchId] || 0) + 1;
    },
    resetUnreadCount: (state, action) => {
      const { matchId } = action.payload;
      state.unreadCounts[matchId] = 0;
    },
    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload;
    },
    updateMessageStatus: (state, action) => {
      const { matchId, messageId, status } = action.payload;
      if (state.messages[matchId]) {
        const message = state.messages[matchId].find(m => m.id === messageId);
        if (message) {
          message.status = status;
        }
      }
    },
    clearChatData: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch Conversations
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload.conversations;
        
        // Set unread counts
        action.payload.conversations.forEach(conv => {
          state.unreadCounts[conv.matchId] = conv.unreadCount || 0;
        });
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Messages
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        const { matchId, messages } = action.payload;
        
        // Append or prepend messages based on pagination
        if (!state.messages[matchId]) {
          state.messages[matchId] = messages;
        } else {
          // Prepend older messages for pagination
          state.messages[matchId] = [...messages, ...state.messages[matchId]];
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Send Message
    builder
      .addCase(sendMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { matchId, message } = action.payload;
        
        if (!state.messages[matchId]) {
          state.messages[matchId] = [];
        }
        state.messages[matchId].push(message);
        
        // Update conversation
        const conversation = state.conversations.find(c => c.matchId === matchId);
        if (conversation) {
          conversation.lastMessage = message;
          conversation.updatedAt = message.createdAt;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Mark as Read
    builder
      .addCase(markAsRead.fulfilled, (state, action) => {
        const { matchId, messageIds } = action.payload;
        
        // Update message status
        if (state.messages[matchId]) {
          state.messages[matchId].forEach(message => {
            if (messageIds.includes(message.id)) {
              message.status = 'read';
            }
          });
        }
        
        // Reset unread count
        state.unreadCounts[matchId] = 0;
      });
  },
});

// Export actions
export const {
  setActiveConversation,
  addMessage,
  setTypingUser,
  updateUnreadCount,
  incrementUnreadCount,
  resetUnreadCount,
  setSocketConnected,
  updateMessageStatus,
  clearChatData,
} = chatSlice.actions;

// Selectors
export const selectConversations = (state) => state.chat.conversations;
export const selectActiveConversation = (state) => state.chat.activeConversation;
export const selectMessages = (state, matchId) => state.chat.messages[matchId] || [];
export const selectTypingUsers = (state, matchId) => state.chat.typingUsers[matchId] || {};
export const selectUnreadCount = (state, matchId) => state.chat.unreadCounts[matchId] || 0;
export const selectTotalUnreadCount = (state) => 
  Object.values(state.chat.unreadCounts).reduce((sum, count) => sum + count, 0);
export const selectSocketConnected = (state) => state.chat.socketConnected;

export default chatSlice.reducer;