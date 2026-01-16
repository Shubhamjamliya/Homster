import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FiUser, FiMail, FiPhone } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../theme';
import { userAuthService } from '../../../services/authService';

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState('details'); // 'details' or 'otp'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpToken, setOtpToken] = useState('');
  const [verificationToken, setVerificationToken] = useState(''); // New State
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill from navigation state (Unified Flow)
  React.useEffect(() => {
    if (location.state?.phone && location.state?.verificationToken) {
      setFormData(prev => ({ ...prev, phoneNumber: location.state.phone }));
      setVerificationToken(location.state.verificationToken);
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validation helpers
  const validateName = (name) => {
    if (!name || !name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) return 'Name can only contain letters and spaces';
    return null;
  };

  const validateEmail = (email) => {
    if (!email) return null; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  };

  const validatePhone = (phone) => {
    if (!phone) return 'Phone number is required';
    if (phone.length !== 10) return 'Phone number must be exactly 10 digits';
    if (!/^[6-9]\d{9}$/.test(phone)) return 'Please enter a valid Indian phone number';
    return null;
  };

  const validateForm = () => {
    const errors = [];
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phoneNumber);

    if (nameError) errors.push(nameError);
    if (emailError) errors.push(emailError);
    if (phoneError) errors.push(phoneError);

    return errors;
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();

    // Run all validations
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(err => toast.error(err));
      return;
    }

    setIsLoading(true);

    // If we have verification token, register directly (SKIP OTP)
    if (verificationToken) {
      try {
        const response = await userAuthService.register({
          name: formData.name,
          email: formData.email || null,
          verificationToken // Use token instead of OTP
        });
        if (response.success) {
          // Register FCM
          try {
            const { registerFCMToken } = await import('../../../services/pushNotificationService');
            await registerFCMToken('user', true);
          } catch (e) { console.error(e); }
          toast.success('Account created successfully!');
          navigate('/user');
        } else {
          toast.error(response.message || 'Registration failed');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Registration failed');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Standard Flow (Send OTP)
    try {
      const response = await userAuthService.sendOTP(formData.phoneNumber, formData.email || null);
      if (response.success) {
        setOtpToken(response.token);
        setIsLoading(false);
        setStep('otp');
        toast.success('OTP sent to your phone number');
      } else {
        setIsLoading(false);
        toast.error(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    }
  };

  // ... handleOtpChange ... handleOtpKeyDown ... handleOtpSubmit (unchanged for fallback)
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }
    if (!otpToken) {
      toast.error('Please request OTP first');
      return;
    }
    setIsLoading(true);
    try {
      const response = await userAuthService.register({
        name: formData.name,
        email: formData.email || null,
        phone: formData.phoneNumber,
        otp: otpValue,
        token: otpToken
      });
      if (response.success) {
        setIsLoading(false);
        try {
          const { registerFCMToken } = await import('../../../services/pushNotificationService');
          await registerFCMToken('user', true);
        } catch (fcmError) {
          console.error('FCM Registration failed on signup:', fcmError);
        }

        toast.success('Account created successfully!');
        navigate('/user');
      } else {
        setIsLoading(false);
        toast.error(response.message || 'Registration failed');
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Section with Teal Gradient */}
      <div
        className="relative h-64 overflow-hidden"
        style={{
          background: themeColors.headerGradient
        }}
      >
        {/* Abstract Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="none">
            <path
              d="M0,200 Q100,100 200,200 T400,200 L400,0 L0,0 Z"
              fill="white"
              opacity="0.3"
            />
            <path
              d="M0,300 Q150,150 300,300 T400,300 L400,400 L0,400 Z"
              fill="white"
              opacity="0.2"
            />
            <path
              d="M0,100 Q50,50 100,100 T200,100 T300,100 T400,100 L400,0 L0,0 Z"
              fill="white"
              opacity="0.25"
            />
          </svg>
        </div>
      </div>

      {/* Bottom Section with White Background */}
      <div className="relative -mt-20 bg-white rounded-t-3xl min-h-[calc(100vh-16rem)] px-6 pt-8 pb-6">
        {step === 'details' ? (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h1>
            <p className="text-gray-600 mb-8">Create your account to get started</p>

            <form onSubmit={handleDetailsSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FiUser className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="w-full pl-12 pr-4 py-4 border-b-2 border-gray-300 focus:outline-none text-gray-900 placeholder-gray-400"
                    style={{ borderBottomColor: 'transparent' }}
                    onFocus={(e) => e.target.style.borderBottomColor = themeColors.button}
                    onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FiMail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="demo@email.com"
                    className="w-full pl-12 pr-4 py-4 border-b-2 border-gray-300 focus:outline-none text-gray-900 placeholder-gray-400"
                    style={{ borderBottomColor: 'transparent' }}
                    onFocus={(e) => e.target.style.borderBottomColor = themeColors.button}
                    onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FiPhone className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange({
                      target: {
                        name: 'phoneNumber',
                        value: e.target.value.replace(/\D/g, '')
                      }
                    })}
                    placeholder="Enter your phone number"
                    className="w-full pl-12 pr-4 py-4 border-b-2 border-gray-300 focus:outline-none text-gray-900 placeholder-gray-400"
                    style={{ borderBottomColor: 'transparent' }}
                    onFocus={(e) => e.target.style.borderBottomColor = themeColors.button}
                    onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !formData.name.trim() || !formData.phoneNumber || formData.phoneNumber.length < 10}
                className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: themeColors.button,
                  boxShadow: `0 4px 12px ${themeColors.brand.teal}4D`
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 6px 16px ${themeColors.brand.teal}66`;
                    e.currentTarget.style.backgroundColor = themeColors.brand.teal;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 12px ${themeColors.brand.teal}4D`;
                  e.currentTarget.style.backgroundColor = themeColors.button;
                }}
              >
                {isLoading ? (verificationToken ? 'Registering...' : 'Sending OTP...') : (verificationToken ? 'Register' : 'Send OTP')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an Account?{' '}
                <Link to="/user/login" className="font-semibold" style={{ color: themeColors.button }}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setStep('details')}
              className="mb-4 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Enter OTP</h1>
            <p className="text-gray-600 mb-2">
              We've sent a 6-digit OTP to {formData.phoneNumber}
            </p>
            <button
              type="button"
              onClick={async () => {
                try {
                  const response = await userAuthService.sendOTP(formData.phoneNumber, formData.email || null);
                  if (response.success) {
                    setOtpToken(response.token);
                    toast.success('OTP resent!');
                  } else {
                    toast.error(response.message || 'Failed to resend OTP');
                  }
                } catch (error) {
                  toast.error(error.response?.data?.message || 'Failed to resend OTP');
                }
              }}
              className="text-sm mb-8 font-semibold"
              style={{ color: themeColors.button }}
            >
              Resend OTP
            </button>

            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Enter OTP
                </label>
                <div className="flex gap-3 justify-center">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none text-gray-900"
                      style={{ borderColor: 'rgb(209, 213, 219)' }}
                      onFocus={(e) => e.target.style.borderColor = themeColors.button}
                      onBlur={(e) => e.target.style.borderColor = 'rgb(209, 213, 219)'}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.join('').length !== 6}
                className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: themeColors.button,
                  boxShadow: `0 4px 12px ${themeColors.brand.teal}4D`
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 6px 16px ${themeColors.brand.teal}66`;
                    e.currentTarget.style.backgroundColor = themeColors.brand.teal;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 12px ${themeColors.brand.teal}4D`;
                  e.currentTarget.style.backgroundColor = themeColors.button;
                }}
              >
                {isLoading ? 'Verifying...' : 'Verify & Sign Up'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;

