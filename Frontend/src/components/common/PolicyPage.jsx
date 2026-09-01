import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiFileText, FiShield } from 'react-icons/fi';
import { configService } from '../../services/configService';

const policyDetails = {
  privacy: { key: 'privacyPolicy', title: 'Privacy Policy', description: 'How Homestr collects, uses, and protects information.' },
  user: { key: 'userPolicy', title: 'User Policy', description: 'Rules and terms for customers using Homestr services.' },
  vendor: { key: 'vendorPolicy', title: 'Vendor Policy', description: 'Rules and terms for service partners on Homestr.' }
};

const PolicyPage = ({ type }) => {
  const navigate = useNavigate();
  const details = policyDetails[type] || policyDetails.privacy;
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPolicy = async () => {
      const response = await configService.getSettings();
      if (response.success) setContent(response.settings?.[details.key] || '');
      setLoading(false);
    };

    loadPolicy();
  }, [details.key]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <button type="button" onClick={() => navigate(-1)} aria-label="Go back"
            className="rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100">
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold">{details.title}</h1>
            <p className="text-xs text-slate-500">Homestr</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-teal-50 p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-white">
              {type === 'privacy' ? <FiShield className="h-5 w-5" /> : <FiFileText className="h-5 w-5" />}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{details.title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{details.description}</p>
          </div>

          <div className="min-h-48 p-6">
            {loading ? (
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
                Loading policy...
              </div>
            ) : content ? (
              <article className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{content}</article>
            ) : (
              <p className="text-sm leading-6 text-slate-500">This policy has not been published yet. Please check back later.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PolicyPage;
