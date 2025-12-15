import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiUser, FiPhone, FiMail, FiMapPin, FiTag } from 'react-icons/fi';
import { workerTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';

const EditProfile = () => {
  const navigate = useNavigate();
  
  // Helper function to convert hex to rgba
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    serviceCategory: '',
    skills: [],
  });

  // Load service categories from admin config (dynamic)
  const [availableCategories, setAvailableCategories] = useState([]);
  const [skillsByCategory, setSkillsByCategory] = useState({});

  useEffect(() => {
    const loadServiceCategories = () => {
      try {
        const categories = JSON.parse(localStorage.getItem('serviceCategories') || '[]');
        const serviceConfig = JSON.parse(localStorage.getItem('adminServiceConfig') || '{}');
        
        // If single service mode, show only first category
        if (serviceConfig.mode === 'single' && categories.length > 0) {
          setAvailableCategories([categories[0].name]);
        } else {
          setAvailableCategories(categories.map(cat => cat.name));
        }

        // Build skills mapping from categories
        const skillsMap = {};
        categories.forEach(cat => {
          skillsMap[cat.name] = cat.skills || [];
        });
        setSkillsByCategory(skillsMap);
      } catch (error) {
        console.error('Error loading service categories:', error);
        // Fallback to default
        setAvailableCategories(['Electrician', 'Plumber', 'Salon']);
        setSkillsByCategory({
          'Electrician': ['Fan Repair', 'AC', 'Lightings'],
          'Plumber': ['Tap Repair', 'Pipe Installation'],
          'Salon': ['Haircut', 'Hair Color'],
        });
      }
    };

    loadServiceCategories();
    window.addEventListener('serviceCategoriesUpdated', loadServiceCategories);
    
    return () => {
      window.removeEventListener('serviceCategoriesUpdated', loadServiceCategories);
    };
  }, []);

  const [errors, setErrors] = useState({});

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
          setFormData({
            name: workerProfile.name || '',
            phone: workerProfile.phone || '',
            email: workerProfile.email || '',
            address: workerProfile.address || '',
            serviceCategory: workerProfile.serviceCategory || workerProfile.category || '',
            skills: workerProfile.skills || [],
          });
        } else {
          // Set default values if no profile exists
          setFormData({
            name: 'Worker Name',
            phone: '+91 9876543210',
            email: 'worker@example.com',
            address: 'Indore, Madhya Pradesh',
            serviceCategory: '',
            skills: [],
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      serviceCategory: category,
      skills: [], // Reset skills when category changes
    }));
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => {
      const currentSkills = prev.skills || [];
      if (currentSkills.includes(skill)) {
        return {
          ...prev,
          skills: currentSkills.filter(s => s !== skill),
        };
      } else {
        return {
          ...prev,
          skills: [...currentSkills, skill],
        };
      }
    });
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,13}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.serviceCategory.trim()) {
      newErrors.serviceCategory = 'Service category is required';
    }
    
    if (!formData.skills || formData.skills.length === 0) {
      newErrors.skills = 'At least one skill is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    try {
      // Load existing profile to preserve stats
      const existingProfile = JSON.parse(localStorage.getItem('workerProfile') || '{}');
      
      const updatedProfile = {
        ...existingProfile,
        ...formData,
        updatedAt: new Date().toISOString(),
      };
      
      localStorage.setItem('workerProfile', JSON.stringify(updatedProfile));
      window.dispatchEvent(new Event('workerProfileUpdated'));
      navigate('/worker/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
      <Header title="Edit Profile" />

      <main className="px-4 py-6">
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <div
                className="p-2 rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.icon}25 0%, ${themeColors.icon}15 100%)`,
                }}
              >
                <FiUser className="w-4 h-4" style={{ color: themeColors.icon }} />
              </div>
              <span>Name <span className="text-red-500">*</span></span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your name"
              className={`w-full px-4 py-3 bg-white rounded-xl border focus:outline-none focus:ring-2 ${
                errors.name ? 'border-red-500' : 'border-gray-200'
              }`}
              style={{ focusRingColor: themeColors.button }}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <div
                className="p-2 rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.icon}25 0%, ${themeColors.icon}15 100%)`,
                }}
              >
                <FiPhone className="w-4 h-4" style={{ color: themeColors.icon }} />
              </div>
              <span>Phone Number <span className="text-red-500">*</span></span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number"
              className={`w-full px-4 py-3 bg-white rounded-xl border focus:outline-none focus:ring-2 ${
                errors.phone ? 'border-red-500' : 'border-gray-200'
              }`}
              style={{ focusRingColor: themeColors.button }}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <div
                className="p-2 rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.icon}25 0%, ${themeColors.icon}15 100%)`,
                }}
              >
                <FiMail className="w-4 h-4" style={{ color: themeColors.icon }} />
              </div>
              <span>Email <span className="text-red-500">*</span></span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              className={`w-full px-4 py-3 bg-white rounded-xl border focus:outline-none focus:ring-2 ${
                errors.email ? 'border-red-500' : 'border-gray-200'
              }`}
              style={{ focusRingColor: themeColors.button }}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <div
                className="p-2 rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.icon}25 0%, ${themeColors.icon}15 100%)`,
                }}
              >
                <FiMapPin className="w-4 h-4" style={{ color: themeColors.icon }} />
              </div>
              <span>Address <span className="text-red-500">*</span></span>
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter your address"
              rows={3}
              className={`w-full px-4 py-3 bg-white rounded-xl border focus:outline-none focus:ring-2 resize-none ${
                errors.address ? 'border-red-500' : 'border-gray-200'
              }`}
              style={{ focusRingColor: themeColors.button }}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          {/* Service Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <div
                className="p-2 rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.icon}25 0%, ${themeColors.icon}15 100%)`,
                }}
              >
                <FiTag className="w-4 h-4" style={{ color: themeColors.icon }} />
              </div>
              <span>Service Category <span className="text-red-500">*</span></span>
            </label>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((category) => {
                const isSelected = formData.serviceCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryChange(category)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95"
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${themeColors.icon} 0%, ${themeColors.icon}dd 100%)`
                        : `linear-gradient(135deg, ${themeColors.icon}20 0%, ${themeColors.icon}10 100%)`,
                      color: isSelected ? '#FFFFFF' : themeColors.icon,
                      border: `1.5px solid ${isSelected ? themeColors.icon : `${themeColors.icon}40`}`,
                      boxShadow: isSelected
                        ? `0 2px 8px ${hexToRgba(themeColors.icon, 0.3)}`
                        : `0 2px 6px ${hexToRgba(themeColors.icon, 0.15)}`,
                    }}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
            {!formData.serviceCategory && (
              <p className="text-gray-500 text-xs mt-2">Select a service category</p>
            )}
          </div>

          {/* Skills */}
          {formData.serviceCategory && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <div
                  className="p-2 rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${themeColors.button}25 0%, ${themeColors.button}15 100%)`,
                  }}
                >
                  <FiTag className="w-4 h-4" style={{ color: themeColors.button }} />
                </div>
                <span>Skills <span className="text-red-500">*</span></span>
              </label>
              <div className="flex flex-wrap gap-2">
                {(skillsByCategory[formData.serviceCategory] || []).map((skill) => {
                  const isSelected = formData.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95"
                      style={{
                        background: isSelected
                          ? `linear-gradient(135deg, ${themeColors.button} 0%, ${themeColors.button}dd 100%)`
                          : `linear-gradient(135deg, ${themeColors.button}20 0%, ${themeColors.button}10 100%)`,
                        color: isSelected ? '#FFFFFF' : themeColors.button,
                        border: `1.5px solid ${isSelected ? themeColors.button : `${themeColors.button}40`}`,
                        boxShadow: isSelected
                          ? `0 2px 8px ${hexToRgba(themeColors.button, 0.3)}`
                          : `0 2px 6px ${hexToRgba(themeColors.button, 0.15)}`,
                      }}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
              {formData.skills.length === 0 && (
                <p className="text-gray-500 text-xs mt-2">Select at least one skill</p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={() => navigate('/worker/profile')}
            className="flex-1 py-4 rounded-xl font-semibold text-gray-700 bg-white border-2 border-gray-200 transition-all active:scale-95"
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{
              background: themeColors.button,
              boxShadow: `0 4px 12px ${themeColors.button}40`,
            }}
          >
            <FiSave className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default EditProfile;


