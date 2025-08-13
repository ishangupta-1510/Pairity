import api from './api';

const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
      deviceId: 'device-' + Math.random().toString(36).substr(2, 9),
    });
    return response.data;
  },

  // Register
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, we'll clear local data
      console.log('Logout error:', error);
    }
  },

  // Verify OTP
  verifyOTP: async (type, value, otp) => {
    const response = await api.post('/auth/verify-otp', {
      type,
      value,
      otp,
    });
    return response.data;
  },

  // Forgot Password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  // Reset Password
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },

  // Refresh Token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  // Check email availability
  checkEmail: async (email) => {
    const response = await api.post('/auth/check-email', {
      email,
    });
    return response.data;
  },

  // Check phone availability
  checkPhone: async (phone) => {
    const response = await api.post('/auth/check-phone', {
      phone,
    });
    return response.data;
  },

  // Resend OTP
  resendOTP: async (type, value) => {
    const response = await api.post('/auth/resend-otp', {
      type,
      value,
    });
    return response.data;
  },

  // Social login
  socialLogin: async (provider, token) => {
    const response = await api.post('/auth/social', {
      provider,
      token,
    });
    return response.data;
  },
};

export default authService;