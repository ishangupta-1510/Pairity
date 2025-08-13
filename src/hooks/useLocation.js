import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState(null);

  // Request location permission
  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermission(status);
      return status === 'granted';
    } catch (err) {
      setError('Failed to request location permission');
      return false;
    }
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check permission first
      let { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          setError('Location permission denied');
          setLoading(false);
          Alert.alert(
            'Location Permission Required',
            'Please enable location services to use this feature.',
            [{ text: 'OK' }]
          );
          return null;
        }
      }

      // Get location
      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
        accuracy: locationData.coords.accuracy,
        altitude: locationData.coords.altitude,
        heading: locationData.coords.heading,
        speed: locationData.coords.speed,
      };

      setLocation(coords);
      setLoading(false);
      return coords;
    } catch (err) {
      setError('Failed to get current location');
      setLoading(false);
      Alert.alert('Location Error', 'Unable to fetch your location. Please try again.');
      return null;
    }
  }, [requestPermission]);

  // Watch location changes
  const watchLocation = useCallback(async (callback, options = {}) => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          setError('Location permission denied');
          return null;
        }
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: options.timeInterval || 5000,
          distanceInterval: options.distanceInterval || 10,
        },
        (locationData) => {
          const coords = {
            latitude: locationData.coords.latitude,
            longitude: locationData.coords.longitude,
            accuracy: locationData.coords.accuracy,
          };
          setLocation(coords);
          if (callback) callback(coords);
        }
      );

      return subscription;
    } catch (err) {
      setError('Failed to watch location');
      return null;
    }
  }, [requestPermission]);

  // Get address from coordinates
  const getAddress = useCallback(async (latitude, longitude) => {
    try {
      const address = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (address && address.length > 0) {
        return {
          street: address[0].street,
          city: address[0].city,
          region: address[0].region,
          country: address[0].country,
          postalCode: address[0].postalCode,
        };
      }
      return null;
    } catch (err) {
      setError('Failed to get address');
      return null;
    }
  }, []);

  // Calculate distance between two points
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance; // Distance in kilometers
  }, []);

  // Check if location services are enabled
  const checkLocationServices = useCallback(async () => {
    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      Alert.alert(
        'Location Services Disabled',
        'Please enable location services in your device settings.',
        [{ text: 'OK' }]
      );
    }
    return enabled;
  }, []);

  useEffect(() => {
    // Check permission on mount
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermission(status);
    })();
  }, []);

  return {
    location,
    loading,
    error,
    permission,
    getCurrentLocation,
    watchLocation,
    getAddress,
    calculateDistance,
    requestPermission,
    checkLocationServices,
  };
};