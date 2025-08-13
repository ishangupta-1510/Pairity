import api from './api';

const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // Upload photo
  uploadPhoto: async (photo, isPrimary = false, caption = '') => {
    const formData = new FormData();
    formData.append('photo', {
      uri: photo.uri,
      type: photo.type || 'image/jpeg',
      name: photo.name || 'photo.jpg',
    });
    formData.append('isPrimary', isPrimary);
    formData.append('caption', caption);

    const response = await api.post('/users/photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete photo
  deletePhoto: async (photoId) => {
    await api.delete(`/users/photos/${photoId}`);
  },

  // Reorder photos
  reorderPhotos: async (photoIds) => {
    const response = await api.put('/users/photos/reorder', {
      photoIds,
    });
    return response.data;
  },

  // Get preferences
  getPreferences: async () => {
    const response = await api.get('/users/preferences');
    return response.data;
  },

  // Update preferences
  updatePreferences: async (preferences) => {
    const response = await api.put('/users/preferences', preferences);
    return response.data;
  },

  // Get settings
  getSettings: async () => {
    const response = await api.get('/users/settings');
    return response.data;
  },

  // Update settings
  updateSettings: async (settings) => {
    const response = await api.put('/users/settings', settings);
    return response.data;
  },

  // Verify identity
  verifyIdentity: async (documentType, documentImage) => {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('document', {
      uri: documentImage.uri,
      type: documentImage.type || 'image/jpeg',
      name: 'document.jpg',
    });

    const response = await api.post('/users/verify-identity', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Verify photo
  verifyPhoto: async (photoId, verificationPhoto) => {
    const formData = new FormData();
    formData.append('photoId', photoId);
    formData.append('verificationPhoto', {
      uri: verificationPhoto.uri,
      type: verificationPhoto.type || 'image/jpeg',
      name: 'verification.jpg',
    });

    const response = await api.post('/users/verify-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete account
  deleteAccount: async (reason, feedback) => {
    const response = await api.delete('/users/account', {
      data: { reason, feedback },
    });
    return response.data;
  },

  // Block user
  blockUser: async (userId, reason) => {
    const response = await api.post('/users/block', {
      userId,
      reason,
    });
    return response.data;
  },

  // Unblock user
  unblockUser: async (userId) => {
    const response = await api.post('/users/unblock', {
      userId,
    });
    return response.data;
  },

  // Get blocked users
  getBlockedUsers: async () => {
    const response = await api.get('/users/blocked');
    return response.data;
  },

  // Report user
  reportUser: async (userId, reason, details) => {
    const response = await api.post('/users/report', {
      userId,
      reason,
      details,
    });
    return response.data;
  },

  // Update location
  updateLocation: async (latitude, longitude) => {
    const response = await api.put('/users/location', {
      latitude,
      longitude,
    });
    return response.data;
  },
};

export default userService;