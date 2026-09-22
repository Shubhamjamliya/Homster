import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../../theme';
import { userAuthService } from '../../../../services/authService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiEdit3,
  FiClipboard,
  FiHeadphones,
  FiFileText,
  FiStar,
  FiMapPin,
  FiSettings,
  FiChevronRight,
  FiShoppingBag,
  FiLogOut,
  FiGift,
  FiShield,
  FiZap,
} from 'react-icons/fi';
import { MdAccountBalanceWallet } from 'react-icons/md';
import NotificationBell from '../../components/common/NotificationBell';

const Account = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({
    name: 'Verified Customer',
    phone: '',
    email: '',
    isPhoneVerified: false,
    isEmailVerified: false,
    walletBalance: 0,
    plans: null
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from database
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          setUserProfile({
            name: userData.name || 'Verified Customer',
            phone: userData.phone || '',
            email: userData.email || '',
            isPhoneVerified: userData.isPhoneVerified || false,
            isEmailVerified: userData.isEmailVerified || false,
            profilePhoto: userData.profilePhoto || '',
            walletBalance: userData.wallet?.balance ?? 0
          });
        }

        const response = await userAuthService.getProfile();
        if (response.success && response.user) {
          setUserProfile({
            name: response.user.name || 'Verified Customer',
            phone: response.user.phone || '',
            email: response.user.email || '',
            isPhoneVerified: response.user.isPhoneVerified || false,
            isEmailVerified: response.user.isEmailVerified || false,
            profilePhoto: response.user.profilePhoto || '',
            walletBalance: response.user.wallet?.balance ?? 0,
            plans: response.user.plans
          });
        }
      } catch (error) {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          setUserProfile({
            name: userData.name || 'Verified Customer',
            phone: userData.phone || '',
            email: userData.email || '',
            isPhoneVerified: userData.isPhoneVerified || false,
            isEmailVerified: userData.isEmailVerified || false
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    if (phone.startsWith('+91')) return phone;
    if (phone.length === 10) return `+91 ${phone}`;
    return phone;
  };

  // Get initials for avatar
  const getInitials = () => {
    if (userProfile.name && userProfile.name !== 'Verified Customer') {
      const names = userProfile.name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    if (userProfile.phone) {
      return userProfile.phone.slice(-2);
    }
    return 'VC';
  };

  const handleLogout = async () => {
    try {
      await userAuthService.logout();
      toast.success('Logged out successfully');
      navigate('/user/login');
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      toast.success('Logged out successfully');
      navigate('/user/login');
    }
  };

  const MenuGroup = ({ title, children }) => (
    <div className="mb-5">
      <h3 className="text-[11.5px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1.5">{title}</h3>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100/80">
        {children}
      </div>
    </div>
  );

  const MenuItem = ({ icon: Icon, label, onClick, color = "text-slate-800", badge, customIcon }) => (
    <motion.button
      type="button"
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50/80 transition-colors text-left group select-none"
    >
      <div className="flex items-center gap-3.5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
          style={{
            backgroundColor: color === 'text-red-500' ? '#FEF2F2' : `${themeColors.brand.teal}12`,
            color: color === 'text-red-500' ? '#EF4444' : themeColors.brand.teal,
          }}
        >
          {customIcon || (Icon && <Icon className="w-4.5 h-4.5" />)}
        </div>
        <span className={`font-semibold text-[13.5px] sm:text-[14px] ${color}`}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[10px] font-bold rounded-full">
            {badge}
          </span>
        )}
        <FiChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#347989] group-hover:translate-x-0.5 transition-all" />
      </div>
    </motion.button>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 relative bg-white">
      {/* Subtle Brand Mesh Gradient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(at 0% 0%, ${themeColors?.brand?.teal || '#347989'}18 0%, transparent 70%),
              radial-gradient(at 100% 0%, ${themeColors?.brand?.yellow || '#D68F35'}15 0%, transparent 70%),
              radial-gradient(at 100% 100%, ${themeColors?.brand?.orange || '#BB5F36'}12 0%, transparent 75%),
              #FFFFFF
            `
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Harmonized Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-slate-100 px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200/90 active:scale-95 transition-transform"
            >
              <FiArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            <h1 className="text-[18px] sm:text-xl font-extrabold text-slate-900 tracking-tight">Account</h1>
          </div>
          <NotificationBell />
        </header>

        <motion.main
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="px-4 pt-5 max-w-lg mx-auto"
        >
          {/* Straightened, Elegant Profile Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-3xl p-5 shadow-[0_4px_24px_-4px_rgba(52,121,137,0.08)] mb-5 relative overflow-hidden border border-slate-100"
          >
            {/* Subtle Brand Ambient Glows */}
            <div
              className="absolute top-0 right-0 w-44 h-44 rounded-full -mr-16 -mt-16 blur-2xl opacity-20 pointer-events-none"
              style={{ backgroundColor: themeColors.brand.yellow }}
            />
            <div
              className="absolute bottom-0 left-0 w-44 h-44 rounded-full -ml-20 -mb-20 blur-2xl opacity-20 pointer-events-none"
              style={{ backgroundColor: themeColors.brand.teal }}
            />

            <div className="flex items-center gap-4 relative z-10">
              <div className="relative shrink-0">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl p-1 bg-white shadow-md border border-slate-100">
                  {userProfile.profilePhoto ? (
                    <img
                      src={userProfile.profilePhoto}
                      alt={userProfile.name}
                      className="w-full h-full rounded-[14px] object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full rounded-[14px] flex items-center justify-center text-white font-black text-2xl"
                      style={{ background: themeColors.gradient }}
                    >
                      {getInitials()}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/user/update-profile')}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-slate-900 text-white rounded-lg border-2 border-white shadow-md active:scale-90 transition-transform"
                  title="Edit Profile"
                >
                  <FiEdit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-[18px] sm:text-xl font-extrabold text-slate-900 truncate mb-0.5">
                  {userProfile.name}
                </h2>
                <p className="text-xs text-slate-500 font-semibold mb-2.5">
                  {userProfile.phone ? formatPhoneNumber(userProfile.phone) : 'No phone linked'}
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/user/update-profile')}
                  className="px-3.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-bold rounded-xl border border-slate-200 transition-colors inline-block active:scale-95"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </motion.div>

          {/* Designer Active Plan Card */}
          {userProfile.plans && userProfile.plans.isActive && (
            <motion.div
              variants={itemVariants}
              onClick={() => navigate('/user/my-plan')}
              className="relative overflow-hidden mb-5 rounded-3xl p-5 text-white cursor-pointer group transition-all"
              style={{
                background: `linear-gradient(135deg, ${themeColors.brand.teal} 0%, ${themeColors.brand.orange} 120%)`,
                boxShadow: `0 12px 30px -8px ${themeColors.brand.teal}40`
              }}
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <FiShield className="w-3.5 h-3.5 text-white/80" />
                    <span className="text-[9.5px] font-black uppercase tracking-[0.15em] text-white/70">Membership Status</span>
                  </div>
                  <h3 className="text-xl font-black mb-1">{userProfile.plans.name}</h3>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-white/15 backdrop-blur-md rounded-full w-fit mt-2 border border-white/10">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-[9.5px] font-bold uppercase tracking-wider">Expires: {new Date(userProfile.plans.expiry).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <FiZap className="w-7 h-7 fill-white text-white drop-shadow-md" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/15 flex justify-between items-center relative z-10">
                <span className="text-[11.5px] font-bold text-white/90">Manage Benefits</span>
                <FiChevronRight className="w-4 h-4 opacity-80 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </motion.div>
          )}

          {/* Quick Actions Grid - Harmonized White Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2.5 mb-4">
            {/* Wallet Balance Card */}
            <button
              type="button"
              onClick={() => navigate('/user/wallet')}
              className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-left group active:scale-[0.98] flex items-center justify-between gap-2"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                style={{ backgroundColor: `${themeColors.brand.teal}15`, color: themeColors.brand.teal }}
              >
                <MdAccountBalanceWallet className="w-4 h-4" />
              </div>
              <div className="text-right">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Balance</span>
                <p className={`text-[15px] font-extrabold mt-0.5 ${userProfile.walletBalance < 0 ? 'text-rose-500' : 'text-slate-900'}`}>
                  ₹{Math.abs(userProfile.walletBalance || 0).toLocaleString('en-IN')}
                  {userProfile.walletBalance < 0 && <span className="text-[10px] font-normal ml-1 text-rose-500">(Penalty)</span>}
                </p>
              </div>
            </button>

            {/* Rewards Card */}
            <button
              type="button"
              onClick={() => navigate('/user/rewards')}
              className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-left group active:scale-[0.98] flex items-center justify-between gap-2"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                style={{ backgroundColor: `${themeColors.brand.yellow}1A`, color: themeColors.brand.yellow }}
              >
                <FiGift className="w-4 h-4" />
              </div>
              <div className="text-right">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rewards</span>
                <p className="text-[15px] font-extrabold text-slate-900 mt-0.5">Refer &amp; Earn</p>
              </div>
            </button>
          </motion.div>

          {/* Grouped Menu Cards (iOS / Benchmark Design) */}

          {/* Shopping Group */}
          <motion.div variants={itemVariants}>
            <MenuGroup title="Shopping">
              <MenuItem
                icon={FiShoppingBag}
                label="Scrap Deals"
                onClick={() => navigate('/user/scrap')}
              />
              <MenuItem
                icon={FiFileText}
                label="My Plans"
                onClick={() => navigate('/user/my-plan')}
              />
            </MenuGroup>
          </motion.div>

          {/* Activity Group */}
          <motion.div variants={itemVariants}>
            <MenuGroup title="Activity">
              <MenuItem
                icon={FiClipboard}
                label="My Bookings"
                onClick={() => navigate('/user/my-bookings')}
              />
              <MenuItem
                icon={FiStar}
                label="My Ratings"
                onClick={() => navigate('/user/my-rating')}
              />
            </MenuGroup>
          </motion.div>

          {/* Preferences Group */}
          <motion.div variants={itemVariants}>
            <MenuGroup title="Preferences">
              <MenuItem
                icon={FiMapPin}
                label="Manage Addresses"
                onClick={() => navigate('/user/manage-addresses')}
              />
              <MenuItem
                icon={FiSettings}
                label="Settings"
                onClick={() => navigate('/user/settings')}
              />
            </MenuGroup>
          </motion.div>

          {/* Support Group */}
          <motion.div variants={itemVariants}>
            <MenuGroup title="Support & More">
              <MenuItem
                icon={FiHeadphones}
                label="Help & Support"
                onClick={() => navigate('/user/help-support')}
              />
              <MenuItem
                icon={FiShield}
                label="Privacy Policy"
                onClick={() => navigate('/user/policies/privacy')}
              />
              <MenuItem
                icon={FiFileText}
                label="User Policy"
                onClick={() => navigate('/user/policies/user')}
              />
              <MenuItem
                customIcon={<span className="font-bold text-sm">H</span>}
                label="About Homestr"
                onClick={() => navigate('/user/about-homestr')}
              />
            </MenuGroup>
          </motion.div>

          {/* Refined Logout Button */}
          <motion.div variants={itemVariants} className="mt-2 mb-6">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-3.5 bg-rose-50 hover:bg-rose-100/80 text-rose-600 font-bold rounded-2xl border border-rose-100 shadow-xs transition-all active:scale-[0.99] text-sm"
            >
              <FiLogOut className="w-4.5 h-4.5" />
              <span>Log Out</span>
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center pb-8">
            <p className="text-[11px] font-medium text-slate-400">Homestr Version 7.6.27</p>
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
};

export default Account;
