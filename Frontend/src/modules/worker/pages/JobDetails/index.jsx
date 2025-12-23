import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiMapPin, FiPhone, FiClock, FiUser, FiCheck, FiX, FiArrowRight, FiNavigation, FiTool, FiCheckCircle, FiDollarSign } from 'react-icons/fi';
import { workerTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import workerService from '../../../../services/workerService';
import { toast } from 'react-hot-toast';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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
        setJob(response.data);
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

  const handleStatusUpdate = async (type) => {
    try {
      setActionLoading(true);
      let response;
      if (type === 'start') {
        response = await workerService.startJob(id);
      } else if (type === 'complete') {
        response = await workerService.completeJob(id);
      }

      if (response.success) {
        toast.success(response.message || 'Updated successfully');
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
      'confirmed': 'Assigned',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#F59E0B',
      'confirmed': '#3B82F6',
      'in_progress': '#F59E0B',
      'completed': '#10B981',
      'cancelled': '#EF4444',
    };
    return colors[status] || '#6B7280';
  };

  const statusColor = getStatusColor(job.status);

  return (
    <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
      <Header title="Job Details" />

      <main className="px-4 py-6">
        {/* Status Banner */}
        <div
          className="rounded-2xl p-4 mb-6 flex items-center justify-between shadow-lg"
          style={{ background: 'white', borderLeft: `6px solid ${statusColor}` }}
        >
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
            <p className="text-lg font-bold" style={{ color: statusColor }}>{getStatusLabel(job.status).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Earning</p>
            <p className="text-2xl font-black text-gray-900">₹{job.finalAmount}</p>
          </div>
        </div>

        {/* Action Button Section */}
        <div className="mb-6">
          {job.status === 'confirmed' && (
            <button
              onClick={() => handleStatusUpdate('start')}
              disabled={actionLoading}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all text-lg"
              style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}
            >
              {actionLoading ? 'Loading...' : <>START JOURNEY <FiNavigation className="w-5 h-5" /></>}
            </button>
          )}

          {job.status === 'in_progress' && (
            <button
              onClick={() => handleStatusUpdate('complete')}
              disabled={actionLoading}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all text-lg"
              style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
            >
              {actionLoading ? 'Loading...' : <>COMPLETE WORK <FiCheckCircle className="w-5 h-5" /></>}
            </button>
          )}

          {job.status === 'completed' && (
            <div className="bg-green-100 border-2 border-green-500 rounded-2xl p-4 text-center text-green-700 font-bold shadow-md">
              <FiCheckCircle className="w-8 h-8 mx-auto mb-2" />
              JOB COMPLETED SUCCESSFULLY
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

        {/* Pricing Summary */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-md border-b-2 border-gray-50">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiDollarSign className="w-5 h-5 text-green-600" /> Payment Summary
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Base Price</span>
              <span className="font-medium">₹{job.baseAmount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Service Fee</span>
              <span className="font-medium">₹{job.serviceFee}</span>
            </div>
            {job.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-₹{job.discountAmount}</span>
              </div>
            )}
            <div className="pt-3 border-t border-dashed border-gray-100 flex justify-between items-center">
              <span className="font-bold text-gray-900 text-lg uppercase">Total</span>
              <span className="font-black text-2xl text-green-600">₹{job.finalAmount}</span>
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

      <BottomNav />
    </div>
  );
};

export default JobDetails;
