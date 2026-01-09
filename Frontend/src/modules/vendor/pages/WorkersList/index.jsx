import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiPlus, FiEdit2, FiTrash2, FiSearch, FiUser, FiBriefcase, FiPhone } from 'react-icons/fi';
import { vendorTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import { getWorkers, deleteWorker } from '../../services/workerService';

const WorkersList = () => {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

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
    const loadWorkers = async () => {
      try {
        const response = await getWorkers();
        const mapped = (response.data || response).map(w => ({
          ...w,
          id: w._id || w.id
        }));
        setWorkers(mapped || []);
      } catch (error) {
        console.error('Error loading workers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkers();
    window.addEventListener('vendorWorkersUpdated', loadWorkers);

    return () => {
      window.removeEventListener('vendorWorkersUpdated', loadWorkers);
    };
  }, []);

  const handleDelete = async (workerId) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      try {
        await deleteWorker(workerId);
        setWorkers(workers.filter(w => w.id !== workerId));
        window.dispatchEvent(new Event('vendorWorkersUpdated'));
      } catch (error) {
        console.error('Error deleting worker:', error);
        alert('Failed to delete worker');
      }
    }
  };

  const filteredWorkers = workers.filter(worker => {
    const matchesFilter = filter === 'all' ||
      (filter === 'online' && worker.availability === 'ONLINE') ||
      (filter === 'offline' && worker.availability === 'OFFLINE');

    const matchesSearch = searchQuery === '' ||
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.phone.includes(searchQuery);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
      <Header title="Workers" />

      <main className="px-4 py-6">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search workers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-0"
              style={{ focusRingColor: themeColors.button }}
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'all', label: 'All' },
            { id: 'online', label: 'Online' },
            { id: 'offline', label: 'Offline' },
          ].map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${filter === filterOption.id
                ? 'text-white'
                : 'bg-white text-gray-700'
                }`}
              style={
                filter === filterOption.id
                  ? {
                    background: themeColors.button,
                    boxShadow: `0 2px 8px ${themeColors.button}40`,
                  }
                  : {
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }
              }
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        {/* Workers List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-transparent rounded-full animate-spin" style={{ borderTopColor: themeColors.button }}></div>
            <p className="mt-4 text-gray-500 font-medium">Loading workers...</p>
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div
            className="bg-white rounded-xl p-8 text-center shadow-md"
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <FiUsers className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 font-semibold mb-2">No workers found</p>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery ? 'Try a different search term' : 'Add your first worker to get started'}
            </p>
            <button
              onClick={() => navigate('/vendor/workers/add')}
              className="px-6 py-3 rounded-xl font-semibold text-white"
              style={{
                background: themeColors.button,
                boxShadow: `0 4px 12px ${themeColors.button}40`,
              }}
            >
              Add Worker
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredWorkers.map((worker, index) => {
              const getAvailabilityColor = (availability) => {
                return availability === 'ONLINE' ? themeColors.icon : '#94A3B8';
              };

              const statusColor = getAvailabilityColor(worker.availability);
              const hexToRgba = (hex, alpha) => {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
              };

              return (
                <div
                  key={worker.id || index}
                  className="rounded-xl p-4 shadow-lg cursor-pointer active:scale-98 transition-all duration-200 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
                    boxShadow: `0 8px 24px ${hexToRgba(statusColor, 0.15)}, 0 4px 12px ${hexToRgba(statusColor, 0.1)}, 0 0 0 2px ${hexToRgba(statusColor, 0.2)}`,
                    border: `2px solid ${hexToRgba(statusColor, 0.3)}`,
                  }}
                >
                  {/* Left border accent */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                    style={{
                      background: `linear-gradient(180deg, ${statusColor} 0%, ${statusColor}dd 100%)`,
                    }}
                  />

                  <div className="relative z-10 pl-2">
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="p-1 rounded-lg"
                            style={{
                              background: `${statusColor}15`,
                            }}
                          >
                            {worker.profilePhoto ? (
                              <img src={worker.profilePhoto} alt={worker.name} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <FiUser className="w-4 h-4" style={{ color: statusColor }} />
                            )}
                          </div>
                          <h3 className="font-bold text-gray-800 text-base">{worker.name}</h3>
                        </div>
                        <div className="ml-8 mb-2">
                          <span
                            className="text-xs font-bold px-3 py-1.5 rounded-full"
                            style={{
                              background: `linear-gradient(135deg, ${statusColor} 0%, ${statusColor}dd 100%)`,
                              color: '#FFFFFF',
                              boxShadow: `0 2px 8px ${hexToRgba(statusColor, 0.3)}`,
                            }}
                          >
                            {worker.availability}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/vendor/workers/${worker.id}/edit`);
                          }}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          style={{ color: themeColors.button }}
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(worker.id);
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-500"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Info Section */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-1 rounded" style={{ background: 'rgba(0, 0, 0, 0.03)' }}>
                          <FiPhone className="w-4 h-4" style={{ color: statusColor }} />
                        </div>
                        <span className="text-gray-700 font-medium">{worker.phone}</span>
                      </div>

                      {worker.skills && worker.skills.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="p-1 rounded" style={{ background: 'rgba(0, 0, 0, 0.03)' }}>
                            <FiBriefcase className="w-4 h-4" style={{ color: statusColor }} />
                          </div>
                          <div className="flex flex-wrap gap-1.5 flex-1">
                            {worker.skills.slice(0, 3).map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 rounded text-xs font-semibold"
                                style={{
                                  background: `${statusColor}15`,
                                  color: statusColor,
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                            {worker.skills.length > 3 && (
                              <span className="px-2 py-0.5 rounded text-xs font-semibold text-gray-600 bg-gray-100">
                                +{worker.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {worker.currentJob ? (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="p-1 rounded" style={{ background: 'rgba(0, 0, 0, 0.03)' }}>
                            <FiBriefcase className="w-4 h-4" style={{ color: statusColor }} />
                          </div>
                          <span className="text-gray-700 font-medium">
                            Assigned to: <span className="font-semibold">{worker.currentJob}</span>
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="p-1 rounded" style={{ background: 'rgba(0, 0, 0, 0.03)' }}>
                            <FiBriefcase className="w-4 h-4" style={{ color: statusColor }} />
                          </div>
                          <span className="text-gray-700 font-medium">Available for assignment</span>
                        </div>
                      )}

                      {worker.stats && (
                        <div className="flex items-center gap-4 pt-1">
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded" style={{ background: 'rgba(0, 0, 0, 0.03)' }}>
                              <FiBriefcase className="w-4 h-4" style={{ color: statusColor }} />
                            </div>
                            <span className="text-gray-700 font-medium">
                              <span className="font-bold" style={{ color: statusColor }}>
                                {worker.stats.jobsCompleted || 0}
                              </span>{' '}
                              jobs
                            </span>
                          </div>
                          {worker.stats.rating && (
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">⭐</span>
                              <span className="text-gray-700 font-medium">
                                <span className="font-bold">{worker.stats.rating}</span> rating
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate('/vendor/workers/add')}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 z-40"
        style={{
          background: themeColors.button,
          boxShadow: `0 8px 24px ${themeColors.button}50`,
        }}
      >
        <FiPlus className="w-6 h-6 text-white" />
      </button>

      <BottomNav />
    </div>
  );
};

export default WorkersList;

