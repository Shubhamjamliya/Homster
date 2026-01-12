import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSave, FiUser, FiPhone, FiMail,
  FiMapPin, FiBriefcase, FiCamera, FiCheck,
  FiChevronDown, FiX
} from 'react-icons/fi';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import workerService from '../../../../services/workerService';
import { publicCatalogService } from '../../../../services/catalogService';
import { toast } from 'react-hot-toast';
import AddressSelectionModal from '../../../user/pages/Checkout/components/AddressSelectionModal';

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: {
      addressLine1: '',
      city: '',
      state: '',
      pincode: '',
    },
    serviceCategory: '',
    skills: [],
    profilePhoto: null,
    status: 'OFFLINE'
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [profileRes, catalogRes] = await Promise.all([
          workerService.getProfile(),
          publicCatalogService.getCategories()
        ]);

        if (profileRes.success) {
          const w = profileRes.worker;
          setFormData({
            name: w.name || '',
            phone: w.phone || '',
            email: w.email || '',
            address: {
              addressLine1: w.address?.addressLine1 || '',
              city: w.address?.city || '',
              state: w.address?.state || '',
              pincode: w.address?.pincode || '',
            },
            serviceCategory: w.serviceCategory || '',
            skills: w.skills || [],
            profilePhoto: w.profilePhoto || null,
            status: w.status || 'OFFLINE'
          });
        }

        if (catalogRes.success) {
          setCategories(catalogRes.categories || []);
        }
      } catch (error) {
        console.error('Init error:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Upload failed');
    return data.imageUrl;
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleCategoryChange = (val) => {
    setFormData(prev => ({
      ...prev,
      serviceCategory: val,
      skills: [] // Reset skills on category change
    }));
  };

  const toggleSkill = (skill) => {
    setFormData(prev => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills };
    });
  };

  const handleAddressSave = (houseNumber, location) => {
    // Extract components from Google Maps location
    let city = '';
    let state = '';
    let pincode = '';
    let addressLine2 = '';

    if (location.components) {
      location.components.forEach(comp => {
        if (comp.types.includes('locality')) city = comp.long_name;
        if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
        if (comp.types.includes('postal_code')) pincode = comp.long_name;
        if (comp.types.includes('sublocality')) addressLine2 = comp.long_name;
      });
    }

    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        addressLine1: houseNumber || prev.address.addressLine1,
        addressLine2: addressLine2,
        city: city || prev.address.city,
        state: state || prev.address.state,
        pincode: pincode || prev.address.pincode,
        fullAddress: location.address // Store the full formatted address string
      }
    }));
    setIsAddressModalOpen(false);
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.serviceCategory) errs.serviceCategory = 'Category is required';

    // Validate phone just in case, though it's read-only usually
    // Validate email

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setSaving(true);

      // Prepare payload to match backend expectation
      // Backend expects address object, skills array, etc.
      const payload = {
        name: formData.name,
        email: formData.email,
        serviceCategory: formData.serviceCategory,
        skills: formData.skills,
        address: formData.address,
        status: formData.status
      };

      if (photoFile) {
        try {
          const photoUrl = await uploadFile(photoFile);
          payload.profilePhoto = photoUrl;
        } catch (uploadErr) {
          console.error('Photo upload failed', uploadErr);
          toast.error('Failed to upload photo');
          setSaving(false);
          return;
        }
      }

      await workerService.updateProfile(payload);
      toast.success('Profile updated successfully');

      // Update local storage to keep session in sync if needed
      const currentWorker = JSON.parse(localStorage.getItem('workerData') || '{}');
      localStorage.setItem('workerData', JSON.stringify({
        ...currentWorker,
        name: payload.name,
        email: payload.email,
        serviceCategory: payload.serviceCategory,
        skills: payload.skills,
        address: payload.address,
        status: payload.status,
        profilePhoto: payload.profilePhoto || currentWorker.profilePhoto
      }));

      navigate('/worker/profile');
    } catch (error) {
      console.error('Update failed:', error);
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  // Find the selected category object to get its skills
  const selectedCategoryObj = categories.find(c => c.title === formData.serviceCategory);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500 font-medium">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Edit Profile" />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">

        {/* Profile Photo */}
        <div className="flex flex-col items-center">
          <div className="relative cursor-pointer" onClick={() => document.getElementById('photo-upload').click()}>
            <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
              {photoPreview || formData.profilePhoto ? (
                <img src={photoPreview || formData.profilePhoto} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <div className="bg-gray-100 w-full h-full flex items-center justify-center">
                  <FiUser className="w-10 h-10 text-gray-300" />
                </div>
              )}
            </div>
            {/* Camera Icon */}
            <div className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white ring-2 ring-white shadow-sm">
              <FiCamera className="w-4 h-4" />
            </div>
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 font-medium">Tap to change photo</p>
        </div>

        {/* Availability Status */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <FiCheck className="text-blue-600" />
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Availability</h2>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleInputChange('status', 'ONLINE')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2 ${formData.status === 'ONLINE'
                ? 'bg-green-50 border-green-500 text-green-700'
                : 'bg-white border-gray-200 text-gray-500'
                }`}
            >
              Online
            </button>
            <button
              onClick={() => handleInputChange('status', 'OFFLINE')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2 ${formData.status === 'OFFLINE'
                ? 'bg-red-50 border-red-500 text-red-700'
                : 'bg-white border-gray-200 text-gray-500'
                }`}
            >
              Offline
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center">
            Set your status to receive new job assignments.
          </p>
        </div>

        {/* Personal Details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <FiUser className="text-blue-600" />
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Personal Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block ml-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                placeholder="Enter name"
              />
              {errors.name && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block ml-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block ml-1">Phone Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.phone}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">
                  VERIFIED
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <FiMapPin className="text-blue-600" />
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Address Details</h2>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm font-medium text-gray-700">
                {formData.address?.fullAddress ||
                  `${formData.address?.addressLine1 || ''} ${formData.address?.city || ''} ${formData.address?.state || ''} ${formData.address?.pincode || ''}`
                }
              </p>
              {!formData.address?.fullAddress && !formData.address?.addressLine1 && (
                <p className="text-xs text-gray-400 italic mt-1">No address set</p>
              )}
            </div>

            <button
              onClick={() => setIsAddressModalOpen(true)}
              className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm border border-blue-100 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
            >
              <FiMapPin className="w-4 h-4" />
              Build/Change Location on Map
            </button>
          </div>
        </div>

        {/* Work Category */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <FiBriefcase className="text-blue-600" />
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Work Profile</h2>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wide">Category</label>
            <div className="relative">
              <div
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between cursor-pointer"
              >
                <span className={`font-medium ${formData.serviceCategory ? 'text-gray-900' : 'text-gray-400'}`}>
                  {formData.serviceCategory || 'Select a Category'}
                </span>
                <FiChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </div>

              {isCategoryOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-60 overflow-y-auto">
                  {categories.map((cat, index) => (
                    <div
                      key={cat._id || index}
                      onClick={() => {
                        handleCategoryChange(cat.title);
                        setIsCategoryOpen(false);
                      }}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 font-medium text-gray-700"
                    >
                      {cat.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.serviceCategory && <p className="text-red-500 text-[10px] mt-1">Required</p>}
          </div>

          {formData.serviceCategory && (
            <div>
              <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wide">Services (Skills)</label>

              {/* Multi-select Dropdown for Services */}
              <div className="relative mb-3">
                <div
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between cursor-pointer"
                >
                  <span className="font-medium text-gray-400">
                    Select Services...
                  </span>
                  <FiChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
                </div>

                {isServicesOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-60 overflow-y-auto">
                    {selectedCategoryObj?.subServices && selectedCategoryObj.subServices.length > 0 ? (
                      selectedCategoryObj.subServices.map((skill, idx) => {
                        const skillName = typeof skill === 'string' ? skill : (skill.name || skill.title);
                        const isSelected = formData.skills.includes(skillName);
                        return (
                          <div
                            key={skillName || idx}
                            onClick={() => {
                              toggleSkill(skillName);
                              // Keep dropdown open for multiple selection
                            }}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 font-medium text-gray-700 flex items-center justify-between"
                          >
                            <span>{skillName}</span>
                            {isSelected && <FiCheck className="w-5 h-5 text-blue-600" />}
                          </div>
                        );
                      })
                    ) : (
                      <div className="px-4 py-3 text-gray-400 text-sm italic">
                        No services available for this category
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Services Tags */}
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, idx) => (
                  <div
                    key={skill || idx}
                    className="pl-3 pr-2 py-1.5 rounded-full text-[11px] font-bold bg-blue-600 text-white flex items-center gap-1 shadow-sm"
                  >
                    {skill}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSkill(skill);
                      }}
                      className="p-0.5 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {errors.skills && <p className="text-red-500 text-[10px] mt-1">Select at least one service</p>}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-3">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <FiSave className="w-5 h-5" />
                Save Profile
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/worker/profile')}
            className="w-full py-3.5 bg-white text-gray-500 border border-gray-200 rounded-2xl font-bold text-sm uppercase tracking-wider active:scale-95 transition-all"
          >
            Cancel
          </button>
        </div>

      </main>



      <AddressSelectionModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        address={formData.address?.fullAddress || ''} // Passing for initial view if supported later
        houseNumber={formData.address?.addressLine1 || ''}
        onHouseNumberChange={(val) => handleInputChange('address.addressLine1', val)}
        onSave={handleAddressSave}
      />

      <BottomNav />
    </div >
  );
};

export default EditProfile;
