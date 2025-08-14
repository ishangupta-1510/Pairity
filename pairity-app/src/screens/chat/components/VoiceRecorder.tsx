import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface VoiceRecorderProps {
  onSend: (uri: string, duration: number) => void;
  onCancel: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSend, onCancel }) => {
  const [duration, setDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = () => {
    onSend('voice_recording_uri', duration);
  };

  return (
    <Modal
      visible={true}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Recording Voice Message</Text>
          
          <Animated.View
            style={[
              styles.recordingIndicator,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Icon name="mic" size={48} color="#fff" />
          </Animated.View>

          <Text style={styles.duration}>{formatDuration(duration)}</Text>

          <View style={styles.waveform}>
            {[...Array(20)].map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.waveBar,
                  {
                    height: 20 + Math.random() * 30,
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.2],
                      outputRange: [0.3, 1],
                    }),
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Icon name="close" size={24} color="#666" />
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.sendButton]}
              onPress={handleSend}
            >
              <Icon name="send" size={24} color="#fff" />
              <Text style={[styles.buttonText, styles.sendButtonText]}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 30,
  },
  recordingIndicator: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  duration: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    marginBottom: 30,
  },
  waveBar: {
    width: 3,
    backgroundColor: '#FF6B6B',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 0.45,
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  sendButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  sendButtonText: {
    color: '#fff',
  },
});

export default VoiceRecorder;