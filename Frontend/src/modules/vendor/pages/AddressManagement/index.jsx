import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiSave } from 'react-icons/fi';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { toast } from 'react-hot-toast';
import { vendorTheme as themeColors } from '../../../../theme';
import vendorService from '../../../../services/vendorService';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import GoogleMapPicker from './components/GoogleMapPicker';

const libraries = ['places'];

const AddressManagement = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [loading, setLoading] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  // Load saved address from backend
  useEffect(() => {
    const loadAddress = async () => {
      try {
        const response = await vendorService.getProfile();
        if (response.success && response.vendor.address) {
          const addr = response.vendor.address;
          if (addr.fullAddress) {
            setAddress(addr.fullAddress);
          }
          if (addr.lat && addr.lng) {
            setSelectedLocation({
              lat: addr.lat,
              lng: addr.lng,
              address: addr.fullAddress || ''
            });
          }
        }
      } catch (error) {
        console.error('Error loading address:', error);
      }
    };
    loadAddress();
  }, []);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setAddress(location.address);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address
        };
        setSelectedLocation(location);
        setAddress(place.formatted_address);
      }
    }
  };

  const onAutocompleteLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const handleSave = async () => {
    if (!address || !selectedLocation) {
      toast.error('Please select an address');
      return;
    }

    setLoading(true);
    try {
      const response = await vendorService.updateAddress({
        fullAddress: address,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng
      });

      if (response.success) {
        toast.success('Address saved successfully!');
        setTimeout(() => {
          navigate('/vendor/profile');
        }, 1000);
      } else {
        toast.error(response.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error(error.response?.data?.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
      <Header
        title="Manage Address"
        showBack={true}
        onBack={() => navigate('/vendor/settings')}
      />

      <main className="px-4 py-6">
        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <FiMapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Set Your Business Location</h3>
              <p className="text-sm text-blue-700">
                This address will be used to show your location to customers and calculate service areas.
              </p>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <GoogleMapPicker
            onLocationSelect={handleLocationSelect}
            initialPosition={selectedLocation}
          />
        </div>

        {/* Address Input */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-md">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Business Address
          </label>
          {isLoaded ? (
            <Autocomplete
              onLoad={onAutocompleteLoad}
              onPlaceChanged={onPlaceChanged}
              options={{
                componentRestrictions: { country: 'in' },
                fields: ['formatted_address', 'geometry', 'name']
              }}
            >
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for your business location..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 rounded-lg text-sm focus:outline-none transition-colors"
                  style={{ borderColor: '#e5e7eb' }}
                  onFocus={(e) => e.target.style.borderColor = themeColors.button}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </Autocomplete>
          ) : (
            <div className="relative">
              <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Loading Google Maps..."
                disabled
                className="w-full pl-10 pr-4 py-3 border-2 rounded-lg text-sm bg-gray-100"
                style={{ borderColor: '#e5e7eb' }}
              />
            </div>
          )}
          {selectedLocation && (
            <p className="text-xs text-gray-500 mt-2">
              Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </p>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!address || !selectedLocation || loading}
          className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: themeColors.button,
            boxShadow: `0 4px 12px ${themeColors.button}40`
          }}
        >
          <FiSave className="w-5 h-5" />
          {loading ? 'Saving...' : 'Save Address'}
        </button>
      </main>

      <BottomNav />
    </div>
  );
};

export default AddressManagement;
