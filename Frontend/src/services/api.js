import axios from 'axios';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // For cookies
});

// Helper to get token keys based on role/path
const getTokenKeys = (url) => {
  if (url?.includes('/vendors') || window.location.pathname.startsWith('/vendor')) {
    return { access: 'vendorAccessToken', refresh: 'vendorRefreshToken', role: 'vendor' };
  }
  if (url?.includes('/workers') || window.location.pathname.startsWith('/worker')) {
    return { access: 'workerAccessToken', refresh: 'workerRefreshToken', role: 'worker' };
  }
  if (url?.includes('/admin') || window.location.pathname.startsWith('/admin')) {
    return { access: 'adminAccessToken', refresh: 'adminRefreshToken', role: 'admin' };
  }
  return { access: 'accessToken', refresh: 'refreshToken', role: 'user' };
};

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const { access } = getTokenKeys(config.url);
    const token = localStorage.getItem(access);

    // For debugging
    // console.log(`Request to ${config.url}, using token key: ${access}, token exists: ${!!token}`);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track if we're currently refreshing
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { access, refresh, role } = getTokenKeys(originalRequest.url);
      const refreshToken = localStorage.getItem(refresh);

      if (!refreshToken) {
        // No refresh token, logout
        handleLogout(role);
        return Promise.reject(error);
      }

      try {
        // Determine correct refresh endpoint based on current path
        let refreshEndpoint = '/users/auth/refresh-token'; // Default to user
        if (role === 'vendor') refreshEndpoint = '/vendors/auth/refresh-token';
        else if (role === 'worker') refreshEndpoint = '/workers/auth/refresh-token';
        else if (role === 'admin') refreshEndpoint = '/admin/auth/refresh-token';

        // Try to refresh the token
        const response = await axios.post(`${API_BASE_URL}${refreshEndpoint}`, {
          refreshToken
        });

        const { accessToken } = response.data;

        // Save new access token
        localStorage.setItem(access, accessToken);

        // Update authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Process queued requests
        processQueue(null, accessToken);
        isRefreshing = false;

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('RefreshToken failed:', refreshError);
        // Refresh failed, logout
        processQueue(refreshError, null);
        isRefreshing = false;
        handleLogout(role);
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden - Role mismatch
    if (error.response?.status === 403) {
      console.error('Access Denied (403):', error.response.data.message);
      // Optional: Redirect if role mismatch is permanent?
    }

    return Promise.reject(error);
  }
);

// Handle logout
export const handleLogout = (role = null) => {
  if (!role) {
    // Determine role from path if not provided
    const path = window.location.pathname;
    if (path.startsWith('/admin')) role = 'admin';
    else if (path.startsWith('/vendor')) role = 'vendor';
    else if (path.startsWith('/worker')) role = 'worker';
    else role = 'user';
  }

  // Clear role-specific tokens only
  if (role === 'vendor') {
    localStorage.removeItem('vendorAccessToken');
    localStorage.removeItem('vendorRefreshToken');
    localStorage.removeItem('vendorData');
    window.location.href = '/vendor/login';
  } else if (role === 'worker') {
    localStorage.removeItem('workerAccessToken');
    localStorage.removeItem('workerRefreshToken');
    localStorage.removeItem('workerData');
    window.location.href = '/worker/login';
  } else if (role === 'admin') {
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminData');
    window.location.href = '/admin/login';
  } else {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    window.location.href = '/user/login';
  }
};

export default api;
