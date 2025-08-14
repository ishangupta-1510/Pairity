import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import { Message } from '../ChatScreen';

const { width: screenWidth } = Dimensions.get('window');

interface MessageBubbleProps {
  message: Message;
  onReaction: (messageId: string, emoji: string) => void;
  onReply: () => void;
  onDelete: () => void;
  onLongPress: () => void;
  onPress: () => void;
  isSelected: boolean;
  showActions: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onReaction,
  onReply,
  onDelete,
  onLongPress,
  onPress,
  isSelected,
  showActions,
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const isMine = message.sender === 'me';

  const renderStatus = () => {
    if (!isMine) return null;

    let icon = 'done';
    let color = '#999';

    switch (message.status) {
      case 'sending':
        icon = 'schedule';
        break;
      case 'sent':
        icon = 'done';
        break;
      case 'delivered':
        icon = 'done-all';
        break;
      case 'read':
        icon = 'done-all';
        color = '#339AF0';
        break;
      case 'failed':
        icon = 'error';
        color = '#FF6B6B';
        break;
    }

    return <Icon name={icon} size={14} color={color} style={styles.statusIcon} />;
  };

  const renderContent = () => {
    if (message.isDeleted) {
      return (
        <View style={styles.deletedMessage}>
          <Icon name="block" size={16} color="#999" />
          <Text style={styles.deletedText}>This message was deleted</Text>
        </View>
      );
    }

    switch (message.type) {
      case 'text':
        return (
          <Text style={[styles.messageText, isMine && styles.messageTextMine]}>
            {message.text}
          </Text>
        );

      case 'image':
        return (
          <TouchableOpacity activeOpacity={0.9}>
            <Image
              source={{ uri: message.media?.uri }}
              style={[
                styles.mediaImage,
                {
                  width: message.media?.width ? Math.min(message.media.width, 250) : 250,
                  height: message.media?.height ? Math.min(message.media.height, 300) : 200,
                },
              ]}
              resizeMode="cover"
            />
          </TouchableOpacity>
        );

      case 'video':
        return (
          <TouchableOpacity style={styles.videoContainer} activeOpacity={0.9}>
            <Image
              source={{ uri: message.media?.thumbnail || message.media?.uri }}
              style={styles.videoThumbnail}
            />
            <View style={styles.playButton}>
              <Icon name="play-arrow" size={32} color="#fff" />
            </View>
            {message.media?.duration && (
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>
                  {Math.floor(message.media.duration / 60)}:
                  {(message.media.duration % 60).toString().padStart(2, '0')}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );

      case 'voice':
        return (
          <TouchableOpacity style={styles.voiceContainer} activeOpacity={0.9}>
            <Icon name="play-arrow" size={24} color={isMine ? '#fff' : '#FF6B6B'} />
            <View style={styles.voiceWaveform}>
              {[...Array(20)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.voiceBar,
                    {
                      height: 10 + Math.random() * 20,
                      backgroundColor: isMine ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 107, 107, 0.3)',
                    },
                  ]}
                />
              ))}
            </View>
            {message.media?.duration && (
              <Text style={[styles.voiceDuration, isMine && styles.voiceDurationMine]}>
                {Math.floor(message.media.duration / 60)}:
                {(message.media.duration % 60).toString().padStart(2, '0')}
              </Text>
            )}
          </TouchableOpacity>
        );

      case 'gif':
        return (
          <Image
            source={{ uri: message.media?.uri }}
            style={styles.gifImage}
            resizeMode="cover"
          />
        );

