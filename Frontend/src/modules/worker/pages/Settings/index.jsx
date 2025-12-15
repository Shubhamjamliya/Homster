import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiVolume2, FiGlobe, FiLogOut } from 'react-icons/fi';
import { workerTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: true,
    soundAlerts: true,
    language: 'en',
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
    const loadSettings = () => {
      try {
        const savedSettings = JSON.parse(localStorage.getItem('workerSettings') || '{}');
        if (Object.keys(savedSettings).length > 0) {
          setSettings(prev => ({ ...prev, ...savedSettings }));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  const handleToggle = (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    localStorage.setItem('workerSettings', JSON.stringify(updated));
  };

  const handleLanguageChange = (lang) => {
    const updated = { ...settings, language: lang };
    setSettings(updated);
    localStorage.setItem('workerSettings', JSON.stringify(updated));
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('workerProfile');
      localStorage.removeItem('workerSettings');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
      <Header title="Settings" />

      <main className="px-4 py-6">
        {/* Notification Settings */}
        <div
          className="bg-white rounded-xl p-4 mb-6 shadow-md"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h3 className="font-bold text-gray-800 mb-4">Notifications</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiBell className="w-5 h-5" style={{ color: themeColors.icon }} />
                <span className="text-gray-800">Push Notifications</span>
              </div>
              <button
                onClick={() => handleToggle('notifications')}
                className={`w-12 h-6 rounded-full transition-all ${
                  settings.notifications ? '' : 'bg-gray-300'
                }`}
                style={
                  settings.notifications
                    ? {
                        background: themeColors.button,
                      }
                    : {}
                }
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-all ${
                    settings.notifications ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                  style={{
                    marginTop: '2px',
                  }}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiVolume2 className="w-5 h-5" style={{ color: themeColors.icon }} />
                <span className="text-gray-800">Sound Alerts</span>
              </div>
              <button
                onClick={() => handleToggle('soundAlerts')}
                className={`w-12 h-6 rounded-full transition-all ${
                  settings.soundAlerts ? '' : 'bg-gray-300'
                }`}
                style={
                  settings.soundAlerts
                    ? {
                        background: themeColors.button,
                      }
                    : {}
                }
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-all ${
                    settings.soundAlerts ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                  style={{
                    marginTop: '2px',
                  }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div
          className="bg-white rounded-xl p-4 mb-6 shadow-md"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <FiGlobe className="w-5 h-5" style={{ color: themeColors.icon }} />
            <h3 className="font-bold text-gray-800">Language</h3>
          </div>
          
          <div className="space-y-2">
            {[
              { code: 'en', name: 'English' },
              { code: 'hi', name: 'हिंदी' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full py-3 px-4 rounded-lg text-left transition-all ${
                  settings.language === lang.code
                    ? 'text-white'
                    : 'bg-gray-50 text-gray-700'
                }`}
                style={
                  settings.language === lang.code
                    ? {
                        background: themeColors.button,
                        boxShadow: `0 2px 8px ${themeColors.button}40`,
                      }
                    : {}
                }
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-white rounded-xl p-4 flex items-center justify-center gap-3 shadow-md transition-all active:scale-95"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <FiLogOut className="w-5 h-5 text-red-500" />
          <span className="font-semibold text-red-500">Logout</span>
        </button>
      </main>

      <BottomNav />
    </div>
  );
};

export default Settings;

