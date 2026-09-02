import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBriefcase, FiCheck, FiSave } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Header from '../../components/layout/Header';
import LogoLoader from '../../../../components/common/LogoLoader';
import { vendorTheme as themeColors } from '../../../../theme';
import { publicCatalogService } from '../../../../services/catalogService';
import { vendorAuthService } from '../../../../services/authService';

const YourServices = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const [categoryResponse, profileResponse] = await Promise.all([
          publicCatalogService.getCategories(),
          vendorAuthService.getProfile()
        ]);

        if (categoryResponse.success) setCategories(categoryResponse.categories || []);

        const vendor = profileResponse.vendor;
        if (profileResponse.success && vendor) {
          const services = Array.isArray(vendor.categories) && vendor.categories.length > 0
            ? vendor.categories
            : (Array.isArray(vendor.service) ? vendor.service : []);
          setSelectedServices(services.filter(service => typeof service === 'string' && service.trim()));
        }
      } catch (error) {
        console.error('Failed to load vendor services:', error);
        toast.error('Unable to load your services');
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  const toggleService = (serviceTitle) => {
    setSelectedServices(current => (
      current.includes(serviceTitle)
        ? current.filter(service => service !== serviceTitle)
        : [...current, serviceTitle]
    ));
  };

  const handleSave = async () => {
    if (selectedServices.length === 0) {
      toast.error('Select at least one service category');
      return;
    }

    setSaving(true);
    try {
      const response = await vendorAuthService.updateProfile({ serviceCategory: selectedServices });
      if (!response.success) throw new Error(response.message || 'Unable to save services');

      const updatedVendor = response.vendor || {};
      localStorage.setItem('vendorProfile', JSON.stringify(updatedVendor));
      localStorage.setItem('vendorData', JSON.stringify(updatedVendor));
      window.dispatchEvent(new Event('vendorProfileUpdated'));
      window.dispatchEvent(new Event('vendorDataUpdated'));

      toast.success('Your services have been updated');
      navigate('/vendor/profile');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Unable to save services');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LogoLoader />;

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <Header title="Your Services" />

      <main className="mx-auto max-w-2xl px-4 py-6">
        <section className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 to-cyan-700 p-6 text-white shadow-lg">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <FiBriefcase className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-black">Services you provide</h1>
          <p className="mt-2 text-sm leading-6 text-teal-50">Select every category you can serve. Customers will only send you bookings that match these selections.</p>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="font-bold text-slate-900">Service categories</h2>
            <p className="mt-1 text-sm text-slate-500">{selectedServices.length} selected</p>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {categories.map(category => {
                const selected = selectedServices.includes(category.title);
                return (
                  <button key={category._id || category.title} type="button" onClick={() => toggleService(category.title)}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${selected ? 'border-teal-500 bg-teal-50 shadow-sm' : 'border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50'}`}>
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${selected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {selected ? <FiCheck className="h-5 w-5" /> : <FiBriefcase className="h-5 w-5" />}
                    </div>
                    <span className={`text-sm font-bold ${selected ? 'text-teal-800' : 'text-slate-700'}`}>{category.title}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">No service categories are available yet.</p>
          )}
        </section>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={() => navigate('/vendor/profile')}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-50">
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={saving || categories.length === 0}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-bold text-white shadow-lg transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: themeColors.button }}>
            {saving ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <FiSave className="h-5 w-5" />}
            Save services
          </button>
        </div>
      </main>
    </div>
  );
};

export default YourServices;
