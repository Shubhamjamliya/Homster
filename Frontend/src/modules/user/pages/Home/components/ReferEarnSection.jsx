import React from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { themeColors } from '../../../../../theme';

const ReferEarnSection = ({ onReferClick }) => {
  return (
    <div
      onClick={onReferClick}
      className="mx-4 mt-2 mb-4 p-3.5 sm:p-4 rounded-2xl cursor-pointer bg-white border border-[#347989]/15 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.99] flex items-center justify-between gap-3 relative overflow-hidden group"
      style={{
        background: `linear-gradient(135deg, rgba(52, 121, 137, 0.05) 0%, rgba(214, 143, 53, 0.05) 100%)`,
      }}
    >
      {/* Left Gift Badge */}
      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#347989]/15 to-[#D68F35]/15 border border-[#347989]/20 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-200">
        <span className="text-xl sm:text-2xl">🎁</span>
      </div>

      {/* Center Text */}
      <div className="flex-1 min-w-0">
        <h3 className="text-[14px] sm:text-[15px] font-extrabold text-slate-900 leading-snug truncate">
          Refer &amp; Get Free Services
        </h3>
        <p className="text-[11.5px] sm:text-[12px] font-medium text-slate-500 leading-tight mt-0.5 truncate">
          Invite friends &amp; earn ₹100 reward*
        </p>
      </div>

      {/* Right Action Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onReferClick?.();
        }}
        className="shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs group-hover:shadow-sm transition-all duration-200 flex items-center gap-1 active:scale-95 leading-none"
        style={{
          backgroundColor: themeColors.brand.teal,
        }}
      >
        <span>Refer</span>
        <FiArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
};

export default ReferEarnSection;
