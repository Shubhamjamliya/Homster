import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiGift, FiShoppingBag, FiUser } from 'react-icons/fi';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'home', label: 'UC', icon: FiHome, path: '/' },
    { id: 'rewards', label: 'Rewards', icon: FiGift, path: '/rewards' },
    { id: 'native', label: 'Native', icon: FiShoppingBag, path: '/native' },
    { id: 'account', label: 'Account', icon: FiUser, path: '/account' },
  ];

  const getActiveTab = () => {
    if (location.pathname === '/') return 'home';
    if (location.pathname === '/rewards') return 'rewards';
    if (location.pathname === '/native') return 'native';
    if (location.pathname === '/account') return 'account';
    return 'home';
  };

  const activeTab = getActiveTab();

  const handleTabClick = (path) => {
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.path)}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-4 transition-colors ${
                activeTab === item.id
                  ? activeTab === 'native' 
                    ? 'text-black' 
                    : 'text-purple-600'
                  : 'text-gray-500'
              }`}
            >
              <IconComponent className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

