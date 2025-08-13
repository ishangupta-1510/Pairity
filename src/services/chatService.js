import api from './api';
import io from 'socket.io-client';
import { Platform } from 'react-native';

// Socket configuration
const SOCKET_URL = __DEV__
  ? Platform.OS === 'ios'
    ? 'http://localhost:3000'
    : 'http://10.0.2.2:3000'
  : 'https://api.pairity.com';

class ChatService {
  constructor() {
    this.socket = null;
    this.listeners = {};
  }

  // Initialize socket connection
  initSocket(token) {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.emit('connected', true);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.emit('connected', false);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emit('error', error);
    });

    // Chat events
    this.socket.on('chat:message', (data) => {
      this.emit('newMessage', data);
    });

    this.socket.on('chat:typing', (data) => {
      this.emit('typing', data);
    });

    this.socket.on('chat:read', (data) => {
      this.emit('messageRead', data);
    });

    this.socket.on('chat:delivered', (data) => {
      this.emit('messageDelivered', data);
    });

    // Match events
    this.socket.on('match:new', (data) => {
      this.emit('newMatch', data);
    });

    this.socket.on('match:expired', (data) => {
      this.emit('matchExpired', data);
    });

    // Notification events
    this.socket.on('notification:like', (data) => {
      this.emit('newLike', data);
    });

    this.socket.on('notification:visitor', (data) => {
      this.emit('profileVisitor', data);
    });
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners = {};
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }

  // Socket emit methods
  joinRoom(matchId) {
    if (this.socket) {
      this.socket.emit('chat:join', { matchId });
    }
  }

  leaveRoom(matchId) {
    if (this.socket) {
      this.socket.emit('chat:leave', { matchId });
    }
  }

  sendTyping(matchId, isTyping) {
    if (this.socket) {
      this.socket.emit('chat:typing', { matchId, isTyping });
    }
  }

  // API methods
  async getConversations() {
    const response = await api.get('/chat/conversations');
    return response.data;
  }

  async getMessages(matchId, before = null, limit = 50) {
    const params = { limit };
    if (before) params.before = before;
    
    const response = await api.get(`/chat/conversations/${matchId}/messages`, params);
    return response.data;
  }

  async sendMessage(matchId, content, type = 'text', replyTo = null) {
    const data = {
      matchId,
      type,
      content: type === 'text' ? { text: content } : content,
    };
    
    if (replyTo) data.replyTo = replyTo;
    
    const response = await api.post('/chat/messages', data);
    
    // Emit via socket for real-time delivery
    if (this.socket) {
      this.socket.emit('chat:message', {
        matchId,
        ...response.data,
      });
    }
    
    return response.data;
  }

  async uploadMedia(matchId, media) {
    const formData = new FormData();
    formData.append('matchId', matchId);
    formData.append('media', {
      uri: media.uri,
      type: media.type,
      name: media.name || 'media',
    });

    const response = await api.post('/chat/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  async markAsRead(matchId, messageIds) {
    const response = await api.post(`/chat/conversations/${matchId}/read`, {
      messageIds,
    });
    
    // Emit read receipt via socket
    if (this.socket) {
      this.socket.emit('chat:read', {
        matchId,
        messageIds,
      });
    }
    
    return response.data;
  }

  async deleteMessage(messageId) {
    await api.delete(`/chat/messages/${messageId}`);
  }

  async editMessage(messageId, newContent) {
    const response = await api.put(`/chat/messages/${messageId}`, {
      content: newContent,
    });
    return response.data;
  }

  async muteConversation(matchId, duration = null) {
    const response = await api.post(`/chat/conversations/${matchId}/mute`, {
      duration, // in minutes, null for indefinite
    });
    return response.data;
  }

  async unmuteConversation(matchId) {
    const response = await api.post(`/chat/conversations/${matchId}/unmute`);
    return response.data;
  }

  async reportMessage(messageId, reason, details) {
    const response = await api.post('/chat/report', {
      messageId,
      reason,
      details,
    });
    return response.data;
  }

  async searchMessages(query, matchId = null) {
    const params = { query };
    if (matchId) params.matchId = matchId;
    
    const response = await api.get('/chat/search', params);
    return response.data;
  }
}

// Create singleton instance
const chatService = new ChatService();

export default chatService;