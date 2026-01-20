import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSettings, FiGrid, FiDollarSign, FiSave, FiUser, FiMail, FiTrash2, FiPlus, FiUsers, FiShield, FiFileText, FiMapPin, FiPhone, FiHeadphones, FiMessageCircle } from 'react-icons/fi';
import { getSettings, updateSettings, updateAdminProfile, getAdminProfile, getAllAdmins, createAdmin, deleteAdmin } from '../../services/settingsService';
import { toast } from 'react-hot-toast';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    workerAutoAssignment: true,
  });

  const [financialSettings, setFinancialSettings] = useState({
    visitedCharges: 0,
    gstPercentage: 18,
    commissionPercentage: 10,
    vendorCashLimit: 10000
  });

  // Billing Configuration State
  const [billingSettings, setBillingSettings] = useState({
    companyName: 'TodayMyDream',
    companyGSTIN: '',
    companyPAN: '',
    companyAddress: '',
    companyCity: '',
    companyState: '',
    companyPincode: '',
    companyPhone: '',
    companyEmail: '',
    invoicePrefix: 'INV',
    sacCode: '998599'
  });
  const [billingLoading, setBillingLoading] = useState(false);

  // Support Settings State
  const [supportSettings, setSupportSettings] = useState({
    supportEmail: '',
    supportPhone: '',
    supportWhatsapp: ''
  });
  const [supportLoading, setSupportLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: 'admin',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Admin Management State
  const [admins, setAdmins] = useState([]);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [adminLoading, setAdminLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const isSuperAdmin = profile.role === 'super_admin';

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getAdminProfile();
        if (res.success && res.data) {
          setProfile(prev => ({
            ...prev,
            email: res.data.email,
            name: res.data.name || 'Admin',
            role: res.data.role || 'admin'
          }));
          const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
          const newData = { ...adminData, ...res.data };
          localStorage.setItem('adminData', JSON.stringify(newData));
        }
      } catch (error) {
        console.error('Error loading admin profile:', error);
      }
    };

    const loadSettings = () => {
      try {
        const adminSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
        if (Object.keys(adminSettings).length > 0) {
          setSettings(prev => ({ ...prev, ...adminSettings }));
        }
      } catch (error) {
        console.error('Error loading admin settings:', error);
      }
    };

    const loadFinancialSettings = async () => {
      try {
        const res = await getSettings();
        if (res.success && res.settings) {
          setFinancialSettings({
            visitedCharges: res.settings.visitedCharges || 0,
            gstPercentage: res.settings.gstPercentage || 0,
            commissionPercentage: res.settings.commissionPercentage || 0,
            vendorCashLimit: res.settings.vendorCashLimit || 10000
          });
          // Load billing settings
          setBillingSettings({
            companyName: res.settings.companyName || 'TodayMyDream',
            companyGSTIN: res.settings.companyGSTIN || '',
            companyPAN: res.settings.companyPAN || '',
            companyAddress: res.settings.companyAddress || '',
            companyCity: res.settings.companyCity || '',
            companyState: res.settings.companyState || '',
            companyPincode: res.settings.companyPincode || '',
            companyPhone: res.settings.companyPhone || '',
            companyEmail: res.settings.companyEmail || '',
            invoicePrefix: res.settings.invoicePrefix || 'INV',
            sacCode: res.settings.sacCode || '998599'
          });
          // Load support settings
          setSupportSettings({
            supportEmail: res.settings.supportEmail || '',
            supportPhone: res.settings.supportPhone || '',
            supportWhatsapp: res.settings.supportWhatsapp || ''
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadProfile();
    loadSettings();
    loadFinancialSettings();
  }, []);

  // Load admins for super_admin
  useEffect(() => {
    if (isSuperAdmin) {
      loadAdmins();
    }
  }, [isSuperAdmin]);

  const loadAdmins = async () => {
    try {
      const res = await getAllAdmins();
      if (res.success) {
        setAdmins(res.data || []);
      }
    } catch (error) {
      console.error('Error loading admins:', error);
    }
  };

  const handleToggle = (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    localStorage.setItem('adminSettings', JSON.stringify(updated));
    window.dispatchEvent(new Event('adminSettingsUpdated'));
  };

  const handleFinancialChange = (e) => {
    const { name, value } = e.target;
    setFinancialSettings(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleFinancialSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSettings(financialSettings);
      toast.success('Financial settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  // Handle billing settings change
  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingSettings(prev => ({ ...prev, [name]: value }));
  };

  // Save billing settings
  const handleBillingSave = async (e) => {
    e.preventDefault();
    setBillingLoading(true);
    try {
      await updateSettings(billingSettings);
      toast.success('Billing settings updated');
    } catch (error) {
      toast.error('Failed to update billing settings');
    } finally {
      setBillingLoading(false);
    }
  };

  // Handle support settings change
  const handleSupportChange = (e) => {
    const { name, value } = e.target;
    setSupportSettings(prev => ({ ...prev, [name]: value }));
  };

  // Save support settings
  const handleSupportSave = async (e) => {
    e.preventDefault();
    setSupportLoading(true);
    try {
      await updateSettings(supportSettings);
      toast.success('Support settings updated');
    } catch (error) {
      toast.error('Failed to update support settings');
    } finally {
      setSupportLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (profile.newPassword && !profile.currentPassword) {
      return toast.error('Current password required');
    }

    setProfileLoading(true);
    try {
      const updateData = { email: profile.email };
      if (profile.newPassword) {
        updateData.currentPassword = profile.currentPassword;
        updateData.newPassword = profile.newPassword;
      } else if (profile.currentPassword) {
        updateData.currentPassword = profile.currentPassword;
      }

      await updateAdminProfile(updateData);
      const adminData = JSON.parse(localStorage.getItem('adminUser') || '{}');
      adminData.email = profile.email;
      localStorage.setItem('adminUser', JSON.stringify(adminData));

      toast.success('Profile updated');
      setProfile(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      return toast.error('All fields required');
    }
    setAdminLoading(true);
    try {
      await createAdmin(newAdmin);
      toast.success('Admin created');
      setNewAdmin({ name: '', email: '', password: '', role: 'admin' });
      setShowAddAdmin(false);
      loadAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleDeleteAdmin = async (id, name) => {
    if (!window.confirm(`Delete admin "${name}"?`)) return;
    try {
      await deleteAdmin(id);
      toast.success('Admin deleted');
      loadAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const [serviceMode, setServiceMode] = useState('multi');
  useEffect(() => {
    const config = JSON.parse(localStorage.getItem('adminServiceConfig') || '{}');
    setServiceMode(config.mode || 'multi');
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Admin Profile */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
              {profile.name ? profile.name.charAt(0).toUpperCase() : <FiUser />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{profile.name || 'Admin'}</h2>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                {isSuperAdmin && <FiShield className="text-amber-500" />}
                {isSuperAdmin ? 'Super Admin' : 'Admin'} • {profile.email}
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                <FiMail className="w-3 h-3" /> Email
              </label>
              <input type="email" name="email" value={profile.email} onChange={handleProfileChange} required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="pt-4 border-t border-gray-50 space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase">Change Password</p>
              <input type="password" name="currentPassword" value={profile.currentPassword} onChange={handleProfileChange}
                placeholder="Current Password" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="password" name="newPassword" value={profile.newPassword} onChange={handleProfileChange}
                  placeholder="New Password" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none" />
                <input type="password" name="confirmPassword" value={profile.confirmPassword} onChange={handleProfileChange}
                  placeholder="Confirm New" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none" />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={profileLoading}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60">
                {profileLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSave className="w-4 h-4" />}
                Update Profile
              </button>
            </div>
          </form>
        </div>

        {/* Right Column */}
        <div className="space-y-6">

          {/* Financial Configuration */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <FiDollarSign className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-bold text-gray-800">Financial Setup</h2>
            </div>

            <form onSubmit={handleFinancialSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Visit Charges (₹)</label>
                  <input type="number" name="visitedCharges" value={financialSettings.visitedCharges} onChange={handleFinancialChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Vendor Cash Limit (₹)</label>
                  <input type="number" name="vendorCashLimit" value={financialSettings.vendorCashLimit} onChange={handleFinancialChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">GST %</label>
                  <input type="number" name="gstPercentage" value={financialSettings.gstPercentage} onChange={handleFinancialChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Commission %</label>
                  <input type="number" name="commissionPercentage" value={financialSettings.commissionPercentage} onChange={handleFinancialChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={loading}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2 disabled:opacity-60">
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSave className="w-4 h-4" />}
                  Save
                </button>
              </div>
            </form>
          </div>

          {/* Support Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <FiHeadphones className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-800">Help & Support Setup</h2>
            </div>

            <form onSubmit={handleSupportSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Support Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="email" name="supportEmail" value={supportSettings.supportEmail} onChange={handleSupportChange}
                    placeholder="support@homster.com"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Support Phone</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="tel" name="supportPhone" value={supportSettings.supportPhone} onChange={handleSupportChange}
                    placeholder="+91 XXXXXXXXXX"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp Number</label>
                <div className="relative">
                  <FiMessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="tel" name="supportWhatsapp" value={supportSettings.supportWhatsapp} onChange={handleSupportChange}
                    placeholder="+91 XXXXXXXXXX"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={supportLoading}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60">
                  {supportLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSave className="w-4 h-4" />}
                  Save Settings
                </button>
              </div>
            </form>
          </div>

          {/* System Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <FiSettings className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-bold text-gray-800">System</h2>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-3">
              <div>
                <p className="font-semibold text-sm text-gray-800">Auto-Assign Workers</p>
                <p className="text-xs text-gray-500">Automatically re-assign if rejected</p>
              </div>
              <button onClick={() => handleToggle('workerAutoAssignment')}
                className={`w-11 h-6 rounded-full transition-all ${settings.workerAutoAssignment ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform ${settings.workerAutoAssignment ? 'translate-x-5' : 'translate-x-0.5'}`} style={{ marginTop: '2px' }} />
              </button>
            </div>

            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-900"><FiGrid className="inline w-3 h-3 mr-1" />Service Mode: {serviceMode === 'single' ? 'Single' : 'Multi'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Billing & Tax Configuration - Super Admin Only */}
      {isSuperAdmin && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <FiFileText className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-lg font-bold text-gray-800">Billing & Tax Configuration</h2>
              <p className="text-xs text-gray-500">Company details for invoices and tax reports</p>
            </div>
          </div>

          <form onSubmit={handleBillingSave}>
            {/* Company Information */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FiMapPin className="w-4 h-4" /> Company Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Company Name</label>
                  <input type="text" name="companyName" value={billingSettings.companyName} onChange={handleBillingChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">GSTIN</label>
                  <input type="text" name="companyGSTIN" value={billingSettings.companyGSTIN} onChange={handleBillingChange}
                    placeholder="27XXXXXXXXXX1ZX" maxLength={15}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-indigo-500 uppercase" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">PAN</label>
                  <input type="text" name="companyPAN" value={billingSettings.companyPAN} onChange={handleBillingChange}
                    placeholder="XXXXXXXXXX" maxLength={10}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-indigo-500 uppercase" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                  <input type="text" name="companyAddress" value={billingSettings.companyAddress} onChange={handleBillingChange}
                    placeholder="Street address, building, area"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                  <input type="text" name="companyCity" value={billingSettings.companyCity} onChange={handleBillingChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                  <input type="text" name="companyState" value={billingSettings.companyState} onChange={handleBillingChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Pincode</label>
                  <input type="text" name="companyPincode" value={billingSettings.companyPincode} onChange={handleBillingChange}
                    maxLength={6}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                  <input type="tel" name="companyPhone" value={billingSettings.companyPhone} onChange={handleBillingChange}
                    placeholder="+91 XXXXXXXXXX"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input type="email" name="companyEmail" value={billingSettings.companyEmail} onChange={handleBillingChange}
                    placeholder="billing@company.com"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-indigo-500" />
                </div>
              </div>
            </div>

            {/* Invoice Settings */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FiFileText className="w-4 h-4" /> Invoice Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Invoice Prefix</label>
                  <input type="text" name="invoicePrefix" value={billingSettings.invoicePrefix} onChange={handleBillingChange}
                    placeholder="INV" maxLength={5}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-indigo-500 uppercase" />
                  <p className="text-[10px] text-gray-400 mt-1">e.g., INV/2025-26/00001</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">SAC Code</label>
                  <input type="text" name="sacCode" value={billingSettings.sacCode} onChange={handleBillingChange}
                    placeholder="998599" maxLength={6}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-indigo-500" />
                  <p className="text-[10px] text-gray-400 mt-1">Service Accounting Code for GST</p>
                </div>
                <div className="flex items-end">
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 w-full">
                    <p className="text-xs font-medium text-indigo-900">GST Rate: {financialSettings.gstPercentage}%</p>
                    <p className="text-[10px] text-indigo-600">Configure in Financial Setup above</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button type="submit" disabled={billingLoading}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-60">
                {billingLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSave className="w-4 h-4" />}
                Save Billing Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin Management - Super Admin Only */}
      {isSuperAdmin && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FiUsers className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-bold text-gray-800">Manage Admins</h2>
            </div>
            <button onClick={() => setShowAddAdmin(!showAddAdmin)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 flex items-center gap-2">
              <FiPlus className="w-4 h-4" /> Add Admin
            </button>
          </div>

          {/* Add Admin Form */}
          <AnimatePresence>
            {showAddAdmin && (
              <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                onSubmit={handleCreateAdmin} className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-100 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input type="text" placeholder="Name" value={newAdmin.name} onChange={e => setNewAdmin(p => ({ ...p, name: e.target.value }))}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none" />
                  <input type="email" placeholder="Email" value={newAdmin.email} onChange={e => setNewAdmin(p => ({ ...p, email: e.target.value }))}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none" />
                  <input type="password" placeholder="Password" value={newAdmin.password} onChange={e => setNewAdmin(p => ({ ...p, password: e.target.value }))}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none" />
                  <select value={newAdmin.role} onChange={e => setNewAdmin(p => ({ ...p, role: e.target.value }))}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none bg-white">
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div className="flex justify-end mt-3">
                  <button type="submit" disabled={adminLoading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-60 flex items-center gap-2">
                    {adminLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiPlus className="w-4 h-4" />}
                    Create
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Admin List */}
          <div className="divide-y divide-gray-100">
            {admins.map(admin => (
              <div key={admin._id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                    {admin.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-800 flex items-center gap-1">
                      {admin.name}
                      {admin.role === 'super_admin' && <FiShield className="text-amber-500 w-3 h-3" />}
                    </p>
                    <p className="text-xs text-gray-500">{admin.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${admin.role === 'super_admin' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                    {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </span>
                  {admin._id !== profile.id && admin.email !== 'admin@admin.com' && (
                    <button onClick={() => handleDeleteAdmin(admin._id, admin.name)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {admins.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-4">No admins found</p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};
export default AdminSettings;
