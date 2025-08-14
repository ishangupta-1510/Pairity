import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FastImage from 'react-native-fast-image';
import { User } from '@/types/discover';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 48) / 2;

interface UserCardGridProps {
  user: User;
  onPress: () => void;
  onLike: () => void;
}

const UserCardGrid: React.FC<UserCardGridProps> = React.memo(({ user, onPress, onLike }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <FastImage
        source={{ uri: user.photos[0] }}
        style={styles.image}
        resizeMode={FastImage.resizeMode.cover}
      >
        <View style={styles.overlay}>
          {/* Online Indicator */}
          {user.isOnline && (
            <View style={styles.onlineIndicator}>
              <Icon name="circle" size={8} color="#51CF66" />
            </View>
          )}

          {/* Verified Badge */}
          {user.isVerified && (
            <View style={styles.verifiedBadge}>
              <Icon name="verified" size={16} color="#fff" />
            </View>
          )}

          {/* User Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {user.name}, {user.age}
            </Text>
            <View style={styles.locationRow}>
              <Icon name="location-on" size={12} color="#fff" />
              <Text style={styles.location}>{user.distance} miles</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onLike();
              }}
            >
              <Icon name="favorite" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Match Percentage */}
          {user.matchPercentage >= 80 && (
            <View style={styles.matchBadge}>
              <Text style={styles.matchText}>{user.matchPercentage}%</Text>
            </View>
          )}
        </View>
      </FastImage>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    height: cardWidth * 1.3,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  onlineIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#339AF0',
    borderRadius: 12,
    padding: 2,
  },
  matchBadge: {
    position: 'absolute',
    top: 40,
    right: 12,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  infoContainer: {
    padding: 12,
    paddingBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 4,
  },
  actions: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default UserCardGrid;