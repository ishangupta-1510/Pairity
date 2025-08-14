import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

import {
  setIncomingCall,
  initializeCall,
  updateCallStatus,
} from '@/store/slices/videoCallSlice';
import { CallStatus } from '@/types/videocall';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface IncomingCallScreenProps {
  route: {
    params: {
      callId: string;
      callerId: string;
      callerName: string;
      callerAvatar: string;
      callType: 'video' | 'audio';
      isScheduled: boolean;
      scheduledTime?: Date;
      customRingtone?: string;
      priority: 'normal' | 'high';
    };
  };
}

const IncomingCallScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  
  const { incomingCall } = useSelector((state: RootState) => state.videoCall);
  
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [showQuickReply, setShowQuickReply] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const acceptButtonAnim = useRef(new Animated.Value(0)).current;
  const declineButtonAnim = useRef(new Animated.Value(0)).current;

  const params = (route as any).params as IncomingCallScreenProps['route']['params'];
  const {
    callId,
    callerId,
    callerName,
    callerAvatar,
    callType,
    isScheduled,
    scheduledTime,
    customRingtone,
    priority,
  } = params;

  useEffect(() => {
    startAnimations();
    playRingtone();
    startHapticFeedback();

    return () => {
      stopRingtone();
      stopHapticFeedback();
    };
  }, []);

  const startAnimations = () => {
    // Slide up animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Pulse animation for caller image
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Button animations
    Animated.stagger(100, [
      Animated.spring(declineButtonAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(acceptButtonAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const playRingtone = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        // Use custom ringtone if provided, otherwise default
        customRingtone 
          ? { uri: customRingtone }
          : require('@/assets/sounds/default-ringtone.mp3'),
        { isLooping: true, volume: 0.8 }
      );
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing ringtone:', error);
    }
  };

  const stopRingtone = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      } catch (error) {
        console.error('Error stopping ringtone:', error);
      }
    }
  };

  const startHapticFeedback = () => {
    if (priority === 'high') {
      // More intense haptic for high priority calls
      const hapticInterval = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 1000);

      return () => clearInterval(hapticInterval);
    } else {
      // Regular haptic pattern
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const stopHapticFeedback = () => {
    // Stop any ongoing haptic feedback
  };

  const handleAcceptCall = async () => {
    await stopRingtone();
    stopHapticFeedback();
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Clear incoming call state
    dispatch(setIncomingCall(null));

    // Initialize the call
    dispatch(initializeCall({
      callId,
      roomId: `room_${callId}`,
      type: 'incoming',
    }));

    // Navigate to video call screen
    navigation.replace('VideoCall' as never, {
      participantId: callerId,
      participantName: callerName,
      participantAvatar: callerAvatar,
      callId,
      roomId: `room_${callId}`,
    } as never);
  };

  const handleDeclineCall = async () => {
    await stopRingtone();
    stopHapticFeedback();
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    // Clear incoming call state
    dispatch(setIncomingCall(null));

    // Update call status to declined
    dispatch(updateCallStatus(CallStatus.DECLINED));

    // Navigate back
    navigation.goBack();
  };

  const handleQuickReply = (message: string) => {
    // TODO: Send quick reply message
    console.log('Quick reply:', message);
    handleDeclineCall();
  };

  const quickReplyOptions = [
    "Can't talk right now",
    "Call me in 5 minutes",
    "I'll call you back",
    "Text me instead",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0, 0, 0, 0.9)" translucent />
      
      <Animated.View 
        style={[
          styles.content,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        {/* Background Gradient */}
        <View style={styles.backgroundGradient} />

        {/* Call Type Indicator */}
        <View style={styles.callTypeContainer}>
          <Icon 
            name={callType === 'video' ? 'videocam' : 'phone'} 
            size={20} 
            color="rgba(255, 255, 255, 0.8)" 
          />
          <Text style={styles.callTypeText}>
            {isScheduled ? 'Scheduled ' : ''}
            {callType === 'video' ? 'Video Call' : 'Voice Call'}
          </Text>
          {priority === 'high' && (
            <View style={styles.priorityIndicator}>
              <Icon name="priority-high" size={16} color="#FF3B30" />
            </View>
          )}
        </View>

        {/* Caller Information */}
        <View style={styles.callerSection}>
          <Animated.View 
            style={[
              styles.callerImageContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <Image
              source={{ uri: callerAvatar }}
              style={styles.callerImage}
              defaultSource={require('@/assets/images/default-avatar.png')}
            />
            <View style={styles.callerImageBorder} />
          </Animated.View>
          
          <Text style={styles.callerName}>{callerName}</Text>
          
          {isScheduled && scheduledTime && (
            <Text style={styles.scheduledTime}>
              Scheduled for {new Date(scheduledTime).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          )}
          
          <Text style={styles.callingText}>
            {callType === 'video' ? 'Incoming video call...' : 'Incoming call...'}
          </Text>
        </View>

        {/* Quick Reply Options */}
        {showQuickReply && (
          <Animated.View style={styles.quickReplyContainer}>
            <Text style={styles.quickReplyTitle}>Quick Reply</Text>
            {quickReplyOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickReplyOption}
                onPress={() => handleQuickReply(option)}
              >
                <Text style={styles.quickReplyText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Quick Reply Button */}
          <TouchableOpacity
            style={styles.quickReplyButton}
            onPress={() => setShowQuickReply(!showQuickReply)}
          >
            <Icon name="message" size={24} color="white" />
          </TouchableOpacity>

          {/* Decline Button */}
          <Animated.View style={{ transform: [{ scale: declineButtonAnim }] }}>
            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
              onPress={handleDeclineCall}
              activeOpacity={0.8}
            >
              <Icon name="call-end" size={32} color="white" />
            </TouchableOpacity>
          </Animated.View>

          {/* Accept Button */}
          <Animated.View style={{ transform: [{ scale: acceptButtonAnim }] }}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={handleAcceptCall}
              activeOpacity={0.8}
            >
              <Icon 
                name={callType === 'video' ? 'videocam' : 'phone'} 
                size={32} 
                color="white" 
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Swipe Up Hint */}
        <View style={styles.swipeHint}>
          <Text style={styles.swipeHintText}>Swipe up for more options</Text>
          <Icon name="keyboard-arrow-up" size={20} color="rgba(255, 255, 255, 0.6)" />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'linear-gradient(45deg, rgba(255, 121, 121, 0.1), rgba(121, 134, 203, 0.1))',
  },
  callTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  callTypeText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  priorityIndicator: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderRadius: 8,
    padding: 2,
  },
  callerSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  callerImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  callerImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  callerImageBorder: {
    position: 'absolute',
    width: 176,
    height: 176,
    borderRadius: 88,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    top: -8,
    left: -8,
  },
  callerName: {
    color: 'white',
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
  },
  scheduledTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
  callingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 18,
    textAlign: 'center',
  },
  quickReplyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  quickReplyTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  quickReplyOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 8,
  },
  quickReplyText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  quickReplyButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  declineButton: {
    backgroundColor: '#FF3B30',
  },
  acceptButton: {
    backgroundColor: '#34C759',
  },
  swipeHint: {
    alignItems: 'center',
    opacity: 0.6,
  },
  swipeHintText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginBottom: 4,
  },
});

export default IncomingCallScreen;