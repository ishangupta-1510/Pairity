import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API Base URL - Change this to your actual backend URL
const BASE_URL = __DEV__ 
  ? Platform.OS === 'ios' 
    ? 'http://localhost:3000/api/v1'
    : 'http://10.0.2.2:3000/api/v1'  // Android emulator
  : 'https://api.pairity.com/v1';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Add auth token to requests
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add device info
    config.headers['X-Device-OS'] = Platform.OS;
    config.headers['X-Device-Version'] = Platform.Version;
    
    // Log request in dev mode
    if (__DEV__) {
      console.log('API Request:', {
        method: config.method,
        url: config.url,
        data: config.data,
        params: config.params,
      });
    }
    
    return config;
  },
  (error) => {
    if (__DEV__) {
      console.error('API Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in dev mode
    if (__DEV__) {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    
    // Return only the data portion
    return response.data;
  },
  async (error) => {
    if (__DEV__) {
      console.error('API Response Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    
    // Handle token expiration
    if (error.response?.status === 401) {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (refreshToken && !error.config._retry) {
        error.config._retry = true;
        
        try {
          // Attempt to refresh token
          const response = await api.post('/auth/refresh', { refreshToken });
          const { token } = response;
          
          // Save new token
          await AsyncStorage.setItem('token', token);
          
          // Retry original request with new token
          error.config.headers.Authorization = `Bearer ${token}`;
          return api(error.config);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          await AsyncStorage.multiRemove(['token', 'refreshToken']);
          // You might want to dispatch a logout action here
          // store.dispatch(logout());
        }
      }
    }
    
    // Handle network errors
    if (!error.response) {
      error.response = {
        data: {
          success: false,
          message: 'Network error. Please check your connection.',
        },
      };
    }
    
    return Promise.reject(error);
  }
);

// API methods
const apiClient = {
  // GET request
  get: (url, params = {}) => api.get(url, { params }),
  
  // POST request
  post: (url, data = {}) => api.post(url, data),
  
  // PUT request
  put: (url, data = {}) => api.put(url, data),
  
  // PATCH request
  patch: (url, data = {}) => api.patch(url, data),
  
  // DELETE request
  delete: (url) => api.delete(url),
  
  // Upload file
  upload: async (url, file, onProgress) => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.name || 'photo.jpg',
    });
    
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },
  
  // Set auth token manually
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },
};

export default apiClient;