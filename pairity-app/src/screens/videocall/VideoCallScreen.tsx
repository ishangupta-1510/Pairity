import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  PanGestureHandler,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';
import { Camera } from 'expo-camera';
import * as Haptics from 'expo-haptics';

import {
  updateCallStatus,
  updateCallDuration,
  toggleMute,
  toggleVideo,
  toggleSpeaker,
  switchCamera,
  endCall,
  addParticipant,
  updateNetworkQuality,
} from '@/store/slices/videoCallSlice';
import { CallStatus } from '@/types/videocall';

import CallControls from '@/components/videocall/CallControls';
import NetworkQualityIndicator from '@/components/videocall/NetworkQualityIndicator';
import CallDurationTimer from '@/components/videocall/CallDurationTimer';
import ParticipantOverlay from '@/components/videocall/ParticipantOverlay';
import CallChat from '@/components/videocall/CallChat';
import EmojiReactions from '@/components/videocall/EmojiReactions';
import CallEndModal from '@/components/videocall/CallEndModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PIP_WIDTH = 120;
const PIP_HEIGHT = 160;

interface VideoCallScreenProps {
  route: {
    params: {
      participantId: string;
      participantName: string;
      participantAvatar: string;
      callId: string;
      roomId: string;
    };
  };
}

const VideoCallScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  
  const { 
    isInCall, 
    callStatus, 
    callDuration, 
    settings, 
    participants, 
    quality,
    callMessages,
    callEmojis,
  } = useSelector((state: RootState) => state.videoCall);
  
  const [localCameraRef, setLocalCameraRef] = useState<Camera | null>(null);
  const [remoteCameraRef, setRemoteCameraRef] = useState<Camera | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [pipPosition, setPipPosition] = useState({ x: SCREEN_WIDTH - PIP_WIDTH - 20, y: 100 });
  const [showChat, setShowChat] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  
  const controlsTimeout = useRef<NodeJS.Timeout>();
  const durationInterval = useRef<NodeJS.Timeout>();
  const pipPanRef = useRef(new Animated.ValueXY({ x: pipPosition.x, y: pipPosition.y }));
  const startTime = useRef<Date>();

  const params = (route as any).params as VideoCallScreenProps['route']['params'];
  const { participantId, participantName, participantAvatar, callId, roomId } = params;

  useEffect(() => {
    initializeCall();
    return cleanup;
  }, []);

  useEffect(() => {
    if (isInCall && callStatus === CallStatus.IN_PROGRESS) {
      startCallTimer();
    } else if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [isInCall, callStatus]);

  useEffect(() => {
    // Auto-hide controls after 5 seconds
    if (controlsVisible) {
      controlsTimeout.current = setTimeout(() => {
        setControlsVisible(false);
      }, 5000);
    }

    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [controlsVisible]);

  const initializeCall = () => {
    startTime.current = new Date();
    dispatch(updateCallStatus(CallStatus.CONNECTING));
    
    // Add participant
    dispatch(addParticipant({
      id: participantId,
      name: participantName,
      avatar: participantAvatar,
      isLocal: false,
      isMuted: false,
      isVideoEnabled: true,
      connectionQuality: 'good',
      joinedAt: new Date(),
    }));

    // Simulate connection process
    setTimeout(() => {
      dispatch(updateCallStatus(CallStatus.RINGING));
      setTimeout(() => {
        dispatch(updateCallStatus(CallStatus.IN_PROGRESS));
        // Haptic feedback for call start
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 2000);
    }, 1000);

    // Simulate network quality updates
    const qualityInterval = setInterval(() => {
      const levels = ['excellent', 'good', 'fair', 'poor'] as const;
      const randomLevel = levels[Math.floor(Math.random() * levels.length)];
      dispatch(updateNetworkQuality({
        level: randomLevel,
        bandwidth: Math.random() * 1000 + 500,
        latency: Math.random() * 100 + 50,
        packetLoss: Math.random() * 5,
        jitter: Math.random() * 20 + 10,
      }));
    }, 5000);

    return () => clearInterval(qualityInterval);
  };

  const startCallTimer = () => {
    durationInterval.current = setInterval(() => {
      if (startTime.current) {
        const elapsed = Math.floor((Date.now() - startTime.current.getTime()) / 1000);
        dispatch(updateCallDuration(elapsed));
      }
    }, 1000);
  };

  const cleanup = () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }
  };

  const showControls = () => {
    setControlsVisible(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
  };

  const handleScreenTap = () => {
    showControls();
  };

  const handleEndCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowEndModal(true);
  };

  const confirmEndCall = () => {
    dispatch(endCall());
    navigation.goBack();
  };

  const handlePipGesture = Animated.event(
    [{ nativeEvent: { translationX: pipPanRef.current.x, translationY: pipPanRef.current.y } }],
    { useNativeDriver: false }
  );

  const handlePipRelease = (event: any) => {
    const { translationX, translationY } = event.nativeEvent;
    const newX = Math.max(20, Math.min(SCREEN_WIDTH - PIP_WIDTH - 20, pipPosition.x + translationX));
    const newY = Math.max(100, Math.min(SCREEN_HEIGHT - PIP_HEIGHT - 100, pipPosition.y + translationY));
    
    setPipPosition({ x: newX, y: newY });
    
    Animated.spring(pipPanRef.current, {
      toValue: { x: newX, y: newY },
      useNativeDriver: false,
    }).start();
  };

  const renderConnectionStatus = () => {
    if (callStatus === CallStatus.CONNECTING) {
      return (
        <View style={[styles.statusOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.8)' }]}>
          <Icon name="sync" size={40} color="white" />
          <Text style={styles.statusText}>Connecting...</Text>
        </View>
      );
    }

    if (callStatus === CallStatus.RINGING) {
      return (
        <View style={[styles.statusOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.8)' }]}>
          <Icon name="phone" size={40} color="white" />
          <Text style={styles.statusText}>Calling {participantName}...</Text>
          <Text style={styles.statusSubtext}>Waiting for answer</Text>
        </View>
      );
    }

    if (callStatus === CallStatus.RECONNECTING) {
      return (
        <View style={[styles.statusOverlay, { backgroundColor: 'rgba(255, 152, 0, 0.9)' }]}>
          <Icon name="wifi-off" size={40} color="white" />
          <Text style={styles.statusText}>Connection lost</Text>
          <Text style={styles.statusSubtext}>Attempting to reconnect...</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      
      {/* Main Video View */}
      <TouchableOpacity 
        style={styles.mainVideoContainer}
        onPress={handleScreenTap}
        activeOpacity={1}
      >
        {settings.video.enabled ? (
          <Camera
            ref={setRemoteCameraRef}
            style={styles.mainVideo}
            type={Camera.Constants.Type.front}
            ratio="16:9"
          />
        ) : (
          <View style={[styles.videoDisabled, { backgroundColor: theme.colors.surface }]}>
            <Icon name="videocam-off" size={60} color={theme.colors.textSecondary} />
            <Text style={[styles.videoDisabledText, { color: theme.colors.textSecondary }]}>
              Video is disabled
            </Text>
          </View>
        )}

        {/* Connection Status Overlay */}
        {renderConnectionStatus()}

        {/* Top Overlay */}
        {controlsVisible && (
          <Animated.View style={styles.topOverlay}>
            <View style={styles.topLeft}>
              <NetworkQualityIndicator quality={quality} />
              <CallDurationTimer duration={callDuration} />
            </View>
            <TouchableOpacity
              style={styles.minimizeButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="keyboard-arrow-down" size={24} color="white" />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Participant Overlay */}
        <ParticipantOverlay 
          participants={participants}
          visible={controlsVisible}
          onParticipantPress={(participant) => {
            console.log('Participant pressed:', participant.name);
          }}
        />

        {/* Emoji Reactions */}
        <EmojiReactions emojis={callEmojis} />
      </TouchableOpacity>

      {/* Picture-in-Picture Local Video */}
      {settings.video.enabled && (
        <PanGestureHandler
          onGestureEvent={handlePipGesture}
          onHandlerStateChange={(event) => {
            if (event.nativeEvent.state === 5) { // END state
              handlePipRelease(event);
            }
          }}
        >
          <Animated.View
            style={[
              styles.pipContainer,
              {
                transform: [
                  { translateX: pipPanRef.current.x },
                  { translateY: pipPanRef.current.y },
                ],
              },
            ]}
          >
            <Camera
              ref={setLocalCameraRef}
              style={styles.pipVideo}
              type={settings.video.facingMode === 'front' ? Camera.Constants.Type.front : Camera.Constants.Type.back}
            />
            
            {settings.audio.enabled ? null : (
              <View style={styles.pipMutedIndicator}>
                <Icon name="mic-off" size={12} color="white" />
              </View>
            )}
          </Animated.View>
        </PanGestureHandler>
      )}

      {/* Call Controls */}
      {controlsVisible && (
        <CallControls
          settings={settings}
          onToggleMute={() => dispatch(toggleMute())}
          onToggleVideo={() => dispatch(toggleVideo())}
          onToggleSpeaker={() => dispatch(toggleSpeaker())}
          onSwitchCamera={() => dispatch(switchCamera())}
          onToggleChat={() => setShowChat(!showChat)}
          onEndCall={handleEndCall}
          onScreenShare={() => {
            Alert.alert('Screen Share', 'Screen sharing feature coming soon!');
          }}
          onMore={() => {
            showControls();
          }}
        />
      )}

      {/* Chat Overlay */}
      <CallChat
        visible={showChat}
        messages={callMessages}
        onClose={() => setShowChat(false)}
        onSendMessage={(message) => {
          // TODO: Send message through WebRTC
          console.log('Send message:', message);
        }}
        onSendEmoji={(emoji, position) => {
          // TODO: Send emoji reaction
          console.log('Send emoji:', emoji, position);
        }}
      />

      {/* End Call Modal */}
      <CallEndModal
        visible={showEndModal}
        participantName={participantName}
        callDuration={callDuration}
        onConfirm={confirmEndCall}
        onCancel={() => setShowEndModal(false)}
        onRate={(rating) => {
          console.log('Call rating:', rating);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  mainVideoContainer: {
    flex: 1,
    position: 'relative',
  },
  mainVideo: {
    flex: 1,
  },
  videoDisabled: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  videoDisabledText: {
    fontSize: 16,
  },
  statusOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    gap: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 32,
    zIndex: 20,
  },
  topLeft: {
    gap: 8,
  },
  minimizeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  pipContainer: {
    position: 'absolute',
    width: PIP_WIDTH,
    height: PIP_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 30,
  },
  pipVideo: {
    flex: 1,
  },
  pipMutedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 2,
  },
});

export default VideoCallScreen;