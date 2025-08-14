import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Alert,
  Dimensions,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

import {
  updateVideoSettings,
  updateAudioSettings,
  initializeCall,
  updatePermissions,
  setVirtualBackground,
  toggleBackgroundBlur,
  toggleBeautyFilter,
} from '@/store/slices/videoCallSlice';

import VirtualBackgroundPicker from '@/components/videocall/VirtualBackgroundPicker';
import AudioLevelIndicator from '@/components/videocall/AudioLevelIndicator';
import BeautyFilterControls from '@/components/videocall/BeautyFilterControls';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PreCallScreenProps {
  route: {
    params: {
      participantId: string;
      participantName: string;
      participantAvatar: string;
      callType: 'video' | 'audio';
      isScheduled?: boolean;
    };
  };
}

const PreCallScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  
  const { settings, permissions, virtualBackgrounds } = useSelector((state: RootState) => state.videoCall);
  
  const [cameraRef, setCameraRef] = useState<Camera | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showBeautyControls, setShowBeautyControls] = useState(false);
  const [isTestingMic, setIsTestingMic] = useState(false);

  const audioLevelInterval = useRef<NodeJS.Timeout>();

  const params = (route as any).params as PreCallScreenProps['route']['params'];
  const { participantId, participantName, participantAvatar, callType, isScheduled } = params;

  useEffect(() => {
    requestPermissions();
    return () => {
      if (audioLevelInterval.current) {
        clearInterval(audioLevelInterval.current);
      }
    };
  }, []);

  const requestPermissions = async () => {
    try {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const audioPermission = await Camera.requestMicrophonePermissionsAsync();
      
      setHasPermission(cameraPermission.status === 'granted' && audioPermission.status === 'granted');
      
      dispatch(updatePermissions({
        camera: cameraPermission.status === 'granted' ? 'granted' : 'denied',
        microphone: audioPermission.status === 'granted' ? 'granted' : 'denied',
      }));
    } catch (error) {
      console.error('Error requesting permissions:', error);
      setHasPermission(false);
    }
  };

  const testMicrophone = async () => {
    if (!permissions.microphone) {
      Alert.alert('Microphone Permission', 'Please allow microphone access to test audio.');
      return;
    }

    setIsTestingMic(true);
    
    // Simulate audio level detection
    audioLevelInterval.current = setInterval(() => {
      setAudioLevel(Math.random() * 100);
    }, 100);

    setTimeout(() => {
      if (audioLevelInterval.current) {
        clearInterval(audioLevelInterval.current);
      }
      setIsTestingMic(false);
      setAudioLevel(0);
    }, 3000);
  };

  const handleVideoToggle = (enabled: boolean) => {
    dispatch(updateVideoSettings({ enabled }));
  };

  const handleAudioToggle = (enabled: boolean) => {
    dispatch(updateAudioSettings({ enabled }));
  };

  const handleSwitchCamera = () => {
    const newFacingMode = settings.video.facingMode === 'front' ? 'back' : 'front';
    dispatch(updateVideoSettings({ facingMode: newFacingMode }));
  };

  const handleCustomBackground = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const backgroundUri = result.assets[0].uri;
        dispatch(setVirtualBackground(backgroundUri));
      }
    } catch (error) {
      console.error('Error picking background image:', error);
      Alert.alert('Error', 'Failed to select background image');
    }
  };

  const handleJoinCall = () => {
    if (!hasPermission) {
      Alert.alert(
        'Permissions Required',
        'Camera and microphone permissions are required for video calls.',
        [
          { text: 'Settings', onPress: () => requestPermissions() },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    // Initialize call
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const roomId = `room_${participantId}_${Date.now()}`;
    
    dispatch(initializeCall({
      callId,
      roomId,
      type: 'outgoing',
    }));

    // Navigate to video call screen
    navigation.navigate('VideoCall' as never, {
      participantId,
      participantName,
      participantAvatar,
      callId,
      roomId,
    } as never);
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Requesting permissions...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.permissionContainer}>
          <Icon name="videocam-off" size={80} color={theme.colors.textSecondary} />
          <Text style={[styles.permissionTitle, { color: theme.colors.text }]}>
            Camera & Microphone Access Required
          </Text>
          <Text style={[styles.permissionMessage, { color: theme.colors.textSecondary }]}>
            Please allow access to your camera and microphone to make video calls.
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: theme.colors.primary }]}
            onPress={requestPermissions}
          >
            <Text style={styles.permissionButtonText}>Grant Permissions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Camera Preview */}
      <View style={styles.cameraContainer}>
        {settings.video.enabled ? (
          <Camera
            ref={setCameraRef}
            style={styles.camera}
            type={settings.video.facingMode === 'front' ? Camera.Constants.Type.front : Camera.Constants.Type.back}
            ratio="16:9"
          >
            {settings.video.virtualBackground && (
              <ImageBackground
                source={{ uri: settings.video.virtualBackground }}
                style={styles.virtualBackground}
                resizeMode="cover"
              />
            )}
            
            {/* Camera overlay */}
            <View style={styles.cameraOverlay}>
              {/* Network quality indicator */}
              <View style={styles.topOverlay}>
                <View style={styles.networkIndicator}>
                  <Icon name="signal-cellular-4-bar" size={16} color="white" />
                  <Text style={styles.networkText}>Excellent</Text>
                </View>
              </View>

              {/* Participant info */}
              <View style={styles.bottomOverlay}>
                <Text style={styles.participantName}>Calling {participantName}...</Text>
                {isScheduled && (
                  <Text style={styles.scheduledText}>Scheduled Call</Text>
                )}
              </View>
            </View>
          </Camera>
        ) : (
          <View style={[styles.cameraDisabled, { backgroundColor: theme.colors.surface }]}>
            <Icon name="videocam-off" size={60} color={theme.colors.textSecondary} />
            <Text style={[styles.cameraDisabledText, { color: theme.colors.textSecondary }]}>
              Camera is disabled
            </Text>
          </View>
        )}
      </View>

      {/* Controls Panel */}
      <View style={[styles.controlsPanel, { backgroundColor: theme.colors.surface }]}>
        {/* Audio Level Indicator */}
        <View style={styles.audioSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Audio</Text>
          <View style={styles.audioControls}>
            <AudioLevelIndicator level={audioLevel} isActive={isTestingMic} />
            <TouchableOpacity
              style={[styles.testMicButton, { backgroundColor: theme.colors.primaryLight }]}
              onPress={testMicrophone}
              disabled={isTestingMic}
            >
              <Icon 
                name={isTestingMic ? "mic" : "mic-none"} 
                size={16} 
                color={theme.colors.primary} 
              />
              <Text style={[styles.testMicText, { color: theme.colors.primary }]}>
                {isTestingMic ? 'Testing...' : 'Test Mic'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Video/Audio Toggles */}
        <View style={styles.toggleSection}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleItem}>
              <Icon name="videocam" size={20} color={theme.colors.text} />
              <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>Camera</Text>
              <Switch
                value={settings.video.enabled}
                onValueChange={handleVideoToggle}
                trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primaryLight }}
                thumbColor={settings.video.enabled ? theme.colors.primary : theme.colors.textSecondary}
              />
            </View>

            <View style={styles.toggleItem}>
              <Icon name="mic" size={20} color={theme.colors.text} />
              <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>Microphone</Text>
              <Switch
                value={settings.audio.enabled}
                onValueChange={handleAudioToggle}
                trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primaryLight }}
                thumbColor={settings.audio.enabled ? theme.colors.primary : theme.colors.textSecondary}
              />
            </View>
          </View>

          {settings.video.enabled && (
            <View style={styles.toggleRow}>
              <View style={styles.toggleItem}>
                <Icon name="blur-on" size={20} color={theme.colors.text} />
                <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>Background Blur</Text>
                <Switch
                  value={settings.video.backgroundBlur}
                  onValueChange={() => dispatch(toggleBackgroundBlur())}
                  trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primaryLight }}
                  thumbColor={settings.video.backgroundBlur ? theme.colors.primary : theme.colors.textSecondary}
                />
              </View>

              <View style={styles.toggleItem}>
                <Icon name="auto-fix-high" size={20} color={theme.colors.text} />
                <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>Beauty Filter</Text>
                <Switch
                  value={settings.video.beautyFilter}
                  onValueChange={() => dispatch(toggleBeautyFilter())}
                  trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primaryLight }}
                  thumbColor={settings.video.beautyFilter ? theme.colors.primary : theme.colors.textSecondary}
                />
              </View>
            </View>
          )}
        </View>

        {/* Additional Options */}
        {settings.video.enabled && (
          <View style={styles.optionsSection}>
            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={handleSwitchCamera}
            >
              <Icon name="flip-camera-ios" size={20} color={theme.colors.text} />
              <Text style={[styles.optionText, { color: theme.colors.text }]}>Switch Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={() => setShowBackgroundPicker(true)}
            >
              <Icon name="wallpaper" size={20} color={theme.colors.text} />
              <Text style={[styles.optionText, { color: theme.colors.text }]}>Background</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={() => setShowBeautyControls(true)}
            >
              <Icon name="face-retouching-natural" size={20} color={theme.colors.text} />
              <Text style={[styles.optionText, { color: theme.colors.text }]}>Effects</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={[styles.actionBar, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[styles.cancelCallButton, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={handleCancel}
        >
          <Icon name="close" size={24} color={theme.colors.textSecondary} />
          <Text style={[styles.cancelCallText, { color: theme.colors.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.joinCallButton, { backgroundColor: theme.colors.premium }]}
          onPress={handleJoinCall}
        >
          <Icon name="videocam" size={24} color="white" />
          <Text style={styles.joinCallText}>Join Call</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <VirtualBackgroundPicker
        visible={showBackgroundPicker}
        onClose={() => setShowBackgroundPicker(false)}
        onSelectBackground={(background) => {
          if (background) {
            dispatch(setVirtualBackground(background.url));
          } else {
            dispatch(setVirtualBackground(undefined));
          }
          setShowBackgroundPicker(false);
        }}
        onCustomBackground={handleCustomBackground}
        backgrounds={virtualBackgrounds}
      />

      <BeautyFilterControls
        visible={showBeautyControls}
        onClose={() => setShowBeautyControls(false)}
        settings={settings.video}
        onUpdateSettings={(updates) => dispatch(updateVideoSettings(updates))}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 16,
  },
  permissionMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontSize: 14,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  virtualBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topOverlay: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 32,
  },
  networkIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  networkText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  bottomOverlay: {
    padding: 16,
    alignItems: 'center',
  },
  participantName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  scheduledText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  cameraDisabled: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  cameraDisabledText: {
    fontSize: 16,
  },
  controlsPanel: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  audioSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  testMicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  testMicText: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggleSection: {
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  toggleLabel: {
    flex: 1,
    fontSize: 14,
  },
  optionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  optionButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    gap: 4,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  cancelCallText: {
    fontSize: 16,
    fontWeight: '500',
  },
  joinCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  joinCallText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PreCallScreen;