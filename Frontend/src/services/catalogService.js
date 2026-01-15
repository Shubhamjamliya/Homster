import api from './api';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

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

  // Upload service image/video directly to Cloudinary
  uploadImage: async (file, folder = 'services', onProgress) => {
    try {
      const url = await uploadToCloudinary(file, folder, onProgress);
      return {
        success: true,
        imageUrl: url,
        message: 'File uploaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to upload file',
        error: error.message
      };
    }
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
 * Now with caching for faster data retrieval
 */
import { apiCache } from './api';

export const publicCatalogService = {
  // Get all active categories (cached for 5 minutes)
  getCategories: async () => {
    const cacheKey = 'public:categories';
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    const response = await api.get('/public/categories');
    if (response.data.success) {
      apiCache.set(cacheKey, response.data, 300); // 5 minutes
    }
    return response.data;
  },

  // Get all active services
  getServices: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params.categorySlug) queryParams.append('categorySlug', params.categorySlug);

    const cacheKey = `public:services:${queryParams.toString()}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    const response = await api.get(`/public/services${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    if (response.data.success) {
      apiCache.set(cacheKey, response.data, 120); // 2 minutes
    }
    return response.data;
  },

  // Get service by slug (cached for 1 minute)
  getServiceBySlug: async (slug) => {
    const cacheKey = `public:service:${slug}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    const response = await api.get(`/public/services/slug/${slug}`);
    if (response.data.success) {
      apiCache.set(cacheKey, response.data, 60); // 1 minute
    }
    return response.data;
  },

  // Get home content (cached for 2 minutes)
  getHomeContent: async () => {
    const cacheKey = 'public:homeContent';
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    const response = await api.get('/public/home-content');
    if (response.data.success) {
      apiCache.set(cacheKey, response.data, 120); // 2 minutes
    }
    return response.data;
  },

  // Invalidate all public caches (useful after admin updates)
  invalidateCache: () => {
    apiCache.invalidatePrefix('public:');
  }
};

