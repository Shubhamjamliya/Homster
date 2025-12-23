import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiEdit2, FiMapPin, FiPhone, FiMail, FiBriefcase, FiStar, FiArrowRight, FiFileText, FiSettings, FiChevronRight, FiCreditCard, FiTarget, FiLogOut } from 'react-icons/fi';
import { FaWallet } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { vendorTheme as themeColors } from '../../../../theme';
import { vendorAuthService } from '../../../../services/authService';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';

const Profile = () => {
  const navigate = useNavigate();

  // Helper function to convert hex to rgba
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const bgStyle = themeColors.backgroundGradient;

    if (html) html.style.background = bgStyle;
    if (body) body.style.background = bgStyle;
    if (root) root.style.background = bgStyle;

    return () => {
      if (html) html.style.background = '';
      if (body) body.style.background = '';
      if (root) root.style.background = '';
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await vendorAuthService.getProfile();
        if (response.success) {
          const vendorData = response.vendor;
          // Format address
          const addressString = vendorData.address
            ? `${vendorData.address.addressLine1 || ''} ${vendorData.address.addressLine2 || ''} ${vendorData.address.city || ''} ${vendorData.address.state || ''} ${vendorData.address.pincode || ''}`.trim() || 'Not set'
            : 'Not set';

          setProfile({
            name: vendorData.name || 'Vendor Name',
            businessName: vendorData.businessName || null,
            phone: vendorData.phone || '',
            email: vendorData.email || '',
            address: addressString,
            rating: vendorData.rating || 0,
            totalJobs: vendorData.totalJobs || 0,
            completionRate: vendorData.completionRate || 0,
            serviceCategory: vendorData.service || '',
            skills: [],
            photo: vendorData.profilePhoto || null,
            approvalStatus: vendorData.approvalStatus,
            isPhoneVerified: vendorData.isPhoneVerified || false,
            isEmailVerified: vendorData.isEmailVerified || false
          });
          localStorage.setItem('vendorData', JSON.stringify(vendorData));
        } else {
          setError(response.message || 'Failed to fetch profile');
          toast.error(response.message || 'Failed to fetch profile');
          // Fallback to local storage if API fails
          const localVendorData = JSON.parse(localStorage.getItem('vendorData') || '{}');
          if (localVendorData && Object.keys(localVendorData).length > 0) {
            setProfile({
              name: localVendorData.name || 'Vendor Name',
              businessName: localVendorData.businessName || null,
              phone: localVendorData.phone || '',
              email: localVendorData.email || '',
              address: 'Not set',
              rating: 0,
              totalJobs: 0,
              completionRate: 0,
              serviceCategory: localVendorData.service || '',
              skills: [],
              photo: localVendorData.profilePhoto || null
            });
            toast.info('Loaded profile from local storage (API failed)');
          }
        }
      } catch (err) {
        console.error('Error fetching vendor profile:', err);
        setError(err.response?.data?.message || 'Failed to fetch profile');
        toast.error(err.response?.data?.message || 'Failed to fetch profile');
        // Fallback to local storage if API fails
        const localVendorData = JSON.parse(localStorage.getItem('vendorData') || '{}');
        if (localVendorData && Object.keys(localVendorData).length > 0) {
          setProfile({
            name: localVendorData.name || 'Vendor Name',
            businessName: localVendorData.businessName || null,
            phone: localVendorData.phone || '',
            email: localVendorData.email || '',
            address: 'Not set',
            rating: 0,
            totalJobs: 0,
            completionRate: 0,
            serviceCategory: localVendorData.service || '',
            skills: [],
            photo: localVendorData.profilePhoto || null
          });
          toast.info('Loaded profile from local storage (API failed)');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: themeColors.backgroundGradient }}>
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.button }}></div>
          <p className="text-gray-600 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: themeColors.backgroundGradient }}>
        <div className="text-center p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error loading profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:opacity-90"
            style={{ backgroundColor: themeColors.button }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
      <Header title="Profile" />

      <main className="px-4 pt-4 pb-6">
        {/* Profile Header Card with Phone & Email */}
        <div
          className="rounded-2xl p-5 mb-4 shadow-xl relative overflow-hidden"
          style={{
            background: themeColors.button,
            border: `2px solid ${themeColors.button}`,
            boxShadow: `0 8px 24px ${hexToRgba(themeColors.button, 0.3)}, 0 4px 12px ${hexToRgba(themeColors.button, 0.2)}`,
          }}
        >
          {/* Decorative Patterns */}
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
            style={{
              background: `radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)`,
              transform: 'translate(30px, -30px)',
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-8"
            style={{
              background: `radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)`,
              transform: 'translate(-20px, 20px)',
            }}
          />

          <div className="relative z-10">
            <div className="flex items-start gap-4">
              {/* Profile Photo - Circle with Rating Below */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className="w-18 h-18 rounded-full flex items-center justify-center overflow-hidden mb-2"
                  style={{
                    background: 'rgba(255, 255, 255, 0.35)',
                    backdropFilter: 'blur(15px)',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25), inset 0 2px 6px rgba(255, 255, 255, 0.5)',
                    border: '3.5px solid rgba(255, 255, 255, 0.6)',
                    width: '72px',
                    height: '72px',
                  }}
                >
                  {profile.photo ? (
                    <img
                      src={profile.photo}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiUser className="w-9 h-9 text-white" />
                  )}
                </div>
                {/* Star Rating Below Photo */}
                {profile.rating > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/25 backdrop-blur-sm">
                    <FiStar className="w-3 h-3 text-yellow-300" style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))' }} />
                    <span className="text-xs font-bold text-white">{profile.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Name and Info */}
              <div className="flex-1 min-w-0 flex flex-col">
                <h2 className="text-xl font-bold text-white mb-1 break-words" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{profile.name}</h2>
                <p className="text-white text-sm opacity-95 mb-2.5 font-medium break-words" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{profile.businessName}</p>

                {/* Phone and Email */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-white/15 backdrop-blur-sm flex-shrink-0">
                      <FiPhone className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs text-white font-semibold break-words" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{profile.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-white/15 backdrop-blur-sm flex-shrink-0">
                      <FiMail className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs text-white font-semibold break-words" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{profile.email}</span>
                  </div>
                </div>
              </div>

              {/* Navigate Button */}
              <button
                onClick={() => navigate('/vendor/profile/details')}
                className="p-3.5 rounded-xl flex-shrink-0 transition-all duration-300 active:scale-95 mt-1"
                style={{
                  background: 'rgba(255, 255, 255, 0.28)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                  border: '1.5px solid rgba(255, 255, 255, 0.35)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.12) rotate(5deg)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.38)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.28)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)';
                }}
              >
                <FiArrowRight className="w-5 h-5 text-white" style={{ fontWeight: 'bold' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Three Cards Section - Horizontal */}
        <div className="px-4 mb-5">
          <div className="grid grid-cols-3 gap-3">
            {/* Active Jobs */}
            <button
              onClick={() => navigate('/vendor/jobs')}
              className="flex flex-col items-center justify-center p-4 rounded-2xl active:scale-95 transition-all duration-300 relative overflow-hidden bg-white"
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.05)',
                border: '1.5px solid rgba(0, 166, 166, 0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 166, 166, 0.15), 0 3px 8px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = hexToRgba(themeColors.button, 0.25);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.borderColor = hexToRgba(themeColors.button, 0.15);
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                style={{
                  backgroundColor: hexToRgba(themeColors.button, 0.12),
                  boxShadow: `0 2px 8px ${hexToRgba(themeColors.button, 0.2)}`,
                }}
              >
                <FiBriefcase className="w-5 h-5" style={{ color: themeColors.button }} />
              </div>
              <span className="text-[11px] font-bold text-gray-800 text-center leading-tight">
                Active Jobs
              </span>
            </button>

            {/* Wallet */}
            <button
              onClick={() => navigate('/vendor/wallet')}
              className="flex flex-col items-center justify-center p-4 rounded-2xl active:scale-95 transition-all duration-300 relative overflow-hidden bg-white"
              style={{
                boxShadow: '0 4px 12px rgba(0, 166, 166, 0.08), 0 2px 6px rgba(0, 0, 0, 0.05)',
                border: '1.5px solid rgba(0, 166, 166, 0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 166, 166, 0.15), 0 3px 8px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = hexToRgba(themeColors.button, 0.25);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.borderColor = hexToRgba(themeColors.button, 0.15);
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                style={{
                  backgroundColor: hexToRgba(themeColors.button, 0.12),
                  boxShadow: `0 2px 8px ${hexToRgba(themeColors.button, 0.2)}`,
                }}
              >
                <FaWallet className="w-5 h-5" style={{ color: themeColors.button }} />
              </div>
              <span className="text-[11px] font-bold text-gray-800 text-center leading-tight">
                Wallet
              </span>
            </button>

            {/* Workers */}
            <button
              onClick={() => navigate('/vendor/workers')}
              className="flex flex-col items-center justify-center p-4 rounded-2xl active:scale-95 transition-all duration-300 relative overflow-hidden bg-white"
              style={{
                boxShadow: '0 4px 12px rgba(0, 166, 166, 0.08), 0 2px 6px rgba(0, 0, 0, 0.05)',
                border: '1.5px solid rgba(0, 166, 166, 0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 166, 166, 0.15), 0 3px 8px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = hexToRgba(themeColors.button, 0.25);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.borderColor = hexToRgba(themeColors.button, 0.15);
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                style={{
                  backgroundColor: hexToRgba(themeColors.button, 0.12),
                  boxShadow: `0 2px 8px ${hexToRgba(themeColors.button, 0.2)}`,
                }}
              >
                <FiUser className="w-5 h-5" style={{ color: themeColors.button }} />
              </div>
              <span className="text-[11px] font-bold text-gray-800 text-center leading-tight">
                Workers
              </span>
            </button>
          </div>
        </div>

        {/* Menu List Section */}
        <div className="px-4 mb-4">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
              boxShadow: '0 6px 20px rgba(41, 173, 129, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
              border: '1.5px solid rgba(41, 173, 129, 0.12)',
            }}
          >
            {/* MY Plans */}
            <button
              onClick={() => navigate('/vendor/my-plans')}
              className="w-full flex items-center justify-between p-4 transition-all duration-300 border-b border-gray-100 active:scale-[0.98]"
              style={{
                borderBottom: '1px solid rgba(229, 231, 235, 0.8)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 166, 166, 0.03) 0%, rgba(0, 166, 166, 0.01) 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                  style={{
                    backgroundColor: hexToRgba(themeColors.button, 0.12),
                    boxShadow: `0 2px 6px ${hexToRgba(themeColors.button, 0.15)}`,
                  }}
                >
                  <FiFileText className="w-5 h-5" style={{ color: themeColors.button }} />
                </div>
                <span className="text-sm font-bold text-gray-800">MY Plans</span>
              </div>
              <FiChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
            </button>

            {/* Wallet */}
            <button
              onClick={() => navigate('/vendor/wallet')}
              className="w-full flex items-center justify-between p-4 transition-all duration-300 border-b border-gray-100 active:scale-[0.98]"
              style={{
                borderBottom: '1px solid rgba(229, 231, 235, 0.8)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 166, 166, 0.03) 0%, rgba(0, 166, 166, 0.01) 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                  style={{
                    backgroundColor: hexToRgba(themeColors.button, 0.12),
                    boxShadow: `0 2px 6px ${hexToRgba(themeColors.button, 0.15)}`,
                  }}
                >
                  <FaWallet className="w-5 h-5" style={{ color: themeColors.button }} />
                </div>
                <span className="text-sm font-bold text-gray-800">Wallet</span>
              </div>
              <FiChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
            </button>

            {/* Plus Membership */}
            <button
              onClick={() => navigate('/vendor/plus-membership')}
              className="w-full flex items-center justify-between p-4 transition-all duration-300 border-b border-gray-100 active:scale-[0.98]"
              style={{
                borderBottom: '1px solid rgba(229, 231, 235, 0.8)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 166, 166, 0.03) 0%, rgba(0, 166, 166, 0.01) 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                  style={{
                    backgroundColor: hexToRgba(themeColors.button, 0.12),
                    boxShadow: `0 2px 6px ${hexToRgba(themeColors.button, 0.15)}`,
                  }}
                >
                  <FiTarget className="w-5 h-5" style={{ color: themeColors.button }} />
                </div>
                <span className="text-sm font-bold text-gray-800">Plus Membership</span>
              </div>
              <FiChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
            </button>

            {/* My Ratings */}
            <button
              onClick={() => navigate('/vendor/my-ratings')}
              className="w-full flex items-center justify-between p-4 transition-all duration-300 border-b border-gray-100 active:scale-[0.98]"
              style={{
                borderBottom: '1px solid rgba(229, 231, 235, 0.8)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 166, 166, 0.03) 0%, rgba(0, 166, 166, 0.01) 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                  style={{
                    backgroundColor: hexToRgba(themeColors.button, 0.12),
                    boxShadow: `0 2px 6px ${hexToRgba(themeColors.button, 0.15)}`,
                  }}
                >
                  <FiStar className="w-5 h-5" style={{ color: themeColors.button }} />
                </div>
                <span className="text-sm font-bold text-gray-800">My Ratings</span>
              </div>
              <FiChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
            </button>

            {/* Manage Payment Methods */}
            <button
              onClick={() => navigate('/vendor/manage-payment-methods')}
              className="w-full flex items-center justify-between p-4 transition-all duration-300 border-b border-gray-100 active:scale-[0.98]"
              style={{
                borderBottom: '1px solid rgba(229, 231, 235, 0.8)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 166, 166, 0.03) 0%, rgba(0, 166, 166, 0.01) 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                  style={{
                    backgroundColor: hexToRgba(themeColors.button, 0.12),
                    boxShadow: `0 2px 6px ${hexToRgba(themeColors.button, 0.15)}`,
                  }}
                >
                  <FiCreditCard className="w-5 h-5" style={{ color: themeColors.button }} />
                </div>
                <span className="text-sm font-bold text-gray-800">Manage Payment Methods</span>
              </div>
              <FiChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
            </button>

            {/* Manage Address */}
            <button
              onClick={() => navigate('/vendor/address-management')}
              className="w-full flex items-center justify-between p-4 transition-all duration-300 border-b border-gray-100 active:scale-[0.98]"
              style={{
                borderBottom: '1px solid rgba(229, 231, 235, 0.8)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 166, 166, 0.03) 0%, rgba(0, 166, 166, 0.01) 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                  style={{
                    backgroundColor: hexToRgba(themeColors.button, 0.12),
                    boxShadow: `0 2px 6px ${hexToRgba(themeColors.button, 0.15)}`,
                  }}
                >
                  <FiMapPin className="w-5 h-5" style={{ color: themeColors.button }} />
                </div>
                <span className="text-sm font-bold text-gray-800">Manage Address</span>
              </div>
              <FiChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
            </button>

            {/* Settings */}
            <button
              onClick={() => navigate('/vendor/settings')}
              className="w-full flex items-center justify-between p-4 transition-all duration-300 border-b border-gray-100 active:scale-[0.98]"
              style={{
                borderBottom: '1px solid rgba(229, 231, 235, 0.8)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 166, 166, 0.03) 0%, rgba(0, 166, 166, 0.01) 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                  style={{
                    backgroundColor: hexToRgba(themeColors.button, 0.12),
                    boxShadow: `0 2px 6px ${hexToRgba(themeColors.button, 0.15)}`,
                  }}
                >
                  <FiSettings className="w-5 h-5" style={{ color: themeColors.button }} />
                </div>
                <span className="text-sm font-bold text-gray-800">Settings</span>
              </div>
              <FiChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
            </button>

            {/* About Appzeto */}
            <button
              onClick={() => navigate('/vendor/about-appzeto')}
              className="w-full flex items-center justify-between p-4 transition-all duration-300 border-b border-gray-100 active:scale-[0.98]"
              style={{
                borderBottom: '1px solid rgba(229, 231, 235, 0.8)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 166, 166, 0.03) 0%, rgba(0, 166, 166, 0.01) 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                  style={{
                    backgroundColor: hexToRgba(themeColors.button, 0.15),
                    border: `2px solid ${hexToRgba(themeColors.button, 0.25)}`,
                    boxShadow: `0 2px 6px ${hexToRgba(themeColors.button, 0.15)}`,
                  }}
                >
                  <span className="text-xs font-bold" style={{ color: themeColors.button }}>A</span>
                </div>
                <span className="text-sm font-bold text-gray-800">About Appzeto</span>
              </div>
              <FiChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <div className="px-4 mt-4 mb-3">
          <button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              try {
                await vendorAuthService.logout();
                toast.success('Logged out successfully');
                navigate('/vendor/login');
              } catch (error) {
                // Even if API call fails, clear local storage
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('vendorData');
                toast.success('Logged out successfully');
                navigate('/vendor/login');
              }
            }}
            className="w-full font-semibold py-3 rounded-xl active:scale-98 transition-all text-white flex items-center justify-center gap-2"
            style={{
              backgroundColor: '#2874F0',
              boxShadow: '0 4px 12px rgba(40, 116, 240, 0.3)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#1e5fd4';
              e.target.style.boxShadow = '0 6px 16px rgba(40, 116, 240, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#2874F0';
              e.target.style.boxShadow = '0 4px 12px rgba(40, 116, 240, 0.3)';
            }}
          >
            <FiLogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;

