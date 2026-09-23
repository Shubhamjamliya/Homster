import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCamera,
  FiCheckCircle,
  FiImage,
  FiLoader,
  FiMapPin,
  FiX,
  FiTag,
  FiFileText,
  FiShield,
  FiDollarSign,
  FiTruck,
  FiCheck
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { z } from 'zod';

import api from '../../../../services/api';
import { themeColors } from '../../../../theme';
import AddressSelectionModal from '../Checkout/components/AddressSelectionModal';
import { uploadToCloudinary } from '../../../../utils/cloudinaryUpload';
import flutterBridge from '../../../../utils/flutterBridge';

// Zod schema for Scrap
const scrapSchema = z.object({
  title: z.string().min(3, 'Title too short (min 3 characters)'),
  description: z.string().optional(),
  address: z
    .object({
      addressLine1: z.string().min(5, 'Address must be selected'),
      city: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
      lat: z.any().optional(),
      lng: z.any().optional()
    })
    .refine((data) => data.addressLine1 && data.addressLine1.length > 0, {
      message: 'Pickup address is required'
    })
});

const POPULAR_SUGGESTIONS = [
  'Old Split AC',
  'Refrigerator',
  'Washing Machine',
  'Newspapers / Books',
  'Copper & Brass',
  'Iron / Steel Scrap',
  'Old Laptop / E-Waste'
];

