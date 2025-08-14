import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SwipeAction, SwipeStats } from '@/types/matching';

export const useMatching = () => {
  const [stats, setStats] = useState<SwipeStats>({
    totalSwipes: 0,
    likes: 0,
    superLikes: 0,
    passes: 0,
    matches: 0,
    matchRate: 0,
    averageResponseTime: 0,
  });

  const checkMatch = useCallback(async (userId: string): Promise<boolean> => {
    try {
      // Simulate API call to check if other user also liked
      // In production, this would be a real API call
      const matchChance = Math.random();
      const isMatch = matchChance > 0.7; // 30% match rate for demo

      if (isMatch) {
        // Record the match
        const matches = await AsyncStorage.getItem('matches');
        const matchList = matches ? JSON.parse(matches) : [];
        matchList.push({
          userId,
          matchedAt: new Date().toISOString(),
        });
        await AsyncStorage.setItem('matches', JSON.stringify(matchList));

        // Update stats
        setStats(prev => ({
          ...prev,
          matches: prev.matches + 1,
          matchRate: ((prev.matches + 1) / prev.totalSwipes) * 100,
        }));
      }

      return isMatch;
    } catch (error) {
      console.error('Failed to check match:', error);
      return false;
    }
  }, []);

  const recordSwipe = useCallback(async (userId: string, action: SwipeAction) => {
    try {
      // Record swipe action
      const swipes = await AsyncStorage.getItem('swipeHistory');
      const swipeHistory = swipes ? JSON.parse(swipes) : [];
      
      swipeHistory.push({
        userId,
        action,
        timestamp: new Date().toISOString(),
      });

      // Keep only last 1000 swipes
      if (swipeHistory.length > 1000) {
        swipeHistory.shift();
      }

      await AsyncStorage.setItem('swipeHistory', JSON.stringify(swipeHistory));

      // Update stats
      setStats(prev => {
        const newStats = {
          ...prev,
          totalSwipes: prev.totalSwipes + 1,
        };

        switch (action) {
          case 'like':
            newStats.likes = prev.likes + 1;
            break;
          case 'superlike':
            newStats.superLikes = prev.superLikes + 1;
            break;
          case 'pass':
            newStats.passes = prev.passes + 1;
            break;
        }

        newStats.matchRate = (newStats.matches / newStats.totalSwipes) * 100;
        return newStats;
      });

      // Send to analytics
      trackSwipeAnalytics(userId, action);
    } catch (error) {
      console.error('Failed to record swipe:', error);
    }
  }, []);

  const getMatchRecommendations = useCallback(async () => {
    try {
      // Get user preferences and history
      const swipes = await AsyncStorage.getItem('swipeHistory');
      const swipeHistory = swipes ? JSON.parse(swipes) : [];

      // Analyze patterns (simplified)
      const likedProfiles = swipeHistory
        .filter((s: any) => s.action === 'like' || s.action === 'superlike')
        .map((s: any) => s.userId);

      // In production, this would use ML/AI for better recommendations
      return {
        preferences: {
          ageRange: [22, 35],
          interests: ['Travel', 'Music', 'Photography'],
          distance: 50,
        },
        patterns: {
          preferredHeight: "5'6\" - 5'10\"",
          preferredEducation: "College+",
        },
      };
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      return null;
    }
  }, []);

  const trackSwipeAnalytics = (userId: string, action: SwipeAction) => {
    // Send analytics event
    // In production, integrate with analytics service
    console.log('Analytics:', { userId, action, timestamp: new Date() });
  };

  const getStats = useCallback(async () => {
    try {
      const savedStats = await AsyncStorage.getItem('swipeStats');
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(['swipeHistory', 'swipeStats', 'matches']);
      setStats({
        totalSwipes: 0,
        likes: 0,
        superLikes: 0,
        passes: 0,
        matches: 0,
        matchRate: 0,
        averageResponseTime: 0,
      });
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }, []);

  return {
    checkMatch,
    recordSwipe,
    getMatchRecommendations,
    getStats,
    clearHistory,
    stats,
  };
};