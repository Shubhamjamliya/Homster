import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiMapPin, FiClock, FiCheckCircle, FiBell, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../../../services/api';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNav from '../../components/layout/BottomNav';
import AddressSelectionModal from '../Checkout/components/AddressSelectionModal';
import { themeColors } from '../../../../theme';

const UserScrapPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const [scraps, setScraps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [houseNumber, setHouseNumber] = useState('');
  const [addressDetails, setAddressDetails] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Other Appliance',
    quantity: '',
    expectedPrice: '',
    description: '',
    address: {
      addressLine1: '',
      city: '',
      state: '',
      pincode: ''
    }
  });

  useEffect(() => {
    fetchMyScrap();
  }, []);

  const fetchMyScrap = async () => {
    try {
      setLoading(true);
      const res = await api.get('/scrap/my');
      if (res.data.success) {
        setScraps(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load scrap items');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Basic validation
      if (!formData.title || !formData.quantity) {
        return toast.error('Please fill required fields');
      }

      const res = await api.post('/scrap', formData);
      if (res.data.success) {
        toast.success('Scrap item listed!');
        setShowAddModal(false);
        setFormData({
          title: '', category: 'Other Appliance', quantity: '', expectedPrice: '', description: '',
          address: { addressLine1: '', city: '', state: '', pincode: '', lat: null, lng: null }
        });
        setHouseNumber('');
        setAddressDetails(null);
        fetchMyScrap();
      }
    } catch (err) {
      toast.error('Failed to create listing');
    }
  };
  const getAddressComponent = (components, type) => {
    return components?.find(c => c.types.includes(type))?.long_name || '';
  };

  const handleAddressSave = (savedHouseNumber, locationObj) => {
    setHouseNumber(savedHouseNumber);
    setAddressDetails(locationObj);

    // Update form data with detailed address components
    if (locationObj) {
      const components = locationObj.components;
      setFormData(prev => ({
        ...prev,
        address: {
          addressLine1: locationObj.address, // Full address string
          addressLine2: savedHouseNumber,
          city: getAddressComponent(components, 'locality') || getAddressComponent(components, 'administrative_area_level_2') || '',
          state: getAddressComponent(components, 'administrative_area_level_1') || '',
          pincode: getAddressComponent(components, 'postal_code') || '',
          lat: locationObj.lat,
          lng: locationObj.lng
        }
      }));
    }
    setShowAddressModal(false);
  };

  const activeScraps = scraps.filter(s => s.status === 'pending' || s.status === 'accepted');
  const historyScraps = scraps.filter(s => s.status === 'completed' || s.status === 'cancelled');

  // Inside return:
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      {/* Header */}
      <div className="bg-white sticky top-0 z-50 border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-gray-50 rounded-full transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
          <div className="flex items-center gap-2">
            <FiTrash2 className="w-5 h-5" style={{ color: themeColors.button }} />
            <h1 className="text-lg font-bold text-gray-900">Sell Scrap</h1>
          </div>
        </div>
        <button
          onClick={() => navigate('/user/notifications')}
          className="p-2 hover:bg-gray-50 rounded-full transition-colors"
        >
          <FiBell className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-200 mt-1">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'active'
            ? `border-[${themeColors.primary}] text-[${themeColors.primary}]`
            : 'border-transparent text-gray-500'
            }`}
          style={{ borderColor: activeTab === 'active' ? themeColors.button : 'transparent', color: activeTab === 'active' ? themeColors.button : undefined }}
        >
          Active Listings
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'history'
            ? `border-[${themeColors.primary}] text-[${themeColors.primary}]`
            : 'border-transparent text-gray-500'
            }`}
          style={{ borderColor: activeTab === 'history' ? themeColors.button : 'transparent', color: activeTab === 'history' ? themeColors.button : undefined }}
        >
          History
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 animate-pulse">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    <div className="h-5 w-40 bg-gray-200 rounded"></div>
                    <div className="h-3 w-32 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="pt-3 border-t border-gray-50 flex justify-between">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (activeTab === 'active' ? activeScraps : historyScraps).length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FiPlus className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No items found</p>
            <p className="text-sm text-gray-400 mt-1">Add items to start selling</p>
          </div>
        ) : (
          (activeTab === 'active' ? activeScraps : historyScraps).map(item => (
            <div key={item._id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600 mb-2">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{item.quantity} • ₹{item.expectedPrice || 'Best Offer'}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold uppercase
                  ${item.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : ''}
                  ${item.status === 'accepted' ? 'bg-green-50 text-green-600' : ''}
                  ${item.status === 'completed' ? 'bg-gray-100 text-gray-600' : ''}
                `}>
                  {item.status}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <FiClock className="w-4 h-4" />
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                {item.status === 'accepted' && (
                  <div className="flex items-center gap-1 text-green-600 font-medium">
                    <FiCheckCircle className="w-4 h-4" />
                    <span>Pickup Scheduled</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-transform active:scale-95"
        style={{ backgroundColor: themeColors.button }}
      >
        <FiPlus className="w-7 h-7" />
      </button>

      {/* Add Modal */}
      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-lg font-bold">Add Scrap Item</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                >
                  <FiCheckCircle className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-4 space-y-4 pb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Title</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g. Old LG Split AC, Samsung Fridge"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <div className="relative">
                      <select
                        className="w-full p-3 bg-gray-50 rounded-xl border-none appearance-none"
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                      >
                        {['Other Appliance', 'AC', 'Fridge', 'Washing Machine', 'Geyser', 'RO', 'Cooler', 'Microwave', 'TV'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="text"
                      className="w-full p-3 bg-gray-50 rounded-xl border-none"
                      placeholder="e.g. 1 unit"
                      value={formData.quantity}
                      onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Price (Optional)</label>
                  <input
                    type="number"
                    className="w-full p-3 bg-gray-50 rounded-xl border-none"
                    placeholder="₹ Estimate"
                    value={formData.expectedPrice}
                    onChange={e => setFormData({ ...formData, expectedPrice: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full p-3 bg-gray-50 rounded-xl border-none"
                    rows="2"
                    placeholder="Condition, model year, etc."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Address Section - Matches Checkout */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <FiMapPin className="text-primary-600" /> Pickup Location
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(true)}
                      className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                      style={{ color: themeColors.button }}
                    >
                      {formData.address.addressLine1 ? 'Change' : 'Select'}
                    </button>
                  </div>

                  {formData.address.addressLine1 ? (
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="font-medium text-gray-900 text-sm">{houseNumber ? `${houseNumber}, ` : ''}{formData.address.addressLine1.split(',')[0]}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{formData.address.addressLine1}</p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(true)}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-sm font-medium hover:bg-gray-100 transition-colors"
                    >
                      + Select Pickup Address
                    </button>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!formData.address.addressLine1}
                    className="w-full py-4 rounded-xl text-white font-bold shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                    style={{ backgroundColor: themeColors.button }}
                  >
                    List Item for Pickup
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AddressSelectionModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        address={formData.address.addressLine1 || ''}
        houseNumber={houseNumber}
        onHouseNumberChange={setHouseNumber}
        onSave={handleAddressSave}
      />

      {/* Hide bottom nav when modal is open to prevent z-index issues / clutter */}
      {!showAddModal && <BottomNav />}
    </div>
  );
};

export default UserScrapPage;
