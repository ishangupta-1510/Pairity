import api from './api';

const matchService = {
  // Get daily queue
  getDailyQueue: async (date = null) => {
    const params = date ? { date } : {};
    const response = await api.get('/matching/daily-queue', params);
    return response.data;
  },

  // Swipe action
  swipe: async (targetUserId, action, metadata = {}) => {
    const response = await api.post('/matching/swipe', {
      targetUserId,
      action, // 'like', 'superlike', 'pass'
      viewDuration: metadata.viewDuration || 0,
      photosViewed: metadata.photosViewed || 1,
    });
    return response.data;
  },

  // Get matches
  getMatches: async (status = 'active', page = 1, limit = 20) => {
    const response = await api.get('/matching/matches', {
      status,
      page,
      limit,
    });
    return response.data;
  },

  // Get a specific match
  getMatch: async (matchId) => {
    const response = await api.get(`/matching/matches/${matchId}`);
    return response.data;
  },

  // Unmatch
  unmatch: async (matchId, reason, feedback = '') => {
    await api.delete(`/matching/matches/${matchId}`, {
      data: { reason, feedback },
    });
  },

  // Get likes received (premium feature)
  getLikesReceived: async () => {
    const response = await api.get('/matching/likes-received');
    return response.data;
  },

  // Get who viewed your profile (premium feature)
  getProfileViewers: async () => {
    const response = await api.get('/matching/profile-viewers');
    return response.data;
  },

  // Boost profile
  boostProfile: async (duration = 30) => {
    const response = await api.post('/matching/boost', {
      duration, // in minutes
    });
    return response.data;
  },

  // Get boost status
  getBoostStatus: async () => {
    const response = await api.get('/matching/boost-status');
    return response.data;
  },

  // Rewind last swipe (premium feature)
  rewind: async () => {
    const response = await api.post('/matching/rewind');
    return response.data;
  },

  // Get discover profiles (after daily queue exhausted)
  getDiscoverProfiles: async (filters = {}) => {
    const response = await api.get('/matching/discover', filters);
    return response.data;
  },

  // Get compatibility details
  getCompatibility: async (userId) => {
    const response = await api.get(`/matching/compatibility/${userId}`);
    return response.data;
  },

  // Report fake profile
  reportProfile: async (userId, reason, details) => {
    const response = await api.post('/matching/report', {
      userId,
      reason,
      details,
    });
    return response.data;
  },

  // Get match statistics
  getStats: async () => {
    const response = await api.get('/matching/stats');
    return response.data;
  },

  // Extend match expiry
  extendMatch: async (matchId) => {
    const response = await api.post(`/matching/matches/${matchId}/extend`);
    return response.data;
  },

  // Get super likes remaining
  getSuperLikesRemaining: async () => {
    const response = await api.get('/matching/superlikes-remaining');
    return response.data;
  },

  // Purchase super likes
  purchaseSuperLikes: async (quantity) => {
    const response = await api.post('/matching/purchase-superlikes', {
      quantity,
    });
    return response.data;
  },
};

export default matchService;