import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CallSettings } from '@/types/videocall';
import * as Haptics from 'expo-haptics';

interface CallControlsProps {
  settings: CallSettings;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
  onSwitchCamera: () => void;
  onToggleChat: () => void;
  onEndCall: () => void;
  onScreenShare: () => void;
  onMore: () => void;
}

const CallControls: React.FC<CallControlsProps> = ({
  settings,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  onSwitchCamera,
  onToggleChat,
  onEndCall,
  onScreenShare,
  onMore,
}) => {
  const handleButtonPress = (action: () => void, haptic = true) => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    action();
  };

  const ControlButton = ({ 
    icon, 
    onPress, 
    isActive = false, 
    isDisabled = false,
    backgroundColor,
    style,
  }: {
    icon: string;
    onPress: () => void;
    isActive?: boolean;
    isDisabled?: boolean;
    backgroundColor?: string;
    style?: any;
  }) => (
    <TouchableOpacity
      style={[
        styles.controlButton,
        isActive && styles.controlButtonActive,
        isDisabled && styles.controlButtonDisabled,
        backgroundColor && { backgroundColor },
        style,
      ]}
      onPress={() => handleButtonPress(onPress, !isDisabled)}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <Icon
        name={icon}
        size={24}
        color={
          backgroundColor === '#FF3B30' 
            ? 'white' 
            : isActive 
            ? 'white' 
            : isDisabled 
            ? 'rgba(255, 255, 255, 0.3)' 
            : 'rgba(255, 255, 255, 0.8)'
        }
      />
    </TouchableOpacity>
  );

  return (
    <Animated.View style={styles.container}>
      <View style={styles.controlsRow}>
        {/* Microphone Toggle */}
        <ControlButton
          icon={settings.audio.enabled ? 'mic' : 'mic-off'}
          onPress={onToggleMute}
          isActive={!settings.audio.enabled}
          backgroundColor={!settings.audio.enabled ? '#FF3B30' : undefined}
        />

        {/* Video Toggle */}
        <ControlButton
          icon={settings.video.enabled ? 'videocam' : 'videocam-off'}
          onPress={onToggleVideo}
          isActive={!settings.video.enabled}
          backgroundColor={!settings.video.enabled ? '#FF3B30' : undefined}
        />

        {/* Speaker Toggle */}
        <ControlButton
          icon={settings.audio.speakerMode ? 'volume-up' : 'volume-down'}
          onPress={onToggleSpeaker}
          isActive={settings.audio.speakerMode}
        />

        {/* Camera Switch */}
        <ControlButton
          icon="flip-camera-ios"
          onPress={onSwitchCamera}
          isDisabled={!settings.video.enabled}
        />

        {/* Chat Toggle */}
        <ControlButton
          icon={settings.chat.visible ? 'chat' : 'chat-bubble-outline'}
          onPress={onToggleChat}
          isActive={settings.chat.visible}
        />
      </View>

      <View style={styles.controlsRow}>
        {/* Screen Share */}
        <ControlButton
          icon={settings.screen.sharing ? 'stop-screen-share' : 'screen-share'}
          onPress={onScreenShare}
          isActive={settings.screen.sharing}
        />

        {/* More Options */}
        <ControlButton
          icon="more-horiz"
          onPress={onMore}
        />

        {/* End Call */}
        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={() => handleButtonPress(onEndCall)}
          activeOpacity={0.8}
        >
          <Icon name="call-end" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 16,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  controlButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  controlButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  endCallButton: {
    backgroundColor: '#FF3B30',
    width: 64,
    height: 64,
    borderRadius: 32,
  },
});

export default CallControls;