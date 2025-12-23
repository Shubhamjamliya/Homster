const axios = require('axios');

/**
 * Location Service
 * Handles location-based operations using Google Maps API
 */

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_API_URL = 'https://maps.googleapis.com/maps/api';

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Object} coord1 - {lat, lng}
 * @param {Object} coord2 - {lat, lng}
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (coord1, coord2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Geocode address to coordinates using Google Maps API
 * @param {string} address - Full address string
 * @returns {Promise<Object>} {lat, lng} coordinates
 */
const geocodeAddress = async (address) => {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not configured, using mock coordinates');
      // Return mock coordinates for testing
      return {
        lat: 22.7196,
        lng: 75.8577
      };
    }

    const response = await axios.get(`${GOOGLE_MAPS_API_URL}/geocode/json`, {
      params: {
        address: address,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng
      };
    }

    throw new Error(`Geocoding failed: ${response.data.status}`);
  } catch (error) {
    console.error('Geocoding error:', error);
    // Return mock coordinates as fallback
    return {
      lat: 22.7196,
      lng: 75.8577
    };
  }
};

/**
 * Find vendors within specified radius of a location
 * @param {Object} centerLocation - {lat, lng} of center point
 * @param {number} radiusKm - Search radius in kilometers (default: 10)
 * @param {Object} filters - Additional filters for vendors
 * @returns {Promise<Array>} Array of nearby vendors with distance
 */
const findNearbyVendors = async (centerLocation, radiusKm = 10, filters = {}) => {
  try {
    const Vendor = require('../models/Vendor');
    const { VENDOR_STATUS } = require('../utils/constants');

    // Get all approved and active vendors
    const vendors = await Vendor.find({
      approvalStatus: VENDOR_STATUS.APPROVED,
      isActive: true,
      ...filters
    }).select('name businessName phone address profilePhoto service rating');

    // Calculate distances and filter by radius
    const nearbyVendors = vendors.map(vendor => {
      let distance = null;

      // If vendor has coordinates in address
      if (vendor.address && vendor.address.lat && vendor.address.lng) {
        distance = calculateDistance(centerLocation, {
          lat: vendor.address.lat,
          lng: vendor.address.lng
        });
      } else if (vendor.address && vendor.address.city) {
        // If no coordinates, geocode the address (async operation)
        // For now, include all vendors if we can't calculate distance
        distance = null; // Will be calculated later if needed
      }

      return {
        ...vendor.toObject(),
        distance: distance,
        withinRange: distance === null || distance <= radiusKm
      };
    }).filter(vendor => vendor.withinRange);

    return nearbyVendors;
  } catch (error) {
    console.error('Find nearby vendors error:', error);
    return [];
  }
};

/**
 * Get distance matrix between multiple points
 * @param {Array} origins - Array of {lat, lng} objects
 * @param {Array} destinations - Array of {lat, lng} objects
 * @returns {Promise<Array>} Distance matrix
 */
const getDistanceMatrix = async (origins, destinations) => {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not configured, using mock distances');
      // Return mock distances
      return origins.map(() => destinations.map(() => ({ distance: { value: 5000 } })));
    }

    const originsStr = origins.map(coord => `${coord.lat},${coord.lng}`).join('|');
    const destinationsStr = destinations.map(coord => `${coord.lat},${coord.lng}`).join('|');

    const response = await axios.get(`${GOOGLE_MAPS_API_URL}/distancematrix/json`, {
      params: {
        origins: originsStr,
        destinations: destinationsStr,
        key: GOOGLE_MAPS_API_KEY,
        units: 'metric'
      }
    });

    return response.data.rows;
  } catch (error) {
    console.error('Distance matrix error:', error);
    return [];
  }
};

module.exports = {
  geocodeAddress,
  findNearbyVendors,
  calculateDistance,
  getDistanceMatrix
};
