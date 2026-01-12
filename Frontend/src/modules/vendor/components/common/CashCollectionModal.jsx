import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2, FiCreditCard, FiClock, FiCheck, FiDollarSign, FiPlusCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

/**
 * CashCollectionModal
 * A unified component for collecting cash payments with support for extra items/services.
 */
const CashCollectionModal = ({
  isOpen,
  onClose,
  booking,
  onConfirm,
  onInitiateOTP,
  loading
}) => {
  const [extraItems, setExtraItems] = useState([]);
  const [step, setStep] = useState('summary'); // 'summary' or 'otp'
  const [otp, setOtp] = useState(['', '', '', '']);
  const [submitting, setSubmitting] = useState(false);

  // Fix potential undefined issue
  const safeExtraItems = Array.isArray(extraItems) ? extraItems : [];

  // To avoid double-counting when we restore extras from the booking, 
  // we calculate the "real" base amount by subtracting existing extras from finalAmount
  const baseAmount = (() => {
    const rawFinal = booking?.finalAmount || parseFloat(booking?.price) || 0;
    const existingExtras = booking?.workDoneDetails?.items || [];
    const existingExtrasTotal = existingExtras.reduce((sum, item) => sum + (parseFloat(item.price || 0) * (item.qty || 1)), 0);
    // If OTP was already sent, the rawFinal already includes existingExtrasTotal
    return (booking?.customerConfirmationOTP || booking?.paymentOtp)
      ? Math.max(0, rawFinal - existingExtrasTotal)
      : rawFinal;
  })();

  const totalExtra = safeExtraItems.reduce((sum, item) => sum + (parseFloat(item.price || 0) * (item.qty || 1)), 0);
  const finalTotal = baseAmount + totalExtra;

  useEffect(() => {
    if (isOpen) {
      // Check if OTP was already initiated for this booking
      const hasOTP = booking?.customerConfirmationOTP || booking?.paymentOtp;

      if (hasOTP) {
        setStep('otp');
        // Restore extra items from booking record if they exist
        if (booking.workDoneDetails?.items && booking.workDoneDetails.items.length > 0) {
          setExtraItems(booking.workDoneDetails.items);
        }
      } else {
        // Fresh start
        setStep('summary');
        setExtraItems([]);
        setOtp(['', '', '', '']);
      }
      setSubmitting(false);
    }
  }, [isOpen, booking?.id, booking?.customerConfirmationOTP, booking?.paymentOtp]);

  const handleAddItem = () => {
    setExtraItems([...extraItems, { title: '', price: '', qty: 1 }]);
  };

  const handleUpdateItem = (index, field, value) => {
    const newItems = [...extraItems];
    newItems[index][field] = value;
    setExtraItems(newItems);
  };

  const handleRemoveItem = (index) => {
    setExtraItems(extraItems.filter((_, i) => i !== index));
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      const nextInput = document.getElementById(`modal-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleSendOTP = async () => {
    // Validate extra items if any
    for (const item of extraItems) {
      if (!item.title || !item.price || parseFloat(item.price) <= 0) {
        toast.error('Please provide title and price for all extra items');
        return;
      }
    }

    setSubmitting(true);
    try {
      await onInitiateOTP(finalTotal, extraItems);
      setStep('otp');
      toast.success('OTP sent to customer');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 4) {
      toast.error('Please enter 4-digit OTP');
      return;
    }

    setSubmitting(true);
    try {
      await onConfirm(finalTotal, extraItems, otpString);
      onClose();
      toast.success('Payment recorded successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{step === 'summary' ? 'Collect Cash' : 'Verify OTP'}</h3>
            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">
              {step === 'summary' ? 'Review Bill & Send OTP' : 'Enter Customer Code'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {step === 'summary' ? (
            <>
              {/* Base Amount Section */}
              <div className="bg-blue-50/50 rounded-2xl p-5 mb-6 border border-blue-100/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-blue-800">Booking Amount</span>
                  <span className="text-lg font-bold text-blue-900">₹{baseAmount.toLocaleString()}</span>
                </div>
                <p className="text-[11px] text-blue-600/80">Original service booking amount</p>
              </div>

              {/* Extra Items Section */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Extra Services / Items</h4>
                  <button
                    onClick={handleAddItem}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FiPlus className="w-3.5 h-3.5" />
                    Add Extra
                  </button>
                </div>

                {extraItems.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-2xl">
                    <p className="text-xs text-gray-400">No extra charges added yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {extraItems.map((item, index) => (
                      <div key={index} className="flex gap-2 items-start animate-in slide-in-from-right-2 duration-200">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            placeholder="Service name"
                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                            value={item.title}
                            onChange={(e) => handleUpdateItem(index, 'title', e.target.value)}
                          />
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                              <input
                                type="number"
                                placeholder="Price"
                                className="w-full pl-7 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                value={item.price}
                                onChange={(e) => handleUpdateItem(index, 'price', e.target.value)}
                              />
                            </div>
                            <div className="w-20">
                              <input
                                type="number"
                                placeholder="Qty"
                                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                value={item.qty}
                                onChange={(e) => handleUpdateItem(index, 'qty', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg mt-1"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-4 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                <FiClock className="w-8 h-8 animate-pulse" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Enter Confirmation Code</h4>
              <p className="text-xs text-gray-500 mb-8 px-4">
                Ask the customer for the 4-digit code sent to their phone to verify the payment of <span className="font-bold text-gray-900">₹{finalTotal.toLocaleString()}</span>.
              </p>

              <div className="flex gap-3 justify-center mb-8">
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    id={`modal-otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    value={otp[i]}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="w-12 h-14 border-2 border-gray-100 rounded-xl text-center text-2xl font-bold focus:border-blue-500 focus:outline-none bg-gray-50 transition-all"
                    maxLength={1}
                  />
                ))}
              </div>

              <button
                onClick={() => setStep('summary')}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Back to Edit Bill
              </button>
            </div>
          )}

          {/* Final Summary */}
          <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl mt-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <FiCreditCard className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4 text-gray-400/80 text-xs font-bold uppercase tracking-widest">
                <span>Payment Summary</span>
                <span>Total Due</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-black tracking-tight">₹{finalTotal.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <div className="px-2 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded-lg border border-blue-500/30">
                    CASH COLLECTION
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50/50 border-t border-gray-100">
          {step === 'summary' ? (
            <button
              onClick={handleSendOTP}
              disabled={submitting || loading}
              className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 hover:brightness-105"
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)',
              }}
            >
              {submitting ? 'Sending...' : 'Send OTP to User'}
              <FiArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleVerify}
              disabled={submitting || loading}
              className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 hover:brightness-105"
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
                boxShadow: '0 8px 16px -4px rgba(16, 185, 129, 0.4)',
              }}
            >
              {submitting ? 'Verifying...' : 'Verify & Record Cash'}
              <FiCheck className="w-5 h-5" />
            </button>
          )}
          <p className="text-[10px] text-gray-400 text-center italic mt-3">
            {step === 'summary'
              ? 'Clicking will finalize the bill and send a 4-digit code to the customer.'
              : 'Enter the code provided by the customer to finalize the transaction.'}
          </p>
        </div>
      </div>
    </div>
  );
};

// Internal icon for button
const FiArrowRight = ({ className }) => (
  <svg className={className} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export default CashCollectionModal;
