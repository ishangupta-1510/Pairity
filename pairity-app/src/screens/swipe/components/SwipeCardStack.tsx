import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import SwipeCard from './SwipeCard';
import { SwipeProfile, SwipeAction } from '@/types/matching';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.25;
const SWIPE_OUT_DURATION = 250;

interface SwipeCardStackProps {
  profiles: SwipeProfile[];
  onSwipe: (profile: SwipeProfile, action: SwipeAction) => Promise<boolean>;
  isPremium: boolean;
}

const SwipeCardStack: React.FC<SwipeCardStackProps> = ({
  profiles,
  onSwipe,
  isPremium,
}) => {
  const position = useRef(new Animated.ValueXY()).current;
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

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
    inputRange: [-screenHeight / 2, -SWIPE_THRESHOLD, 0],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  const maybeOpacity = position.y.interpolate({
    inputRange: [0, SWIPE_THRESHOLD, screenHeight / 2],
    outputRange: [0, 1, 1],
    extrapolate: 'clamp',
  });

  const nextCardScale = position.x.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: [1, 0.95, 1],
    extrapolate: 'clamp',
  });

  const nextCardOpacity = position.x.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: [1, 0.8, 1],
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
        } else if (gestureState.dy > SWIPE_THRESHOLD && isPremium) {
          forceSwipe('down');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipe = async (direction: 'right' | 'left' | 'up' | 'down') => {
    const currentProfile = profiles[0];
    if (!currentProfile) return;

    let action: SwipeAction;
    let x = 0;
    let y = 0;

    switch (direction) {
      case 'right':
        action = 'like';
        x = screenWidth;
        break;
      case 'left':
        action = 'pass';
        x = -screenWidth;
        break;
      case 'up':
        action = 'superlike';
        y = -screenHeight;
        break;
      case 'down':
        action = 'maybe';
        y = screenHeight;
        break;
    }

    // Check if swipe is allowed
    const canSwipe = await onSwipe(currentProfile, action);
    if (!canSwipe) {
      resetPosition();
      return;
    }

    Animated.timing(position, {
      toValue: { x, y },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      setCurrentCardIndex(prev => prev + 1);
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 4,
      tension: 40,
      useNativeDriver: false,
    }).start();
  };

  const renderCards = () => {
    if (profiles.length === 0) return null;

    return profiles.map((profile, index) => {
      if (index === 0) {
        // Top card - interactive
        return (
          <Animated.View
            key={profile.id}
            style={[styles.cardContainer, rotateAndTranslate]}
            {...panResponder.panHandlers}
          >
            <SwipeCard
              profile={profile}
              likeOpacity={likeOpacity}
              nopeOpacity={nopeOpacity}
              superLikeOpacity={superLikeOpacity}
              maybeOpacity={maybeOpacity}
              isPremium={isPremium}
            />
          </Animated.View>
        );
      }

      if (index === 1) {
        // Second card - visible but not interactive
        return (
          <Animated.View
            key={profile.id}
            style={[
              styles.cardContainer,
              styles.nextCard,
              {
                opacity: nextCardOpacity,
                transform: [{ scale: nextCardScale }],
              },
            ]}
          >
            <SwipeCard
              profile={profile}
              likeOpacity={new Animated.Value(0)}
              nopeOpacity={new Animated.Value(0)}
              superLikeOpacity={new Animated.Value(0)}
              maybeOpacity={new Animated.Value(0)}
              isPremium={isPremium}
              isPreview
            />
          </Animated.View>
        );
      }

      if (index <= 3) {
        // Background cards - subtle visibility
        const scale = 0.95 - (index - 1) * 0.02;
        const translateY = (index - 1) * 8;
        const opacity = 1 - (index - 1) * 0.2;

        return (
          <View
            key={profile.id}
            style={[
              styles.cardContainer,
              styles.backgroundCard,
              {
                opacity,
                transform: [
                  { scale },
                  { translateY },
                ],
              },
            ]}
          >
            <SwipeCard
              profile={profile}
              likeOpacity={new Animated.Value(0)}
              nopeOpacity={new Animated.Value(0)}
              superLikeOpacity={new Animated.Value(0)}
              maybeOpacity={new Animated.Value(0)}
              isPremium={isPremium}
              isPreview
              isBlurred
            />
          </View>
        );
      }

      return null;
    }).reverse();
  };

  return <View style={styles.container}>{renderCards()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  nextCard: {
    zIndex: -1,
  },
  backgroundCard: {
    zIndex: -2,
  },
});

export default SwipeCardStack;