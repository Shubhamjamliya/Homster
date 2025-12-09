import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const UpdateProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: 'Verified Customer',
    email: 'customer@example.com',
    phoneNumber: '+91 6261387233',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Save profile data (can be extended to save to localStorage or API)
    toast.success('Profile updated successfully!');
    navigate('/account');
  };

  const handleBack = () => {
    navigate('/account');
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 text-black" />
            </button>
            <h1 className="text-xl font-bold text-black">Update Profile</h1>
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        {/* Profile Form */}
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <div 
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: '#00a6a6' }}
              >
                <FiUser className="w-5 h-5" />
              </div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{
                  focusRingColor: '#00a6a6',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#00a6a6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 166, 166, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div 
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: '#00a6a6' }}
              >
                <FiMail className="w-5 h-5" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                onFocus={(e) => {
                  e.target.style.borderColor = '#00a6a6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 166, 166, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Enter your email address"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <div 
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: '#00a6a6' }}
              >
                <FiPhone className="w-5 h-5" />
              </div>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                onFocus={(e) => {
                  e.target.style.borderColor = '#00a6a6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 166, 166, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Enter your phone number"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6">
          <button
            onClick={handleSave}
            className="w-full text-white font-bold py-3.5 rounded-xl active:scale-98 transition-all shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #00a6a6 0%, #29ad81 100%)',
              boxShadow: '0 4px 12px rgba(0, 166, 166, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 6px 16px rgba(0, 166, 166, 0.5)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = '0 4px 12px rgba(0, 166, 166, 0.4)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Save Changes
          </button>
        </div>
      </main>
    </div>
  );
};

export default UpdateProfile;