      case 'location':
        return (
          <TouchableOpacity style={styles.locationContainer} activeOpacity={0.9}>
            <Image
              source={{ uri: `https://maps.googleapis.com/maps/api/staticmap?center=${message.media?.uri}&zoom=15&size=250x150&key=YOUR_API_KEY` }}
              style={styles.locationMap}
            />
            <View style={styles.locationInfo}>
              <Icon name="location-on" size={16} color={isMine ? '#fff' : '#FF6B6B'} />
              <Text style={[styles.locationText, isMine && styles.locationTextMine]}>
                Location
              </Text>
            </View>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  const quickReactions = ['❤️', '👍', '😂', '😮', '😢', '😡'];

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onLongPress={onLongPress}
      onPress={onPress}
      style={[
        styles.messageWrapper,
        isMine && styles.messageWrapperMine,
        isSelected && styles.messageSelected,
      ]}
    >
      {message.replyTo && (
        <View style={[styles.replyBubble, isMine && styles.replyBubbleMine]}>
          <View style={styles.replyBorder} />
          <View style={styles.replyContent}>
            <Text style={[styles.replyName, isMine && styles.replyNameMine]}>
              {message.replyTo.sender === 'me' ? 'You' : 'Them'}
            </Text>
            <Text style={[styles.replyText, isMine && styles.replyTextMine]} numberOfLines={1}>
              {message.replyTo.text || 'Media message'}
            </Text>
          </View>
        </View>
      )}

      <View style={[styles.bubble, isMine && styles.bubbleMine]}>
        {renderContent()}
        
        {message.editedAt && (
          <Text style={[styles.editedLabel, isMine && styles.editedLabelMine]}>
            edited
          </Text>
        )}

        <View style={styles.messageFooter}>
          <Text style={[styles.timestamp, isMine && styles.timestampMine]}>
            {moment(message.timestamp).format('h:mm A')}
          </Text>
          {renderStatus()}
        </View>
      </View>

      {message.reactions && message.reactions.length > 0 && (
        <View style={[styles.reactions, isMine && styles.reactionsMine]}>
          {message.reactions.map((reaction, index) => (
            <TouchableOpacity
              key={index}
              style={styles.reactionBubble}
              onPress={() => onReaction(message.id, reaction.emoji)}
            >
              <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
              {message.reactions!.filter(r => r.emoji === reaction.emoji).length > 1 && (
                <Text style={styles.reactionCount}>
                  {message.reactions!.filter(r => r.emoji === reaction.emoji).length}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showActions && showReactions && (
        <View style={[styles.quickReactions, isMine && styles.quickReactionsMine]}>
          {quickReactions.map(emoji => (
            <TouchableOpacity
              key={emoji}
              style={styles.quickReactionButton}
              onPress={() => {
                onReaction(message.id, emoji);
                setShowReactions(false);
              }}
            >
              <Text style={styles.quickReactionEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  messageWrapper: {
    marginVertical: 4,
    alignItems: 'flex-start',
  },
  messageWrapperMine: {
    alignItems: 'flex-end',
  },
  messageSelected: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  bubble: {
    maxWidth: screenWidth * 0.75,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleMine: {
    backgroundColor: '#FF6B6B',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  messageTextMine: {
    color: '#fff',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
  },
  timestampMine: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statusIcon: {
    marginLeft: 4,
  },
  deletedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deletedText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginLeft: 8,
  },
  mediaImage: {
    borderRadius: 12,
  },
  videoContainer: {
    position: 'relative',
  },
  videoThumbnail: {
    width: 250,
    height: 200,
    borderRadius: 12,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    fontSize: 12,
    color: '#fff',
  },
  voiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    minWidth: 200,
  },
  voiceWaveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  voiceBar: {
    width: 2,
    marginHorizontal: 1,
    borderRadius: 1,
  },
  voiceDuration: {
    fontSize: 12,
    color: '#666',
  },
  voiceDurationMine: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  gifImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  locationContainer: {
    width: 250,
  },
  locationMap: {
    width: '100%',
    height: 150,
    borderRadius: 12,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  locationTextMine: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  replyBubble: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
    maxWidth: screenWidth * 0.75,
    flexDirection: 'row',
  },
  replyBubbleMine: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  replyBorder: {
    width: 3,
    backgroundColor: '#FF6B6B',
    borderRadius: 2,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 2,
  },
  replyNameMine: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  replyText: {
    fontSize: 13,
    color: '#666',
  },
  replyTextMine: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  reactions: {
    flexDirection: 'row',
    marginTop: -8,
    marginLeft: 8,
  },
  reactionsMine: {
    marginRight: 8,
    marginLeft: 0,
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 11,
    color: '#666',
    marginLeft: 2,
  },
  quickReactions: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickReactionsMine: {
    right: 0,
    left: undefined,
  },
  quickReactionButton: {
    padding: 8,
  },
  quickReactionEmoji: {
    fontSize: 20,
  },
  editedLabel: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 2,
  },
  editedLabelMine: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default MessageBubble;