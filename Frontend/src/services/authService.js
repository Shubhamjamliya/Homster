import api from './api';
import { registerFCMToken, removeFCMToken } from './pushNotificationService';

/**
 * User Authentication Service
 */
/**
 * User Authentication Service
 */
export const userAuthService = {
  // Send OTP
  sendOTP: async (phone, email = null) => {
    const response = await api.post('/users/auth/send-otp', { phone, email });
    return response.data;
  },

  // Register
  register: async (data) => {
    const response = await api.post('/users/auth/register', data);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      // Register FCM token after successful registration
      registerFCMToken('user', true).catch(console.error);
    }
    return response.data;
  },

  // Login
  login: async (data) => {
    const response = await api.post('/users/auth/login', data);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      // Register FCM token after successful login
      registerFCMToken('user', true).catch(console.error);
    }
    return response.data;
  },

  // Logout
  logout: async () => {
    // Remove FCM token before logout
    await removeFCMToken('user');
    try {
      await api.post('/users/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
  },

  // Get profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    if (response.data.user) {
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data);
    if (response.data.user) {
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response.data;
  }
};

/**
 * Vendor Authentication Service
 */
export const vendorAuthService = {
  // Send OTP
  sendOTP: async (phone, email = null) => {
    const response = await api.post('/vendors/auth/send-otp', { phone, email });
    return response.data;
  },

  // Register
  register: async (data) => {
    const response = await api.post('/vendors/auth/register', data);
    return response.data;
  },

  // Login
  login: async (data) => {
    // Remove email from login payload if present
    const { email, ...loginData } = data;
    const response = await api.post('/vendors/auth/login', loginData);
    if (response.data.accessToken) {
      localStorage.setItem('vendorAccessToken', response.data.accessToken);
      localStorage.setItem('vendorRefreshToken', response.data.refreshToken);
      localStorage.setItem('vendorData', JSON.stringify(response.data.vendor));
      // Register FCM token after successful login (await to ensure it completes)
      console.log('[AUTH] Vendor login successful, registering FCM token...');
      try {
        const fcmToken = await registerFCMToken('vendor', true);
        if (fcmToken) {
          console.log('[AUTH] ✅ Vendor FCM token registered successfully');
        } else {
          console.log('[AUTH] ⚠️ Vendor FCM token registration returned null');
        }
      } catch (err) {
        console.error('[AUTH] ❌ Vendor FCM token registration failed:', err);
      }
    }
    return response.data;
  },

  // Logout
  logout: async () => {
    // Remove FCM token before logout
    await removeFCMToken('vendor');
    try {
      await api.post('/vendors/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('vendorAccessToken');
    localStorage.removeItem('vendorRefreshToken');
    localStorage.removeItem('vendorData');
  },

  // Get profile
  getProfile: async () => {
    const response = await api.get('/vendors/profile');
    if (response.data.vendor) {
      localStorage.setItem('vendorData', JSON.stringify(response.data.vendor));
    }
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.put('/vendors/profile', data);
    if (response.data.vendor) {
      localStorage.setItem('vendorData', JSON.stringify(response.data.vendor));
    }
    return response.data;
  }
};

/**
 * Worker Authentication Service
 */
export const workerAuthService = {
  // Send OTP
  sendOTP: async (phone, email = null) => {
    const response = await api.post('/workers/auth/send-otp', { phone, email });
    return response.data;
  },

  // Register
  register: async (data) => {
    const response = await api.post('/workers/auth/register', data);
    if (response.data.accessToken) {
      localStorage.setItem('workerAccessToken', response.data.accessToken);
      localStorage.setItem('workerRefreshToken', response.data.refreshToken);
      localStorage.setItem('workerData', JSON.stringify(response.data.worker));
    }
    return response.data;
  },

  // Login
  login: async (data) => {
    // Remove email from login payload if present
    const { email, ...loginData } = data;
    const response = await api.post('/workers/auth/login', loginData);
    if (response.data.accessToken) {
      localStorage.setItem('workerAccessToken', response.data.accessToken);
      localStorage.setItem('workerRefreshToken', response.data.refreshToken);
      localStorage.setItem('workerData', JSON.stringify(response.data.worker));
      // Register FCM token after successful login
      registerFCMToken('worker', true).catch(console.error);
    }
    return response.data;
  },

  // Logout
  logout: async () => {
    // Remove FCM token before logout
    await removeFCMToken('worker');
    try {
      await api.post('/workers/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('workerAccessToken');
    localStorage.removeItem('workerRefreshToken');
    localStorage.removeItem('workerData');
  },

  // Get profile
  getProfile: async () => {
    const response = await api.get('/workers/profile');
    if (response.data.worker) {
      localStorage.setItem('workerData', JSON.stringify(response.data.worker));
    }
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.put('/workers/profile', data);
    if (response.data.worker) {
      localStorage.setItem('workerData', JSON.stringify(response.data.worker));
    }
    return response.data;
  }
};

/**
 * Admin Authentication Service
 */
export const adminAuthService = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/admin/auth/login', { email, password });
    if (response.data.accessToken) {
      localStorage.setItem('adminAccessToken', response.data.accessToken);
      localStorage.setItem('adminRefreshToken', response.data.refreshToken);
      localStorage.setItem('adminData', JSON.stringify(response.data.admin));
    }
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/admin/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminData');
  }
};


