const Vendor = require('../../models/Vendor');
const { validationResult } = require('express-validator');

/**
 * Get vendor profile
 */
const getProfile = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const vendor = await Vendor.findById(vendorId).select('-password -__v');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        businessName: vendor.businessName || null,
        email: vendor.email,
        phone: vendor.phone,
        service: vendor.service,
        address: vendor.address || null,
        rating: 0, // TODO: Calculate from reviews
        totalJobs: 0, // TODO: Count from bookings
        completionRate: 0, // TODO: Calculate from bookings
        approvalStatus: vendor.approvalStatus,
        isPhoneVerified: vendor.isPhoneVerified || false,
        isEmailVerified: vendor.isEmailVerified || false,
        profilePhoto: vendor.profilePhoto || null,
        createdAt: vendor.createdAt,
        updatedAt: vendor.updatedAt
      }
    });
  } catch (error) {
    console.error('Get vendor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile. Please try again.'
    });
  }
};

/**
 * Update vendor profile
 */
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const vendorId = req.user.id;
    const { name, businessName, address } = req.body;

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Update fields
    if (name) vendor.name = name.trim();
    if (businessName !== undefined) vendor.businessName = businessName ? businessName.trim() : null;
    if (address) {
      vendor.address = {
        addressLine1: address.addressLine1 || vendor.address?.addressLine1 || '',
        addressLine2: address.addressLine2 || vendor.address?.addressLine2 || '',
        city: address.city || vendor.address?.city || '',
        state: address.state || vendor.address?.state || '',
        pincode: address.pincode || vendor.address?.pincode || '',
        landmark: address.landmark || vendor.address?.landmark || ''
      };
    }

    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      vendor: {
        id: vendor._id,
        name: vendor.name,
        businessName: vendor.businessName,
        email: vendor.email,
        phone: vendor.phone,
        service: vendor.service,
        address: vendor.address,
        approvalStatus: vendor.approvalStatus,
        isPhoneVerified: vendor.isPhoneVerified,
        isEmailVerified: vendor.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Update vendor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile. Please try again.'
    });
  }
};

/**
 * Update vendor address
 */
const updateAddress = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const vendorId = req.user.id;
    const { fullAddress, lat, lng } = req.body;

    if (!fullAddress || !lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Full address and coordinates are required'
      });
    }

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Update address with coordinates
    vendor.address = {
      ...vendor.address,
      fullAddress: fullAddress.trim(),
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    };

    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      address: vendor.address
    });
  } catch (error) {
    console.error('Update vendor address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update address. Please try again.'
    });
  }
};

/**
 * Update vendor real-time location
 */
const updateLocation = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
    }

    // Update only the location field
    await Vendor.findByIdAndUpdate(vendorId, {
      location: { lat, lng, updatedAt: new Date() }
    });

    res.status(200).json({ success: true, message: 'Location updated' });
  } catch (error) {
    console.error('Vendor location update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateAddress,
  updateLocation
};

