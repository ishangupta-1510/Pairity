import React from 'react';
import { fireEvent, waitFor, act } from '@testing-library/react-native';
import { renderWithProviders, screenTestHelpers, mockApiHelpers } from '@/utils/testHelpers';
import { TestDataFactory, MockApiHelper } from '@/utils/testing';
import SwipeScreen from '@/screens/swipe/SwipeScreen';
import MatchModal from '@/components/matches/MatchModal';
import MatchesScreen from '@/screens/matches/MatchesScreen';

// Mock API endpoints
global.fetch = jest.fn();

describe('Matching Flow Integration', () => {
  const mockUsers = TestDataFactory.createUserList(5);
  const currentUser = TestDataFactory.createUser({ id: 'current-user' });
  
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Swipe to Match Flow', () => {
    it('completes the full swipe to match process', async () => {
      // Setup API responses
      mockApiHelpers.setupSuccessResponse(
        global.fetch as jest.Mock,
        MockApiHelper.success({ users: mockUsers })
      );

      const mockStore = {
        preloadedState: {
          auth: { isAuthenticated: true, user: currentUser },
          swipe: { queue: mockUsers, dailyCount: 5, limit: 100 },
          matches: { matches: [], newMatch: null },
        },
      };

      const { getByTestId, queryByTestId } = renderWithProviders(
        <SwipeScreen />,
        mockStore
      );

      // Wait for screen to load
      await waitFor(() => {
        expect(getByTestId('swipe-screen')).toBeTruthy();
      });

      // Verify users are loaded
      expect(getByTestId('swipe-card-stack')).toBeTruthy();

      // Simulate right swipe (like) on first user
      const firstCard = getByTestId(`swipe-card-${mockUsers[0].id}`);
      
      // Mock match response
      mockApiHelpers.setupSuccessResponse(
        global.fetch as jest.Mock,
        MockApiHelper.success({
          matched: true,
          match: TestDataFactory.createMatch(currentUser.id, mockUsers[0].id),
        })
      );

      await act(async () => {
        fireEvent(firstCard, 'onSwipe', mockUsers[0].id, 'like');
      });

      // Verify API call was made
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/matches/swipe'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            swipedUserId: mockUsers[0].id,
            action: 'like',
          }),
        })
      );

      // Wait for match modal to appear
      await waitFor(() => {
        expect(queryByTestId('match-modal')).toBeTruthy();
      });

      // Verify match modal content
      expect(queryByTestId('match-celebration')).toBeTruthy();
      expect(queryByTestId('matched-user-photo')).toBeTruthy();
    });

    it('handles non-match swipe correctly', async () => {
      const mockStore = {
        preloadedState: {
          auth: { isAuthenticated: true, user: currentUser },
          swipe: { queue: mockUsers, dailyCount: 5, limit: 100 },
        },
      };

      const { getByTestId, queryByTestId } = renderWithProviders(
        <SwipeScreen />,
        mockStore
      );

      const firstCard = getByTestId(`swipe-card-${mockUsers[0].id}`);
      
      // Mock non-match response
      mockApiHelpers.setupSuccessResponse(
        global.fetch as jest.Mock,
        MockApiHelper.success({ matched: false })
      );

      await act(async () => {
        fireEvent(firstCard, 'onSwipe', mockUsers[0].id, 'like');
      });

      // Verify no match modal appears
      await waitFor(() => {
        expect(queryByTestId('match-modal')).toBeFalsy();
      });

      // Verify next card is shown
      expect(getByTestId(`swipe-card-${mockUsers[1].id}`)).toBeTruthy();
    });

    it('handles daily limit reached', async () => {
      const mockStore = {
        preloadedState: {
          auth: { isAuthenticated: true, user: currentUser },
          swipe: { queue: mockUsers, dailyCount: 100, limit: 100 },
        },
      };

      const { getByTestId, queryByTestId } = renderWithProviders(
        <SwipeScreen />,
        mockStore
      );

      const firstCard = getByTestId(`swipe-card-${mockUsers[0].id}`);

      // Mock daily limit response
      mockApiHelpers.setupErrorResponse(
        global.fetch as jest.Mock,
        'Daily swipe limit reached',
        429
      );

      await act(async () => {
        fireEvent(firstCard, 'onSwipe', mockUsers[0].id, 'like');
      });

      // Wait for daily limit modal
      await waitFor(() => {
        expect(queryByTestId('daily-limit-modal')).toBeTruthy();
      });

      // Verify premium upgrade option is shown
      expect(queryByTestId('upgrade-premium-button')).toBeTruthy();
    });
  });

  describe('SuperLike Flow', () => {
    it('handles superlike action correctly', async () => {
      const mockStore = {
        preloadedState: {
          auth: { isAuthenticated: true, user: currentUser },
          swipe: { queue: mockUsers, superLikesRemaining: 1 },
        },
      };

      const { getByTestId } = renderWithProviders(
        <SwipeScreen />,
        mockStore
      );

      const firstCard = getByTestId(`swipe-card-${mockUsers[0].id}`);
      
      // Mock superlike response
      mockApiHelpers.setupSuccessResponse(
        global.fetch as jest.Mock,
        MockApiHelper.success({ superLiked: true })
      );

      await act(async () => {
        fireEvent(firstCard, 'onSwipe', mockUsers[0].id, 'superlike');
      });

      // Verify superlike API call
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/matches/swipe'),
        expect.objectContaining({
          body: JSON.stringify({
            swipedUserId: mockUsers[0].id,
            action: 'superlike',
          }),
        })
      );

      // Verify superlike animation
      expect(getByTestId('superlike-animation')).toBeTruthy();
    });

    it('shows superlike limit modal when no superlikes remaining', async () => {
      const mockStore = {
        preloadedState: {
          auth: { isAuthenticated: true, user: currentUser },
          swipe: { queue: mockUsers, superLikesRemaining: 0 },
        },
      };

      const { getByTestId, queryByTestId } = renderWithProviders(
        <SwipeScreen />,
        mockStore
      );

      const firstCard = getByTestId(`swipe-card-${mockUsers[0].id}`);

      await act(async () => {
        fireEvent(firstCard, 'onSwipe', mockUsers[0].id, 'superlike');
      });

      // Wait for superlike limit modal
      await waitFor(() => {
        expect(queryByTestId('superlike-limit-modal')).toBeTruthy();
      });
    });
  });

  describe('Match Navigation Flow', () => {
    it('navigates from match modal to chat', async () => {
      const match = TestDataFactory.createMatch(currentUser.id, mockUsers[0].id);
      const mockNavigation = { navigate: jest.fn() };

      const { getByTestId } = renderWithProviders(
        <MatchModal
          visible={true}
          match={match}
          matchedUser={mockUsers[0]}
          onClose={jest.fn()}
          onStartChat={jest.fn()}
        />,
        { navigationOptions: { navigation: mockNavigation } }
      );

      const startChatButton = getByTestId('start-chat-button');
      fireEvent.press(startChatButton);

      screenTestHelpers.expectNavigationCall(
        mockNavigation,
        'Chat',
        { chatId: match.chatId, userId: mockUsers[0].id }
      );
    });

    it('navigates from match modal to matches list', async () => {
      const match = TestDataFactory.createMatch(currentUser.id, mockUsers[0].id);
      const mockNavigation = { navigate: jest.fn() };

      const { getByTestId } = renderWithProviders(
        <MatchModal
          visible={true}
          match={match}
          matchedUser={mockUsers[0]}
          onClose={jest.fn()}
          onStartChat={jest.fn()}
        />,
        { navigationOptions: { navigation: mockNavigation } }
      );

      const viewMatchesButton = getByTestId('view-matches-button');
      fireEvent.press(viewMatchesButton);

      screenTestHelpers.expectNavigationCall(mockNavigation, 'Matches');
    });
  });

  describe('Matches Screen Integration', () => {
    it('loads and displays matches correctly', async () => {
      const matches = [
        TestDataFactory.createMatch(currentUser.id, mockUsers[0].id),
        TestDataFactory.createMatch(currentUser.id, mockUsers[1].id),
      ];

      // Setup API response
      mockApiHelpers.setupSuccessResponse(
        global.fetch as jest.Mock,
        MockApiHelper.success({ matches, users: mockUsers.slice(0, 2) })
      );

      const mockStore = {
        preloadedState: {
          auth: { isAuthenticated: true, user: currentUser },
          matches: { matches: [], loading: false },
        },
      };

      const { getByTestId, getAllByTestId } = renderWithProviders(
        <MatchesScreen />,
        mockStore
      );

      // Wait for screen to load
      await waitFor(() => {
        expect(getByTestId('matches-screen')).toBeTruthy();
      });

      // Verify matches are displayed
      await waitFor(() => {
        const matchCards = getAllByTestId(/match-card-/);
        expect(matchCards).toHaveLength(2);
      });
    });

    it('handles empty matches state', async () => {
      // Setup empty response
      mockApiHelpers.setupSuccessResponse(
        global.fetch as jest.Mock,
        MockApiHelper.success({ matches: [], users: [] })
      );

      const mockStore = {
        preloadedState: {
          auth: { isAuthenticated: true, user: currentUser },
          matches: { matches: [], loading: false },
        },
      };

      const { getByTestId } = renderWithProviders(
        <MatchesScreen />,
        mockStore
      );

      await waitFor(() => {
        expect(getByTestId('matches-screen')).toBeTruthy();
      });

      // Verify empty state is shown
      screenTestHelpers.expectEmptyState(
        getByTestId,
        'No matches yet. Keep swiping to find your perfect match!'
      );
    });

    it('navigates to chat from match card', async () => {
      const matches = [TestDataFactory.createMatch(currentUser.id, mockUsers[0].id)];
      const mockNavigation = { navigate: jest.fn() };

      const mockStore = {
        preloadedState: {
          auth: { isAuthenticated: true, user: currentUser },
          matches: { matches, loading: false },
        },
      };

      const { getByTestId } = renderWithProviders(
        <MatchesScreen />,
        mockStore,
        { navigationOptions: { navigation: mockNavigation } }
      );

      await waitFor(() => {
        expect(getByTestId('matches-screen')).toBeTruthy();
      });

      const matchCard = getByTestId(`match-card-${matches[0].id}`);
      fireEvent.press(matchCard);

      screenTestHelpers.expectNavigationCall(
        mockNavigation,
        'Chat',
        { matchId: matches[0].id, userId: mockUsers[0].id }
      );
    });
  });

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      const mockStore = {
        preloadedState: {
          auth: { isAuthenticated: true, user: currentUser },
          swipe: { queue: mockUsers, dailyCount: 5, limit: 100 },
        },
      };

      const { getByTestId, queryByTestId } = renderWithProviders(
        <SwipeScreen />,
        mockStore
      );

      const firstCard = getByTestId(`swipe-card-${mockUsers[0].id}`);

      // Mock network error
      mockApiHelpers.setupNetworkError(global.fetch as jest.Mock);

      await act(async () => {
        fireEvent(firstCard, 'onSwipe', mockUsers[0].id, 'like');
      });

      // Wait for error message
      await waitFor(() => {
        expect(queryByTestId('error-message')).toBeTruthy();
      });

      // Verify retry button is shown
      expect(queryByTestId('retry-button')).toBeTruthy();
    });

    it('handles API errors with proper user feedback', async () => {
      const mockStore = {
        preloadedState: {
          auth: { isAuthenticated: true, user: currentUser },
          swipe: { queue: mockUsers, dailyCount: 5, limit: 100 },
        },
      };

      const { getByTestId, queryByTestId } = renderWithProviders(
        <SwipeScreen />,
        mockStore
      );

      const firstCard = getByTestId(`swipe-card-${mockUsers[0].id}`);

      // Mock API error
      mockApiHelpers.setupErrorResponse(
        global.fetch as jest.Mock,
        'User not found',
        404
      );

      await act(async () => {
        fireEvent(firstCard, 'onSwipe', mockUsers[0].id, 'like');
      });

      // Wait for error message
      await waitFor(() => {
        screenTestHelpers.expectErrorState(queryByTestId, 'User not found');
      });
    });
  });

  describe('State Management Integration', () => {
    it('updates store state correctly after successful match', async () => {
      const match = TestDataFactory.createMatch(currentUser.id, mockUsers[0].id);
      
      const mockStore = {
        preloadedState: {
          auth: { isAuthenticated: true, user: currentUser },
          swipe: { queue: mockUsers, dailyCount: 5, limit: 100 },
          matches: { matches: [], newMatch: null },
        },
      };

      const { getByTestId, store } = renderWithProviders(
        <SwipeScreen />,
        mockStore
      );

      const firstCard = getByTestId(`swipe-card-${mockUsers[0].id}`);

      // Mock successful match response
      mockApiHelpers.setupSuccessResponse(
        global.fetch as jest.Mock,
        MockApiHelper.success({ matched: true, match })
      );

      await act(async () => {
        fireEvent(firstCard, 'onSwipe', mockUsers[0].id, 'like');
      });

      // Wait for state update
      await waitFor(() => {
        const state = store.getState();
        expect(state.matches.newMatch).toEqual(match);
        expect(state.swipe.dailyCount).toBe(6);
      });
    });

    it('updates queue correctly after swipe', async () => {
      const mockStore = {
        preloadedState: {
          auth: { isAuthenticated: true, user: currentUser },
          swipe: { queue: mockUsers, dailyCount: 5, limit: 100 },
        },
      };

      const { getByTestId, store } = renderWithProviders(
        <SwipeScreen />,
        mockStore
      );

      const firstCard = getByTestId(`swipe-card-${mockUsers[0].id}`);

      // Mock non-match response
      mockApiHelpers.setupSuccessResponse(
        global.fetch as jest.Mock,
        MockApiHelper.success({ matched: false })
      );

      await act(async () => {
        fireEvent(firstCard, 'onSwipe', mockUsers[0].id, 'dislike');
      });

      // Wait for state update
      await waitFor(() => {
        const state = store.getState();
        expect(state.swipe.queue).not.toContain(mockUsers[0]);
        expect(state.swipe.queue.length).toBe(mockUsers.length - 1);
      });
    });
  });
});