import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiChevronRight } from 'react-icons/fi';
import { MdAccountBalanceWallet } from 'react-icons/md';

const Wallet = () => {
  const navigate = useNavigate();
  const walletBalance = 0;

  // Sample wallet items/transactions
  const walletItems = [
    {
      id: 1,
      type: 'credit',
      title: 'Referral Bonus',
      description: 'Earned from friend referral',
      amount: 100,
      date: '2 days ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'debit',
      title: 'Service Payment',
      description: 'Electrician service booking',
      amount: 500,
      date: '5 days ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'credit',
      title: 'Cashback',
      description: 'Cashback on salon booking',
      amount: 50,
      date: '1 week ago',
      status: 'completed'
    },
    {
      id: 4,
      type: 'debit',
      title: 'Service Payment',
      description: 'AC service booking',
      amount: 800,
      date: '2 weeks ago',
      status: 'completed'
    }
  ];

  return (
    <div className="min-h-screen bg-white pb-4">
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
            <h1 className="text-xl font-bold text-black">Wallet</h1>
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        {/* Referral Banner */}
        <div className="bg-gray-100 rounded-xl p-4 mb-4 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-lg font-bold text-black mb-1">Refer your friends and earn</h2>
            <p className="text-sm text-gray-700">They get ₹100 and you get ₹100</p>
          </div>
          {/* Gift Box Illustration */}
          <div className="absolute right-4 top-2 z-0">
            <div className="relative">
              <div className="w-20 h-20 bg-purple-400 rounded-lg flex items-center justify-center transform rotate-12 shadow-md">
                <div className="w-16 h-16 bg-pink-300 rounded-lg flex items-center justify-center">
                  <span className="text-3xl">🎁</span>
                </div>
              </div>
              {/* Sparkles */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-200 rounded-full"></div>
              <div className="absolute top-4 -left-2 w-2 h-2 bg-white rounded-full opacity-80"></div>
              <div className="absolute bottom-4 -right-2 w-2 h-2 bg-white rounded-full opacity-80"></div>
            </div>
          </div>
        </div>

        {/* UC Cash Section */}
        <div className="border-b border-gray-200 pb-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
                <MdAccountBalanceWallet className="w-6 h-6" style={{ color: '#F59E0B' }} />
              </div>
              <div>
                <h3 className="text-base font-bold text-black">UC Cash</h3>
                <p className="text-xs text-gray-600">Formerly UC Credits. Applicable on all services</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-base font-bold text-black">₹{walletBalance.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Wallet Items */}
        <div>
          <h3 className="text-base font-bold text-black mb-3">Wallet Activity</h3>
          <div className="space-y-0">
            {walletItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No wallet activity yet</p>
              </div>
            ) : (
              walletItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between py-4 ${
                    index !== walletItems.length - 1 ? 'border-b border-gray-200' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.type === 'credit' ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      <span className={`text-lg ${item.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.type === 'credit' ? '+' : '-'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-black">{item.title}</p>
                      <p className="text-xs text-gray-600">{item.description}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        item.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {item.type === 'credit' ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{item.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Wallet;

