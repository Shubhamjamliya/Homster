import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiMapPin,
  FiClock,
  FiCheckCircle,
  FiArrowLeft,
  FiTrash2,
  FiX,
  FiImage,
  FiCheck,
  FiDollarSign,
  FiTag,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiZap,
  FiChevronRight
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../../../services/api';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { themeColors } from '../../../../theme';
import NotificationBell from '../../components/common/NotificationBell';
import flutterBridge from '../../../../utils/flutterBridge';

const UserScrapPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const [scraps, setScraps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScrap, setSelectedScrap] = useState(null);
  const [respondingToOffer, setRespondingToOffer] = useState(false);

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

  const handleRespondOffer = async (e, scrapId, action, price) => {
    if (e) e.stopPropagation();

    if (action === 'reject') {
      if (!window.confirm(`Are you sure you want to reject the offer of ₹${price || ''}?`)) {
        return;
      }
    }

    try {
      setRespondingToOffer(true);
      toast.loading(action === 'accept' ? 'Accepting offer...' : 'Rejecting offer...', { id: 'offer-resp' });
      const res = await api.put(`/scrap/${scrapId}/respond`, { action });
      if (res.data.success) {
        toast.success(
          res.data.message || (action === 'accept' ? 'Offer accepted! Pickup will be scheduled.' : 'Offer rejected.'),
          { id: 'offer-resp' }
        );
        flutterBridge.hapticFeedback?.('success');
        if (selectedScrap && selectedScrap._id === scrapId) {
          setSelectedScrap(res.data.data);
        }
        fetchMyScrap();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update offer', { id: 'offer-resp' });
      flutterBridge.hapticFeedback?.('error');
    } finally {
      setRespondingToOffer(false);
    }
  };

  const handleDelete = async (e, id) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      toast.loading('Deleting listing...', { id: 'delete-scrap' });
      const res = await api.delete(`/scrap/${id}`);
      if (res.data.success) {
        toast.success('Listing deleted successfully', { id: 'delete-scrap' });
        flutterBridge.hapticFeedback?.('success');
        setSelectedScrap(null);
        fetchMyScrap();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete listing', { id: 'delete-scrap' });
    }
  };

  const activeScraps = scraps.filter(
    (s) => s.status === 'pending' || s.status === 'offered' || s.status === 'accepted'
  );
  const historyScraps = scraps.filter(
    (s) => s.status === 'completed' || s.status === 'cancelled' || s.status === 'rejected'
  );

  const brandTeal = themeColors?.brand?.teal || '#347989';
  const brandYellow = themeColors?.brand?.yellow || '#D68F35';
  const brandOrange = themeColors?.brand?.orange || '#BB5F36';

  const getStatusBadge = (status, offeredPrice) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Awaiting Quote
          </span>
        );
      case 'offered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
            Offer: ₹{offeredPrice}
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FiCheck className="w-3 h-3 text-emerald-600" />
            Accepted
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-gray-100 text-gray-600 border border-gray-200">
            <FiCheckCircle className="w-3 h-3 text-gray-500" />
            Completed
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-rose-50 text-rose-600 border border-rose-200">
            <FiX className="w-3 h-3 text-rose-500" />
            Rejected
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-rose-50 text-rose-600 border border-rose-200">
            <FiX className="w-3 h-3 text-rose-500" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-gray-100 text-gray-600 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  const getTimelineStepIndex = (status) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'offered':
        return 1;
      case 'accepted':
        return 2;
      case 'completed':
        return 3;
      default:
        return 0;
    }
  };

  const currentList = activeTab === 'active' ? activeScraps : historyScraps;

  return (
    <div className="min-h-screen pb-28 relative bg-slate-50/60">
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
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-gray-100 px-4 py-3.5 flex items-center justify-between shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3">
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
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-xs"
                  style={{ background: `linear-gradient(135deg, ${brandTeal}, #245863)` }}
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </div>
                <h1 className="text-lg font-black text-gray-900 tracking-tight">Sell Scrap</h1>
              </div>
              <p className="text-[11px] font-medium text-gray-500 ml-9 -mt-0.5">
                Doorstep pickup & fair rates
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>

        {/* Modern Segmented Pill Tabs */}
        <div className="px-4 pt-3 pb-1">
          <div className="bg-gray-100/90 p-1 rounded-2xl flex items-center shadow-inner border border-gray-200/60">
            <button
              onClick={() => {
                flutterBridge.hapticFeedback?.('selection');
                setActiveTab('active');
              }}
              className={`relative flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'active'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>Active Listings</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black tracking-tight transition-colors ${
                  activeTab === 'active'
                    ? 'bg-teal-50 text-teal-700'
                    : 'bg-gray-200/70 text-gray-600'
                }`}
                style={
                  activeTab === 'active'
                    ? { backgroundColor: `${brandTeal}15`, color: brandTeal }
                    : {}
                }
              >
                {activeScraps.length}
              </span>
            </button>

            <button
              onClick={() => {
                flutterBridge.hapticFeedback?.('selection');
                setActiveTab('history');
              }}
              className={`relative flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>History</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black tracking-tight transition-colors ${
                  activeTab === 'history'
                    ? 'bg-teal-50 text-teal-700'
                    : 'bg-gray-200/70 text-gray-600'
                }`}
                style={
                  activeTab === 'history'
                    ? { backgroundColor: `${brandTeal}15`, color: brandTeal }
                    : {}
                }
              >
                {historyScraps.length}
              </span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-4 space-y-4">
          {loading ? (
            /* Skeleton Loading State */
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white/90 rounded-[24px] shadow-xs p-4 border border-gray-100 animate-pulse flex gap-3.5"
                >
                  <div className="w-20 h-20 bg-gray-200 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2.5 pt-1">
                    <div className="h-4 w-3/4 bg-gray-200 rounded-md" />
                    <div className="h-3 w-1/2 bg-gray-100 rounded-md" />
                    <div className="h-3 w-1/3 bg-gray-100 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : currentList.length === 0 ? (
            activeTab === 'active' ? (
              /* Rich, Engaging Hero Empty State for Active Tab */
              <div className="py-2 space-y-5">
                {/* Hero Showcase Card */}
                <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-white via-teal-50/30 to-amber-50/20 border border-teal-100/70 p-6 shadow-sm text-center">
                  {/* Decorative glowing blobs */}
                  <div
                    className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-2xl opacity-40 pointer-events-none"
                    style={{ backgroundColor: brandYellow }}
                  />
                  <div
                    className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full blur-2xl opacity-35 pointer-events-none"
                    style={{ backgroundColor: brandTeal }}
                  />

                  {/* Central Recycle Icon Glow */}
                  <div className="relative mx-auto w-24 h-24 mb-4 flex items-center justify-center">
                    <div
                      className="absolute inset-0 rounded-full animate-ping opacity-15"
                      style={{ backgroundColor: brandTeal }}
                    />
                    <div
                      className="absolute inset-2 rounded-full opacity-20"
                      style={{
                        background: `radial-gradient(circle, ${brandTeal} 0%, transparent 70%)`
                      }}
                    />
                    <div
                      className="w-20 h-20 rounded-full shadow-lg flex items-center justify-center text-white transition-transform active:scale-95"
                      style={{
                        background: `linear-gradient(135deg, ${brandTeal} 0%, #245863 100%)`,
                        boxShadow: `0 10px 25px -5px ${brandTeal}50`
                      }}
                    >
                      <FiRefreshCw className="w-9 h-9" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-amber-400 text-gray-950 p-1.5 rounded-full shadow-md border-2 border-white">
                      <FiDollarSign className="w-4 h-4" />
                    </div>
                  </div>

                  <h2 className="text-xl font-black text-gray-900 tracking-tight">
                    Turn Scrap into Instant Cash
                  </h2>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto mt-2 leading-relaxed">
                    Have old appliances, metals, paper, or e-waste? Sell them at guaranteed fair
                    rates with free doorstep pickup.
                  </p>

                  {/* Primary CTA button */}
                  <button
                    onClick={() => {
                      flutterBridge.hapticFeedback?.('medium');
                      navigate('/user/scrap/add');
                    }}
                    className="mt-5 w-full py-3.5 px-6 rounded-2xl text-white font-bold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    style={{
                      background: `linear-gradient(135deg, ${brandTeal} 0%, #235863 100%)`,
                      boxShadow: `0 8px 20px -4px ${brandTeal}45`
                    }}
                  >
                    <FiPlus className="w-5 h-5" />
                    <span>Sell Scrap Now</span>
                  </button>
                </div>

                {/* Trust Guarantees */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-gray-100 shadow-xs text-center flex flex-col items-center">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 mb-1.5">
                      <FiTruck className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-900 leading-tight">
                      Free Pickup
                    </span>
                    <span className="text-[9px] text-gray-400 mt-0.5">At doorstep</span>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-gray-100 shadow-xs text-center flex flex-col items-center">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 mb-1.5">
                      <FiDollarSign className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-900 leading-tight">
                      Instant Cash
                    </span>
                    <span className="text-[9px] text-gray-400 mt-0.5">UPI or Cash</span>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-gray-100 shadow-xs text-center flex flex-col items-center">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 mb-1.5">
                      <FiShield className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-900 leading-tight">
                      Fair Scale
                    </span>
                    <span className="text-[9px] text-gray-400 mt-0.5">Digital weight</span>
                  </div>
                </div>

                {/* How It Works Guided Cards */}
                <div className="bg-white/90 backdrop-blur-sm rounded-[24px] p-4 border border-gray-100 shadow-xs">
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                    <FiZap className="text-amber-500" /> How It Works
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">Upload Photos & Details</h4>
                        <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                          Snap pictures of what you want to sell and specify pickup address.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">Receive Vendor Price Quote</h4>
                        <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                          Verified scrap partners inspect your request and send best pricing.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">Accept & Get Paid</h4>
                        <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                          Approve the offer. The partner arrives, weighs accurately, and pays on the spot.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              /* History Empty State */
              <div className="py-16 px-4 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100/90 mx-auto flex items-center justify-center text-gray-400 mb-4 border border-gray-200/60 shadow-xs">
                  <FiClock className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-800">No Scrap History</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1.5 leading-relaxed">
                  Completed scrap orders, rejected quotes, and cancelled requests will be recorded
                  here.
                </p>
                <button
                  onClick={() => {
                    flutterBridge.hapticFeedback?.('selection');
                    setActiveTab('active');
                  }}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs shadow-xs transition-colors"
                >
                  View Active Listings
                </button>
              </div>
            )
          ) : (
            /* Modernized Scrap Cards List */
            currentList.map((item) => (
              <div
                key={item._id}
                className="bg-white/95 rounded-[24px] shadow-xs hover:shadow-md p-4 border border-gray-100/90 active:scale-[0.99] transition-all cursor-pointer overflow-hidden relative group"
                onClick={() => setSelectedScrap(item)}
              >
                <div className="flex gap-3.5">
                  {/* Image preview with counter badge */}
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-gray-100 bg-gray-50 relative">
                    {item.images && item.images.length > 0 ? (
                      <>
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        {item.images.length > 1 && (
                          <span className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                            +{item.images.length - 1}
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                        <FiImage className="w-6 h-6" />
                        <span className="text-[9px] font-semibold mt-1">No Photo</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-extrabold text-gray-900 text-sm leading-tight truncate">
                          {item.title}
                        </h3>
                        {getStatusBadge(item.status, item.offeredPrice)}
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Metadata Footer */}
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2 font-medium">
                      <div className="flex items-center gap-1 truncate max-w-[170px]">
                        <FiMapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate">
                          {item.address?.city || item.address?.addressLine1 || 'Pickup Location'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <FiClock className="w-3 h-3" />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Offer Action Banner (When status === 'offered') */}
                {item.status === 'offered' && (
                  <div
                    className="mt-3.5 p-3.5 bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200/80 rounded-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        <span className="text-xs font-black text-amber-900 uppercase tracking-wide">
                          Vendor Quote Received
                        </span>
                      </div>
                      <span className="text-base font-black text-amber-900 bg-white/80 px-2 py-0.5 rounded-lg border border-amber-200 shadow-xs">
                        ₹{item.offeredPrice}
                      </span>
                    </div>

                    {item.adminNote && (
                      <p className="text-[11px] text-amber-850 mt-1.5 italic bg-white/50 p-2 rounded-xl border border-amber-100/60">
                        "{item.adminNote}"
                      </p>
                    )}

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) =>
                          handleRespondOffer(e, item._id, 'accept', item.offeredPrice)
                        }
                        disabled={respondingToOffer}
                        className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <FiCheck className="w-4 h-4" /> Approve ₹{item.offeredPrice}
                      </button>
                      <button
                        onClick={(e) =>
                          handleRespondOffer(e, item._id, 'reject', item.offeredPrice)
                        }
                        disabled={respondingToOffer}
                        className="py-2.5 px-3 bg-white hover:bg-rose-50 active:scale-95 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <FiX className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Row / Actions */}
                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  {item.status === 'accepted' ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <FiCheckCircle className="w-3.5 h-3.5" /> Pickup Scheduled{' '}
                      {item.finalPrice ? `• ₹${item.finalPrice}` : ''}
                    </span>
                  ) : (
                    <span className="text-gray-400 font-medium flex items-center gap-1">
                      Tap for details <FiChevronRight className="w-3 h-3" />
                    </span>
                  )}

                  {(item.status === 'pending' ||
                    item.status === 'cancelled' ||
                    item.status === 'rejected') && (
                    <button
                      onClick={(e) => handleDelete(e, item._id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                      title="Delete Listing"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-semibold">Delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Elevated Floating Action Button (FAB) */}
        <Motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            flutterBridge.hapticFeedback?.('medium');
            navigate('/user/scrap/add');
          }}
          className="fixed bottom-24 right-4 z-30 px-4 py-3.5 rounded-full shadow-lg flex items-center gap-2 text-white font-bold text-xs"
          style={{
            background: `linear-gradient(135deg, ${brandTeal} 0%, #235863 100%)`,
            boxShadow: `0 8px 24px -2px ${brandTeal}60`
          }}
          aria-label="Sell Scrap"
        >
          <FiPlus className="w-5 h-5" />
          <span className="pr-1 tracking-wide font-extrabold">Sell Scrap</span>
        </Motion.button>

        {/* User Scrap Details Bottom Sheet Modal */}
        <AnimatePresence>
          {selectedScrap && (
            <>
              {/* Backdrop */}
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedScrap(null)}
                className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-md"
              />

              {/* Sheet */}
              <Motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="fixed bottom-20 left-3 right-3 sm:left-4 sm:right-4 bg-white rounded-[32px] z-[70] max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col"
                onClick={(e) => e.stopPropagation()}
                style={{
                  boxShadow: '0 -20px 50px -10px rgba(0,0,0,0.35)'
                }}
              >
                {/* Drag Handle Indicator */}
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3" />

                {/* Modal Sticky Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-md z-10">
                  <div className="pr-2">
                    <h2 className="text-lg font-black text-gray-900 leading-tight">
                      {selectedScrap.title}
                    </h2>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Listed on {new Date(selectedScrap.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedScrap(null)}
                    className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 active:scale-90 transition-all shrink-0"
                    aria-label="Close"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 space-y-5">
                  {/* Status Progress Tracker */}
                  <div className="bg-gray-50/90 rounded-2xl p-3.5 border border-gray-100">
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 mb-2">
                      <span>Listing Status</span>
                      {getStatusBadge(selectedScrap.status, selectedScrap.offeredPrice)}
                    </div>
                    {/* Steps line */}
                    <div className="grid grid-cols-4 gap-1 pt-1">
                      {['Listed', 'Quoted', 'Accepted', 'Pickup'].map((step, idx) => {
                        const activeIdx = getTimelineStepIndex(selectedScrap.status);
                        const isDone = idx <= activeIdx;
                        return (
                          <div key={idx} className="flex flex-col items-center">
                            <div
                              className={`w-full h-1.5 rounded-full transition-colors ${
                                isDone ? 'bg-teal-600' : 'bg-gray-200'
                              }`}
                              style={isDone ? { backgroundColor: brandTeal } : {}}
                            />
                            <span
                              className={`text-[9px] font-bold mt-1.5 ${
                                isDone ? 'text-gray-900' : 'text-gray-400'
                              }`}
                            >
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Images Gallery */}
                  {selectedScrap.images && selectedScrap.images.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
                        Photos ({selectedScrap.images.length})
                      </span>
                      <div className="grid grid-cols-2 gap-2.5">
                        {selectedScrap.images.map((img, i) => (
                          <div
                            key={i}
                            className={`rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 ${
                              i === 0 && selectedScrap.images.length % 2 !== 0
                                ? 'col-span-2 aspect-video'
                                : 'aspect-square'
                            }`}
                          >
                            <img
                              src={img}
                              alt="Scrap preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price Offer Card inside Modal (If offered) */}
                  {selectedScrap.status === 'offered' && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 border-2 border-amber-200/90 p-4 rounded-3xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                            Partner Price Offer
                          </span>
                          <h4 className="text-2xl font-black text-amber-900 mt-0.5">
                            ₹{selectedScrap.offeredPrice}
                          </h4>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-amber-200/70 flex items-center justify-center text-amber-800 text-lg">
                          <FiTag />
                        </div>
                      </div>

                      {selectedScrap.adminNote && (
                        <div className="bg-white/90 p-3 rounded-2xl border border-amber-100 text-xs text-gray-700">
                          <p className="font-bold text-gray-500 text-[10px] uppercase">
                            Partner Note:
                          </p>
                          <p className="mt-0.5 italic">"{selectedScrap.adminNote}"</p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={(e) =>
                            handleRespondOffer(
                              e,
                              selectedScrap._id,
                              'accept',
                              selectedScrap.offeredPrice
                            )
                          }
                          disabled={respondingToOffer}
                          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <FiCheck className="w-4 h-4" /> Approve ₹{selectedScrap.offeredPrice}
                        </button>
                        <button
                          onClick={(e) =>
                            handleRespondOffer(
                              e,
                              selectedScrap._id,
                              'reject',
                              selectedScrap.offeredPrice
                            )
                          }
                          disabled={respondingToOffer}
                          className="px-4 py-3 bg-white hover:bg-rose-50 active:scale-95 text-rose-600 border border-rose-200 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <FiX className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Accepted Banner */}
                  {selectedScrap.status === 'accepted' && (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                        <FiCheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-900">
                          Offer Approved {selectedScrap.finalPrice ? `• ₹${selectedScrap.finalPrice}` : ''}
                        </h4>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          Doorstep pickup has been scheduled. Keep the scrap accessible.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {selectedScrap.description && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
                        Description
                      </span>
                      <div className="bg-gray-50/90 p-4 rounded-2xl border border-gray-100">
                        <p className="text-xs text-gray-700 leading-relaxed font-medium">
                          {selectedScrap.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Location Card */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
                      Pickup Address
                    </span>
                    <div className="bg-gray-50/90 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 mt-0.5">
                        <FiMapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">
                          {selectedScrap.address?.addressLine1 || 'Address details'}
                        </p>
                        {(selectedScrap.address?.city || selectedScrap.address?.state) && (
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {[
                              selectedScrap.address?.city,
                              selectedScrap.address?.state,
                              selectedScrap.address?.pincode
                            ]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex gap-2.5">
                  <button
                    onClick={() => setSelectedScrap(null)}
                    className="flex-1 py-3.5 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold text-xs shadow-md active:scale-95 transition-all text-center"
                  >
                    Close
                  </button>

                  {(selectedScrap.status === 'pending' ||
                    selectedScrap.status === 'cancelled' ||
                    selectedScrap.status === 'rejected') && (
                    <button
                      onClick={(e) => handleDelete(e, selectedScrap._id)}
                      className="px-5 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-2xl font-bold text-xs active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </Motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserScrapPage;
