const User = require('../../models/User');
const { validationResult } = require('express-validator');

/**
 * Get user profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password -otp -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name || 'Verified Customer',
        email: user.email || null,
        phone: user.phone || null,
        isPhoneVerified: user.isPhoneVerified || false,
        isEmailVerified: user.isEmailVerified || false,
        profilePhoto: user.profilePhoto || null,
        addresses: user.addresses || [],
        plans: user.plans || {},
        settings: user.settings || {},
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile. Please try again.'
    });
  }
};

/**
 * Update user profile
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

    const userId = req.user.id;
    const { name, email, addresses, profilePhoto, settings } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name.trim();
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      user.email = email.toLowerCase();
    }

    // Update profile photo
    if (profilePhoto) user.profilePhoto = profilePhoto;

    // Update addresses
    if (addresses && Array.isArray(addresses)) {
      user.addresses = addresses;
    }

    // Update settings
    if (settings) {
      if (settings.notifications !== undefined) user.settings.notifications = settings.notifications;
      if (settings.language) user.settings.language = settings.language;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified,
        profilePhoto: user.profilePhoto || null,
        addresses: user.addresses || [],
        addresses: user.addresses || [],
        plans: user.plans || {},
        settings: user.settings || {}
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile. Please try again.'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile
};

