import React from 'react';
import BottomNav from '../../components/layout/BottomNav';
import { FiCopy } from 'react-icons/fi';
import { FaWhatsapp, FaFacebookMessenger } from 'react-icons/fa';

const Rewards = () => {
  const handleCopyLink = () => {
    console.log('Copy link clicked');
    // Copy referral link to clipboard
    const referralLink = 'https://appzeto.com/refer/your-link';
    navigator.clipboard.writeText(referralLink).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  const handleShareWhatsApp = () => {
    console.log('Share via WhatsApp');
    const text = 'Check out this amazing electrical services app!';
    const url = 'https://appzeto.com/refer/your-link';
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  };

  const handleShareMessenger = () => {
    console.log('Share via Messenger');
    const url = 'https://appzeto.com/refer/your-link';
    window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=your-app-id`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="bg-black text-white py-4">
        <div className="px-4 text-center">
          <h1 className="text-lg font-semibold">Refer & Earn</h1>
        </div>
      </header>

      <main>
        {/* Main Referral Section */}
        <div className="bg-blue-50 relative overflow-hidden">
          {/* Dotted Pattern Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_black_1px,_transparent_1px)] bg-[length:20px_20px]"></div>
          </div>

          <div className="relative px-4 py-6">
            <h2 className="text-xl font-bold text-black mb-3">
              Refer and get FREE services
            </h2>
            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
              Invite your friends to try our electrical services. They get instant ₹100 off. You win ₹100 once they take a service.
            </p>

            {/* Gift Box Illustration */}
            <div className="flex justify-end mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-yellow-400 rounded-lg flex items-center justify-center transform rotate-12 shadow-lg">
                  <span className="text-4xl">🎁</span>
                </div>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-orange-400 rounded-full"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-orange-300 rounded-full"></div>
              </div>
            </div>

            {/* Refer Via Section */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Refer via</p>
              <div className="flex gap-4">
                {/* WhatsApp */}
                <button
                  onClick={handleShareWhatsApp}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center">
                    <FaWhatsapp className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-xs text-gray-700">Whatsapp</span>
                </button>

                {/* Messenger */}
                <button
                  onClick={handleShareMessenger}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center">
                    <FaFacebookMessenger className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-xs text-gray-700">Messenger</span>
                </button>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center">
                    <FiCopy className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-xs text-gray-700">Copy Link</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* How it works Section */}
        <div className="px-4 py-6 bg-white">
          <h3 className="text-lg font-bold text-black mb-4">How it works?</h3>
          
          <div className="relative pl-8">
            {/* Vertical Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>

            {/* Step 1 */}
            <div className="relative mb-6">
              <div className="absolute -left-8 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-700">1</span>
              </div>
              <p className="text-sm text-gray-700">Invite your friends & get rewarded</p>
            </div>

            {/* Step 2 */}
            <div className="relative mb-6">
              <div className="absolute -left-8 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-700">2</span>
              </div>
              <p className="text-sm text-gray-700">They get ₹100 on their first service</p>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="absolute -left-8 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-700">3</span>
              </div>
              <p className="text-sm text-gray-700">You get ₹100 once their service is completed</p>
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-blue-600 text-sm">
            <span className="text-blue-600">•</span>
            <button className="hover:underline">Terms and conditions</button>
            <span className="text-blue-600">•</span>
            <button className="hover:underline">FAQs</button>
          </div>
        </div>

        {/* Scratch Cards Section - New Addition */}
        <div className="px-4 py-6">
          <h2 className="text-lg font-bold text-gray-800 mb-2">
            You are yet to earn any scratch cards
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Start referring to get surprises
          </p>

          {/* Dotted Line Separator */}
          <div className="border-t border-dotted border-gray-300 my-4"></div>

          {/* Referral Offer */}
          <div className="flex items-center gap-3 mt-6">
            <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🎁</span>
            </div>
            <p className="text-base text-gray-800 font-medium">
              Earn ₹100 on every successful referral
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Rewards;

