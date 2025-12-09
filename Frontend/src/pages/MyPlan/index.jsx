import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const MyPlan = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 text-black" />
            </button>
            <h1 className="text-xl font-bold text-black">My plan</h1>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        {/* Active Plans Section */}
        <div>
          <h2 className="text-xl font-bold text-black mb-2">Active plans</h2>
          <p className="text-sm text-gray-600">You have no active plans</p>
        </div>
      </main>
    </div>
  );
};

export default MyPlan;

