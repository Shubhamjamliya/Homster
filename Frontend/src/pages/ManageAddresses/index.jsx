import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiPlus, FiMoreVertical, FiEdit2, FiTrash2 } from 'react-icons/fi';
import AddressFormModal from '../../components/common/AddressFormModal';

const ManageAddresses = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      label: 'Home',
      address: 'vyv, New Palasia, Indore, Madhya Pradesh 452001, India',
      name: 'yfufu',
      phone: '+91 6261387233'
    }
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMenu, setShowMenu] = useState(null); // Address ID for which menu is open
  const [editingAddress, setEditingAddress] = useState(null);

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingAddress(null);
  };

  const handleSaveAddress = (formData) => {
    if (editingAddress) {
      // Update existing address
      setAddresses(addresses.map(addr => 
        addr.id === editingAddress.id 
          ? { ...editingAddress, ...formData }
          : addr
      ));
      toast.success('Address updated successfully!');
    } else {
      // Add new address
      const newAddress = {
        id: Date.now(),
        ...formData
      };
      setAddresses([...addresses, newAddress]);
      toast.success('Address added successfully!');
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setShowMenu(null);
    setShowAddModal(true);
  };

  const handleDelete = (addressId) => {
    setAddresses(addresses.filter(addr => addr.id !== addressId));
    setShowMenu(null);
    toast.success('Address deleted successfully!');
  };

  const handleMenuToggle = (addressId) => {
    setShowMenu(showMenu === addressId ? null : addressId);
  };

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
            <h1 className="text-xl font-bold text-black">Manage Addresses</h1>
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        {/* Add Another Address Button */}
        <button
          onClick={handleAddAddress}
          className="w-full flex items-center gap-3 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
            <FiPlus className="w-4 h-4" style={{ color: '#8b5cf6' }} />
          </div>
          <span className="text-sm font-medium" style={{ color: '#8b5cf6' }}>
            Add another address
          </span>
        </button>

        {/* Address List */}
        <div className="mt-4 space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="bg-white border border-gray-200 rounded-xl p-4 relative"
            >
              {/* Menu Button */}
              <button
                onClick={() => handleMenuToggle(address.id)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiMoreVertical className="w-5 h-5 text-gray-600" />
              </button>

              {/* Menu Dropdown */}
              {showMenu === address.id && (
                <div className="absolute top-12 right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                  <button
                    onClick={() => handleEdit(address)}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                  >
                    <FiEdit2 className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors text-left text-red-600"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span className="text-sm">Delete</span>
                  </button>
                </div>
              )}

              {/* Address Content */}
              <div className="pr-12">
                <h3 className="text-base font-bold text-black mb-2">{address.label}</h3>
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">{address.address}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{address.name}</span>
                  <span>•</span>
                  <span>{address.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Add/Edit Address Modal */}
      <AddressFormModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        address={editingAddress}
        onSave={handleSaveAddress}
      />

      {/* Close menu when clicking outside */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(null)}
        />
      )}
    </div>
  );
};

export default ManageAddresses;

