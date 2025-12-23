const User = require('../../models/User');
const Token = require('../../models/Token');
const { generateTokenPair, verifyRefreshToken } = require('../../utils/tokenService');
const { createOTPToken, verifyOTPToken, markTokenAsUsed } = require('../../services/otpService');
const { sendOTPEmail } = require('../../services/emailService');
const { TOKEN_TYPES, USER_ROLES } = require('../../utils/constants');
const { validationResult } = require('express-validator');
const { generateOTP } = require('../../utils/generateOTP');

/**
 * Send OTP for user registration/login
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

    // Check if user exists (for login) or not (for signup)
    const existingUser = await User.findOne({ phone });

    // Create OTP token
    const { token, otp } = await createOTPToken({
      userId: existingUser ? existingUser._id : null,
      phone,
      email: email || null,
      type: existingUser ? TOKEN_TYPES.PHONE_VERIFICATION : TOKEN_TYPES.PHONE_VERIFICATION,
      expiryMinutes: 10
    });

    // Send OTP via SMS (simulated) or Email
    if (process.env.NODE_ENV === 'development' || process.env.USE_DEFAULT_OTP === 'true') {
      console.log(`[DEV MODE] Default OTP for ${phone}: ${otp}`);
    } else {
      console.log(`OTP for ${phone}: ${otp}`);
    }

    if (email) {
      await sendOTPEmail(email, otp, 'verification');
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      token // Return token for verification
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
 * Register user with OTP
 */
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, phone, otp, token } = req.body;

    // Verify OTP
    const verification = await verifyOTPToken({ phone, otp, type: TOKEN_TYPES.PHONE_VERIFICATION });
    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }

    // Verify token
    if (verification.tokenDoc.token !== token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists. Please login.'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: email || null,
      phone,
      isPhoneVerified: true,
      isEmailVerified: email ? false : true
    });

    // Mark token as used
    await markTokenAsUsed(verification.tokenDoc._id);

    // Generate JWT tokens
    const tokens = generateTokenPair({
      userId: user._id,
      role: USER_ROLES.USER
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified
      },
      ...tokens
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

/**
 * Login user with OTP
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

    // Verify token
    if (verification.tokenDoc.token !== token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please sign up first.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Mark token as used
    await markTokenAsUsed(verification.tokenDoc._id);

    // Generate JWT tokens
    const tokens = generateTokenPair({
      userId: user._id,
      role: USER_ROLES.USER
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified
      },
      ...tokens
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

/**
 * Logout user
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

    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // Generate new token pair
    const tokens = generateTokenPair({
      userId: user._id,
      role: USER_ROLES.USER
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
