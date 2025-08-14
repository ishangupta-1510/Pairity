import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ChatHeaderProps {
  user: {
    id: string;
    name: string;
    photo: string;
    isOnline: boolean;
    lastSeen?: string;
    isTyping?: boolean;
    isPremium?: boolean;
  };
  onBack: () => void;
  onVideoCall: () => void;
  onInfo: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  user,
  onBack,
  onVideoCall,
  onInfo,
}) => {
  const getStatusText = () => {
    if (user.isTyping) return 'typing...';
    if (user.isOnline) return 'online';
    if (user.lastSeen) {
      const lastSeenDate = new Date(user.lastSeen);
      const now = new Date();
      const diffMs = now.getTime() - lastSeenDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) return `last seen ${diffMins}m ago`;
      if (diffHours < 24) return `last seen ${diffHours}h ago`;
      if (diffDays < 7) return `last seen ${diffDays}d ago`;
      return 'last seen a while ago';
    }
    return 'offline';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Icon name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.userInfo} onPress={onInfo}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: user.photo }} style={styles.avatar} />
          {user.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        
        <View style={styles.userDetails}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{user.name}</Text>
            {user.isPremium && (
              <Icon name="star" size={16} color="#FFD43B" style={styles.premiumIcon} />
            )}
          </View>
          <Text style={[styles.userStatus, user.isTyping && styles.typingStatus]}>
            {getStatusText()}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onVideoCall}>
          <Icon name="videocam" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onInfo}>
          <Icon name="more-vert" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#51CF66',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  premiumIcon: {
    marginLeft: 6,
  },
  userStatus: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  typingStatus: {
    color: '#51CF66',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default ChatHeader;