import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDollarSign, FiArrowUp, FiArrowDown, FiArrowRight, FiSearch } from 'react-icons/fi';
import { vendorTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import { autoInitDummyData } from '../../utils/initDummyData';
import { getWalletBalance, getTransactions } from '../../services/walletService';

const Wallet = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState({
    balance: 0,
    pending: 0,
    available: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all'); // all, earning, withdrawal, commission

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
    // Initialize dummy data if needed
    autoInitDummyData();

    const loadWallet = async () => {
      try {
        const walletData = await getWalletBalance();
        const txns = await getTransactions();

        // Calculate pending from transactions
        const pendingAmount = txns
          .filter(t => t.type === 'withdrawal' && t.status === 'pending')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const availableBalance = walletData.balance || 0;

        setWallet({
          balance: availableBalance + pendingAmount, // Total = Available + Pending
          available: availableBalance,
          pending: pendingAmount,
        });

        // Map transactions to UI format if needed (Backend returns standard format, assume it matches or is close enough)
        // Backend Transaction model: type, amount, status, date(createdAt), description
        // Frontend expects: type, amount, status, date, description

        const formattedTxns = txns.map(t => ({
          ...t,
          date: new Date(t.createdAt).toLocaleDateString(),
          amount: t.amount // Backend might store absolute or negative? Controller uses absolute in amount field.
        }));

        setTransactions(formattedTxns);
      } catch (error) {
        console.error('Error loading wallet:', error);
      }
    };

    // Load immediately and after a delay
    loadWallet();
    setTimeout(loadWallet, 200);

    window.addEventListener('vendorWalletUpdated', loadWallet);

    return () => {
      window.removeEventListener('vendorWalletUpdated', loadWallet);
    };
  }, []);

  const filteredTransactions = transactions.filter(txn => {
    if (filter === 'all') return true;
    return txn.type.toLowerCase() === filter;
  });

  const getTransactionIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'earning':
        return <FiArrowDown className="w-5 h-5 text-green-500" />;
      case 'withdrawal':
        return <FiArrowUp className="w-5 h-5 text-red-500" />;
      case 'commission':
        return <FiDollarSign className="w-5 h-5 text-orange-500" />;
      default:
        return <FiDollarSign className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type.toLowerCase()) {
      case 'earning':
        return 'text-green-600';
      case 'withdrawal':
        return 'text-red-600';
      case 'commission':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
      <Header title="Wallet" />

      <main className="px-4 py-6">
        {/* Balance Cards */}
        <div className="space-y-4 mb-6">
          {/* Total Balance */}
          <div
            className="rounded-2xl p-6 shadow-xl relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${themeColors.button} 0%, ${themeColors.icon} 100%)`,
              boxShadow: `0 12px 32px ${themeColors.button}50, 0 4px 16px ${themeColors.button}30`,
            }}
          >
            {/* Decorative Pattern */}
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
              style={{
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
                transform: 'translate(30px, -30px)',
              }}
            />
            <div className="relative z-10">
              <p className="text-white text-sm mb-2 opacity-90 font-medium">Total Balance</p>
              <p className="text-4xl font-bold text-white">₹{wallet.balance.toLocaleString()}</p>
            </div>
          </div>

          {/* Available & Pending */}
          <div className="grid grid-cols-2 gap-4">
            {/* Available Card */}
            <div
              className="rounded-2xl p-5 shadow-lg relative overflow-hidden border-2"
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%)',
                borderColor: '#10B981',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2), 0 4px 12px rgba(16, 185, 129, 0.15)',
              }}
            >
              {/* Left accent */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                style={{
                  background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
                }}
              />
              <div className="relative z-10 pl-2">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="p-2 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
                    }}
                  >
                    <FiArrowDown className="w-5 h-5" style={{ color: '#10B981' }} />
                  </div>
                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Available</p>
                </div>
                <p className="text-2xl font-bold mb-1" style={{ color: '#10B981' }}>
                  ₹{wallet.available.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 font-medium">Withdrawable</p>
              </div>
            </div>

            {/* Pending Card */}
            <div
              className="rounded-2xl p-5 shadow-lg relative overflow-hidden border-2"
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF7ED 100%)',
                borderColor: '#F97316',
                boxShadow: '0 8px 24px rgba(249, 115, 22, 0.2), 0 4px 12px rgba(249, 115, 22, 0.15)',
              }}
            >
              {/* Left accent */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                style={{
                  background: 'linear-gradient(180deg, #F97316 0%, #EA580C 100%)',
                }}
              />
              <div className="relative z-10 pl-2">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="p-2 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0.1) 100%)',
                    }}
                  >
                    <FiArrowUp className="w-5 h-5" style={{ color: '#F97316' }} />
                  </div>
                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Pending</p>
                </div>
                <p className="text-2xl font-bold mb-1" style={{ color: '#F97316' }}>
                  ₹{wallet.pending.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 font-medium">In settlement</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'all', label: 'All' },
            { id: 'earning', label: 'Earnings' },
            { id: 'withdrawal', label: 'Withdrawals' },
            { id: 'commission', label: 'Commission' },
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

        {/* Transactions */}
        <div>
          <h3 className="font-bold text-gray-800 mb-4">Transactions</h3>
          {filteredTransactions.length === 0 ? (
            <div
              className="bg-white rounded-xl p-8 text-center shadow-md"
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <FiDollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 font-semibold mb-2">No transactions yet</p>
              <p className="text-sm text-gray-500">Your transactions will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((txn, index) => {
                const txnColor = txn.type.toLowerCase() === 'earning' ? '#10B981' :
                  txn.type.toLowerCase() === 'withdrawal' ? '#EF4444' : '#F97316';
                const hexToRgba = (hex, alpha) => {
                  const r = parseInt(hex.slice(1, 3), 16);
                  const g = parseInt(hex.slice(3, 5), 16);
                  const b = parseInt(hex.slice(5, 7), 16);
                  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                };

                return (
                  <div
                    key={index}
                    className="rounded-2xl p-4 shadow-lg relative overflow-hidden border-2"
                    style={{
                      background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
                      borderColor: hexToRgba(txnColor, 0.3),
                      boxShadow: `0 8px 24px ${hexToRgba(txnColor, 0.15)}, 0 4px 12px ${hexToRgba(txnColor, 0.1)}`,
                    }}
                  >
                    {/* Left accent bar */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                      style={{
                        background: `linear-gradient(180deg, ${txnColor} 0%, ${txnColor}dd 100%)`,
                      }}
                    />

                    <div className="relative z-10 pl-3">
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${hexToRgba(txnColor, 0.2)} 0%, ${hexToRgba(txnColor, 0.1)} 100%)`,
                            border: `2px solid ${hexToRgba(txnColor, 0.3)}`,
                          }}
                        >
                          {getTransactionIcon(txn.type)}
                        </div>

                        {/* Transaction Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-bold text-gray-900 capitalize text-base">{txn.type}</p>
                            <p className={`text-xl font-bold ${getTransactionColor(txn.type)}`}>
                              {txn.type.toLowerCase() === 'withdrawal' ? '-' : '+'}₹{Math.abs(txn.amount).toLocaleString()}
                            </p>
                          </div>
                          <p className="text-sm text-gray-700 font-medium mb-1">{txn.description || 'Transaction'}</p>
                          <div className="flex items-center gap-3">
                            <p className="text-xs text-gray-500">{txn.date}</p>
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded-full ${txn.status === 'completed' ? 'bg-green-100 text-green-700' :
                                  txn.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-600'
                                }`}
                            >
                              {txn.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Request Withdrawal Button */}
        {wallet.available > 0 && (
          <div className="mt-6">
            <button
              onClick={() => navigate('/vendor/wallet/withdraw')}
              className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{
                background: themeColors.button,
                boxShadow: `0 4px 12px ${themeColors.button}40`,
              }}
            >
              Request Withdrawal
              <FiArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Wallet;

