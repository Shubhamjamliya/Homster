import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiAlertTriangle, FiCode, FiTrash2 } from 'react-icons/fi';
import { clearBookingActivity } from '../../services/settingsService';

const DeveloperSettings = () => {
  const [confirmation, setConfirmation] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const [deleted, setDeleted] = useState(null);

  const handleClear = async () => {
    if (confirmation !== 'CLEAR ALL') {
      toast.error('Type CLEAR ALL to enable this action.');
      return;
    }

    setIsClearing(true);
    try {
      const response = await clearBookingActivity(confirmation);
      setDeleted(response.deleted);
      setConfirmation('');
      toast.success('Booking activity has been cleared.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not reset booking activity.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 shadow-lg">
            <FiCode className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Developer Settings</h1>
            <p className="mt-1 text-sm text-slate-500">Restricted maintenance controls for the booking system.</p>
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
          <div className="border-b border-red-100 bg-red-50 px-6 py-5">
            <div className="flex items-start gap-3">
              <FiAlertTriangle className="mt-0.5 shrink-0 text-xl text-red-600" />
              <div>
                <h2 className="font-bold text-red-900">Reset booking activity</h2>
                <p className="mt-1 text-sm leading-6 text-red-800">
                  This permanently removes all bookings and their related booking requests, vendor bills, and transactions.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 px-6 py-6">
            <p className="text-sm leading-6 text-slate-600">
              Users, vendors, workers, services, catalog data, reviews, settings, settlements, wallets, and unrelated transactions are not changed.
            </p>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Type CLEAR ALL to confirm</span>
              <input
                type="text"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                placeholder="CLEAR ALL"
                autoComplete="off"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm uppercase outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
              />
            </label>

            <button
              type="button"
              onClick={handleClear}
              disabled={confirmation !== 'CLEAR ALL' || isClearing}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiTrash2 className="text-base" />
              {isClearing ? 'Clearing activity...' : 'Clear ALL'}
            </button>

            {deleted && (
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Cleared {deleted.bookings} bookings, {deleted.bookingRequests} booking requests, {deleted.vendorBills} vendor bills, and {deleted.transactions} transactions.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DeveloperSettings;
