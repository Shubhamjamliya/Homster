import api from './api';

/**
 * Catalog Service
 * Handles all API calls for Categories, Services, and Home Content
 */

/**
 * Category API calls
 */
export const categoryService = {
  // Get all categories
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.showOnHome !== undefined) queryParams.append('showOnHome', params.showOnHome);
    if (params.isPopular !== undefined) queryParams.append('isPopular', params.isPopular);

    const response = await api.get(`/admin/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    return response.data;
  },

  // Get single category by ID
  getById: async (id) => {
    const response = await api.get(`/admin/categories/${id}`);
    return response.data;
  },

  // Create new category
  create: async (data) => {
    const response = await api.post('/admin/categories', data);
    return response.data;
  },

  // Update category
  update: async (id, data) => {
    const response = await api.put(`/admin/categories/${id}`, data);
    return response.data;
  },

  // Delete category
  delete: async (id) => {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  },

  // Update category order
  updateOrder: async (id, homeOrder) => {
    const response = await api.patch(`/admin/categories/${id}/order`, { homeOrder });
    return response.data;
  }
};

/**
 * Service API calls
 */
export const serviceService = {
  // Get all services
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);

    const response = await api.get(`/admin/services${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    return response.data;
  },

  // Get single service by ID
  getById: async (id) => {
    const response = await api.get(`/admin/services/${id}`);
    return response.data;
  },

  // Create new service
  create: async (data) => {
    const response = await api.post('/admin/services', data);
    return response.data;
  },

  // Update service
  update: async (id, data) => {
    const response = await api.put(`/admin/services/${id}`, data);
    return response.data;
  },

  // Delete service
  delete: async (id) => {
    const response = await api.delete(`/admin/services/${id}`);
    return response.data;
  },

  // Update service page content
  updatePage: async (id, page) => {
    const response = await api.patch(`/admin/services/${id}/page`, { page });
    return response.data;
  },

  // Upload service image
  uploadImage: async (file, folder = 'services') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    const response = await api.post('/admin/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

/**
 * Home Content API calls
 */
export const homeContentService = {
  // Get home content
  get: async () => {
    const response = await api.get('/admin/home-content');
    return response.data;
  },

  // Update home content
  update: async (data) => {
    const response = await api.put('/admin/home-content', data);
    return response.data;
  }
};

/**
 * Public Catalog Service (for user app - no authentication required)
 */
export const publicCatalogService = {
  // Get all active categories
  getCategories: async () => {
    const response = await api.get('/public/categories');
    return response.data; // The controller returns { success: true, categories: [...] }
  },

  // Get all active services
  getServices: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params.categorySlug) queryParams.append('categorySlug', params.categorySlug);

    const response = await api.get(`/public/services${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    return response.data;
  },

  // Get service by slug
  getServiceBySlug: async (slug) => {
    const response = await api.get(`/public/services/slug/${slug}`);
    return response.data;
  },

  // Get home content
  getHomeContent: async () => {
    const response = await api.get('/public/home-content');
    return response.data;
  }
};

