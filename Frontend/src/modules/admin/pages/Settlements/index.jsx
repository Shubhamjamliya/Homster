import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDollarSign, FiCheck, FiX, FiEye, FiClock, FiUsers, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import adminSettlementService from '../../../../services/adminSettlementService';

const SettlementManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending, vendors, withdrawals, history
  const [dashboard, setDashboard] = useState(null);
  const [pendingSettlements, setPendingSettlements] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [history, setHistory] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal State
  const [activeModal, setActiveModal] = useState(null); // 'approve_settlement', 'reject_settlement', 'block_vendor', 'update_limit', 'approve_withdrawal', 'reject_withdrawal'
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalInput, setModalInput] = useState(''); // Reasons/Notes/Limit
  const [modalInput2, setModalInput2] = useState(''); // Secondary (Ref No)

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Always load dashboard
      const dashRes = await adminSettlementService.getDashboard();
      if (dashRes.success) {
        setDashboard(dashRes.data);
      }

      if (activeTab === 'pending') {
        const res = await adminSettlementService.getPendingSettlements();
        if (res.success) setPendingSettlements(res.data || []);
      } else if (activeTab === 'vendors') {
        const res = await adminSettlementService.getVendorBalances({ filterDue: 'true' });
        if (res.success) setVendors(res.data || []);
      } else if (activeTab === 'history') {
        const res = await adminSettlementService.getSettlementHistory();
        if (res.success) setHistory(res.data || []);
      } else if (activeTab === 'withdrawals') {
        const res = await adminSettlementService.getWithdrawalRequests();
        if (res.success) setWithdrawals(res.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };



  // --- Modal Openers ---
  const openApproveSettlement = (item) => {
    setSelectedItem(item);
    setActiveModal('approve_settlement');
  };

  const openRejectSettlement = (item) => {
    setSelectedItem(item);
    setModalInput('');
    setActiveModal('reject_settlement');
  };

  const openBlockVendor = (vendor) => {
    setSelectedItem(vendor);
    setModalInput('');
    setActiveModal('block_vendor');
  };

  const openUnblockVendor = (vendor) => {
    setSelectedItem(vendor);
    setActiveModal('unblock_vendor');
  };

  const openUpdateLimit = (vendor) => {
    setSelectedItem(vendor);
    setModalInput(vendor.cashLimit || 10000);
    setActiveModal('update_limit');
  };

  const openApproveWithdrawal = (item) => {
    setSelectedItem(item);
    setModalInput(''); // Transaction Ref
    setActiveModal('approve_withdrawal');
  };

  const openRejectWithdrawal = (item) => {
    setSelectedItem(item);
    setModalInput('');
    setActiveModal('reject_withdrawal');
  };

  const closeModals = () => {
    setActiveModal(null);
    setSelectedItem(null);
    setModalInput('');
    setModalInput2('');
  };

  // --- Action Handlers ---
  const handleApproveSettlement = async () => {
    try {
      setActionLoading(true);
      const res = await adminSettlementService.approveSettlement(selectedItem._id);
      if (res.success) {
        toast.success('Settlement approved!');
        loadData();
        closeModals();
      } else {
        toast.error(res.message || 'Failed to approve');
      }
    } catch (error) {
      toast.error('Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSettlement = async () => {
    if (!modalInput.trim()) return toast.error('Rejection reason is required');
    try {
      setActionLoading(true);
      const res = await adminSettlementService.rejectSettlement(selectedItem._id, modalInput);
      if (res.success) {
        toast.success('Settlement rejected');
        loadData();
        closeModals();
      }
    } catch (error) {
      toast.error('Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockVendor = async () => {
    if (!modalInput.trim()) return toast.error('Blocking reason is required');
    try {
      setActionLoading(true);
      const res = await adminSettlementService.blockVendor(selectedItem._id, modalInput);
      if (res.success) {
        toast.success('Vendor blocked');
        loadData();
        closeModals();
      }
    } catch (error) {
      toast.error('Failed to block');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateLimitSubmit = async () => {
    if (!modalInput || isNaN(modalInput)) return toast.error('Valid limit required');
    try {
      setActionLoading(true);
      const res = await adminSettlementService.updateCashLimit(selectedItem._id, parseInt(modalInput));
      if (res.success) {
        toast.success('Limit updated');
        loadData();
        closeModals();
      }
    } catch (error) {
      toast.error('Failed to update limit');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblockVendorSubmit = async () => {
    try {
      setActionLoading(true);
      const res = await adminSettlementService.unblockVendor(selectedItem._id);
      if (res.success) {
        toast.success('Vendor unblocked');
        loadData();
        closeModals();
      }
    } catch (error) {
      toast.error('Failed to unblock');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveWithdrawalSubmit = async () => {
    const ref = modalInput.trim() || `MANUAL-${Date.now()}`;
    try {
      setActionLoading(true);
      const res = await adminSettlementService.approveWithdrawal(selectedItem._id, { transactionReference: ref });
      if (res.success) {
        toast.success('Withdrawal approved');
        loadData();
        closeModals();
      }
    } catch (error) {
      toast.error('Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectWithdrawalSubmit = async () => {
    if (!modalInput.trim()) return toast.error('Rejection reason required');
    try {
      setActionLoading(true);
      const res = await adminSettlementService.rejectWithdrawal(selectedItem._id, modalInput);
      if (res.success) {
        toast.success('Withdrawal rejected');
        loadData();
        closeModals();
      }
    } catch (error) {
      toast.error('Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Dashboard Cards */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-red-50 text-red-600">
                <FiDollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Due</p>
                <p className="text-lg font-bold text-red-600">₹{dashboard.totalDueToAdmin?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                <FiClock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Pending</p>
                <p className="text-lg font-bold text-orange-600">{dashboard.pendingSettlements?.count || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <FiTrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Today Cash</p>
                <p className="text-lg font-bold text-blue-600">₹{dashboard.todayCashCollected?.amount?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-green-50 text-green-600">
                <FiCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Weekly</p>
                <p className="text-lg font-bold text-green-600">₹{dashboard.weeklySettlements?.amount?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs and Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200 bg-gray-50/50 overflow-x-auto">
          {[
            { id: 'pending', label: 'Pending', icon: FiClock },
            { id: 'withdrawals', label: 'Withdrawals', icon: FiDollarSign },
            { id: 'vendors', label: 'Vendors with Due', icon: FiUsers },
            { id: 'history', label: 'History', icon: FiTrendingUp },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Pending Settlements */}
              {activeTab === 'pending' && (
                pendingSettlements.length === 0 ? (
                  <div className="text-center py-10">
                    <FiCheck className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-500 text-sm font-medium">No pending settlements</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pendingSettlements.map(settlement => (
                      <div key={settlement._id} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-xs truncate">
                              {settlement.vendorId?.name || 'Vendor'}
                            </p>
                            <p className="text-[10px] text-gray-500 truncate mb-1">{settlement.vendorId?.businessName}</p>
                            <p className="text-lg font-bold text-blue-600">
                              ₹{settlement.amount?.toLocaleString()}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] font-bold text-gray-600 bg-gray-200/50 px-1.5 py-0.5 rounded uppercase">
                                {settlement.paymentMethod}
                              </span>
                              {settlement.paymentReference && (
                                <span className="text-[10px] text-gray-400 truncate">Ref: {settlement.paymentReference}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <button
                              onClick={() => openApproveSettlement(settlement)}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-lg font-bold text-[10px] uppercase hover:bg-green-700 flex items-center justify-center gap-1 transition-colors"
                            >
                              <FiCheck className="w-3 h-3" /> Approve
                            </button>
                            <button
                              onClick={() => openRejectSettlement(settlement)}
                              className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-bold text-[10px] uppercase hover:bg-red-700 flex items-center justify-center gap-1 transition-colors"
                            >
                              <FiX className="w-3 h-3" /> Reject
                            </button>
                          </div>
                        </div>

                        {settlement.paymentProof && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <a
                              href={settlement.paymentProof}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase"
                            >
                              View Proof →
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Vendors with Due */}
              {activeTab === 'vendors' && (
                vendors.length === 0 ? (
                  <div className="text-center py-10">
                    <FiCheck className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-500 text-sm font-medium">All vendors are settled</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-4">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                          <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Vendor</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Limit Status</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Amount Due</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {vendors.map(vendor => (
                          <tr key={vendor._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-bold text-gray-900 text-xs">{vendor.name}</p>
                              <p className="text-[10px] text-gray-500 truncate">{vendor.businessName}</p>
                            </td>
                            <td className="px-4 py-3 text-[11px] text-gray-600">{vendor.phone}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex flex-col items-end">
                                <span className="text-[10px] font-bold text-gray-700">
                                  ₹{Math.abs(vendor.balance).toLocaleString()} / ₹{vendor.cashLimit?.toLocaleString()}
                                </span>
                                <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${vendor.isBlocked ? 'bg-red-500' : 'bg-blue-500'}`}
                                    style={{ width: `${Math.min((vendor.amountDue / vendor.cashLimit) * 100, 100)}%` }}
                                  ></div>
                                </div>
                                {vendor.isBlocked && <span className="text-[8px] text-red-600 font-bold mt-0.5 uppercase">Blocked</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-bold text-red-600 text-sm">
                                ₹{vendor.amountDue?.toLocaleString() || 0}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => navigate(`/admin/settlements/vendor/${vendor._id}`)}
                                  className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold uppercase hover:bg-blue-100 transition-colors"
                                >
                                  Ledger
                                </button>
                                <button
                                  onClick={() => openUpdateLimit(vendor)}
                                  className="px-2 py-1 bg-gray-50 text-gray-700 rounded-lg text-[10px] font-bold uppercase hover:bg-gray-100 transition-colors"
                                >
                                  Limit
                                </button>
                                {vendor.isBlocked ? (
                                  <button
                                    onClick={() => openUnblockVendor(vendor)}
                                    className="px-2 py-1 bg-orange-50 text-orange-700 rounded-lg text-[10px] font-bold uppercase hover:bg-orange-100 transition-colors"
                                  >
                                    Unblock
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => openBlockVendor(vendor)}
                                    className="px-2 py-1 bg-red-50 text-red-700 rounded-lg text-[10px] font-bold uppercase hover:bg-red-100 transition-colors"
                                  >
                                    Block
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {/* History */}
              {activeTab === 'history' && (
                history.length === 0 ? (
                  <div className="text-center py-12">
                    <FiDollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600 font-semibold">No settlement history</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map(settlement => (
                      <div
                        key={settlement._id}
                        className={`bg-gray-50 rounded-xl p-4 border-l-4 ${settlement.status === 'approved' ? 'border-green-500' :
                          settlement.status === 'rejected' ? 'border-red-500' : 'border-orange-500'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {settlement.vendorId?.name} - ₹{settlement.amount?.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">{formatDate(settlement.createdAt)}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${settlement.status === 'approved' ? 'bg-green-100 text-green-700' :
                            settlement.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                            {settlement.status.toUpperCase()}
                          </span>
                        </div>
                        {settlement.rejectionReason && (
                          <p className="text-sm text-red-600 mt-2">Reason: {settlement.rejectionReason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Withdrawal Requests */}
              {activeTab === 'withdrawals' && (
                withdrawals.length === 0 ? (
                  <div className="text-center py-12">
                    <FiCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600 font-semibold">No pending withdrawal requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {withdrawals.map(request => (
                      <div key={request._id} className="bg-white rounded-xl p-6 shadow-sm border border-l-4 border-l-green-500">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-lg text-gray-900">{request.vendorId?.name}</p>
                              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{request.vendorId?.businessName}</span>
                            </div>
                            <p className="text-2xl font-bold text-green-600 mb-2">₹{request.amount?.toLocaleString()}</p>

                            <div className="text-sm text-gray-600 space-y-1">
                              <p>Available Earnings: <span className="font-semibold">₹{request.vendorId?.wallet?.earnings?.toLocaleString() || 0}</span></p>
                              <p>Requested: {formatDate(request.requestDate)}</p>
                              {request.bankDetails && (
                                <div className="mt-2 bg-gray-50 p-2 rounded text-xs">
                                  <p className="font-semibold text-gray-700">Bank Details:</p>
                                  {Object.entries(request.bankDetails).map(([key, val]) => (
                                    <p key={key}><span className="capitalize text-gray-500">{key}:</span> {val}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => openApproveWithdrawal(request)}
                              className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold shadow-sm hover:bg-green-700 active:scale-95 transition-all text-sm"
                            >
                              Approve & Pay
                            </button>
                            <button
                              onClick={() => openRejectWithdrawal(request)}
                              className="px-6 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 active:scale-95 transition-all text-sm"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                        {request.adminNotes && (
                          <p className="mt-3 text-sm text-gray-500 italic border-t pt-2">Note: {request.adminNotes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>


      {/* --- Modals --- */}

      {/* Approve Settlement Modal */}
      <Modal
        isOpen={activeModal === 'approve_settlement'}
        onClose={closeModals}
        title="Approve Settlement"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to approve this settlement of
            <span className="font-bold text-gray-900 mx-1">₹{selectedItem?.amount?.toLocaleString()}</span>
            from {selectedItem?.vendorId?.name}?
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={closeModals}>Cancel</Button>
            <Button
              onClick={handleApproveSettlement}
              isLoading={actionLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Settlement Modal */}
      <Modal
        isOpen={activeModal === 'reject_settlement'}
        onClose={closeModals}
        title="Reject Settlement"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Please provide a reason for rejecting this settlement.</p>
          <textarea
            value={modalInput}
            onChange={(e) => setModalInput(e.target.value)}
            placeholder="e.g., Transaction ID not found, Invalid screenshot..."
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
            rows={3}
          />
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={closeModals}>Cancel</Button>
            <Button
              onClick={handleRejectSettlement}
              isLoading={actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reject Settlement
            </Button>
          </div>
        </div>
      </Modal>

      {/* Block Vendor Modal */}
      <Modal
        isOpen={activeModal === 'block_vendor'}
        onClose={closeModals}
        title="Block Vendor"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Blocking <span className="font-bold">{selectedItem?.name}</span> will prevent them from accepting new cash jobs.
          </p>
          <textarea
            value={modalInput}
            onChange={(e) => setModalInput(e.target.value)}
            placeholder="Reason for blocking..."
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
            rows={3}
          />
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={closeModals}>Cancel</Button>
            <Button
              onClick={handleBlockVendor}
              isLoading={actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Block Vendor
            </Button>
          </div>
        </div>
      </Modal>

      {/* Unblock Vendor Modal */}
      <Modal
        isOpen={activeModal === 'unblock_vendor'}
        onClose={closeModals}
        title="Unblock Vendor"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to unblock <span className="font-bold text-gray-900">{selectedItem?.name}</span>?
            Their cash limit and blocking status will be reset.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={closeModals}>Cancel</Button>
            <Button
              onClick={handleUnblockVendorSubmit}
              isLoading={actionLoading}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Confirm Unblock
            </Button>
          </div>
        </div>
      </Modal>

      {/* Update Limit Modal */}
      <Modal
        isOpen={activeModal === 'update_limit'}
        onClose={closeModals}
        title="Update Cash Limit"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Set a new cash collection limit for {selectedItem?.name}.</p>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500 font-bold">₹</span>
            <input
              type="number"
              value={modalInput}
              onChange={(e) => setModalInput(e.target.value)}
              className="w-full p-3 pl-8 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={closeModals}>Cancel</Button>
            <Button
              onClick={handleUpdateLimitSubmit}
              isLoading={actionLoading}
            >
              Update Limit
            </Button>
          </div>
        </div>
      </Modal>

      {/* Approve Withdrawal Modal with TDS */}
      <Modal
        isOpen={activeModal === 'approve_withdrawal'}
        onClose={closeModals}
        title="Approve Withdrawal"
        size="md"
      >
        <div className="space-y-5">
          {/* Vendor Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-black text-sm">
              {selectedItem?.vendorId?.name?.charAt(0) || 'V'}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{selectedItem?.vendorId?.name}</p>
              <p className="text-xs text-gray-500">{selectedItem?.vendorId?.businessName}</p>
            </div>
          </div>

          {/* TDS Breakdown Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payout Breakdown</p>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[10px] font-black uppercase">TDS Applied</span>
            </div>

            <div className="space-y-3">
              {/* Gross Amount */}
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Gross Withdrawal</span>
                <span className="font-bold text-xl">₹{selectedItem?.amount?.toLocaleString() || 0}</span>
              </div>

              {/* TDS Deduction */}
              <div className="flex justify-between items-center text-red-400">
                <span className="text-sm">TDS Deduction (2%)</span>
                <span className="font-bold">- ₹{Math.round((selectedItem?.amount || 0) * 0.02).toLocaleString()}</span>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-700 my-2"></div>

              {/* Net Amount */}
              <div className="flex justify-between items-center">
                <span className="text-green-400 text-sm font-medium">Net Amount to Transfer</span>
                <span className="font-black text-2xl text-green-400">
                  ₹{((selectedItem?.amount || 0) - Math.round((selectedItem?.amount || 0) * 0.02)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Bank Details Preview */}
          {selectedItem?.bankDetails && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-2">Transfer To</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {selectedItem.bankDetails.accountHolderName && (
                  <p><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-800">{selectedItem.bankDetails.accountHolderName}</span></p>
                )}
                {selectedItem.bankDetails.bankName && (
                  <p><span className="text-gray-500">Bank:</span> <span className="font-medium text-gray-800">{selectedItem.bankDetails.bankName}</span></p>
                )}
                {selectedItem.bankDetails.accountNumber && (
                  <p><span className="text-gray-500">A/C:</span> <span className="font-medium text-gray-800">{selectedItem.bankDetails.accountNumber}</span></p>
                )}
                {selectedItem.bankDetails.ifscCode && (
                  <p><span className="text-gray-500">IFSC:</span> <span className="font-medium text-gray-800">{selectedItem.bankDetails.ifscCode}</span></p>
                )}
                {selectedItem.bankDetails.upiId && (
                  <p className="col-span-2"><span className="text-gray-500">UPI:</span> <span className="font-medium text-gray-800">{selectedItem.bankDetails.upiId}</span></p>
                )}
              </div>
            </div>
          )}

          {/* Transaction Reference Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Transaction Reference</label>
            <input
              type="text"
              value={modalInput}
              onChange={(e) => setModalInput(e.target.value)}
              placeholder="e.g., UPI-1234567890 or Bank Ref No."
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm"
            />
            <p className="text-[10px] text-gray-400 mt-1">Optional. A reference ID will be auto-generated if left empty.</p>
          </div>

          {/* Info Note */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <FiAlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-800 leading-relaxed">
              <span className="font-bold">TDS Note:</span> 2% TDS will be deducted as per regulations. Both the withdrawal and TDS entries will appear in the vendor's transaction history.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={closeModals}>Cancel</Button>
            <Button
              onClick={handleApproveWithdrawalSubmit}
              isLoading={actionLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-6"
            >
              Confirm & Pay ₹{((selectedItem?.amount || 0) - Math.round((selectedItem?.amount || 0) * 0.02)).toLocaleString()}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Withdrawal Modal */}
      <Modal
        isOpen={activeModal === 'reject_withdrawal'}
        onClose={closeModals}
        title="Reject Withdrawal"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Please provide a reason for rejecting this withdrawal request.</p>
          <textarea
            value={modalInput}
            onChange={(e) => setModalInput(e.target.value)}
            placeholder="e.g., Incorrect bank details..."
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
            rows={3}
          />
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={closeModals}>Cancel</Button>
            <Button
              onClick={handleRejectWithdrawalSubmit}
              isLoading={actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reject Request
            </Button>
          </div>
        </div>
      </Modal>
    </div >
  );
};

export default SettlementManagement;
