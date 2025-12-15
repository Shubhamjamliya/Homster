import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiEdit2, FiMapPin, FiPhone, FiMail, FiBriefcase, FiStar, FiChevronRight, FiTag } from 'react-icons/fi';
import { workerTheme as themeColors, vendorTheme } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: 'Worker Name',
    phone: '+91 9876543210',
    email: 'worker@example.com',
    address: 'Indore, Madhya Pradesh',
    rating: 4.7,
    totalJobs: 0,
    completedJobs: 0,
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
        const workerProfile = JSON.parse(localStorage.getItem('workerProfile') || '{}');
        if (Object.keys(workerProfile).length > 0) {
          // Handle migration from category to serviceCategory
          const updatedProfile = {
            ...workerProfile,
            serviceCategory: workerProfile.serviceCategory || workerProfile.category || '',
            skills: workerProfile.skills || []
          };
          setProfile(prev => ({ ...prev, ...updatedProfile }));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
    window.addEventListener('workerProfileUpdated', loadProfile);

    return () => {
      window.removeEventListener('workerProfileUpdated', loadProfile);
    };
  }, []);

  return (
    <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
      <Header title="Profile" />

      <main className="px-4 pt-4 pb-6">
        {/* Profile Header Card */}
        <div
          className="rounded-2xl p-5 mb-4 shadow-xl relative overflow-hidden"
          style={{
            background: vendorTheme.button,
            border: `2px solid ${vendorTheme.button}`,
          }}
        >
          {/* Decorative Pattern */}
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
            style={{
              background: `radial-gradient(circle, ${vendorTheme.button} 0%, transparent 70%)`,
              transform: 'translate(30px, -30px)',
            }}
          />

          <div className="relative z-10">
            <div className="flex items-start gap-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  border: '3px solid white',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    alt={profile.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <FiUser className="w-10 h-10 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-0.5">{profile.name}</h2>
                {(profile.serviceCategory || profile.category) && (
                  <p className="text-sm text-white font-medium opacity-90 mb-2">{profile.serviceCategory || profile.category}</p>
                )}
                {!profile.serviceCategory && !profile.category && (
                  <div className="mb-2"></div>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                    <FiStar className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                    <span className="text-white text-sm font-bold">{profile.rating}</span>
                  </div>
                  <span className="text-white/60 text-xs">•</span>
                  <p className="text-sm text-white opacity-90 font-medium">{profile.completedJobs} Jobs Done</p>
                </div>
              </div>
              {/* Edit Profile Button on Card */}
              <button
                onClick={() => navigate('/worker/profile/edit')}
                className="p-2.5 rounded-lg flex-shrink-0 transition-all active:scale-95"
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  border: '1.5px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <FiEdit2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div
          className="bg-white rounded-xl p-4 mb-4 shadow-md"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h3 className="font-bold text-gray-800 mb-4">Personal Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <FiPhone className="w-5 h-5" style={{ color: themeColors.icon }} />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-sm font-semibold text-gray-800">{profile.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiMail className="w-5 h-5" style={{ color: themeColors.icon }} />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-sm font-semibold text-gray-800">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiMapPin className="w-5 h-5" style={{ color: themeColors.icon }} />
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="text-sm font-semibold text-gray-800">{profile.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Service Category & Skills */}
        <div
          className="bg-white rounded-xl p-4 mb-4 shadow-md"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h3 className="font-bold text-gray-800 mb-4">Service Information</h3>
          <div className="space-y-3">
            {/* Service Category */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: `${themeColors.icon}15` }}>
                <FiTag className="w-5 h-5" style={{ color: themeColors.icon }} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">Service Category</p>
                <p className="text-sm font-semibold text-gray-800">{profile.serviceCategory || profile.category || 'Not set'}</p>
              </div>
            </div>

            {/* Skills */}
            <div className="flex items-start gap-3">
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
                          boxShadow: `0 2px 6px ${themeColors.button}40`,
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
        </div>

        {/* Stats */}
        <div
          className="bg-white rounded-xl p-4 mb-4 shadow-md"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h3 className="font-bold text-gray-800 mb-3">Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-800">{profile.totalJobs}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-800">{profile.completedJobs}</p>
            </div>
          </div>
        </div>

        {/* Edit Profile Button */}
        <button
          onClick={() => navigate('/worker/profile/edit')}
          className="w-full bg-white rounded-xl p-4 flex items-center justify-between shadow-md transition-all active:scale-95 mb-4"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="flex items-center gap-3">
            <FiEdit2 className="w-5 h-5" style={{ color: themeColors.button }} />
            <span className="font-semibold text-gray-800">Edit Profile</span>
          </div>
          <FiChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        {/* Settings Button */}
        <button
          onClick={() => navigate('/worker/settings')}
          className="w-full bg-white rounded-xl p-4 flex items-center justify-between shadow-md transition-all active:scale-95"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="flex items-center gap-3">
            <FiEdit2 className="w-5 h-5" style={{ color: themeColors.button }} />
            <span className="font-semibold text-gray-800">Settings</span>
          </div>
          <FiChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;

