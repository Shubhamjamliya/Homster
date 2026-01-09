import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiMapPin, FiPhone, FiClock, FiUser, FiCheck, FiX, FiArrowRight, FiNavigation, FiTool, FiCheckCircle, FiDollarSign, FiCamera, FiPlus, FiTrash, FiXCircle } from 'react-icons/fi';
import { workerTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import { CashCollectionModal } from '../../../../components/common';
import workerService from '../../../../services/workerService';
import api from '../../../../services/api';
import { toast } from 'react-hot-toast';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [otpInput, setOtpInput] = useState(['', '', '', '']); // Array for 4 digit OTP
  const [workPhotos, setWorkPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [collectionAmount, setCollectionAmount] = useState('');

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

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await workerService.getJobById(id);
      if (response.success) {
        // Map items for consistency
        const data = response.data;
        setJob({
          ...data,
          items: data.bookedItems || []
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Failed to load job details');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    // Mimic upload process using FileReader (Converting to Base64 for now)
    const uploadPromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(uploadPromises).then(urls => {
      setWorkPhotos(prev => [...prev, ...urls]);
      setIsUploading(false);
    });
  };

  const handleRemovePhoto = (index) => {
    setWorkPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otpInput];
    newOtp[index] = value;
    setOtpInput(newOtp);

    // Auto focus next
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const verifyVisit = async () => {
    const otp = otpInput.join('');
    if (otp.length !== 4) return toast.error('Please enter valid 4-digit OTP');

    setActionLoading(true);
    // Get Location
    if (!navigator.geolocation) {
      setActionLoading(false);
      return toast.error('Geolocation is not supported by your browser');
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        const response = await workerService.verifyVisit(id, otp, location);
        if (response.success) {
          toast.success('Site visit verified!');
          setIsVisitModalOpen(false);
          setOtpInput(['', '', '', '']);
          fetchJobDetails();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Verification failed');
      } finally {
        setActionLoading(false);
      }
    }, (err) => {
      console.error(err);
      toast.error('Unable to retrieve your location');
      setActionLoading(false);
    });
  };

  const handleInitiateCashOTP = async (totalAmount, extraItems = []) => {
    try {
      setActionLoading(true);
      const res = await workerService.initiateCashCollection(id, totalAmount, extraItems);
      if (res.success) {
        return res;
      } else {
        throw new Error(res.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Initiate cash error:', error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCash = async (totalAmount, extraItems, otp) => {
    try {
      setActionLoading(true);
      const response = await workerService.collectCash(id, otp, totalAmount, extraItems);
      if (response.success) {
        toast.success('Payment collected & Job Completed!');
        setIsPaymentModalOpen(false);
        fetchJobDetails();
      }
    } catch (error) {
      console.error('Confirm cash error:', error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleJobResponse = async (status) => {
    try {
      setActionLoading(true);
      const response = (await api.put(`/workers/jobs/${id}/respond`, { status })).data;
      if (response.success) {
        toast.success(status === 'ACCEPTED' ? 'Job Accepted' : 'Job Declined');
        if (status === 'ACCEPTED') {
          fetchJobDetails();
        } else {
          navigate('/worker/jobs');
        }
      } else {
        toast.error(response.message || 'Failed');
      }
    } catch (error) {
      console.error('Response error:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (type) => {
    if (type === 'visit' && !isVisitModalOpen) {
      setOtpInput(['', '', '', '']);
      setIsVisitModalOpen(true);
      return;
    }

    if (type === 'collect' && !isPaymentModalOpen) {
      setOtpInput(['', '', '', '']);
      setCollectionAmount(job.finalAmount);
      setIsPaymentModalOpen(true);
      return;
    }

    if (type === 'complete' && !isCompletionModalOpen) {
      setIsCompletionModalOpen(true);
      return;
    }

    try {
      setActionLoading(true);
      let response;
      if (type === 'start') {
        response = await workerService.startJob(id);
      } else if (type === 'complete') {
        if (workPhotos.length === 0) {
          toast.error('Please upload at least one work photo');
          setActionLoading(false);
          return;
        }
        response = await workerService.completeJob(id, { workPhotos });
      }

      if (response.success) {
        toast.success(response.message || 'Updated successfully');
        setIsCompletionModalOpen(false);
        fetchJobDetails();
      }
      setActionLoading(false);
    } catch (error) {
      console.error('Action error:', error);
      toast.error(error.response?.data?.message || 'Action failed');
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: themeColors.backgroundGradient }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.button }}></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center" style={{ background: themeColors.backgroundGradient }}>
        <div>
          <FiXCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-bold text-xl mb-4">Job not found</p>
          <button onClick={() => navigate('/worker/jobs')} className="px-6 py-3 bg-blue-600 text-white rounded-xl">Back to Jobs</button>
        </div>
      </div>
    );
  }

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending',
      'confirmed': 'Assigned', // Legacy?
      'assigned': 'Assigned',
      'visited': 'Visited',
      'journey_started': 'On The Way',
      'in_progress': 'In Progress',
      'work_done': 'Work Done',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
    };
    return labels[status.toLowerCase()] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#F59E0B',
      'confirmed': '#3B82F6',
      'assigned': '#3B82F6',
      'journey_started': '#3B82F6',
      'visited': '#F59E0B',
      'in_progress': '#F59E0B',
      'work_done': '#10B981',
      'completed': '#10B981',
      'cancelled': '#EF4444',
    };
    return colors[status.toLowerCase()] || '#6B7280';
  };

  const getTimelineStep = (status) => {
    switch (status) {
      case 'confirmed':
      case 'assigned': return 0;
      case 'journey_started': return 1;
      case 'visited':
      case 'in_progress': return 2;
      case 'work_done': return 3;
      case 'completed': return 4;
      default: return -1;
    }
  };

  const currentStep = getTimelineStep(job.status);
  const statusColor = getStatusColor(job.status || 'pending');

  return (
    <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
      <Header title="Job Details" />

      <main className="px-4 py-6">
        {/* View Timeline Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/worker/job/${id}/timeline`)}
            className="w-full bg-white border border-gray-200 py-4 rounded-2xl font-bold text-gray-700 flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all text-lg mb-4"
          >
            <FiClock className="w-5 h-5 text-gray-500" />
            View Job Timeline
          </button>

          {(!job.workerResponse || job.workerResponse === 'PENDING') && (job.status === 'confirmed' || job.status === 'assigned' || job.status === 'pending') && (
            <div className="flex gap-3 mb-4 animate-in slide-in-from-top-2">
              <button
                onClick={() => handleJobResponse('REJECTED')}
                disabled={actionLoading}
                className="flex-1 py-4 rounded-2xl font-bold text-red-500 bg-red-50 border border-red-100 shadow-sm active:scale-95 transition-all"
              >
                DECLINE
              </button>
              <button
                onClick={() => handleJobResponse('ACCEPTED')}
                disabled={actionLoading}
                className="flex-1 py-4 rounded-2xl font-bold text-white shadow-xl active:scale-95 transition-all"
                style={{ background: themeColors.button }}
              >
                ACCEPT JOB
              </button>
            </div>
          )}

          {job.workerResponse === 'ACCEPTED' && (job.status === 'confirmed' || job.status === 'assigned') && (
            <button
              onClick={() => handleStatusUpdate('start')}
              disabled={actionLoading}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all text-lg"
              style={{ background: themeColors.button }}
            >
              {actionLoading ? 'Loading...' : <>START JOURNEY <FiNavigation className="w-5 h-5" /></>}
            </button>
          )}

          {job.status === 'journey_started' && (
            <button
              onClick={() => handleStatusUpdate('visit')}
              disabled={actionLoading}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all text-lg"
              style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}
            >
              <FiMapPin className="w-5 h-5" /> ARRIVED (VERIFY OTP)
            </button>
          )}

          {(job.status === 'visited' || job.status === 'in_progress') && (
            <button
              onClick={() => handleStatusUpdate('complete')}
              disabled={actionLoading}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all text-lg"
              style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
            >
              {actionLoading ? 'Loading...' : <>COMPLETE WORK <FiCheckCircle className="w-5 h-5" /></>}
            </button>
          )}

          {job.status === 'work_done' && (
            <button
              onClick={() => handleStatusUpdate('collect')}
              disabled={actionLoading}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all text-lg"
              style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
            >
              <FiDollarSign className="w-5 h-5" /> COLLECT CASH
            </button>
          )}

          {job.status === 'completed' && (
            <div className="bg-green-100 border-2 border-green-500 rounded-2xl p-4 text-center text-green-700 font-bold shadow-md">
              <FiCheckCircle className="w-8 h-8 mx-auto mb-2" />
              JOB COMPLETED & SETTLED
            </div>
          )}
        </div>

        {/* Customer Info Card */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-gray-50">
              <FiUser className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">{job.userId?.name || 'Customer'}</h3>
              <p className="text-sm text-gray-500">{job.serviceName}</p>
            </div>
            {job.userId?.phone && (
              <a href={`tel:${job.userId.phone}`} className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 active:scale-90 transition-transform">
                <FiPhone className="w-5 h-5" />
              </a>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-50">
            {/* Address Card with Map */}
            <div className="mt-4 bg-blue-50 rounded-xl p-3 border border-blue-100">
              <div className="flex items-start gap-3 mb-3">
                <FiMapPin className="w-5 h-5 mt-0.5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-400 uppercase">Service Location</p>
                  <p className="font-semibold text-gray-800 text-sm">
                    {job.address?.addressLine1}, {job.address?.city}
                  </p>
                </div>
              </div>

              {/* Map Embed */}
              <div
                className="w-full h-40 rounded-lg overflow-hidden mb-3 bg-gray-200 border border-blue-100 relative group cursor-pointer"
                onClick={() => navigate(`/worker/job/${id}/map`)}
              >
                {(() => {
                  const fullAddress = `${job.address?.addressLine1 || ''}, ${job.address?.city || ''}`;
                  const mapQuery = encodeURIComponent(fullAddress);

                  return (
                    <>
                      <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0, pointerEvents: 'none' }}
                        src={`https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`}
                        allowFullScreen
                        tabIndex="-1"
                      ></iframe>
                      {/* Overlay to intercept clicks */}
                      <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors flex items-center justify-center">
                        <span className="bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          View Route
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>

              <button
                onClick={() => navigate(`/worker/job/${id}/map`)}
                className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 active:scale-95 transition-transform"
                style={{ background: themeColors.button }}
              >
                <FiNavigation className="w-4 h-4" />
                View Route
              </button>
            </div>

            <div className="flex items-start gap-3">
              <FiClock className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Scheduled Time</p>
                <p className="text-sm text-gray-700 font-medium">
                  {new Date(job.scheduledDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <p className="text-sm font-bold text-blue-600 mt-0.5">{job.scheduledTime}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Booked Services List */}
        {job.items && job.items.length > 0 && (
          <div className="bg-white rounded-2xl p-5 mb-6 shadow-md">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiTool className="w-5 h-5 text-gray-500" /> Booked Services
            </h4>
            <div className="space-y-4">
              {job.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-bold text-gray-800">{item.card?.title || 'Service Item'}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase">{item.sectionTitle || 'General'}</p>
                    {item.card?.features && item.card.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.card.features.map((f, i) => (
                          <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">Qty: {item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Summary */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-md border-b-2 border-gray-50">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiDollarSign className="w-5 h-5 text-green-600" /> Payment Summary
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Base Price</span>
              <span className="font-medium">₹{job.basePrice || job.baseAmount || 0}</span>
            </div>
            {job.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">GST (18%)</span>
                <span className="font-medium">₹{job.tax || 0}</span>
              </div>
            )}
            {(job.visitingCharges > 0 || job.visitationFee > 0) && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Convenience Fee</span>
                <span className="font-medium">₹{job.visitingCharges || job.visitationFee || 0}</span>
              </div>
            )}
            {job.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-₹{job.discount}</span>
              </div>
            )}
            <div className="pt-3 border-t border-dashed border-gray-100 flex justify-between items-center">
              <span className="font-bold text-gray-900 text-lg uppercase">Total</span>
              <span className="font-black text-2xl text-green-600">₹{job.finalAmount || ((job.basePrice || 0) + (job.tax || 0) - (job.discount || 0))}</span>
            </div>
          </div>
        </div>

        {/* Booking Details Extra */}
        <div className="bg-gray-50 rounded-2xl p-5 shadow-inner mb-6 border border-gray-100">
          <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-4">
            <span>Booking Number</span>
            <span className="text-gray-600">{job.bookingNumber}</span>
          </div>

          {job.status === 'completed' && (
            <div className="mb-2">
              <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-1">
                <span>Completed At</span>
                <span className="text-gray-600">{new Date(job.completedAt).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Completion Modal */}
      {isCompletionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-gray-900">Finish Job</h3>
                <button onClick={() => setIsCompletionModalOpen(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-8">
                <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-4">Upload Work Photos</p>

                <div className="grid grid-cols-3 gap-3">
                  {workPhotos.map((photo, index) => (
                    <div key={index} className="aspect-square rounded-2xl bg-gray-100 border-2 border-gray-50 relative overflow-hidden shadow-sm">
                      <img src={photo} className="w-full h-full object-cover" alt="work" />
                      <button
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow-md active:scale-95"
                      >
                        <FiTrash className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {workPhotos.length < 3 && (
                    <label className="aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer active:scale-95 transition-transform hover:bg-gray-100">
                      <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                      <FiCamera className="w-8 h-8 mb-1" />
                      <span className="text-[10px] font-black uppercase">Add Photo</span>
                    </label>
                  )}
                </div>

                {isUploading && <p className="text-blue-500 text-[10px] font-bold mt-2 animate-pulse">UPLOADING...</p>}
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                      <FiDollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-green-600 uppercase">Collect Cash</p>
                      <p className="text-xl font-black text-green-700">₹{job.finalAmount || ((job.basePrice || 0) + (job.tax || 0) - (job.discount || 0))}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 mb-2">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> Upon completion, an OTP will be sent to the customer. You will need to enter it next to confirm payment.
                  </p>
                </div>

                <p className="text-xs text-center text-gray-400 font-medium">By clicking complete, you confirm that the work is finished.</p>

                <button
                  onClick={() => handleStatusUpdate('complete')}
                  disabled={actionLoading || isUploading || workPhotos.length === 0}
                  className="w-full py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 shadow-xl shadow-green-500/30 active:scale-95 transition-all text-lg"
                  style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
                >
                  {actionLoading ? 'UPDATING...' : 'MARK WORK DONE'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visit OTP Modal */}
      {isVisitModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Verify Site Visit</h3>
              <button onClick={() => setIsVisitModalOpen(false)}><FiX className="w-6 h-6" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-6">Enter the 4-digit OTP sent to the customer to verify your arrival.</p>

            <div className="flex gap-3 justify-center mb-8">
              {[0, 1, 2, 3].map((i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="number"
                  value={otpInput[i]}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  className="w-12 h-14 rounded-xl border-2 border-gray-200 text-center text-2xl font-bold focus:border-blue-500 focus:outline-none"
                  maxLength={1}
                />
              ))}
            </div>

            <button
              onClick={verifyVisit}
              disabled={actionLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200"
            >
              {actionLoading ? 'Verifying...' : 'Verify & Check-in'}
            </button>
          </div>
        </div>
      )}

      {/* Unified Cash Collection Modal */}
      <CashCollectionModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        booking={job}
        onInitiateOTP={handleInitiateCashOTP}
        onConfirm={handleConfirmCash}
        loading={actionLoading}
      />
    </div>
  );
};

export default JobDetails;
