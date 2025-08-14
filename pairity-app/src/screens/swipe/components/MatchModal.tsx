import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';
import { MatchData } from '@/types/matching';

const { width: screenWidth } = Dimensions.get('window');

interface MatchModalProps {
  visible: boolean;
  onClose: () => void;
  match: MatchData;
  onMessage: () => void;
}

const MatchModal: React.FC<MatchModalProps> = ({
  visible,
  onClose,
  match,
  onMessage,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const photo1Scale = useRef(new Animated.Value(0)).current;
  const photo2Scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Entrance animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(200),
          Animated.spring(photo1Scale, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(400),
          Animated.spring(photo2Scale, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      photo1Scale.setValue(0);
      photo2Scale.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
          {/* Confetti Animation */}
          <LottieView
            source={require('@/assets/animations/confetti.json')}
            autoPlay
            loop={false}
            style={styles.confetti}
            pointerEvents="none"
          />

          <Text style={styles.title}>It's a Match!</Text>
          <Text style={styles.subtitle}>
            You and {match.user.name} liked each other
          </Text>

          {/* Profile Photos */}
          <View style={styles.photosContainer}>
            <Animated.View
              style={[
                styles.photoWrapper,
                { transform: [{ scale: photo1Scale }] },
              ]}
            >
              <Image
                source={{ uri: 'https://i.pravatar.cc/300?img=1' }} // Current user photo
                style={styles.photo}
              />
            </Animated.View>

            <View style={styles.heartContainer}>
              <Icon name="favorite" size={32} color="#FF6B6B" />
            </View>

            <Animated.View
              style={[
                styles.photoWrapper,
                { transform: [{ scale: photo2Scale }] },
              ]}
            >
              <Image
                source={{ uri: match.user.photos[0] }}
                style={styles.photo}
              />
            </Animated.View>
          </View>

          {/* Match Info */}
          <View style={styles.matchInfo}>
            <Text style={styles.matchPercentage}>
              {match.user.matchPercentage}% Match
            </Text>
            {match.user.interests.length > 0 && (
              <Text style={styles.commonInterests}>
                {match.user.interests.length} common interests
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <TouchableOpacity style={styles.messageButton} onPress={onMessage}>
            <Icon name="chat" size={20} color="#fff" />
            <Text style={styles.messageButtonText}>Send a Message</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.keepSwipingButton} onPress={onClose}>
            <Text style={styles.keepSwipingText}>Keep Swiping</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: screenWidth - 40,
    maxWidth: 400,
  },
  confetti: {
    position: 'absolute',
    top: -100,
    left: -100,
    right: -100,
    bottom: -100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  photosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  photoWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  heartContainer: {
    marginHorizontal: 20,
    backgroundColor: '#FFF5F5',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  matchPercentage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#51CF66',
    marginBottom: 4,
  },
  commonInterests: {
    fontSize: 14,
    color: '#666',
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    width: '100%',
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 10,
    flex: 1,
    textAlign: 'center',
  },
  keepSwipingButton: {
    paddingVertical: 10,
  },
  keepSwipingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
});

export default MatchModal;