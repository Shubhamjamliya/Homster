import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiPhone } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../theme';
import { workerAuthService } from '../../../services/authService';

const WorkerLogin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpToken, setOtpToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  console.log('WorkerLogin Unified Component Loaded v2'); // Debug: Ensure latest code is running

  // Clear any existing worker tokens on page load
  useEffect(() => {
    localStorage.removeItem('workerAccessToken');
    localStorage.removeItem('workerRefreshToken');
    localStorage.removeItem('workerData');
  }, []);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    setIsLoading(true);
    try {
      const response = await workerAuthService.sendOTP(phoneNumber);
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
      // Unified Flow: verifyLogin
      const response = await workerAuthService.verifyLogin({
        phone: phoneNumber,
        otp: otpValue
      });

      if (response.success) {
        setIsLoading(false);

        if (response.isNewUser) {
          // New Worker -> Signup
          toast.success('Phone verified! Please complete registration.');
          navigate('/worker/signup', {
            state: { phone: phoneNumber, verificationToken: response.verificationToken }
          });
        } else {
          // Existing Worker -> Dashboard
          toast.success('Login successful!');
          navigate('/worker');
        }
      } else {
        setIsLoading(false);
        toast.error(response.message || 'Login failed');
      }
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error.response?.data?.message || 'Verification failed. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Section with Teal Gradient */}
      <div
        className="relative h-64 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #00a6a6 0%, #008a8a 50%, #006b6b 100%)'
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
        {step === 'phone' ? (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Worker Sign in</h1>
            <p className="text-gray-600 mb-8">Enter your phone number to continue</p>

            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FiPhone className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter your phone number"
                    className="w-full pl-12 pr-4 py-4 border-b-2 border-gray-300 focus:outline-none text-gray-900 placeholder-gray-400"
                    style={{ borderBottomColor: 'transparent' }}
                    onFocus={(e) => e.target.style.borderBottomColor = themeColors.button}
                    onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
                    maxLength={10}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !phoneNumber || phoneNumber.length < 10}
                className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: themeColors.button,
                  boxShadow: '0 4px 12px rgba(0, 166, 166, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 166, 166, 0.4)';
                    e.currentTarget.style.backgroundColor = '#008a8a';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 166, 166, 0.3)';
                  e.currentTarget.style.backgroundColor = themeColors.button;
                }}
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an Account?{' '}
                <Link to="/worker/signup" className="font-semibold" style={{ color: themeColors.button }}>
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setStep('phone')}
              className="mb-4 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Enter OTP</h1>
            <p className="text-gray-600 mb-2">
              We've sent a 6-digit OTP to {phoneNumber}
            </p>
            <button
              type="button"
              onClick={async () => {
                try {
                  const response = await workerAuthService.sendOTP(phoneNumber);
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
                  boxShadow: '0 4px 12px rgba(0, 166, 166, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 166, 166, 0.4)';
                    e.currentTarget.style.backgroundColor = '#008a8a';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 166, 166, 0.3)';
                  e.currentTarget.style.backgroundColor = themeColors.button;
                }}
              >
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerLogin;
