import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { User } from '@/types/discover';

interface UserCardListProps {
  user: User;
  onPress: () => void;
  onLike: () => void;
  onMessage: () => void;
}

const UserCardList: React.FC<UserCardListProps> = React.memo(({ 
  user, 
  onPress, 
  onLike, 
  onMessage 
}) => {
  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `Active ${minutes}m ago`;
    if (hours < 24) return `Active ${hours}h ago`;
    if (days < 7) return `Active ${days}d ago`;
    return `Active ${Math.floor(days / 7)}w ago`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.content}>
        {/* Photo Section */}
        <View style={styles.photoSection}>
          <Image 
            source={{ uri: user.photos[0] }} 
            style={styles.photo}
            contentFit="cover"
          />
          {user.isOnline && (
            <View style={styles.onlineIndicator}>
              <Icon name="circle" size={10} color="#51CF66" />
            </View>
          )}
          {user.isVerified && (
            <View style={styles.verifiedBadge}>
              <Icon name="verified" size={14} color="#fff" />
            </View>
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.headerRow}>
            <Text style={styles.name}>{user.name}, {user.age}</Text>
            {user.isNew && (
              <View style={styles.newBadge}>
                <Text style={styles.newText}>NEW</Text>
              </View>
            )}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icon name="location-on" size={14} color="#666" />
              <Text style={styles.metaText}>{user.distance} miles</Text>
            </View>
            {!user.isOnline && (
              <Text style={styles.lastActive}>{formatLastActive(user.lastActive)}</Text>
            )}
          </View>

          <Text style={styles.bio} numberOfLines={2}>
            {user.bio}
          </Text>

          {/* Interests */}
          <View style={styles.interestsRow}>
            {user.interests.slice(0, 3).map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
            {user.interests.length > 3 && (
              <Text style={styles.moreInterests}>+{user.interests.length - 3}</Text>
            )}
          </View>

          {/* Match Percentage */}
          <View style={styles.matchContainer}>
            <View style={styles.matchBar}>
              <View 
                style={[styles.matchFill, { width: `${user.matchPercentage}%` }]} 
              />
            </View>
            <Text style={styles.matchText}>{user.matchPercentage}% Match</Text>
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              onLike();
            }}
          >
            <Icon name="favorite-border" size={24} color="#FF6B6B" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              onMessage();
            }}
          >
            <Icon name="chat-bubble-outline" size={24} color="#339AF0" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    padding: 12,
  },
  photoSection: {
    position: 'relative',
    marginRight: 12,
  },
  photo: {
    width: 80,
    aspectRatio: 4/5, // Maintain proper aspect ratio
    borderRadius: 8,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
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
    top: 4,
    right: 4,
    backgroundColor: '#339AF0',
    borderRadius: 10,
    padding: 2,
  },
  infoSection: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  newBadge: {
    marginLeft: 8,
    backgroundColor: '#FFD43B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  lastActive: {
    fontSize: 12,
    color: '#999',
  },
  bio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  interestsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  interestTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  interestText: {
    fontSize: 11,
    color: '#666',
  },
  moreInterests: {
    fontSize: 11,
    color: '#999',
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginRight: 8,
  },
  matchFill: {
    height: '100%',
    backgroundColor: '#51CF66',
    borderRadius: 2,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#51CF66',
  },
  actionsSection: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
  actionButton: {
    padding: 8,
    marginBottom: 8,
  },
});

export default UserCardList;