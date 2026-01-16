import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiFileText, FiUpload, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../theme';
import { sendOTP as sendVendorOTP, register } from '../services/authService';

const VendorSignup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState('details'); // 'details' or 'otp'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    aadhar: '',
    pan: '',
    service: '',
    documents: []
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpToken, setOtpToken] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [documentPreview, setDocumentPreview] = useState({});

  // Unified Flow: Pre-fill
  useEffect(() => {
    if (location.state?.phone && location.state?.verificationToken) {
      setFormData(prev => ({ ...prev, phoneNumber: location.state.phone }));
      setVerificationToken(location.state.verificationToken);
    }
  }, [location.state]);

  // Clear any existing vendor tokens on page load
  useEffect(() => {
    localStorage.removeItem('vendorAccessToken');
    localStorage.removeItem('vendorRefreshToken');
    localStorage.removeItem('vendorData');
  }, []);

  // Sample services - this should come from API
  const services = [
    'AC Service',
    'Electrician',
    'Plumber',
    'Carpenter',
    'Cleaning',
    'Salon',
    'Spa',
    'Massage',
    'Appliance Repair'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDocumentUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, WEBP, GIF) or PDF file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents.filter(d => d.type !== type), { type, file, url: reader.result }]
      }));
      setDocumentPreview(prev => ({
        ...prev,
        [type]: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeDocument = (type) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.type !== type)
    }));
    setDocumentPreview(prev => {
      const newPreview = { ...prev };
      delete newPreview[type];
      return newPreview;
    });
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    // Aadhar and PAN validations remain
    if (!formData.aadhar || formData.aadhar.length !== 12) {
      toast.error('Please enter a valid 12-digit Aadhar number');
      return;
    }
    if (!formData.pan || formData.pan.length !== 10) {
      toast.error('Please enter a valid 10-character PAN number');
      return;
    }
    // Service validation removed

    if (formData.documents.length < 2) {
      toast.error('Please upload both Aadhar and PAN documents');
      return;
    }

    setIsLoading(true);

    // Unified Flow: Direct Registration
    if (verificationToken) {
      try {
        const aadharDoc = formData.documents.find(d => d.type === 'aadhar')?.url || null;
        const panDoc = formData.documents.find(d => d.type === 'pan')?.url || null;
        const otherDocs = formData.documents.filter(d => d.type === 'other').map(d => d.url);

        const registerData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phoneNumber,
          aadhar: formData.aadhar,
          pan: formData.pan,
          service: [], // Default empty
          aadharDocument: aadharDoc,
          panDocument: panDoc,
          otherDocuments: otherDocs,
          verificationToken // Use token
        };

        const response = await register(registerData);

        if (response.success) {
          toast.success('Registration successful! Your account is pending admin approval.');
          navigate('/vendor/login');
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

    // Standard Flow
    try {
      const response = await sendVendorOTP(formData.phoneNumber);
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
      // Prepare document URLs (in production, upload to Cloudinary first)
      const aadharDoc = formData.documents.find(d => d.type === 'aadhar')?.url || null;
      const panDoc = formData.documents.find(d => d.type === 'pan')?.url || null;
      const otherDocs = formData.documents.filter(d => d.type === 'other').map(d => d.url);

      const registerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phoneNumber,
        aadhar: formData.aadhar,
        pan: formData.pan,
        service: formData.service,
        aadharDocument: aadharDoc,
        panDocument: panDoc,
        otherDocuments: otherDocs,
        otp: otpValue,
        token: otpToken
      };

      console.log('Sending register data:', registerData);

      const response = await register(registerData);

      if (response.success) {
        setIsLoading(false);
        toast.success('Registration successful! Your account is pending admin approval.');
        navigate('/vendor/login');
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
        {step === 'details' ? (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Registration</h1>
            <p className="text-gray-600 mb-8">Create your vendor account</p>

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
                  Email *
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
                    required
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Aadhar Number *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FiFileText className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="aadhar"
                    value={formData.aadhar}
                    onChange={(e) => handleInputChange({
                      target: {
                        name: 'aadhar',
                        value: e.target.value.replace(/\D/g, '').slice(0, 12)
                      }
                    })}
                    placeholder="Enter 12-digit Aadhar number"
                    className="w-full pl-12 pr-4 py-4 border-b-2 border-gray-300 focus:outline-none text-gray-900 placeholder-gray-400"
                    style={{ borderBottomColor: 'transparent' }}
                    onFocus={(e) => e.target.style.borderBottomColor = themeColors.button}
                    onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
                    maxLength={12}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  PAN Number *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FiFileText className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="pan"
                    value={formData.pan}
                    onChange={(e) => handleInputChange({
                      target: {
                        name: 'pan',
                        value: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)
                      }
                    })}
                    placeholder="Enter 10-character PAN number"
                    className="w-full pl-12 pr-4 py-4 border-b-2 border-gray-300 focus:outline-none text-gray-900 placeholder-gray-400"
                    style={{ borderBottomColor: 'transparent' }}
                    onFocus={(e) => e.target.style.borderBottomColor = themeColors.button}
                    onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              {/* Service Selection Removed */}

              {/* Document Upload Section */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Documents *
                </label>

                {/* Aadhar Document */}
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Aadhar Document</label>
                  {documentPreview.aadhar ? (
                    <div className="relative">
                      <img
                        src={documentPreview.aadhar}
                        alt="Aadhar"
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeDocument('aadhar')}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                      <div className="text-center">
                        <FiUpload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-600">Upload Aadhar</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleDocumentUpload(e, 'aadhar')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* PAN Document */}
                <div>
                  <label className="block text-xs text-gray-600 mb-2">PAN Document</label>
                  {documentPreview.pan ? (
                    <div className="relative">
                      <img
                        src={documentPreview.pan}
                        alt="PAN"
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeDocument('pan')}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                      <div className="text-center">
                        <FiUpload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-600">Upload PAN</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleDocumentUpload(e, 'pan')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Other Documents */}
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Other Documents (Optional)</label>
                  {documentPreview.other ? (
                    <div className="relative">
                      <img
                        src={documentPreview.other}
                        alt="Other"
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeDocument('other')}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                      <div className="text-center">
                        <FiUpload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-600">Upload Other Documents</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleDocumentUpload(e, 'other')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !formData.name.trim() || !formData.email.trim() || !formData.phoneNumber || formData.phoneNumber.length < 10 || !formData.aadhar || formData.aadhar.length !== 12 || !formData.pan || formData.pan.length !== 10 || formData.documents.length < 2}
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
                {isLoading ? (verificationToken ? 'Registering...' : 'Sending OTP...') : (verificationToken ? 'Register' : 'Send OTP')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an Account?{' '}
                <Link to="/vendor/login" className="font-semibold" style={{ color: themeColors.button }}>
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
                  const response = await sendVendorOTP(formData.phoneNumber);
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
                {isLoading ? 'Verifying...' : 'Verify & Sign Up'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorSignup;

