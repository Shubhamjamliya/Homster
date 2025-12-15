import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiEdit2, FiMapPin, FiPhone, FiMail, FiBriefcase, FiTag } from 'react-icons/fi';
import { vendorTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';

const ProfileDetails = () => {
  const navigate = useNavigate();

  // Helper function to convert hex to rgba
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const [profile, setProfile] = useState({
    name: 'Vendor Name',
    businessName: 'Business Name',
    phone: '+91 9876543210',
    email: 'vendor@example.com',
    address: 'Indore, Madhya Pradesh',
    serviceCategory: 'Electrician',
    skills: ['Fan Repair', 'AC', 'Lightings'],
  });

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
    const loadProfile = () => {
      try {
        const vendorProfile = JSON.parse(localStorage.getItem('vendorProfile') || '{}');
        if (Object.keys(vendorProfile).length > 0) {
          // If serviceCategory or skills are missing, set defaults
          const updatedProfile = {
            ...vendorProfile,
            serviceCategory: vendorProfile.serviceCategory || 'Electrician',
            skills: vendorProfile.skills || ['Fan Repair', 'AC', 'Lightings', 'House Wiring']
          };
          
          // Update localStorage if missing
          if (!vendorProfile.serviceCategory || !vendorProfile.skills || vendorProfile.skills.length === 0) {
            localStorage.setItem('vendorProfile', JSON.stringify(updatedProfile));
          }
          
          setProfile(prev => ({
            ...prev,
            ...updatedProfile
          }));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
    window.addEventListener('vendorProfileUpdated', loadProfile);

    return () => {
      window.removeEventListener('vendorProfileUpdated', loadProfile);
    };
  }, []);

  return (
    <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
      <Header title="Profile Details" />

      <main className="px-4 pt-4 pb-6">
        {/* Header with Edit Button */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-lg">Profile Information</h3>
          <button
            onClick={() => navigate('/vendor/profile/edit')}
            className="p-2 rounded-lg hover:scale-105 transition-all flex items-center gap-1.5"
            style={{
              background: `linear-gradient(135deg, ${themeColors.button} 0%, ${themeColors.icon} 100%)`,
              color: '#FFFFFF',
              boxShadow: `0 2px 8px ${hexToRgba(themeColors.button, 0.3)}`,
            }}
          >
            <FiEdit2 className="w-4 h-4" />
            <span className="text-sm font-semibold">Edit</span>
          </button>
        </div>

        {/* Profile Info - Compact List */}
        <div className="space-y-2.5 mb-6">
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-gray-100">
            <div className="p-2 rounded-lg" style={{ background: `${themeColors.icon}15` }}>
              <FiUser className="w-5 h-5" style={{ color: themeColors.icon }} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">Name</p>
              <p className="text-gray-900 font-semibold text-sm">{profile.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-gray-100">
            <div className="p-2 rounded-lg" style={{ background: `${themeColors.icon}15` }}>
              <FiBriefcase className="w-5 h-5" style={{ color: themeColors.icon }} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">Business Name</p>
              <p className="text-gray-900 font-semibold text-sm">{profile.businessName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-gray-100">
            <div className="p-2 rounded-lg" style={{ background: `${themeColors.icon}15` }}>
              <FiPhone className="w-5 h-5" style={{ color: themeColors.icon }} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">Phone</p>
              <p className="text-gray-900 font-semibold text-sm">{profile.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-gray-100">
            <div className="p-2 rounded-lg" style={{ background: `${themeColors.icon}15` }}>
              <FiMail className="w-5 h-5" style={{ color: themeColors.icon }} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">Email</p>
              <p className="text-gray-900 font-semibold text-sm">{profile.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-gray-100">
            <div className="p-2 rounded-lg" style={{ background: `${themeColors.icon}15` }}>
              <FiMapPin className="w-5 h-5" style={{ color: themeColors.icon }} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">Address</p>
              <p className="text-gray-900 font-semibold text-sm">{profile.address}</p>
            </div>
          </div>

          {/* Service Category */}
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-gray-100">
            <div className="p-2 rounded-lg" style={{ background: `${themeColors.icon}15` }}>
              <FiTag className="w-5 h-5" style={{ color: themeColors.icon }} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">Service Category</p>
              <p className="text-gray-900 font-semibold text-sm">{profile.serviceCategory || 'Not set'}</p>
            </div>
          </div>

          {/* Skills */}
          <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white border border-gray-100">
            <div className="p-2 rounded-lg mt-0.5" style={{ background: `${themeColors.button}15` }}>
              <FiTag className="w-5 h-5" style={{ color: themeColors.button }} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Skills</p>
              {profile.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${themeColors.button} 0%, ${themeColors.button}dd 100%)`,
                        color: '#FFFFFF',
                        boxShadow: `0 2px 6px ${hexToRgba(themeColors.button, 0.3)}`,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm font-medium">Not set</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default ProfileDetails;

