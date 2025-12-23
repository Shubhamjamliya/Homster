import api from './api';

const workerService = {
  // Profile
  getProfile: async () => {
    const response = await api.get('/workers/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/workers/profile', profileData);
    return response.data;
  },

  updateLocation: async (lat, lng) => {
    // Assuming backend accepts { location: { lat, lng } } or similar
    // We send partial update if supported, or implementation depends on backend
    return api.put('/workers/profile/location', { lat, lng });
    // Note: If /location endpoint doesn't exist, we might need to use /profile
    // But for suggestion, specific endpoint is cleaner if available. 
    // If not, we fall back to generic profile update.
  },

  // Jobs
  getAssignedJobs: async (params) => {
    const response = await api.get('/workers/jobs', { params });
    return response.data;
  },

  getJobById: async (id) => {
    const response = await api.get(`/workers/jobs/${id}`);
    return response.data;
  },

  updateJobStatus: async (id, status) => {
    const response = await api.put(`/workers/jobs/${id}/status`, { status });
    return response.data;
  },

  startJob: async (id) => {
    const response = await api.post(`/workers/jobs/${id}/start`);
    return response.data;
  },

  completeJob: async (id) => {
    const response = await api.post(`/workers/jobs/${id}/complete`);
    return response.data;
  },

  addJobNotes: async (id, notes) => {
    const response = await api.post(`/workers/jobs/${id}/notes`, { notes });
    return response.data;
  },

  // Notifications
  getNotifications: async (params) => {
    const response = await api.get('/notifications/worker', { params });
    return response.data;
  },

  markNotificationAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllNotificationsAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  }
};

export default workerService;
