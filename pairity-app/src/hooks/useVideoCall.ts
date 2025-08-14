import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Alert, AppState, AppStateStatus } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

import {
  initializeCall,
  updateCallStatus,
  updateCallDuration,
  setLocalStream,
  setRemoteStream,
  addParticipant,
  removeParticipant,
  updateParticipant,
  updateNetworkQuality,
  endCall,
  resetCallState,
  addCallToHistory,
  setIncomingCall,
  addCallMessage,
  addCallEmoji,
  updatePermissions,
  setError,
} from '@/store/slices/videoCallSlice';

import {
  CallStatus,
  CallParticipant,
  NetworkQuality,
  CallHistory,
  IncomingCall,
  CallMessage,
  CallEmoji,
  CallPermissions,
} from '@/types/videocall';

export const useVideoCall = () => {
  const dispatch = useDispatch();
  const videoCallState = useSelector((state: RootState) => state.videoCall);
  
  const startTimeRef = useRef<Date>();
  const durationIntervalRef = useRef<NodeJS.Timeout>();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const audioSessionRef = useRef<Audio.Sound>();

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current === 'active' && nextAppState.match(/inactive|background/)) {
        // App went to background during call
        if (videoCallState.isInCall) {
          handleCallBackground();
        }
      } else if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground during call
        if (videoCallState.isInCall) {
          handleCallForeground();
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [videoCallState.isInCall]);

  // Initialize video call
  const initiateCall = useCallback((params: {
    participantId: string;
    participantName: string;
    participantAvatar: string;
    callType: 'video' | 'audio';
    isScheduled?: boolean;
  }) => {
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const roomId = `room_${params.participantId}_${Date.now()}`;
    
    dispatch(initializeCall({
      callId,
      roomId,
      type: 'outgoing',
    }));

    // Add participant
    dispatch(addParticipant({
      id: params.participantId,
      name: params.participantName,
      avatar: params.participantAvatar,
      isLocal: false,
      isMuted: false,
      isVideoEnabled: params.callType === 'video',
      connectionQuality: 'good',
      joinedAt: new Date(),
    }));

    return { callId, roomId };
  }, [dispatch]);

  // Accept incoming call
  const acceptIncomingCall = useCallback(async (incomingCall: IncomingCall) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      dispatch(initializeCall({
        callId: incomingCall.callId,
        roomId: `room_${incomingCall.callId}`,
        type: 'incoming',
      }));

      dispatch(addParticipant({
        id: incomingCall.callerId,
        name: incomingCall.callerName,
        avatar: incomingCall.callerAvatar,
        isLocal: false,
        isMuted: false,
        isVideoEnabled: incomingCall.callType === 'video',
        connectionQuality: 'good',
        joinedAt: new Date(),
      }));

      dispatch(setIncomingCall(null));
      
      return true;
    } catch (error) {
      console.error('Error accepting call:', error);
      dispatch(setError('Failed to accept call'));
      return false;
    }
  }, [dispatch]);

  // Decline incoming call
  const declineIncomingCall = useCallback((incomingCall: IncomingCall, reason?: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    dispatch(updateCallStatus(CallStatus.DECLINED));
    dispatch(setIncomingCall(null));
    
    // TODO: Send decline message to caller
    if (reason) {
      console.log('Decline reason:', reason);
    }
  }, [dispatch]);

  // Start call timer
  const startCallTimer = useCallback(() => {
    startTimeRef.current = new Date();
    
    durationIntervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000);
        dispatch(updateCallDuration(elapsed));
      }
    }, 1000);
  }, [dispatch]);

  // Stop call timer
  const stopCallTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = undefined;
    }
  }, []);

  // End call
  const endVideoCall = useCallback(() => {
    stopCallTimer();
    
    // Create call history entry
    if (videoCallState.isInCall) {
      const participant = videoCallState.participants.find(p => !p.isLocal);
      if (participant) {
        const historyEntry: CallHistory = {
          id: videoCallState.callId,
          participantId: participant.id,
          participantName: participant.name,
          participantAvatar: participant.avatar,
          type: videoCallState.callType === 'incoming' ? 'incoming' : 'outgoing',
          status: videoCallState.callStatus,
          startTime: startTimeRef.current || new Date(),
          endTime: new Date(),
          duration: videoCallState.callDuration,
          quality: videoCallState.quality,
        };
        
        dispatch(addCallToHistory(historyEntry));
      }
    }
    
    dispatch(endCall());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [dispatch, videoCallState]);

  // Update network quality
  const updateCallQuality = useCallback((quality: NetworkQuality) => {
    dispatch(updateNetworkQuality(quality));
  }, [dispatch]);

  // Send chat message
  const sendChatMessage = useCallback((message: string) => {
    const chatMessage: CallMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'local', // Current user
      message,
      timestamp: new Date(),
      type: 'text',
    };
    
    dispatch(addCallMessage(chatMessage));
    
    // TODO: Send via WebRTC data channel
    console.log('Send chat message:', message);
  }, [dispatch]);

  // Send emoji reaction
  const sendEmojiReaction = useCallback((emoji: string, position: { x: number; y: number }) => {
    const emojiReaction: CallEmoji = {
      id: `emoji_${Date.now()}`,
      senderId: 'local',
      emoji,
      timestamp: new Date(),
      position,
      animation: 'bounce',
    };
    
    dispatch(addCallEmoji(emojiReaction));
    
    // Remove emoji after animation
    setTimeout(() => {
      // dispatch(removeCallEmoji(emojiReaction.id));
    }, 3000);
    
    // TODO: Send via WebRTC
    console.log('Send emoji reaction:', emoji, position);
  }, [dispatch]);

  // Handle call background
  const handleCallBackground = useCallback(() => {
    // Minimize video if in background to save battery
    if (videoCallState.settings.video.enabled) {
      // TODO: Pause local video stream
      console.log('App backgrounded - pausing video');
    }
  }, [videoCallState.settings.video.enabled]);

  // Handle call foreground
  const handleCallForeground = useCallback(() => {
    // Resume video if it was enabled
    if (videoCallState.settings.video.enabled) {
      // TODO: Resume local video stream
      console.log('App foregrounded - resuming video');
    }
  }, [videoCallState.settings.video.enabled]);

  // Request permissions
  const requestCallPermissions = useCallback(async (): Promise<CallPermissions> => {
    try {
      // Request camera permission
      const cameraStatus = await Audio.requestPermissionsAsync();
      
      // Request microphone permission  
      const microphoneStatus = await Audio.requestPermissionsAsync();
      
      // Request notification permission (for incoming calls)
      // const notificationStatus = await Notifications.requestPermissionsAsync();
      
      const permissions: CallPermissions = {
        camera: cameraStatus.granted ? 'granted' : 'denied',
        microphone: microphoneStatus.granted ? 'granted' : 'denied',
        notifications: 'granted', // Assume granted for now
      };
      
      dispatch(updatePermissions(permissions));
      return permissions;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      const deniedPermissions: CallPermissions = {
        camera: 'denied',
        microphone: 'denied',
        notifications: 'denied',
      };
      dispatch(updatePermissions(deniedPermissions));
      return deniedPermissions;
    }
  }, [dispatch]);

  // Check if call is possible
  const canMakeCall = useCallback(() => {
    return videoCallState.permissions.camera === 'granted' && 
           videoCallState.permissions.microphone === 'granted';
  }, [videoCallState.permissions]);

  // Get call duration formatted
  const getFormattedCallDuration = useCallback((duration: number): string => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Get network quality description
  const getNetworkQualityDescription = useCallback((quality: NetworkQuality): string => {
    switch (quality.level) {
      case 'excellent':
        return 'Excellent connection';
      case 'good':
        return 'Good connection';
      case 'fair':
        return 'Fair connection';
      case 'poor':
        return 'Poor connection - consider switching networks';
      default:
        return 'Connection quality unknown';
    }
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    stopCallTimer();
    if (audioSessionRef.current) {
      audioSessionRef.current.unloadAsync();
    }
    dispatch(resetCallState());
  }, [dispatch, stopCallTimer]);

  return {
    // State
    callState: videoCallState,
    
    // Actions
    initiateCall,
    acceptIncomingCall,
    declineIncomingCall,
    endVideoCall,
    startCallTimer,
    stopCallTimer,
    sendChatMessage,
    sendEmojiReaction,
    updateCallQuality,
    requestCallPermissions,
    cleanup,
    
    // Utilities
    canMakeCall,
    getFormattedCallDuration,
    getNetworkQualityDescription,
    
    // Status checks
    isInCall: videoCallState.isInCall,
    callStatus: videoCallState.callStatus,
    callDuration: videoCallState.callDuration,
    hasIncomingCall: !!videoCallState.incomingCall,
  };
};