import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDollarSign, FiArrowRight, FiCreditCard } from 'react-icons/fi';
import { vendorTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import { requestWithdrawal, getWalletBalance } from '../../services/walletService';

const WithdrawalRequest = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState({ available: 0 });
  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState(null);
  const [error, setError] = useState('');

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
    const loadWallet = async () => {
      try {
        const vendorWallet = await getWalletBalance();
        setWallet({ available: vendorWallet.balance || 0 });
      } catch (error) {
        console.error('Error loading wallet:', error);
      }
    };

    const loadBankAccount = () => {
      try {
        const bank = JSON.parse(localStorage.getItem('vendorBankAccount') || 'null');
        setBankAccount(bank);
      } catch (error) {
        console.error('Error loading bank account:', error);
      }
    };

    loadWallet();
    loadBankAccount();
  }, []);

  const handleAmountChange = (value) => {
    const numValue = value.replace(/[^0-9]/g, '');
    setAmount(numValue);
    setError('');

    const numAmount = parseInt(numValue) || 0;
    if (numAmount > wallet.available) {
      setError('Amount cannot exceed available balance');
    } else if (numAmount < 100) {
      setError('Minimum withdrawal amount is ₹100');
    }
  };

  const handleMaxAmount = () => {
    setAmount(wallet.available.toString());
    setError('');
  };

  const handleSubmit = async () => {
    const numAmount = parseInt(amount) || 0;

    if (!amount || numAmount === 0) {
      setError('Please enter withdrawal amount');
      return;
    }

    if (numAmount > wallet.available) {
      setError('Amount cannot exceed available balance');
      return;
    }

    if (numAmount < 100) {
      setError('Minimum withdrawal amount is ₹100');
      return;
    }

    if (!bankAccount) {
      setError('Please add bank account details first');
      return;
    }

    try {
      // API Call
      await requestWithdrawal({
        amount: numAmount,
        bankDetails: bankAccount
      });

      window.dispatchEvent(new Event('vendorWalletUpdated'));
      alert('Withdrawal request submitted successfully!');
      navigate('/vendor/wallet');
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      alert(error.response?.data?.message || 'Failed to submit withdrawal request. Please try again.');
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
      <Header title="Request Withdrawal" />

      <main className="px-4 py-6">
        {/* Available Balance */}
        <div
          className="bg-white rounded-xl p-6 mb-6 shadow-md text-center"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <p className="text-sm text-gray-600 mb-2">Available Balance</p>
          <p className="text-4xl font-bold" style={{ color: themeColors.button }}>
            ₹{wallet.available.toLocaleString()}
          </p>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Withdrawal Amount
          </label>
          <div className="relative">
            <FiDollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="Enter amount"
              className={`w-full pl-12 pr-20 py-4 bg-white rounded-xl border focus:outline-none focus:ring-2 text-lg font-semibold ${error ? 'border-red-500' : 'border-gray-200'
                }`}
              style={{ focusRingColor: themeColors.button }}
            />
            <button
              onClick={handleMaxAmount}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-2 rounded-lg text-sm font-semibold"
              style={{
                background: `${themeColors.button}15`,
                color: themeColors.button,
              }}
            >
              MAX
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {amount && !error && (
            <p className="text-sm text-gray-600 mt-2">
              You will receive: ₹{parseInt(amount || 0).toLocaleString()}
            </p>
          )}
        </div>

        {/* Bank Account */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-gray-700">
              Bank Account
            </label>
            <button
              onClick={() => {
                // In real app, navigate to add/edit bank account page
                const account = prompt('Enter bank account details (JSON format)');
                if (account) {
                  try {
                    const parsed = JSON.parse(account);
                    localStorage.setItem('vendorBankAccount', JSON.stringify(parsed));
                    setBankAccount(parsed);
                  } catch (e) {
                    alert('Invalid format');
                  }
                }
              }}
              className="text-sm font-semibold"
              style={{ color: themeColors.button }}
            >
              {bankAccount ? 'Edit' : 'Add'}
            </button>
          </div>

          {bankAccount ? (
            <div
              className="bg-white rounded-xl p-4 shadow-md"
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${themeColors.button}15` }}
                >
                  <FiCreditCard className="w-6 h-6" style={{ color: themeColors.button }} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{bankAccount.accountHolderName}</p>
                  <p className="text-sm text-gray-600">
                    {bankAccount.bankName} • ****{bankAccount.accountNumber.slice(-4)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">IFSC: {bankAccount.ifsc}</p>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="bg-white rounded-xl p-6 text-center border-2 border-dashed border-gray-300"
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <FiCreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600 mb-2">No bank account added</p>
              <button
                onClick={() => {
                  const account = prompt('Enter bank account details (JSON format)');
                  if (account) {
                    try {
                      const parsed = JSON.parse(account);
                      localStorage.setItem('vendorBankAccount', JSON.stringify(parsed));
                      setBankAccount(parsed);
                    } catch (e) {
                      alert('Invalid format');
                    }
                  }
                }}
                className="text-sm font-semibold"
                style={{ color: themeColors.button }}
              >
                Add Bank Account
              </button>
            </div>
          )}
        </div>

        {/* Withdrawal History */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Recent Withdrawals</h3>
          <div
            className="bg-white rounded-xl p-4 shadow-md"
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <p className="text-sm text-gray-600 text-center py-4">
              No withdrawal history
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!amount || !!error || !bankAccount}
          className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: themeColors.button,
            boxShadow: `0 4px 12px ${themeColors.button}40`,
          }}
        >
          Request Withdrawal
          <FiArrowRight className="w-5 h-5" />
        </button>
      </main>

      <BottomNav />
    </div>
  );
};

export default WithdrawalRequest;

