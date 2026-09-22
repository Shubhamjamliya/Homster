import React from 'react';
import CategoryCard from '../../../components/common/CategoryCard';

const toAssetUrl = (url) => {
  if (!url) return '';
  const clean = url.replace('/api/upload', '/upload');
  if (clean.startsWith('http')) return clean;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
  return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

const ServiceCategories = React.memo(({ categories, onCategoryClick, onSeeAllClick }) => {
  if (!Array.isArray(categories) || categories.length === 0) {
    return null;
  }

  const serviceCategories = categories.map((cat) => ({
    ...cat,
    icon: toAssetUrl(cat.icon || cat.image),
  }));

  return (
    <div className="px-4 sm:px-5">
      {/* Section Header with Brand Teal Accent */}
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex flex-col">
          <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Service Categories
            <span
              className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,121,137,0.5)]"
              style={{ backgroundColor: '#347989' }}
            />
          </h2>
          <p className="text-[10.5px] text-slate-400 font-bold uppercase tracking-[0.12em] mt-0.5">
            Premium Home Services
          </p>
        </div>
      </div>

      {/* Modern Card Container with Refined Spacing */}
      <div className="bg-white rounded-3xl p-2.5 sm:p-3.5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] border border-slate-100">
        <div className="grid grid-cols-4 gap-y-3 gap-x-0.5 sm:gap-x-1.5">
          {serviceCategories.map((category, index) => {
            const iconSrc = toAssetUrl(category.icon || category.image);
            return (
              <div key={category.id || index} className="flex justify-center h-full">
                <CategoryCard
                  title={category.title}
                  icon={
                    <img
                      src={iconSrc}
                      alt={category.title}
                      className="w-10 h-10 sm:w-11 sm:h-11 object-contain transition-transform duration-300 group-hover:scale-105 rounded-lg"
                      loading="lazy"
                      decoding="async"
                    />
                  }
                  onClick={() => onCategoryClick?.(category)}
                  hasSaleBadge={category.hasSaleBadge}
                  index={index}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

ServiceCategories.displayName = 'ServiceCategories';

export default ServiceCategories;
