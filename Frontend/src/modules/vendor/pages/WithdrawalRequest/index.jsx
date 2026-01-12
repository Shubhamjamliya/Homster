import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDollarSign, FiArrowRight, FiCreditCard, FiAlertCircle, FiCheckCircle, FiEdit2, FiClock, FiPlusCircle, FiActivity } from 'react-icons/fi';
import { vendorTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import { requestWithdrawal, getWalletBalance, getWithdrawalHistory } from '../../services/walletService';
import { toast } from 'react-hot-toast';

const WithdrawalRequest = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState({ available: 0 });
  const [amount, setAmount] = useState('');
  const [showBankForm, setShowBankForm] = useState(false);
  const [history, setHistory] = useState([]);
  const [bankAccount, setBankAccount] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });
  const [isBankSaved, setIsBankSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [walletRes, historyRes] = await Promise.all([
        getWalletBalance(),
        getWithdrawalHistory()
      ]);
      setWallet({ available: walletRes.earnings || 0 });
      setHistory(historyRes || []);

      const savedBank = JSON.parse(localStorage.getItem('vendorBankAccount') || 'null');
      if (savedBank) {
        setBankAccount(savedBank);
        setIsBankSaved(true);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAmountChange = (value) => {
    const numValue = value.replace(/[^0-9]/g, '');
    setAmount(numValue);
    setError('');

    const numAmount = parseInt(numValue) || 0;
    if (numAmount > wallet.available) {
      setError('Amount cannot exceed available earnings');
    } else if (numAmount < 100 && numValue !== '') {
      setError('Minimum withdrawal amount is ₹100');
    }
  };

  const handleMaxAmount = () => {
    setAmount(wallet.available.toString());
    setError('');
  };

  const handleBankInputChange = (e) => {
    const { name, value } = e.target;
    setBankAccount(prev => ({ ...prev, [name]: value }));
  };

  const saveBankDetails = () => {
    if (!bankAccount.accountHolderName || !bankAccount.accountNumber || !bankAccount.bankName || !bankAccount.ifscCode) {
      toast.error('Please fill all mandatory bank details');
      return;
    }
    localStorage.setItem('vendorBankAccount', JSON.stringify(bankAccount));
    setIsBankSaved(true);
    setShowBankForm(false);
    toast.success('Bank details updated');
  };

  const handleSubmit = async () => {
    const numAmount = parseInt(amount) || 0;
    if (!amount || numAmount === 0 || error) return;
    if (!isBankSaved) {
      toast.error('Please add bank details');
      return;
    }

    try {
      setLoading(true);
      await requestWithdrawal({
        amount: numAmount,
        bankDetails: bankAccount
      });
      toast.success('Request sent successfully!');
      window.dispatchEvent(new Event('vendorWalletUpdated'));
      navigate('/vendor/wallet');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  const tdsRate = 2;
  const tdsAmount = Math.round((parseInt(amount) || 0) * (tdsRate / 100));
  const netAmount = (parseInt(amount) || 0) - tdsAmount;

  return (
    <div className="min-h-screen pb-24" style={{ background: themeColors.backgroundGradient }}>
      <Header title="Request Withdrawal" />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Modern Balance Header */}
        <div className="relative mb-8 pt-4">
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Redeemable</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-gray-400">₹</span>
              <span className="text-5xl font-black text-gray-900 tracking-tight">
                {wallet.available.toLocaleString()}
              </span>
            </div>
            <div className="mt-4 flex gap-2">
              <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold border border-green-100 flex items-center gap-1">
                <FiCheckCircle className="w-3 h-3" /> Verified Balance
              </div>
            </div>
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-50 mb-6 group transition-all hover:shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <FiDollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">Withdraw Amount</h3>
            </div>
            <button
              onClick={handleMaxAmount}
              className="text-[10px] font-black text-white px-3 py-1.5 rounded-lg transition-all active:scale-95"
              style={{ background: themeColors.button }}
            >
              USE MAX
            </button>
          </div>

          <div className="relative mb-4">
            <input
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className={`w-full px-4 py-5 bg-gray-50 rounded-2xl border-2 text-3xl font-black text-center focus:outline-none transition-all ${error ? 'border-red-100 text-red-500' : 'border-transparent focus:bg-white focus:border-emerald-100 text-gray-900'
                }`}
            />
          </div>

          {error && <p className="text-red-500 text-[11px] font-bold text-center mb-4 flex justify-center items-center gap-1"><FiAlertCircle className="w-3.5 h-3.5" /> {error}</p>}

          {amount && !error && (
            <div className="bg-emerald-50/50 rounded-2xl p-4 space-y-3 border border-emerald-50">
              <div className="flex justify-between text-xs font-bold text-gray-500">
                <span>Gross Total</span>
                <span>₹{parseInt(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-red-500/70">
                <span>TDS Deduction (2%)</span>
                <span>- ₹{tdsAmount.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-emerald-100 flex justify-between items-end">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Net Payout</span>
                <span className="text-2xl font-black text-emerald-600 leading-none">₹{netAmount.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Bank Detail Card - Pro Style */}
        <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-50 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <FiCreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">Payout Destination</h3>
            </div>
            {isBankSaved && !showBankForm && (
              <button
                onClick={() => setShowBankForm(true)}
                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100"
              >
                <FiEdit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {!isBankSaved || showBankForm ? (
            <div className="space-y-3">
              {[
                { label: 'Holder Name', name: 'accountHolderName' },
                { label: 'Bank Name', name: 'bankName' },
                { label: 'Account Number', name: 'accountNumber' },
                { label: 'IFSC Code', name: 'ifscCode' },
                { label: 'UPI ID (Optional)', name: 'upiId' }
              ].map((f) => (
                <div key={f.name}>
                  <input
                    type="text"
                    name={f.name}
                    value={bankAccount[f.name]}
                    onChange={handleBankInputChange}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-blue-100 focus:bg-white outline-none text-sm font-bold placeholder:font-medium transition-all"
                    placeholder={f.label}
                  />
                </div>
              ))}
              <button
                onClick={saveBankDetails}
                className="w-full py-4 bg-gray-900 text-white rounded-[1.2rem] font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all mt-2"
              >
                Confirm Account
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-blue-50 flex items-center gap-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-5 scale-150">
                <FiCreditCard className="w-20 h-20 text-blue-900" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 border border-blue-50">
                <FiPlusCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-black text-gray-800 text-sm">{bankAccount.accountHolderName}</p>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-tight">
                  {bankAccount.bankName} • {bankAccount.accountNumber.slice(-4).padStart(12, '•')}
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">{bankAccount.ifscCode}</span>
                  {bankAccount.upiId && <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase">UPI Enabled</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ledger Summary */}
        {history.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 px-2">
              <FiActivity className="text-gray-400 w-4 h-4" />
              <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em]">Recent Activity</h3>
            </div>
            <div className="space-y-3">
              {history.slice(0, 3).map((item) => (
                <div key={item._id} className="bg-white rounded-[1.2rem] p-4 flex justify-between items-center shadow-sm border border-gray-50 hover:border-gray-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.status === 'approved' ? 'bg-emerald-50 text-emerald-500' :
                        item.status === 'rejected' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'
                      }`}>
                      <FiClock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-gray-800">₹{item.amount.toLocaleString()}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${item.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                      item.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Action */}
        <button
          onClick={handleSubmit}
          disabled={!amount || !!error || !isBankSaved || loading}
          className="w-full py-5 rounded-[1.5rem] font-black text-white text-[13px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-40 disabled:grayscale shadow-2xl group"
          style={{
            background: `linear-gradient(135deg, ${themeColors.button}, #0f172a)`,
          }}
        >
          {loading ? (
            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              Confirm Payout
              <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <p className="text-center text-[10px] text-gray-400 mt-8 font-black uppercase tracking-wider leading-relaxed opacity-50 px-6">
          Payouts hit your bank in 24-48 business hours.<br />
          TDS is mandated by govt. regulations.
        </p>
      </main>

      <BottomNav />
    </div>
  );
};

export default WithdrawalRequest;
