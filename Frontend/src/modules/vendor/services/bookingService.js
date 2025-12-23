/**
 * Booking Service
 * Handles all booking-related API calls
 * 
 * Note: This is a structure file for backend integration.
 * Replace localStorage calls with actual API endpoints.
 */

import api from '../../../services/api';

const API_BASE_URL = '/api/vendors';

/**
 * Get all bookings
 * @param {Object} filters - Filter options (status, date range, etc.)
 * @returns {Promise<Array>} List of bookings
 */
export const getBookings = async (filters = {}) => {
  try {
    const response = await api.get('/vendors/bookings', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

/**
 * Get booking by ID
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>} Booking details
 */
export const getBookingById = async (bookingId) => {
  try {
    const response = await api.get(`/vendors/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
};

/**
 * Accept a booking
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>} Updated booking
 */
export const acceptBooking = async (bookingId) => {
  try {
    const response = await api.post(`/vendors/bookings/${bookingId}/accept`);
    return response.data;
  } catch (error) {
    console.error('Error accepting booking:', error);
    throw error;
  }
};

/**
 * Reject a booking
 * @param {string} bookingId - Booking ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Updated booking
 */
export const rejectBooking = async (bookingId, reason = '') => {
  try {
    const response = await api.post(`/vendors/bookings/${bookingId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error rejecting booking:', error);
    throw error;
  }
};

/**
 * Assign worker to booking
 * @param {string} bookingId - Booking ID
 * @param {string} workerId - Worker ID (or 'SELF')
 * @returns {Promise<Object>} Updated booking
 */
export const assignWorker = async (bookingId, workerId) => {
  try {
    const response = await api.post(`/vendors/bookings/${bookingId}/assign-worker`, { workerId });
    return response.data;
  } catch (error) {
    console.error('Error assigning worker:', error);
    throw error;
  }
};

/**
 * Update booking status
 * @param {string} bookingId - Booking ID
 * @param {string} status - New status
 * @param {Object} data - Additional data (images, notes, etc.)
 * @returns {Promise<Object>} Updated booking
 */
export const updateBookingStatus = async (bookingId, status, data = {}) => {
  try {
    const response = await api.put(`/vendors/bookings/${bookingId}/status`, { status, ...data });
    return response.data;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

/**
 * Get pending booking alerts
 * @returns {Promise<Array>} List of pending bookings
 */
export const getPendingAlerts = async () => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/bookings/pending`);
    // return await response.json();

    // Mock implementation
    const pending = JSON.parse(localStorage.getItem('vendorPendingJobs') || '[]');
    return pending;
  } catch (error) {
    console.error('Error fetching pending alerts:', error);
    throw error;
  }
};

