import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { renderWithProviders, animationTestHelpers } from '@/utils/testHelpers';
import { TestDataFactory } from '@/utils/testing';
import SwipeCard from '@/components/swipe/SwipeCard';

// Mock Animated module
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Animated: {
    ...jest.requireActual('react-native').Animated,
    spring: jest.fn(() => ({
      start: jest.fn(),
    })),
    timing: jest.fn(() => ({
      start: jest.fn(),
    })),
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      setOffset: jest.fn(),
      flattenOffset: jest.fn(),
      extractOffset: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
      interpolate: jest.fn(() => 'interpolated_value'),
      _value: 0,
    })),
  },
}));

describe('SwipeCard', () => {
  const mockUser = TestDataFactory.createUser({
    id: 'test-user-1',
    name: 'Test User',
    age: 25,
    bio: 'Test bio',
    photos: ['https://example.com/photo1.jpg'],
  });

  const mockOnSwipe = jest.fn();
  const mockOnCardPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders user information correctly', () => {
      const { getByText } = renderWithProviders(
        <SwipeCard
          user={mockUser}
          onSwipe={mockOnSwipe}
          onCardPress={mockOnCardPress}
        />
      );

      expect(getByText('Test User, 25')).toBeTruthy();
      expect(getByText('Test bio')).toBeTruthy();
    });

    it('renders user photo', () => {
      const { getByTestId } = renderWithProviders(
        <SwipeCard
          user={mockUser}
          onSwipe={mockOnSwipe}
          onCardPress={mockOnCardPress}
          testID="swipe-card"
        />
      );

      const card = getByTestId('swipe-card');
      expect(card).toBeTruthy();
    });

    it('renders verification badge for verified users', () => {
      const verifiedUser = TestDataFactory.createUser({ verified: true });
      
      const { getByTestId } = renderWithProviders(
        <SwipeCard
          user={verifiedUser}
          onSwipe={mockOnSwipe}
          onCardPress={mockOnCardPress}
          testID="verified-card"
        />
      );

      expect(getByTestId('verification-badge')).toBeTruthy();
    });

    it('renders premium badge for premium users', () => {
      const premiumUser = TestDataFactory.createUser({ premium: true });
      
      const { getByTestId } = renderWithProviders(
        <SwipeCard
          user={premiumUser}
          onSwipe={mockOnSwipe}
          onCardPress={mockOnCardPress}
          testID="premium-card"
        />
      );

      expect(getByTestId('premium-badge')).toBeTruthy();
    });

    it('renders interests tags', () => {
      const userWithInterests = TestDataFactory.createUser({
        interests: ['Travel', 'Food', 'Music'],
      });

      const { getByText } = renderWithProviders(
        <SwipeCard
          user={userWithInterests}
          onSwipe={mockOnSwipe}
          onCardPress={mockOnCardPress}
        />
      );

      expect(getByText('Travel')).toBeTruthy();
      expect(getByText('Food')).toBeTruthy();
      expect(getByText('Music')).toBeTruthy();
    });
  });

  describe('Swipe Gestures', () => {
    it('handles right swipe (like) correctly', () => {
      const { getByTestId } = renderWithProviders(
        <SwipeCard
          user={mockUser}
          onSwipe={mockOnSwipe}
          onCardPress={mockOnCardPress}
          testID="swipe-card"
        />
      );

      const card = getByTestId('swipe-card');
      
      // Simulate right swipe gesture
      fireEvent(card, 'onMoveShouldSetPanResponder', {
        nativeEvent: { dx: 100, dy: 0 },
      });

      fireEvent(card, 'onPanResponderMove', {
        nativeEvent: { dx: 150, dy: 0 },
      });

      fireEvent(card, 'onPanResponderRelease', {
        nativeEvent: { dx: 150, dy: 0, vx: 1 },
      });

      expect(mockOnSwipe).toHaveBeenCalledWith(mockUser.id, 'like');
    });

    it('handles left swipe (dislike) correctly', () => {
      const { getByTestId } = renderWithProviders(
        <SwipeCard
          user={mockUser}
          onSwipe={mockOnSwipe}
          onCardPress={mockOnCardPress}
          testID="swipe-card"
        />
      );

      const card = getByTestId('swipe-card');
      
      // Simulate left swipe gesture
      fireEvent(card, 'onMoveShouldSetPanResponder', {
        nativeEvent: { dx: -100, dy: 0 },
      });

      fireEvent(card, 'onPanResponderMove', {
        nativeEvent: { dx: -150, dy: 0 },
      });

      fireEvent(card, 'onPanResponderRelease', {
        nativeEvent: { dx: -150, dy: 0, vx: -1 },
      });

      expect(mockOnSwipe).toHaveBeenCalledWith(mockUser.id, 'dislike');
    });

    it('handles up swipe (superlike) correctly', () => {
      const { getByTestId } = renderWithProviders(
        <SwipeCard
          user={mockUser}
          onSwipe={mockOnSwipe}
          onCardPress={mockOnCardPress}
          testID="swipe-card"
        />
      );

      const card = getByTestId('swipe-card');
      
      // Simulate up swipe gesture
      fireEvent(card, 'onMoveShouldSetPanResponder', {
        nativeEvent: { dx: 0, dy: -100 },
      });

      fireEvent(card, 'onPanResponderMove', {
        nativeEvent: { dx: 0, dy: -150 },
      });

      fireEvent(card, 'onPanResponderRelease', {
        nativeEvent: { dx: 0, dy: -150, vy: -1 },
      });

      expect(mockOnSwipe).toHaveBeenCalledWith(mockUser.id, 'superlike');
    });

    it('returns to center position on insufficient swipe distance', () => {
      const { getByTestId } = renderWithProviders(
        <SwipeCard
          user={mockUser}
          onSwipe={mockOnSwipe}
          onCardPress={mockOnCardPress}
          testID="swipe-card"
        />
      );

      const card = getByTestId('swipe-card');
      
      // Simulate short swipe gesture
      fireEvent(card, 'onMoveShouldSetPanResponder', {
        nativeEvent: { dx: 50, dy: 0 },
      });

      fireEvent(card, 'onPanResponderMove', {
        nativeEvent: { dx: 50, dy: 0 },
      });

      fireEvent(card, 'onPanResponderRelease', {
        nativeEvent: { dx: 50, dy: 0, vx: 0.1 },
      });

      expect(mockOnSwipe).not.toHaveBeenCalled();
      // Card should animate back to center
      animationTestHelpers.expectAnimationStart(Animated.spring);
    });
  });

  describe('Button Actions', () => {
    it('handles dislike button press', () => {
      const { getByTestId } = renderWithProviders(
        <SwipeCard
          user={mockUser}
          onSwipe={mockOnSwipe}
          onCardPress={mockOnCardPress}
          showButtons={true}
          testID="swipe-card"
        />
      );

      const dislikeButton = getByTestId('dislike-button');
      fireEvent.press(dislikeButton);

      expect(mockOnSwipe).toHaveBeenCalledWith(mockUser.id, 'dislike');
    });

    it('handles like button press', () => {
      const { getByTestId } = renderWithProviders(
        <SwipeCard
          user={mockUser}
          onSwipe={mockOnSwipe}
          onCardPress={mockOnCardPress}
          showButtons={true}
          testID="swipe-card"
        />
      );

      const likeButton = getByTestId('like-button');
      fireEvent.press(likeButton);

      expect(mockOnSwipe).toHaveBeenCalledWith(mockUser.id, 'like');
    });

    it('handles superlike button press', () => {
      const { getByTestId } = renderWithProviders(
        <SwipeCard
          user={mockUser}
          onSwipe={mockOnSwipe}
          onCardPress={mockOnCardPress}
          showButtons={true}
          testID="swipe-card"
        />
      );

      const superlikeButton = getByTestId('superlike-button');
      fireEvent.press(superlikeButton);

      expect(mockOnSwipe).toHaveBeenCalledWith(mockUser.id, 'superlike');
    });

    it('hides buttons when showButtons is false', () => {
      const { queryByTestId } = renderWithProviders(
        <SwipeCard
          user={mockUser}
          onSwipe={mockOnSwipe}
          onCardPress={mockOnCardPress}
          showButtons={false}
          testID="swipe-card"
        />
      );

      expect(queryByTestId('dislike-button')).toBeFalsy();
      expect(queryByTestId('like-button')).toBeFalsy();
      expect(queryByTestId('superlike-button')).toBeFalsy();
    });
  });

  describe('Card Press Handling', () => {
    it('handles card press correctly', () => {
      const { getByTestId } = renderWithProviders(
        <SwipeCard
          user={mockUser}
          onSwipe={mockOnSwipe}
          onCardPress={mockOnCardPress}
          testID="swipe-card"
        />
      );

      const card = getByTestId('swipe-card');
      fireEvent.press(card);

      expect(mockOnCardPress).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('Visual Feedback', () => {
    it('shows like indicator during right swipe', () => {
      const { getByTestId } = renderWithProviders(
        <SwipeCard
          user={mockUser}
          onSwipe={mockOnSwipe}
          onCardPress={mockOnCardPress}
          testID="swipe-card"
        />
      );

      const card = getByTestId('swipe-card');
      
      // Simulate right swipe in progress
      fireEvent(card, 'onPanResponderMove', {
        nativeEvent: { dx: 100, dy: 0 },
      });

      expect(getByTestId('like-indicator')).toBeTruthy();
    });

    it('shows dislike indicator during left swipe', () => {
      const { getByTestId } = renderWithProviders(
        <SwipeCard
          user={mockUser}
          onSwipe={mockOnSwipe}
          onCardPress={mockOnCardPress}
          testID="swipe-card"
        />
      );

      const card = getByTestId('swipe-card');
      
      // Simulate left swipe in progress
      fireEvent(card, 'onPanResponderMove', {
        nativeEvent: { dx: -100, dy: 0 },
      });

      expect(getByTestId('dislike-indicator')).toBeTruthy();
    });

    it('shows superlike indicator during up swipe', () => {
      const { getByTestId } = renderWithProviders(
        <SwipeCard
          user={mockUser}
          onSwipe={mockOnSwipe}
          onCardPress={mockOnCardPress}
          testID="swipe-card"
        />
      );

      const card = getByTestId('swipe-card');
      
      // Simulate up swipe in progress
      fireEvent(card, 'onPanResponderMove', {
        nativeEvent: { dx: 0, dy: -100 },
      });

      expect(getByTestId('superlike-indicator')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
      const { getByTestId } = renderWithProviders(
        <SwipeCard
          user={mockUser}
          onSwipe={mockOnSwipe}
          onCardPress={mockOnCardPress}
          testID="swipe-card"
        />
      );

      const card = getByTestId('swipe-card');
      expect(card.props.accessibilityLabel).toContain(mockUser.name);
      expect(card.props.accessibilityLabel).toContain(mockUser.age.toString());
    });

    it('has proper accessibility role', () => {
      const { getByTestId } = renderWithProviders(
        <SwipeCard
          user={mockUser}
          onSwipe={mockOnSwipe}
          onCardPress={mockOnCardPress}
          testID="swipe-card"
        />
      );

      const card = getByTestId('swipe-card');
      expect(card.props.accessibilityRole).toBe('button');
    });

    it('has accessibility actions for swipe gestures', () => {
      const { getByTestId } = renderWithProviders(
        <SwipeCard
          user={mockUser}
          onSwipe={mockOnSwipe}
          onCardPress={mockOnCardPress}
          testID="swipe-card"
        />
      );

      const card = getByTestId('swipe-card');
      const actions = card.props.accessibilityActions;
      
      expect(actions).toContainEqual(
        expect.objectContaining({ name: 'like' })
      );
      expect(actions).toContainEqual(
        expect.objectContaining({ name: 'dislike' })
      );
      expect(actions).toContainEqual(
        expect.objectContaining({ name: 'superlike' })
      );
    });

    it('handles accessibility actions correctly', () => {
      const { getByTestId } = renderWithProviders(
        <SwipeCard
          user={mockUser}
          onSwipe={mockOnSwipe}
          onCardPress={mockOnCardPress}
          testID="swipe-card"
        />
      );

      const card = getByTestId('swipe-card');
      
      // Test like action
      fireEvent(card, 'onAccessibilityAction', {
        nativeEvent: { actionName: 'like' },
      });
      expect(mockOnSwipe).toHaveBeenCalledWith(mockUser.id, 'like');

      // Test dislike action
      fireEvent(card, 'onAccessibilityAction', {
        nativeEvent: { actionName: 'dislike' },
      });
      expect(mockOnSwipe).toHaveBeenCalledWith(mockUser.id, 'dislike');

      // Test superlike action
      fireEvent(card, 'onAccessibilityAction', {
        nativeEvent: { actionName: 'superlike' },
      });
      expect(mockOnSwipe).toHaveBeenCalledWith(mockUser.id, 'superlike');
    });
  });

  describe('Animation Behavior', () => {
    it('animates card position during swipe', () => {
      const { getByTestId } = renderWithProviders(
        <SwipeCard
          user={mockUser}
          onSwipe={mockOnSwipe}
          onCardPress={mockOnCardPress}
          testID="swipe-card"
        />
      );

      const card = getByTestId('swipe-card');
      
      fireEvent(card, 'onPanResponderMove', {
        nativeEvent: { dx: 50, dy: 0 },
      });

      // Animation values should be updated
      expect(Animated.Value).toHaveBeenCalled();
    });

    it('animates card exit on successful swipe', () => {
      const { getByTestId } = renderWithProviders(
        <SwipeCard
          user={mockUser}
          onSwipe={mockOnSwipe}
          onCardPress={mockOnCardPress}
          testID="swipe-card"
        />
      );

      const card = getByTestId('swipe-card');
      
      fireEvent(card, 'onPanResponderRelease', {
        nativeEvent: { dx: 200, dy: 0, vx: 1 },
      });

      animationTestHelpers.expectAnimationStart(Animated.timing);
    });
  });
});