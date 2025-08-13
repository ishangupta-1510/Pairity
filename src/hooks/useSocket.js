import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import chatService from '../services/chatService';
import {
  addMessage,
  setTypingUser,
  incrementUnreadCount,
  updateMessageStatus,
  setSocketConnected,
} from '../store/slices/chatSlice';
import { addMatch } from '../store/slices/matchSlice';
import { selectUser } from '../store/slices/authSlice';

export const useSocket = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const listenersRef = useRef({});

  useEffect(() => {
    if (!user?.token) return;

    // Initialize socket connection
    chatService.initSocket(user.token);

    // Setup event listeners
    setupListeners();

    // Cleanup on unmount
    return () => {
      cleanupListeners();
      chatService.disconnect();
    };
  }, [user?.token]);

  const setupListeners = useCallback(() => {
    // Connection events
    listenersRef.current.connected = (isConnected) => {
      dispatch(setSocketConnected(isConnected));
    };
    chatService.on('connected', listenersRef.current.connected);

    // New message
    listenersRef.current.newMessage = (data) => {
      dispatch(addMessage({
        matchId: data.matchId,
        message: data,
      }));
      
      // Increment unread count if not in active conversation
      if (data.senderId !== user?.id) {
        dispatch(incrementUnreadCount({ matchId: data.matchId }));
      }
    };
    chatService.on('newMessage', listenersRef.current.newMessage);

    // Typing indicator
    listenersRef.current.typing = (data) => {
      dispatch(setTypingUser({
        matchId: data.matchId,
        userId: data.userId,
        isTyping: data.isTyping,
      }));
    };
    chatService.on('typing', listenersRef.current.typing);

    // Message read
    listenersRef.current.messageRead = (data) => {
      data.messageIds.forEach((messageId) => {
        dispatch(updateMessageStatus({
          matchId: data.matchId,
          messageId,
          status: 'read',
        }));
      });
    };
    chatService.on('messageRead', listenersRef.current.messageRead);

    // Message delivered
    listenersRef.current.messageDelivered = (data) => {
      dispatch(updateMessageStatus({
        matchId: data.matchId,
        messageId: data.messageId,
        status: 'delivered',
      }));
    };
    chatService.on('messageDelivered', listenersRef.current.messageDelivered);

    // New match
    listenersRef.current.newMatch = (data) => {
      dispatch(addMatch(data.match));
      // You might want to show a notification here
    };
    chatService.on('newMatch', listenersRef.current.newMatch);

    // Match expired
    listenersRef.current.matchExpired = (data) => {
      // Handle match expiration
      console.log('Match expired:', data);
    };
    chatService.on('matchExpired', listenersRef.current.matchExpired);

    // New like
    listenersRef.current.newLike = (data) => {
      // Handle new like notification
      console.log('New like:', data);
    };
    chatService.on('newLike', listenersRef.current.newLike);

    // Profile visitor
    listenersRef.current.profileVisitor = (data) => {
      // Handle profile visitor notification
      console.log('Profile visitor:', data);
    };
    chatService.on('profileVisitor', listenersRef.current.profileVisitor);
  }, [dispatch, user?.id]);

  const cleanupListeners = useCallback(() => {
    Object.entries(listenersRef.current).forEach(([event, handler]) => {
      chatService.off(event, handler);
    });
    listenersRef.current = {};
  }, []);

  // Public methods
  const joinRoom = useCallback((matchId) => {
    chatService.joinRoom(matchId);
  }, []);

  const leaveRoom = useCallback((matchId) => {
    chatService.leaveRoom(matchId);
  }, []);

  const sendTyping = useCallback((matchId, isTyping) => {
    chatService.sendTyping(matchId, isTyping);
  }, []);

  const sendMessage = useCallback(async (matchId, content, type = 'text') => {
    try {
      const message = await chatService.sendMessage(matchId, content, type);
      return { success: true, data: message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const markAsRead = useCallback(async (matchId, messageIds) => {
    try {
      await chatService.markAsRead(matchId, messageIds);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  return {
    joinRoom,
    leaveRoom,
    sendTyping,
    sendMessage,
    markAsRead,
  };
};