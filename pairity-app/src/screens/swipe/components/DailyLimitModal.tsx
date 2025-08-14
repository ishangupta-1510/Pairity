import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomButton from '@/components/CustomButton';

interface DailyLimitModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const DailyLimitModal: React.FC<DailyLimitModalProps> = ({
  visible,
  onClose,
  onUpgrade,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#666" />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <Icon name="favorite" size={48} color="#FF6B6B" />
            <View style={styles.limitBadge}>
              <Text style={styles.limitText}>0</Text>
            </View>
          </View>

          <Text style={styles.title}>Out of Likes!</Text>
          <Text style={styles.subtitle}>
            You've reached your daily like limit.
            Upgrade to Premium for unlimited likes!
          </Text>

          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <Icon name="all-inclusive" size={20} color="#FF6B6B" />
              <Text style={styles.benefitText}>Unlimited Likes</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="replay" size={20} color="#FFD43B" />
              <Text style={styles.benefitText}>Unlimited Rewinds</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="star" size={20} color="#339AF0" />
              <Text style={styles.benefitText}>5 Super Likes per day</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="flash-on" size={20} color="#9C27B0" />
              <Text style={styles.benefitText}>1 Boost per month</Text>
            </View>
          </View>

          <CustomButton
            title="Upgrade to Premium"
            onPress={onUpgrade}
            variant="primary"
            size="large"
            fullWidth
            style={styles.upgradeButton}
          />

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.laterText}>Maybe Later</Text>
          </TouchableOpacity>

          <View style={styles.timerContainer}>
            <Icon name="schedule" size={16} color="#666" />
            <Text style={styles.timerText}>
              More likes in 12:34:56
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 20,
    maxWidth: 400,
    width: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  limitBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  limitText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  benefitText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  upgradeButton: {
    marginBottom: 15,
  },
  laterText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  timerText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
});

export default DailyLimitModal;