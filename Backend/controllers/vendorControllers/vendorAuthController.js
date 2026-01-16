const Vendor = require('../../models/Vendor');
const { createOTPToken, verifyOTPToken, markTokenAsUsed } = require('../../services/otpService');
const { generateTokenPair, verifyRefreshToken } = require('../../utils/tokenService');
const cloudinaryService = require('../../services/cloudinaryService');
const { TOKEN_TYPES, USER_ROLES, VENDOR_STATUS } = require('../../utils/constants');
const { validationResult } = require('express-validator');

/**
 * Send OTP for vendor registration/login
 */
const sendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phone, email } = req.body;

    const existingVendor = await Vendor.findOne({ phone });

    const { token, otp } = await createOTPToken({
      userId: existingVendor ? existingVendor._id : null,
      phone,
      email: email || null,
      type: TOKEN_TYPES.PHONE_VERIFICATION,
      expiryMinutes: 10
    });

    if (process.env.NODE_ENV === 'development' || process.env.USE_DEFAULT_OTP === 'true') {
      console.log(`[DEV MODE] Default OTP for vendor ${phone}: ${otp}`);
    } else {
      console.log(`OTP for vendor ${phone}: ${otp}`);
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      token
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
};

/**
 * Register vendor with OTP and documents
 */
const register = async (req, res) => {
  try {
    console.log('Vendor register called with data:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, phone, aadhar, pan, service, otp, token } = req.body;

    // Verify OTP
    const verification = await verifyOTPToken({ phone, otp, type: TOKEN_TYPES.PHONE_VERIFICATION });
    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }

    if (verification.tokenDoc.token !== token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({ $or: [{ phone }, { email }] });
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: 'Vendor already exists. Please login.'
      });
    }

    // Upload documents to Cloudinary if they are base64 strings
    let aadharUrl = req.body.aadharDocument || null;
    let panUrl = req.body.panDocument || null;
    let otherUrls = req.body.otherDocuments || [];

    if (aadharUrl && aadharUrl.startsWith('data:')) {
      const uploadRes = await cloudinaryService.uploadFile(aadharUrl, { folder: 'vendors/documents' });
      if (uploadRes.success) aadharUrl = uploadRes.url;
    }

    if (panUrl && panUrl.startsWith('data:')) {
      const uploadRes = await cloudinaryService.uploadFile(panUrl, { folder: 'vendors/documents' });
      if (uploadRes.success) panUrl = uploadRes.url;
    }

    if (otherUrls && otherUrls.length > 0) {
      const uploadedOthers = [];
      for (const doc of otherUrls) {
        if (doc && doc.startsWith('data:')) {
          const uploadRes = await cloudinaryService.uploadFile(doc, { folder: 'vendors/documents/others' });
          if (uploadRes.success) uploadedOthers.push(uploadRes.url);
        } else {
          uploadedOthers.push(doc);
        }
      }
      otherUrls = uploadedOthers;
    }

    // Create vendor (pending approval)
    const vendor = await Vendor.create({
      name,
      email,
      phone,
      service,
      aadhar: {
        number: aadhar,
        document: aadharUrl
      },
      pan: {
        number: pan,
        document: panUrl
      },
      otherDocuments: otherUrls,
      approvalStatus: VENDOR_STATUS.PENDING,
      isPhoneVerified: true
    });

    // Mark token as used
    await markTokenAsUsed(verification.tokenDoc._id);

    // 🔔 NOTIFY ALL ADMINS about new vendor registration
    try {
      const { createNotification } = require('../notificationControllers/notificationController');
      const Admin = require('../../models/Admin');

      const admins = await Admin.find({ isActive: true }).select('_id');

      for (const admin of admins) {
        await createNotification({
          adminId: admin._id,
          type: 'vendor_approval_request',
          title: '👤 New Vendor Registration',
          message: `${vendor.name} (${vendor.phone}) has registered and is pending approval`,
          relatedId: vendor._id,
          relatedType: 'vendor',
          data: {
            vendorId: vendor._id,
            vendorName: vendor.name,
            phone: vendor.phone,
            service: vendor.service
          },
          pushData: {
            type: 'admin_alert',
            link: '/admin/vendors/all'
          }
        });
      }
      console.log(`[VendorRegister] Notified ${admins.length} admins about new vendor: ${vendor.name}`);
    } catch (notifyErr) {
      console.error('[VendorRegister] Failed to notify admins:', notifyErr);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Your account is pending admin approval.',
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        approvalStatus: vendor.approvalStatus
      }
    });
  } catch (error) {
    console.error('Vendor registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

/**
 * Login vendor with OTP (only if approved)
 */
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phone, otp, token } = req.body;

    // Verify OTP
    const verification = await verifyOTPToken({ phone, otp, type: TOKEN_TYPES.PHONE_VERIFICATION });
    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }

    if (verification.tokenDoc.token !== token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    // Find vendor
    const vendor = await Vendor.findOne({ phone });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found. Please sign up first.'
      });
    }

    // Check approval status
    if (vendor.approvalStatus === VENDOR_STATUS.PENDING) {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval. Please wait for approval.'
      });
    }

    if (vendor.approvalStatus === VENDOR_STATUS.REJECTED) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been rejected. Please contact support.'
      });
    }

    if (vendor.approvalStatus === VENDOR_STATUS.SUSPENDED) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    if (!vendor.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Mark token as used
    await markTokenAsUsed(verification.tokenDoc._id);

    // Generate JWT tokens
    const tokens = generateTokenPair({
      userId: vendor._id,
      role: USER_ROLES.VENDOR
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        businessName: vendor.businessName,
        service: vendor.service
      },
      ...tokens
    });
  } catch (error) {
    console.error('Vendor login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

/**
 * Logout vendor
 */
const logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

/**
 * Refresh Access Token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Check if vendor exists
    const vendor = await Vendor.findById(decoded.userId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Check status
    if (vendor.approvalStatus !== 'APPROVED' || !vendor.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // Generate new token pair
    const tokens = generateTokenPair({
      userId: vendor._id,
      role: USER_ROLES.VENDOR
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      ...tokens
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token'
    });
  }
};

module.exports = {
  sendOTP,
  register,
  login,
  logout,
  refreshToken
};
