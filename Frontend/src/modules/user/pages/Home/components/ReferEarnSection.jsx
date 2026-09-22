import React from 'react';
import { themeColors } from '../../../../../theme';

const ReferEarnSection = ({ onReferClick }) => {
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm mx-4 mt-3 bg-white border border-[#347989]/20"
      style={{
        background: `linear-gradient(135deg, ${themeColors.brand.teal}0F 0%, ${themeColors.brand.yellow}0F 100%)`,
      }}
    >
      <div className="p-4 sm:p-5 flex items-center justify-between">
        <div className="flex-1 pr-3">
          <h3 className="text-[17px] sm:text-lg font-extrabold mb-1 text-slate-900 tracking-tight">
            Refer and get free services
          </h3>
          <p className="text-sm font-medium text-slate-600">
            Invite friends & earn ₹100 instant reward*
          </p>
        </div>

        {/* Gift Boxes Illustration */}
        <div className="flex items-center gap-1 shrink-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center transform rotate-12 shadow-sm border border-[#347989]/20"
            style={{ backgroundColor: `${themeColors.brand.teal}18` }}
          >
            <span className="text-xl">🎁</span>
          </div>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center transform -rotate-6 -ml-2.5 shadow-sm border border-[#D68F35]/20"
            style={{ backgroundColor: `${themeColors.brand.yellow}18` }}
          >
            <span className="text-lg">🎁</span>
          </div>
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center transform rotate-12 -ml-2 shadow-sm border border-[#BB5F36]/20"
            style={{ backgroundColor: `${themeColors.brand.orange}18` }}
          >
            <span className="text-sm">🎁</span>
          </div>
        </div>
      </div>

      <button
        onClick={onReferClick}
        className="w-full text-white font-bold py-3 text-sm active:scale-[0.99] transition-all rounded-b-2xl shadow-sm"
        style={{
          backgroundColor: themeColors.brand.teal,
        }}
      >
        Refer Now
      </button>
    </div>
  );
};

export default ReferEarnSection;
