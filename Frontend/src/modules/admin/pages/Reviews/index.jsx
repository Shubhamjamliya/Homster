import React, { useState, useEffect, useMemo } from 'react';
import {
  FiStar,
  FiEye,
  FiEyeOff,
  FiTrash2,
  FiSearch,
  FiUser,
  FiBriefcase,
  FiBox,
  FiX,
  FiMessageSquare,
  FiImage,
  FiCheckCircle,
  FiCalendar,
  FiTag,
  FiAward
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import reviewService from '../../services/reviewService';
import Pagination from '../../components/Pagination';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    rating: '',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1
  });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getAllReviews(filters);
      if (response.success) {
        setReviews(response.data || []);
        setPagination(response.pagination || { total: 0, pages: 1 });
      }
    } catch (error) {
      console.error('Fetch reviews error:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await reviewService.getReviewStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await reviewService.updateReviewStatus(id, newStatus);
      if (response.success) {
        toast.success(`Review marked as ${newStatus}`);
        fetchReviews();
        fetchStats();
      }
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Failed to update status');
    }
  };

  // Client-side search filtering across customer name, phone, review text, vendor, service
  const filteredReviews = useMemo(() => {
    if (!searchQuery.trim()) return reviews;
    const q = searchQuery.toLowerCase().trim();
    return reviews.filter(r => {
      const customer = (r.userId?.name || '').toLowerCase();
      const phone = (r.userId?.phone || '').toLowerCase();
      const reviewText = (r.review || '').toLowerCase();
      const vendor = (r.vendorId?.businessName || '').toLowerCase();
      const service = (r.serviceId?.title || '').toLowerCase();
      const bookingNo = (r.bookingId?.bookingNumber || '').toLowerCase();
      return (
        customer.includes(q) ||
        phone.includes(q) ||
        reviewText.includes(q) ||
        vendor.includes(q) ||
        service.includes(q) ||
        bookingNo.includes(q)
      );
    });
  }, [reviews, searchQuery]);

  const renderStars = (rating, size = 'w-3.5 h-3.5') => {
    const safeRating = Math.round(Number(rating) || 0);
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`${size} ${
              star <= safeRating 
                ? 'text-amber-400 fill-amber-400' 
                : 'text-slate-200 fill-slate-100'
            }`}
          />
        ))}
      </div>
    );
  };

  // Helper for percentage distribution
  const totalCount = stats?.totalReviews || 0;
  const getPercentage = (count) => {
    if (!totalCount || !count) return 0;
    return Math.round((count / totalCount) * 100);
  };

  const isFilterActive = filters.rating !== '' || filters.status !== '' || searchQuery.trim() !== '';

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilters({
      page: 1,
      limit: 10,
      status: '',
      rating: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Average Rating */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Average Rating
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Score
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
              </span>
              <div className="flex flex-col">
                {renderStars(stats.averageRating, 'w-4 h-4')}
                <span className="text-[10px] text-slate-400 font-semibold mt-0.5">out of 5.0 stars</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Customer Satisfaction</span>
              <span className="font-bold text-emerald-600">
                {stats.averageRating ? Math.round((stats.averageRating / 5) * 100) : 0}%
              </span>
            </div>
          </div>

          {/* Card 2: Total Reviews */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Reviews
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FiMessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {stats.totalReviews || 0}
              </span>
              <span className="text-xs text-slate-500 font-medium">all-time feedback</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Moderated
              </span>
            </div>
          </div>

          {/* Card 3: 5-Star Excellence */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                5-Star Excellence
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FiAward className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {stats.star5 || 0}
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                {getPercentage(stats.star5)}% of total
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Top Tier Service</span>
              <span className="font-semibold text-slate-700">Perfect Rating</span>
            </div>
          </div>

          {/* Card 4: Quick Rating Breakdown & Interactive Filter */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Rating Breakdown
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Click to filter</span>
            </div>
            <div className="space-y-1.5">
              {[
                { stars: 5, count: stats.star5 || 0 },
                { stars: 4, count: stats.star4 || 0 },
                { stars: 3, count: stats.star3 || 0 },
                { stars: 2, count: stats.star2 || 0 },
                { stars: 1, count: stats.star1 || 0 }
              ].map((item) => {
                const pct = getPercentage(item.count);
                const isSelected = String(filters.rating) === String(item.stars);
                return (
                  <button
                    key={item.stars}
                    type="button"
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        rating: isSelected ? '' : String(item.stars),
                        page: 1
                      }));
                    }}
                    className={`w-full flex items-center gap-2 px-1.5 py-0.5 rounded-md text-left transition-all ${
                      isSelected ? 'bg-blue-50 ring-1 ring-blue-500/30' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-slate-700 w-5 shrink-0 flex items-center gap-0.5">
                      {item.stars}<span className="text-amber-400">★</span>
                    </span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.stars >= 4 ? 'bg-amber-400' : item.stars === 3 ? 'bg-amber-300' : 'bg-rose-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 w-8 text-right shrink-0">
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <FiSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, vendor, service, or keyword..."
            className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Controls: Rating & Status */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Rating Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Rating:</span>
            <select
              value={filters.rating}
              onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value, page: 1 }))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none cursor-pointer"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars ★★★★★</option>
              <option value="4">4 Stars ★★★★☆</option>
              <option value="3">3 Stars ★★★☆☆</option>
              <option value="2">2 Stars ★★☆☆☆</option>
              <option value="1">1 Star ★☆☆☆☆</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Status:</span>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="active">Active (Visible)</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {isFilterActive && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-all flex items-center gap-1"
            >
              <FiX className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Reviews Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80">
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider min-w-[280px]">
                  Feedback & Rating
                </th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Service & Vendor
                </th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Visibility
                </th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-slate-500 mt-3 text-xs font-semibold">Loading reviews...</p>
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-slate-500">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <FiMessageSquare className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-slate-800">No reviews found</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {isFilterActive 
                        ? 'Try clearing or changing your filters to see more results.' 
                        : 'No reviews have been submitted yet.'}
                    </p>
                    {isFilterActive && (
                      <button
                        onClick={clearAllFilters}
                        className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => {
                  const userInitial = review.userId?.name?.charAt(0).toUpperCase() || 'U';
                  const formattedDate = new Date(review.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <tr 
                      key={review._id} 
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Customer Column */}
                      <td className="px-5 py-4 align-top">
                        <div className="flex items-start gap-3">
                          {review.userId?.profilePhoto ? (
                            <img
                              src={review.userId.profilePhoto}
                              alt={review.userId.name || 'User'}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs shrink-0">
                              {userInitial}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm leading-snug truncate">
                              {review.userId?.name || 'Customer'}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {review.userId?.phone || review.userId?.email || 'No contact info'}
                            </p>
                            {review.isVerified && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 mt-0.5">
                                <FiCheckCircle className="w-2.5 h-2.5" /> Verified User
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Feedback & Rating Column */}
                      <td className="px-5 py-4 align-top max-w-md">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            {renderStars(review.rating)}
                            <span className="text-xs font-black text-slate-800">
                              {review.rating}.0
                            </span>
                            <span className="text-slate-300">•</span>
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                              <FiCalendar className="w-3 h-3" />
                              <span>{formattedDate}</span>
                            </div>
                          </div>

                          <p className="text-slate-700 text-xs leading-relaxed font-normal">
                            {review.review || (
                              <span className="italic text-slate-400">No written comment provided</span>
                            )}
                          </p>

                          {/* Image attachments if any */}
                          {review.images && review.images.length > 0 && (
                            <div className="flex items-center gap-2 pt-1">
                              {review.images.map((imgUrl, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setSelectedImage(imgUrl)}
                                  className="relative w-11 h-11 rounded-lg overflow-hidden border border-slate-200 hover:border-blue-500 shadow-xs transition-all hover:scale-105 shrink-0"
                                >
                                  <img 
                                    src={imgUrl} 
                                    alt={`Review attachment ${i + 1}`} 
                                    className="w-full h-full object-cover" 
                                  />
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Booking reference tag */}
                          {review.bookingId?.bookingNumber && (
                            <div className="pt-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                <FiTag className="w-2.5 h-2.5" />
                                <span>#{review.bookingId.bookingNumber}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Service & Vendor Column */}
                      <td className="px-5 py-4 align-top">
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            <FiBriefcase className="text-slate-400 w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[160px]">
                              {review.vendorId?.businessName || review.vendorId?.name || 'Direct / Platform'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-slate-600">
                            <FiBox className="text-slate-400 w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[160px]">
                              {review.serviceId?.title || 'General Service'}
                            </span>
                          </div>

                          {review.workerId?.name && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              <FiUser className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[150px]">
                                Worker: {review.workerId.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Visibility Status Column */}
                      <td className="px-5 py-4 align-top">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          review.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/80'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            review.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                          }`} />
                          {review.status === 'active' ? 'Visible' : 'Hidden'}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="px-5 py-4 align-top text-right">
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/60 shadow-2xs">
                          {review.status === 'active' ? (
                            <button
                              onClick={() => handleStatusUpdate(review._id, 'hidden')}
                              className="p-1.5 text-amber-600 hover:bg-amber-100/70 rounded-lg transition-colors"
                              title="Hide Review from Public"
                            >
                              <FiEyeOff className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusUpdate(review._id, 'active')}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-100/70 rounded-lg transition-colors"
                              title="Publish / Unhide Review"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to permanently delete this review?')) {
                                handleStatusUpdate(review._id, 'deleted');
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-100/70 hover:text-rose-700 rounded-lg transition-colors"
                            title="Delete Review"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Standardized Pagination Footer */}
        {!loading && reviews.length > 0 && (
          <Pagination
            currentPage={filters.page}
            totalPages={pagination.pages || 1}
            totalItems={pagination.total || reviews.length}
            itemsPerPage={filters.limit || 10}
            itemName="reviews"
            onPageChange={(newPage) => setFilters(prev => ({ ...prev, page: newPage }))}
            onLimitChange={(newLimit) => setFilters(prev => ({ ...prev, limit: newLimit, page: 1 }))}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        )}
      </div>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2 border border-white/20" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full transition-all"
            >
              <FiX className="w-5 h-5" />
            </button>
            <img
              src={selectedImage}
              alt="Review attachment"
              className="w-full h-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
