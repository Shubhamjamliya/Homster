import React, { memo, useMemo } from 'react';
import { optimizeCloudinaryUrl } from '../../../../utils/cloudinaryOptimize';

const SimpleServiceCard = memo(({ image, title, onClick }) => {
  const formattedTitle = useMemo(() => {
    if (!title) return '';
    const cleaned = title.replace(/servcies/gi, 'services');
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }, [title]);

  return (
    <div
      className="min-w-[122px] w-[122px] sm:min-w-[138px] sm:w-[138px] bg-white rounded-2xl overflow-hidden cursor-pointer border border-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col group active:scale-[0.98]"
      onClick={onClick}
    >
      <div className="w-full h-20 sm:h-[88px] bg-slate-50 relative overflow-hidden flex items-center justify-center">
        {image ? (
          <img
            src={optimizeCloudinaryUrl(image, { width: 300, quality: 'auto' })}
            alt={formattedTitle}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="px-1.5 py-1.5 flex-1 flex items-center min-h-[32px]">
        <h3 className="text-[10.5px] sm:text-[11px] font-semibold text-slate-800 leading-tight line-clamp-2 transition-colors group-hover:text-primary-700">
          {formattedTitle}
        </h3>
      </div>
    </div>
  );
});

SimpleServiceCard.displayName = 'SimpleServiceCard';

export default SimpleServiceCard;
