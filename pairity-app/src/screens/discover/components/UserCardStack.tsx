import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FastImage from 'react-native-fast-image';
import { User } from '@/types/discover';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;
const SWIPE_OUT_DURATION = 250;

interface UserCardStackProps {
  users: User[];
  onLike: (user: User) => void;
  onSuperLike: (user: User) => void;
  onPass: (user: User) => void;
  onProfile: (user: User) => void;
}

const UserCardStack: React.FC<UserCardStackProps> = ({
  users,
  onLike,
  onSuperLike,
  onPass,
  onProfile,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const currentUser = users[currentIndex];
  const nextUser = users[currentIndex + 1];

  const rotate = position.x.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const rotateAndTranslate = {
    transform: [
      { rotate },
      ...position.getTranslateTransform(),
    ],
  };

  const likeOpacity = position.x.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: [1, 0, 0],
    extrapolate: 'clamp',
  });

  const superLikeOpacity = position.y.interpolate({
    inputRange: [-screenHeight / 2, 0, screenHeight / 2],
    outputRange: [1, 0, 0],
    extrapolate: 'clamp',
  });

  const nextCardOpacity = position.x.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: [1, 0, 1],
    extrapolate: 'clamp',
  });

  const nextCardScale = position.x.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: [1, 0.9, 1],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else if (gestureState.dy < -SWIPE_THRESHOLD) {
          forceSwipe('up');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipe = (direction: 'right' | 'left' | 'up') => {
    const x = direction === 'right' ? screenWidth : direction === 'left' ? -screenWidth : 0;
    const y = direction === 'up' ? -screenHeight : 0;

    Animated.timing(position, {
      toValue: { x, y },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: 'right' | 'left' | 'up') => {
    if (!currentUser) return;

    switch (direction) {
      case 'right':
        onLike(currentUser);
        break;
      case 'left':
        onPass(currentUser);
        break;
      case 'up':
        onSuperLike(currentUser);
        break;
    }

    position.setValue({ x: 0, y: 0 });
    setCurrentIndex(prevIndex => prevIndex + 1);
    setCurrentPhotoIndex(0);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 4,
      useNativeDriver: false,
    }).start();
  };

  const handleActionButton = (action: 'pass' | 'superlike' | 'like') => {
    switch (action) {
      case 'pass':
        forceSwipe('left');
        break;
      case 'superlike':
        forceSwipe('up');
        break;
      case 'like':
        forceSwipe('right');
        break;
    }
  };

  const handlePhotoPress = (e: any) => {
    const touchX = e.nativeEvent.locationX;
    const cardWidth = screenWidth - 32;
    
    if (touchX < cardWidth / 2) {
      // Previous photo
      if (currentPhotoIndex > 0) {
        setCurrentPhotoIndex(currentPhotoIndex - 1);
      }
    } else {
      // Next photo
      if (currentUser && currentPhotoIndex < currentUser.photos.length - 1) {
        setCurrentPhotoIndex(currentPhotoIndex + 1);
      }
    }
  };

  if (!currentUser) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="search-off" size={64} color="#ddd" />
        <Text style={styles.emptyTitle}>No More Profiles</Text>
        <Text style={styles.emptySubtitle}>
          Check back later for more matches!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Next Card Preview */}
      {nextUser && (
        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: nextCardOpacity,
              transform: [{ scale: nextCardScale }],
            },
            styles.nextCard,
          ]}
        >
          <FastImage
            source={{ uri: nextUser.photos[0] }}
            style={styles.cardImage}
            resizeMode={FastImage.resizeMode.cover}
          />
        </Animated.View>
      )}

      {/* Current Card */}
      <Animated.View
        style={[styles.cardContainer, rotateAndTranslate]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity activeOpacity={1} onPress={handlePhotoPress}>
          <FastImage
            source={{ uri: currentUser.photos[currentPhotoIndex] }}
            style={styles.cardImage}
            resizeMode={FastImage.resizeMode.cover}
          >
            <View style={styles.cardOverlay}>
              {/* Photo Indicators */}
              <View style={styles.photoIndicators}>
                {currentUser.photos.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.photoIndicator,
                      index === currentPhotoIndex && styles.photoIndicatorActive,
                    ]}
                  />
                ))}
              </View>

              {/* Swipe Indicators */}
              <Animated.View style={[styles.likeLabel, { opacity: likeOpacity }]}>
                <Text style={styles.likeText}>LIKE</Text>
              </Animated.View>
              <Animated.View style={[styles.nopeLabel, { opacity: nopeOpacity }]}>
                <Text style={styles.nopeText}>NOPE</Text>
              </Animated.View>
              <Animated.View style={[styles.superLikeLabel, { opacity: superLikeOpacity }]}>
                <Text style={styles.superLikeText}>SUPER LIKE</Text>
              </Animated.View>

              {/* User Info */}
              <ScrollView style={styles.infoContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.headerInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{currentUser.name}, {currentUser.age}</Text>
                    {currentUser.isVerified && (
                      <Icon name="verified" size={20} color="#339AF0" />
                    )}
                  </View>
                  <View style={styles.locationRow}>
                    <Icon name="location-on" size={14} color="#fff" />
                    <Text style={styles.location}>{currentUser.distance} miles away</Text>
                  </View>
                </View>

                <Text style={styles.bio}>{currentUser.bio}</Text>

                <View style={styles.interestsContainer}>
                  {currentUser.interests.map((interest, index) => (
                    <View key={index} style={styles.interestTag}>
                      <Text style={styles.interestText}>{interest}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.viewProfileButton}
                  onPress={() => onProfile(currentUser)}
                >
                  <Text style={styles.viewProfileText}>View Full Profile</Text>
                  <Icon name="arrow-forward" size={16} color="#fff" />
                </TouchableOpacity>
              </ScrollView>
            </View>
          </FastImage>
        </TouchableOpacity>
      </Animated.View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={() => handleActionButton('pass')}
        >
          <Icon name="close" size={32} color="#FF6B6B" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={() => handleActionButton('superlike')}
        >
          <Icon name="star" size={28} color="#339AF0" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleActionButton('like')}
        >
          <Icon name="favorite" size={28} color="#51CF66" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  cardContainer: {
    position: 'absolute',
    top: 20,
    left: 16,
    right: 16,
    bottom: 120,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  nextCard: {
    zIndex: -1,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  photoIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  photoIndicator: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  photoIndicatorActive: {
    backgroundColor: '#fff',
  },
  likeLabel: {
    position: 'absolute',
    top: 50,
    left: 40,
    zIndex: 1000,
    transform: [{ rotate: '-30deg' }],
  },
  likeText: {
    borderWidth: 3,
    borderColor: '#51CF66',
    color: '#51CF66',
    fontSize: 32,
    fontWeight: 'bold',
    padding: 10,
    borderRadius: 10,
  },
  nopeLabel: {
    position: 'absolute',
    top: 50,
    right: 40,
    zIndex: 1000,
    transform: [{ rotate: '30deg' }],
  },
  nopeText: {
    borderWidth: 3,
    borderColor: '#FF6B6B',
    color: '#FF6B6B',
    fontSize: 32,
    fontWeight: 'bold',
    padding: 10,
    borderRadius: 10,
  },
  superLikeLabel: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    zIndex: 1000,
  },
  superLikeText: {
    borderWidth: 3,
    borderColor: '#339AF0',
    color: '#339AF0',
    fontSize: 28,
    fontWeight: 'bold',
    padding: 10,
    borderRadius: 10,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '40%',
    padding: 20,
  },
  headerInfo: {
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 4,
  },
  bio: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
    marginBottom: 12,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  interestTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  interestText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  passButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  superLikeButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#339AF0',
  },
  likeButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#51CF66',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default UserCardStack;