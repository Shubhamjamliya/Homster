import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiMapPin, FiPhone, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../../../services/api';
import { themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';

const VendorScrapPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'my'
  const [scraps, setScraps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScrap();
  }, [activeTab]);

  const fetchScrap = async () => {
    try {
      setLoading(true);
      if (activeTab === 'available') {
        const res = await api.get('/scrap/available');
        if (res.data.success) setScraps(res.data.data);
      } else {
        const res = await api.get('/scrap/my-accepted');
        if (res.data.success) setScraps(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      const res = await api.put(`/scrap/${id}/accept`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchScrap(); // Refresh available list
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept');
    }
  };

  const handleComplete = async (id) => {
    try {
      const res = await api.put(`/scrap/${id}/complete`);
      if (res.data.success) {
        toast.success('Pickup marked as completed');
        fetchScrap();
      }
    } catch (err) {
      toast.error('Failed to complete');
    }
  };

  // UI for accepting
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Scrap Requests" showBack={true} />

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-200 mt-1">
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'available' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'
            }`}
          style={{ borderColor: activeTab === 'available' ? themeColors.button : 'transparent', color: activeTab === 'available' ? themeColors.button : undefined }}
        >
          Available Scraps
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'my' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'
            }`}
          style={{ borderColor: activeTab === 'my' ? themeColors.button : 'transparent', color: activeTab === 'my' ? themeColors.button : undefined }}
        >
          My Pickups
        </button>
      </div>

      <div className="p-4 space-y-4">
        {loading ? <div className="text-center py-10">Loading...</div> : scraps.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No active requests found.</div>
        ) : (
          scraps.map(item => (
            <div key={item._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between">
                <div>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{item.category}</span>
                  <h3 className="font-bold text-gray-900 mt-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.quantity} • Est: ₹{item.expectedPrice || 'N/A'}</p>
                </div>
              </div>

              <div className="mt-3 flex items-start gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                <FiMapPin className="w-4 h-4 mt-0.5" />
                <div>
                  <p>{item.address?.addressLine1}</p>
                  <p>{item.address?.city} - {item.address?.pincode}</p>
                </div>
              </div>

              {activeTab === 'available' && (
                <button
                  onClick={() => handleAccept(item._id)}
                  className="w-full mt-4 py-2.5 rounded-lg text-white font-semibold shadow-md active:scale-95"
                  style={{ backgroundColor: themeColors.button }}
                >
                  Confirm Buying / Pickup
                </button>
              )}

              {activeTab === 'my' && (
                <div className="mt-4 border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
                    <FiPhone className="text-blue-600" />
                    <a href={`tel:${item.userId?.phone}`} className="hover:text-blue-600">
                      {item.userId?.phone || 'No Phone'}
                    </a>
                    <span className="text-gray-400 mx-1">|</span>
                    <span className="capitalize text-xs px-2 py-0.5 bg-gray-100 rounded">{item.status}</span>
                  </div>

                  {item.status === 'accepted' && (
                    <button
                      onClick={() => handleComplete(item._id)}
                      className="w-full py-2.5 rounded-lg border-2 font-bold text-sm active:scale-95 transition-all text-green-600 border-green-600 hover:bg-green-50"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default VendorScrapPage;
