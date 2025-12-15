import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiUserCheck, FiRefreshCw, FiGrid } from 'react-icons/fi';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    workerAutoAssignment: true, // Default to automatic
  });

  useEffect(() => {
    const loadSettings = () => {
      try {
        const adminSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
        if (Object.keys(adminSettings).length > 0) {
          setSettings(prev => ({ ...prev, ...adminSettings }));
        }
      } catch (error) {
        console.error('Error loading admin settings:', error);
      }
    };

    loadSettings();
  }, []);

  const handleToggle = (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    localStorage.setItem('adminSettings', JSON.stringify(updated));
    window.dispatchEvent(new Event('adminSettingsUpdated'));
  };

  // Load service mode
  const [serviceMode, setServiceMode] = useState('multi');
  useEffect(() => {
    const config = JSON.parse(localStorage.getItem('adminServiceConfig') || '{}');
    setServiceMode(config.mode || 'multi');
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="lg:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage system settings</p>
      </div>

      {/* Worker Assignment Settings */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <FiSettings className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-bold text-gray-800">Worker Assignment Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              {settings.workerAutoAssignment ? (
                <FiRefreshCw className="w-6 h-6 text-green-600" />
              ) : (
                <FiUserCheck className="w-6 h-6 text-blue-600" />
              )}
              <div>
                <p className="font-semibold text-gray-800">Assignment Mode</p>
                <p className="text-sm text-gray-600">
                  {settings.workerAutoAssignment
                    ? 'Automatic: System will auto-assign next worker when one rejects'
                    : 'Manual: Vendor must manually assign new worker when one rejects'}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('workerAutoAssignment')}
              className={`w-14 h-7 rounded-full transition-all ${
                settings.workerAutoAssignment ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-all ${
                  settings.workerAutoAssignment ? 'translate-x-7' : 'translate-x-0.5'
                }`}
                style={{
                  marginTop: '2px',
                }}
              />
            </button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Current Mode:</strong>{' '}
              {settings.workerAutoAssignment ? (
                <>
                  <span className="font-semibold">Automatic Assignment</span>
                  <br />
                  When a worker rejects a job, the system will automatically assign it to the next available worker.
                </>
              ) : (
                <>
                  <span className="font-semibold">Manual Assignment</span>
                  <br />
                  When a worker rejects a job, vendors will need to manually assign a new worker from the booking details page.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Service Configuration */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <FiGrid className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-bold text-gray-800">Service Configuration</h2>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-800 mb-2">Current Mode</p>
            <p className="text-sm text-gray-600">
              {serviceMode === 'single' 
                ? 'Single Service Mode: Only one service category is allowed'
                : 'Multi Service Mode: Multiple service categories are allowed'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              To change service mode, go to <strong>Service Categories</strong> page.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminSettings;

