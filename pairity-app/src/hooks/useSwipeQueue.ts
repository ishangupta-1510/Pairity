import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SwipeProfile } from '@/types/matching';

const QUEUE_KEY = 'swipeQueue';
const SEEN_PROFILES_KEY = 'seenProfiles';
const MAX_QUEUE_SIZE = 50;
const MAX_SEEN_PROFILES = 500;

export const useSwipeQueue = () => {
  const loadQueue = useCallback(async (): Promise<SwipeProfile[]> => {
    try {
      const queue = await AsyncStorage.getItem(QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Failed to load queue:', error);
      return [];
    }
  }, []);

  const saveToQueue = useCallback(async (profiles: SwipeProfile[]) => {
    try {
      const existingQueue = await loadQueue();
      const seenProfiles = await getSeenProfiles();
      
      // Filter out already seen profiles
      const newProfiles = profiles.filter(
        profile => !seenProfiles.includes(profile.id)
      );
      
      // Combine and limit queue size
      const updatedQueue = [...existingQueue, ...newProfiles].slice(0, MAX_QUEUE_SIZE);
      
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue));
    } catch (error) {
      console.error('Failed to save queue:', error);
    }
  }, [loadQueue]);

  const removeFromQueue = useCallback(async (profileId: string) => {
    try {
      const queue = await loadQueue();
      const updatedQueue = queue.filter(profile => profile.id !== profileId);
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue));
      
      // Add to seen profiles
      await addToSeenProfiles(profileId);
    } catch (error) {
      console.error('Failed to remove from queue:', error);
    }
  }, [loadQueue]);

  const getSeenProfiles = useCallback(async (): Promise<string[]> => {
    try {
      const seen = await AsyncStorage.getItem(SEEN_PROFILES_KEY);
      return seen ? JSON.parse(seen) : [];
    } catch (error) {
      console.error('Failed to get seen profiles:', error);
      return [];
    }
  }, []);

  const addToSeenProfiles = useCallback(async (profileId: string) => {
    try {
      const seenProfiles = await getSeenProfiles();
      
      // Add new profile and limit size
      const updatedSeen = [profileId, ...seenProfiles].slice(0, MAX_SEEN_PROFILES);
      
      await AsyncStorage.setItem(SEEN_PROFILES_KEY, JSON.stringify(updatedSeen));
    } catch (error) {
      console.error('Failed to add to seen profiles:', error);
    }
  }, [getSeenProfiles]);

  const clearQueue = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(QUEUE_KEY);
    } catch (error) {
      console.error('Failed to clear queue:', error);
    }
  }, []);

  const clearSeenProfiles = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(SEEN_PROFILES_KEY);
    } catch (error) {
      console.error('Failed to clear seen profiles:', error);
    }
  }, []);

  const preloadProfiles = useCallback(async (count: number = 10) => {
    try {
      const queue = await loadQueue();
      
      if (queue.length < 5) {
        // Fetch more profiles from API
        // This would be replaced with actual API call
        const newProfiles = await fetchProfilesFromAPI(count);
        await saveToQueue(newProfiles);
      }
    } catch (error) {
      console.error('Failed to preload profiles:', error);
    }
  }, [loadQueue, saveToQueue]);

  const fetchProfilesFromAPI = async (count: number): Promise<SwipeProfile[]> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const profiles: SwipeProfile[] = Array.from({ length: count }, (_, i) => ({
          id: `api_profile_${Date.now()}_${i}`,
          name: `User ${i + 1}`,
          age: 22 + Math.floor(Math.random() * 20),
          photos: [
            `https://i.pravatar.cc/600?img=${i + 20}`,
            `https://i.pravatar.cc/600?img=${i + 21}`,
          ],
          bio: 'Looking for something meaningful...',
          location: `${Math.floor(Math.random() * 50)} miles away`,
          distance: Math.floor(Math.random() * 50),
          interests: ['Travel', 'Music'].slice(0, Math.floor(Math.random() * 2) + 1),
          prompts: [],
          isVerified: Math.random() > 0.5,
          matchPercentage: 60 + Math.floor(Math.random() * 40),
          hasInstagram: false,
          hasSpotify: false,
          instagramPhotos: [],
          spotifyArtists: [],
        }));
        resolve(profiles);
      }, 1000);
    });
  };

  const getPriorityQueue = useCallback(async (): Promise<SwipeProfile[]> => {
    try {
      const queue = await loadQueue();
      
      // Sort by priority (boosted profiles, high match percentage, etc.)
      return queue.sort((a, b) => {
        // Boosted profiles first
        // Then by match percentage
        // Then by distance
        return b.matchPercentage - a.matchPercentage;
      });
    } catch (error) {
      console.error('Failed to get priority queue:', error);
      return [];
    }
  }, [loadQueue]);

  return {
    loadQueue,
    saveToQueue,
    removeFromQueue,
    clearQueue,
    clearSeenProfiles,
    preloadProfiles,
    getPriorityQueue,
    getSeenProfiles,
  };
};