const AddScrap = () => {
  const navigate = useNavigate();

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [houseNumber, setHouseNumber] = useState('');
  const [_addressDetails, setAddressDetails] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    images: [],
    address: {
      addressLine1: '',
      city: '',
      state: '',
      pincode: ''
    }
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isFlutter, setIsFlutter] = useState(flutterBridge.isFlutter);
  const [showSourceSheet, setShowSourceSheet] = useState(false);

  // Sync flutter bridge state
  useEffect(() => {
    flutterBridge.waitForFlutter().then((ready) => {
      setIsFlutter(ready);
    });
  }, []);

  const handleNativeCamera = async () => {
    const file = await flutterBridge.openCamera();
    if (file) {
      const newFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: 'idle'
      };
      setSelectedFiles((prev) => [...prev, newFile]);
      flutterBridge.hapticFeedback?.('success');
    }
  };

  const handlePhotoClick = () => {
    flutterBridge.hapticFeedback?.('light');
    setShowSourceSheet(true);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      return toast.error('Maximum 5 images allowed');
    }

    const newFiles = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'idle'
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    flutterBridge.hapticFeedback?.('selection');
  };

  const removeImage = (index) => {
    flutterBridge.hapticFeedback?.('light');
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    // Zod Validation
    const validationResult = scrapSchema.safeParse(formData);
    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0].message);
      return;
    }

    try {
      setIsUploading(true);
      toast.loading('Uploading images and listing items...', { id: 'scrap' });

      // 1. Upload images to Cloudinary
      const imageUrls = [];
      const updatedFiles = [...selectedFiles];

      for (let i = 0; i < updatedFiles.length; i++) {
        const item = updatedFiles[i];
        try {
          setSelectedFiles((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, status: 'uploading' } : f))
          );

          const url = await uploadToCloudinary(item.file, 'scrap_items', (pct) => {
            setSelectedFiles((prev) =>
              prev.map((f) => (f.id === item.id ? { ...f, progress: pct } : f))
            );
          });

          imageUrls.push(url);
          setSelectedFiles((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, status: 'done', progress: 100 } : f))
          );
        } catch (err) {
          console.error('Image upload failed', err);
          setSelectedFiles((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, status: 'error' } : f))
          );
          toast.error(`Failed to upload image ${i + 1}`);
        }
      }

      // Check if we have at least one image if images were selected
      if (selectedFiles.length > 0 && imageUrls.length === 0) {
        setIsUploading(false);
        toast.dismiss('scrap');
        return toast.error('Failed to upload images. Please try again.');
      }

      // 2. Prepare final data
      const finalData = {
        ...formData,
        images: imageUrls
      };

      const res = await api.post('/scrap', finalData);
      if (res.data.success) {
        flutterBridge.hapticFeedback?.('success');
        toast.success('Scrap item listed successfully!', { id: 'scrap' });
        navigate(-1);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create listing', { id: 'scrap' });
      flutterBridge.hapticFeedback?.('error');
    } finally {
      setIsUploading(false);
    }
  };

  const getAddressComponent = (components, type) => {
    return components?.find((c) => c.types.includes(type))?.long_name || '';
  };

  const handleAddressSave = (savedHouseNumber, locationObj) => {
    setHouseNumber(savedHouseNumber);
    setAddressDetails(locationObj);

    if (locationObj) {
      const components = locationObj.components;
      setFormData((prev) => ({
        ...prev,
        address: {
          addressLine1: locationObj.address,
          addressLine2: savedHouseNumber,
          city:
            getAddressComponent(components, 'locality') ||
            getAddressComponent(components, 'administrative_area_level_2') ||
            '',
          state: getAddressComponent(components, 'administrative_area_level_1') || '',
          pincode: getAddressComponent(components, 'postal_code') || '',
          lat: locationObj.lat,
          lng: locationObj.lng
        }
      }));
    }
    setShowAddressModal(false);
    flutterBridge.hapticFeedback?.('success');
  };

  const brandTeal = themeColors?.brand?.teal || '#347989';
  const brandYellow = themeColors?.brand?.yellow || '#D68F35';
  const brandOrange = themeColors?.brand?.orange || '#BB5F36';

  return (
    <div className="min-h-screen pb-24 relative bg-slate-50/60">
      {/* Brand Ambient Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(at 0% 0%, ${brandTeal}18 0%, transparent 55%),
              radial-gradient(at 100% 10%, ${brandYellow}14 0%, transparent 60%),
              radial-gradient(at 80% 90%, ${brandOrange}10 0%, transparent 60%),
              radial-gradient(at 10% 80%, ${brandTeal}12 0%, transparent 50%),
              #FAFBFC
            `
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(${brandTeal} 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Modern Glassmorphic Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-gray-100 px-4 py-3.5 flex items-center gap-3 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
          <button
            onClick={() => {
              flutterBridge.hapticFeedback?.('light');
              navigate(-1);
            }}
            className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-xs border border-gray-200/80 active:scale-95 transition-all text-gray-700 hover:text-gray-900"
            aria-label="Back"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-black text-gray-900 tracking-tight">Add Scrap Item</h1>
            <p className="text-[11px] font-medium text-gray-500">
              List items for doorstep pickup & instant cash
            </p>
          </div>
        </header>

        <form onSubmit={handleCreate} className="p-4 space-y-4">
          {/* Card 1: Title & Category Suggestions */}
          <div className="bg-white/95 rounded-[24px] p-4 border border-gray-150 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center text-white"
                style={{ background: `linear-gradient(135deg, ${brandTeal}, #245863)` }}
              >
                <FiTag className="w-3.5 h-3.5" />
              </div>
              <label className="text-xs font-black text-gray-800 uppercase tracking-wide">
                Item Title <span className="text-rose-500">*</span>
              </label>
            </div>

            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-50/80 rounded-2xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                placeholder="e.g. Old LG Split AC, Samsung Fridge"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              {formData.title && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, title: '' })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Suggestions Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Quick Suggestions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SUGGESTIONS.map((item, idx) => {
                  const isSelected = formData.title === item;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        flutterBridge.hapticFeedback?.('selection');
                        setFormData({ ...formData, title: item });
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-gray-100 hover:bg-gray-200/80 text-gray-600'
                      }`}
                      style={
                        isSelected
                          ? { backgroundColor: brandTeal }
                          : {}
                      }
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 2: Description */}
          <div className="bg-white/95 rounded-[24px] p-4 border border-gray-150 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                  <FiFileText className="w-3.5 h-3.5" />
                </div>
                <label className="text-xs font-black text-gray-800 uppercase tracking-wide">
                  Description <span className="text-gray-400 font-normal normal-case">(Optional)</span>
                </label>
              </div>
              <span className="text-[10px] text-gray-400 font-medium">
                {formData.description.length}/300
              </span>
            </div>

            <textarea
              className="w-full px-4 py-3 bg-gray-50/80 rounded-2xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all resize-none"
              rows="3"
              maxLength={300}
              placeholder="Mention item condition, working status, approximate weight or brand model year..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Card 3: Image Upload */}
          <div className="bg-white/95 rounded-[24px] p-4 border border-gray-150 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
                  <FiCamera className="w-3.5 h-3.5" />
                </div>
                <label className="text-xs font-black text-gray-800 uppercase tracking-wide">
                  Item Images
                </label>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-full">
                {selectedFiles.length}/5 photos
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {selectedFiles.map((item, index) => (
                <div
                  key={item.id || index}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shadow-xs group"
                >
                  <img src={item.preview} alt="Preview" className="w-full h-full object-cover" />

                  {/* Upload Progress Overlay */}
                  {item.status === 'uploading' && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center p-2">
                      <div className="w-full bg-white/30 rounded-full h-1.5 mb-1.5 overflow-hidden">
                        <div
                          className="bg-white h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-white font-black">{item.progress}%</span>
                    </div>
                  )}

                  {item.status === 'done' && (
                    <div className="absolute top-1.5 left-1.5 bg-emerald-600 text-white rounded-full p-1 shadow-sm">
                      <FiCheck size={10} />
                    </div>
                  )}

                  {item.status === 'error' && (
                    <div className="absolute inset-0 bg-rose-500/30 flex items-center justify-center">
                      <FiX className="text-white w-5 h-5 drop-shadow-sm" />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    disabled={isUploading}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black text-white rounded-full flex items-center justify-center transition-all active:scale-90"
                    aria-label="Remove image"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}

              {selectedFiles.length < 5 && !isUploading && (
                <button
                  type="button"
                  onClick={handlePhotoClick}
                  className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-teal-600 hover:bg-teal-50/30 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 group"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-teal-100 flex items-center justify-center text-gray-500 group-hover:text-teal-700 transition-colors">
                    <FiCamera className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black text-gray-500 group-hover:text-teal-800 uppercase tracking-tight">
                    Add Photo
                  </span>
                  <input
                    id="add-scrap-photo-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    onClick={(e) => e.stopPropagation()}
                  />
                </button>
              )}
            </div>
          </div>

          {/* Card 4: Pickup Location */}
          <div className="bg-white/95 rounded-[24px] p-4 border border-gray-150 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                  <FiMapPin className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-wide">
                  Pickup Location <span className="text-rose-500">*</span>
                </h3>
              </div>
              {formData.address.addressLine1 && (
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="text-xs font-bold hover:underline"
                  style={{ color: brandTeal }}
                >
                  Change
                </button>
              )}
            </div>

            {formData.address.addressLine1 ? (
              <div className="bg-gray-50/90 p-3.5 rounded-2xl border border-gray-200/80 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-red-100/70 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                  <FiMapPin className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-gray-900 text-xs">
                    {houseNumber ? `${houseNumber}, ` : ''}
                    {formData.address.addressLine1.split(',')[0]}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                    {formData.address.addressLine1}
                  </p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  flutterBridge.hapticFeedback?.('selection');
                  setShowAddressModal(true);
                }}
                className="w-full py-3.5 border-2 border-dashed border-gray-300 hover:border-teal-600 hover:bg-teal-50/30 rounded-2xl text-gray-600 text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <FiMapPin className="w-4 h-4 text-teal-700" />
                <span>+ Select Pickup Address</span>
              </button>
            )}
          </div>

          {/* Reassurance Guarantee Banner */}
          <div className="grid grid-cols-3 gap-2 px-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
              <FiTruck className="w-3 h-3 text-teal-600 shrink-0" />
              <span>Free Pickup</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
              <FiDollarSign className="w-3 h-3 text-amber-600 shrink-0" />
              <span>Instant Payment</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
              <FiShield className="w-3 h-3 text-blue-600 shrink-0" />
              <span>Fair Weighing</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!formData.address.addressLine1 || isUploading}
              className="w-full py-4 rounded-2xl text-white font-extrabold text-sm shadow-md active:scale-98 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${brandTeal} 0%, #235863 100%)`,
                boxShadow: !formData.address.addressLine1 || isUploading
                  ? 'none'
                  : `0 10px 25px -5px ${brandTeal}50`
              }}
            >
              {isUploading ? (
                <>
                  <FiLoader className="animate-spin w-4 h-4" />
                  <span>Listing Scrap Item...</span>
                </>
              ) : !formData.address.addressLine1 ? (
                <span>Select Pickup Address to Continue</span>
              ) : (
                <>
                  <FiCheckCircle className="w-4 h-4" />
                  <span>List Item for Pickup</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <AddressSelectionModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        address={formData.address.addressLine1 || ''}
        houseNumber={houseNumber}
        onHouseNumberChange={setHouseNumber}
        onSave={handleAddressSave}
      />

      {/* Photo Source Selection - Mobile Styled Bottom Sheet */}
      <AnimatePresence>
        {showSourceSheet && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSourceSheet(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            <Motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="relative bg-white w-full rounded-t-[32px] p-6 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] z-10"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="font-extrabold text-gray-900 text-base">Select Photo Source</h4>
                  <p className="text-[11px] text-gray-500">Take a photo or choose from gallery</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSourceSheet(false)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {/* Camera Option */}
                <button
                  type="button"
                  onClick={() => {
                    setShowSourceSheet(false);
                    if (isFlutter) {
                      handleNativeCamera();
                    } else {
                      document.getElementById('add-scrap-photo-upload')?.click();
                    }
                  }}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-teal-100 hover:border-teal-300 active:scale-95 transition-all text-center"
                  style={{ backgroundColor: `${brandTeal}0D` }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: brandTeal }}
                  >
                    <FiCamera className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-extrabold text-gray-900 text-xs block">Take Photo</span>
                    <span className="text-[10px] text-gray-500">Use device camera</span>
                  </div>
                </button>

                {/* Gallery Option */}
                <button
                  type="button"
                  onClick={() => {
                    setShowSourceSheet(false);
                    document.getElementById('add-scrap-photo-upload')?.click();
                  }}
                  className="flex flex-col items-center gap-3 p-5 bg-blue-50/70 hover:bg-blue-50 rounded-2xl border border-blue-100 hover:border-blue-300 active:scale-95 transition-all text-center"
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-200">
                    <FiImage className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-extrabold text-gray-900 text-xs block">Gallery</span>
                    <span className="text-[10px] text-gray-500">Upload from device</span>
                  </div>
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddScrap;
