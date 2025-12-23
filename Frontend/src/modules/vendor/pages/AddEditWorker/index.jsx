import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX, FiLink, FiUserPlus, FiSearch, FiChevronDown } from 'react-icons/fi';
import { vendorTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import { createWorker, updateWorker, getWorkerById, linkWorker } from '../../services/workerService';
import { publicCatalogService } from '../../../../services/catalogService';
import { toast } from 'react-hot-toast';

const AddEditWorker = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'link'
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    aadhar: {
      number: '',
      document: '' // Base64 string ideally
    },
    skills: [],
    serviceCategory: '',
    address: {
      addressLine1: '',
      city: '',
      state: '',
      pincode: ''
    },
    status: 'active'
  });

  const [linkPhone, setLinkPhone] = useState('');

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
    const initData = async () => {
      try {
        const catRes = await publicCatalogService.getCategories();
        if (catRes.success) {
          console.log('Loaded Categories:', catRes.categories || []);
          setCategories(catRes.categories || []);
        }

        if (isEdit) {
          setLoading(true);
          const res = await getWorkerById(id);
          if (res.success) {
            const w = res.data;
            setFormData({
              name: w.name || '',
              phone: w.phone || '',
              email: w.email || '',
              aadhar: {
                number: w.aadhar?.number || '',
                document: w.aadhar?.document || ''
              },
              skills: w.skills || [],
              serviceCategory: w.serviceCategory || '',
              address: {
                addressLine1: w.address?.addressLine1 || '',
                city: w.address?.city || '',
                state: w.address?.state || '',
                pincode: w.address?.pincode || ''
              },
              status: w.status || 'active'
            });
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Init error:', error);
        toast.error('Failed to load data');
        setLoading(false);
      }
    };
    initData();
  }, [id, isEdit]);

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
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleCategoryChange = (val) => {
    setFormData(prev => ({
      ...prev,
      serviceCategory: val,
      skills: []
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

  // Simplified Validation
  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Required';
    if (!formData.phone.trim()) errs.phone = 'Required';
    if (!formData.email.trim()) errs.email = 'Required';
    if (!isEdit) {
      // Only validate aadhar for new add, or if desired for updates
      if (!formData.aadhar.number) errs['aadhar.number'] = 'Required';
      if (!formData.aadhar.document) errs['aadhar.document'] = 'Required';
    }
    if (!formData.serviceCategory) errs.serviceCategory = 'Required';
    if (formData.skills.length === 0) errs.skills = 'Select at least one';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      setLoading(true);
      // Clean payload
      const payload = { ...formData };
      // For testing, if no document is uploaded, we might need a dummy base64 or ensuring file upload works.
      // Assuming user will upload or we have a placeholder for demo.
      if (!payload.aadhar.document) payload.aadhar.document = 'data:image/png;base64,placeholder';

      if (isEdit) {
        await updateWorker(id, payload);
        toast.success('Worker updated');
      } else {
        await createWorker(payload);
        toast.success('Worker added');
      }
      window.dispatchEvent(new Event('vendorWorkersUpdated'));
      navigate('/vendor/workers');
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkWorker = async () => {
    if (!linkPhone.trim() || linkPhone.length < 10) {
      toast.error('Enter valid phone number');
      return;
    }
    try {
      setLoading(true);
      await linkWorker(linkPhone);
      toast.success('Worker linked successfully!');
      window.dispatchEvent(new Event('vendorWorkersUpdated'));
      navigate('/vendor/workers');
    } catch (error) {
      console.error('Link error:', error);
      toast.error(error.response?.data?.message || 'Failed to link worker');
    } finally {
      setLoading(false);
    }
  };

  // Get selected category object for skills
  const selectedCategoryObj = categories.find(c => c.title === formData.serviceCategory);

  return (
    <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
      <Header title={isEdit ? 'Edit Worker' : 'Add Worker'} />

      <main className="px-4 py-6 max-w-lg mx-auto">

        {/* Tabs for Add New vs Link */}
        {!isEdit && (
          <div className="flex bg-white rounded-xl p-1 mb-6 shadow-sm border border-gray-100">
            <button
              onClick={() => setActiveTab('new')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'new'
                ? 'text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-50'
                }`}
              style={{
                background: activeTab === 'new' ? themeColors.button : 'transparent'
              }}
            >
              <FiUserPlus className="w-4 h-4" />
              Create New
            </button>
            <button
              onClick={() => setActiveTab('link')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'link'
                ? 'text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-50'
                }`}
              style={{
                background: activeTab === 'link' ? themeColors.button : 'transparent'
              }}
            >
              <FiLink className="w-4 h-4" />
              Link Existing
            </button>
          </div>
        )}

        {/* Link Existing Mode */}
        {activeTab === 'link' && !isEdit && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center space-y-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2"
              style={{ background: `${themeColors.button}15` }}
            >
              <FiSearch className="w-8 h-8" style={{ color: themeColors.button }} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Add Existing Worker</h3>
            <p className="text-sm text-gray-500">
              Enter the phone number of a registered worker to add them to your team.
            </p>

            <div className="pt-2">
              <input
                type="tel"
                value={linkPhone}
                onChange={(e) => setLinkPhone(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-center text-lg font-medium tracking-wide"
                maxLength={10}
              />
            </div>

            <button
              onClick={handleLinkWorker}
              disabled={loading}
              className="w-full py-4 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
              style={{
                background: themeColors.button,
                boxShadow: `0 8px 24px ${themeColors.button}40`
              }}
            >
              {loading ? 'Processing...' : 'Find & Add Worker'}
            </button>
          </div>
        )}

        {/* Create / Edit Mode */}
        {(activeTab === 'new' || isEdit) && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Details</h4>

              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Full Name *"
                  className={`w-full px-4 py-3 bg-gray-50 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-100 ${errors.name ? 'border-red-500' : 'border-gray-100'}`}
                />

                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Mobile Number *"
                  className={`w-full px-4 py-3 bg-gray-50 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-100 ${errors.phone ? 'border-red-500' : 'border-gray-100'}`}
                  maxLength={10}
                />

                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Email Address *"
                  className={`w-full px-4 py-3 bg-gray-50 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-100 ${errors.email ? 'border-red-500' : 'border-gray-100'}`}
                />
              </div>
            </div>

            {/* Work Profile */}
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Work Profile</h4>

              {/* Category Dropdown */}
              <div>
                <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wide">Category</label>
                <div className="relative">
                  <button
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <span className={`font-medium truncate ${formData.serviceCategory ? 'text-gray-900' : 'text-gray-400'}`}>
                      {formData.serviceCategory || 'Select a Category'}
                    </span>
                    <FiChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isCategoryOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10 bg-transparent"
                        onClick={() => setIsCategoryOpen(false)}
                      />
                      <div className="absolute z-20 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto">
                        {categories.length > 0 ? (
                          categories.map(cat => (
                            <button
                              key={cat._id}
                              onClick={() => {
                                handleCategoryChange(cat.title);
                                setIsCategoryOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 font-medium text-gray-700 border-b border-gray-50 last:border-0 flex items-center justify-between"
                            >
                              {cat.title}
                              {formData.serviceCategory === cat.title && (
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-400 text-sm">No categories found</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                {errors.serviceCategory && <p className="text-red-500 text-[10px] mt-1">Required</p>}
              </div>

              {/* Services (Skills) Dropdown */}
              {formData.serviceCategory && (
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wide">Services (Skills)</label>
                  <div className="relative">
                    <button
                      onClick={() => setIsServicesOpen(!isServicesOpen)}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      <span className={`font-medium truncate ${formData.skills.length > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                        {formData.skills.length > 0 ? `${formData.skills.length} Selected` : 'Select Services'}
                      </span>
                      <FiChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isServicesOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10 bg-transparent"
                          onClick={() => setIsServicesOpen(false)}
                        />
                        <div className="absolute z-20 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto">
                          {selectedCategoryObj?.subServices && selectedCategoryObj.subServices.length > 0 ? (
                            selectedCategoryObj.subServices.map((skill, idx) => {
                              const sName = typeof skill === 'string' ? skill : (skill.name || skill.title);
                              const isSelected = formData.skills.includes(sName);
                              return (
                                <button
                                  key={idx}
                                  onClick={() => toggleSkill(sName)}
                                  className="w-full text-left px-4 py-3 hover:bg-gray-50 font-medium text-gray-700 border-b border-gray-50 last:border-0 flex items-center justify-between"
                                >
                                  {sName}
                                  {isSelected && (
                                    <div className="w-2 h-2 rounded-full" style={{ background: themeColors.button }} />
                                  )}
                                </button>
                              );
                            })
                          ) : (
                            <div className="px-4 py-3 text-gray-400 text-sm">No services available</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Selected Services Tags */}
                  {formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700"
                        >
                          {skill}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleSkill(skill); }}
                            className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none"
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {errors.skills && <p className="text-red-500 text-[10px] mt-1">Select at least one service</p>}
                </div>
              )}
            </div>

            {/* Documents (Simplified) */}
            {
              !isEdit && (
                <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Identity Proof (Aadhar)</h4>
                  <input
                    type="text"
                    value={formData.aadhar.number}
                    onChange={(e) => handleInputChange('aadhar.number', e.target.value)}
                    placeholder="Aadhar Number *"
                    className={`w-full px-4 py-3 bg-gray-50 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-100 ${errors['aadhar.number'] ? 'border-red-500' : 'border-gray-100'}`}
                    maxLength={12}
                  />
                  {/* File upload placeholder - Using simple text for simplicity or actual file input */}
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                    <input
                      type="text"
                      value={formData.aadhar.document}
                      onChange={(e) => handleInputChange('aadhar.document', e.target.value)}
                      placeholder="Paste Document URL/Base64 (Demo)"
                      className="w-full text-xs text-center bg-transparent focus:outline-none"
                    />
                    {/* In real app, this would be <input type="file" /> */}
                  </div>
                </div>
              )
            }

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 text-white rounded-xl font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              style={{
                background: themeColors.button,
                boxShadow: `0 8px 24px ${themeColors.button}40`
              }}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Details' : 'Create Worker')}
            </button>
          </div >
        )}
      </main >

      <BottomNav />
    </div >
  );
};

export default AddEditWorker;
