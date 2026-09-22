import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiCamera, FiImage, FiX, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../../theme';
import { userAuthService } from '../../../../services/authService';
import flutterBridge from '../../../../utils/flutterBridge';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address').refine(val => val.includes('@'), 'Invalid email address'),
});

const TEAL = '#347989';
const AMBER = '#D68F35';

const UpdateProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', profilePhoto: '' });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFlutter, setIsFlutter] = useState(flutterBridge.isFlutter);
  const [showSourceSheet, setShowSourceSheet] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    flutterBridge.waitForFlutter().then(ready => setIsFlutter(ready));
  }, []);

  const handleNativeCamera = async () => {
    try {
      const file = await flutterBridge.openCamera();
      if (file) {
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
        flutterBridge.hapticFeedback('success');
      }
    } catch (error) {
      console.error('Native camera failed:', error);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          setFormData({ name: userData.name || '', email: userData.email || '', phone: userData.phone || '', profilePhoto: userData.profilePhoto || '' });
        }
        const response = await userAuthService.getProfile();
        if (response.success && response.user) {
          const user = response.user;
          setFormData({ name: user.name || '', email: user.email || '', phone: user.phone || '', profilePhoto: user.profilePhoto || '' });
          if (storedUserData) {
            const updatedLocal = { ...JSON.parse(storedUserData), ...user };
            localStorage.setItem('userData', JSON.stringify(updatedLocal));
          }
        }
      } catch (error) {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          setFormData({ name: userData.name || '', email: userData.email || '', phone: userData.phone || '', profilePhoto: userData.profilePhoto || '' });
        } else {
          toast.error('Failed to load profile data');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const uploadFile = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    let baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    if (!baseUrl) baseUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : window.location.origin;
    baseUrl = baseUrl.replace(/\/api$/, '');
    const response = await fetch(`${baseUrl}/api/image/upload`, { method: 'POST', body: fd });
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Upload failed');
    return data.imageUrl;
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error('File size should be less than 5MB'); return; }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    if (phone.startsWith('+91')) return phone;
    if (phone.length === 10) return `+91 ${phone}`;
    return phone;
  };

  const getInitials = () => {
    if (!formData.name) return 'U';
    const parts = formData.name.trim().split(' ');
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0].slice(0, 2).toUpperCase();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const validationResult = profileSchema.safeParse({ name: formData.name.trim(), email: formData.email.trim() });
    if (!validationResult.success) { toast.error(validationResult.error.errors[0].message); return; }
    setIsSaving(true);
    setUploading(true);
    try {
      let photoUrl = formData.profilePhoto;
      if (photoFile) {
        try { photoUrl = await uploadFile(photoFile); }
        catch (err) { toast.error('Failed to upload profile photo'); setIsSaving(false); setUploading(false); return; }
      }
      const response = await userAuthService.updateProfile({ name: formData.name.trim(), email: formData.email.trim() || null, profilePhoto: photoUrl });
      if (response.success) {
        toast.success('Profile updated!');
        if (response.user) {
          const storedUserData = localStorage.getItem('userData');
          const updatedData = storedUserData ? { ...JSON.parse(storedUserData), ...response.user } : response.user;
          localStorage.setItem('userData', JSON.stringify(updatedData));
        }
        navigate('/user/account');
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
      setUploading(false);
    }
  };

  const inputBase = 'w-full pl-11 pr-4 py-3.5 rounded-2xl border text-sm font-medium bg-white transition-all duration-200 outline-none placeholder:text-slate-300';

  return (
    <div className="min-h-screen pb-28 relative" style={{ background: '#f8f9fb' }}>
      {/* Ambient gradient bg */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: `radial-gradient(at 0% 0%, ${TEAL}14 0%, transparent 65%), radial-gradient(at 100% 0%, ${AMBER}12 0%, transparent 65%), #f8f9fb` }} />
      </div>

      {/* Glassmorphic Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-slate-100 px-4 py-3.5 flex items-center gap-3">
        <button type="button" onClick={() => navigate('/user/account')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200/90 active:scale-95 transition-transform">
          <FiArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-[18px] font-extrabold text-slate-900 tracking-tight">Edit Profile</h1>
      </header>

      <main className="relative z-10 px-4 pt-6 max-w-lg mx-auto">

        {/* Avatar Card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl p-6 shadow-[0_4px_24px_-4px_rgba(52,121,137,0.08)] border border-slate-100 mb-5 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full -mr-14 -mt-14 blur-2xl opacity-20 pointer-events-none" style={{ backgroundColor: AMBER }} />
          <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full -ml-16 -mb-16 blur-2xl opacity-20 pointer-events-none" style={{ backgroundColor: TEAL }} />

          <div className="relative mb-3 z-10">
            <motion.div
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowSourceSheet(true)}
              className="w-24 h-24 rounded-[22px] overflow-hidden cursor-pointer"
              style={{ boxShadow: `0 0 0 3px ${TEAL}30, 0 0 0 6px ${TEAL}12`, border: `2.5px solid ${TEAL}25` }}
            >
              {photoPreview || formData.profilePhoto ? (
                <img src={photoPreview || formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-black text-2xl" style={{ background: `linear-gradient(135deg, ${TEAL} 0%, ${AMBER} 140%)` }}>
                  {getInitials()}
                </div>
              )}
            </motion.div>

            <button type="button" onClick={() => setShowSourceSheet(true)}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md border-2 border-white active:scale-90 transition-transform"
              style={{ backgroundColor: TEAL }}>
              <FiCamera className="w-3.5 h-3.5" />
            </button>

            <input id="user-photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>

          <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest z-10">Tap to change photo</p>
        </motion.div>

        {/* Form Fields Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.08 }}
          className="bg-white rounded-3xl p-5 shadow-[0_4px_24px_-4px_rgba(52,121,137,0.08)] border border-slate-100 mb-5 space-y-4">

          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-0.5">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors" style={{ color: focusedField === 'name' ? TEAL : '#94a3b8' }} />
              <input
                type="text" name="name" value={formData.name} onChange={handleInputChange} disabled={isLoading}
                onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                placeholder="Your full name"
                className={`${inputBase} ${focusedField === 'name' ? 'border-[#347989] shadow-[0_0_0_3px_rgba(52,121,137,0.10)] text-slate-800' : 'border-slate-200 text-slate-800'}`}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-0.5">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors" style={{ color: focusedField === 'email' ? TEAL : '#94a3b8' }} />
              <input
                type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={isLoading}
                onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                placeholder="you@example.com"
                className={`${inputBase} ${focusedField === 'email' ? 'border-[#347989] shadow-[0_0_0_3px_rgba(52,121,137,0.10)] text-slate-800' : 'border-slate-200 text-slate-800'}`}
              />
            </div>
          </div>

          {/* Phone — locked */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-0.5">Phone Number</label>
            <div className="relative">
              <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                type="tel" value={formatPhoneNumber(formData.phone)} disabled
                className={`${inputBase} border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed`}
                placeholder="Phone number"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded-full">Locked</span>
              </div>
            </div>
            <p className="text-[10.5px] text-slate-400 mt-1 pl-0.5">Phone number cannot be changed for security</p>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.button
          type="button"
          onClick={handleSave}
          disabled={isLoading || isSaving}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.14 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-2xl text-white font-extrabold text-[15px] tracking-wide transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(135deg, ${TEAL} 0%, #2a6270 100%)`, boxShadow: `0 8px 24px -6px ${TEAL}50` }}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin w-5 h-5 text-white/80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <FiCheck className="w-5 h-5" />
              <span>Save Changes</span>
            </>
          )}
        </motion.button>
      </main>

      {/* Bottom Sheet - Photo Source */}
      <AnimatePresence>
        {showSourceSheet && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSourceSheet(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative bg-white w-full rounded-t-[28px] p-5 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.12)] z-10">
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Change Photo</h4>
                  <p className="text-[11.5px] text-slate-400 font-medium mt-0.5">Choose a source for your profile picture</p>
                </div>
                <button type="button" onClick={() => setShowSourceSheet(false)}
                  className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 active:scale-90 transition-transform">
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button type="button"
                  onClick={() => { setShowSourceSheet(false); if (isFlutter) handleNativeCamera(); else document.getElementById('user-photo-upload')?.click(); }}
                  className="flex flex-col items-center gap-3 py-5 rounded-2xl border active:scale-95 transition-all"
                  style={{ backgroundColor: `${TEAL}0D`, borderColor: `${TEAL}20` }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: TEAL }}>
                    <FiCamera className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-[13px]" style={{ color: TEAL }}>Take Photo</span>
                </button>

                <button type="button"
                  onClick={() => { setShowSourceSheet(false); document.getElementById('user-photo-upload')?.click(); }}
                  className="flex flex-col items-center gap-3 py-5 rounded-2xl border active:scale-95 transition-all"
                  style={{ backgroundColor: `${AMBER}0D`, borderColor: `${AMBER}20` }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: AMBER }}>
                    <FiImage className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-[13px]" style={{ color: AMBER }}>Gallery</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UpdateProfile;
