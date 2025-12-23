import React from 'react';
import CategoryCard from '../../../components/common/CategoryCard';
import electricianIcon from '../../../../../assets/images/icons/services/electrician.png';
import womensSalonIcon from '../../../../../assets/images/icons/services/womens-salon-spa-icon.png';
import massageMenIcon from '../../../../../assets/images/icons/services/massage-men-icon.png';
import cleaningIcon from '../../../../../assets/images/icons/services/cleaning-icon.png';
import electricianPlumberIcon from '../../../../../assets/images/icons/services/electrician-plumber-carpenter-icon.png';
import acApplianceRepairIcon from '../../../../../assets/images/icons/services/ac-appliance-repair-icon.png';

const toAssetUrl = (url) => {
  if (!url) return '';
  const clean = url.replace('/api/upload', '/upload');
  if (clean.startsWith('http')) return clean;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
  return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

const ServiceCategories = React.memo(({ categories, onCategoryClick, onSeeAllClick }) => {
  // Urban Company service categories
  const defaultCategories = [
    { id: 0, title: 'Electricity', icon: electricianIcon },
    { id: 1, title: "Women's Salon & Spa", icon: womensSalonIcon },
    { id: 2, title: 'Massage for Men', icon: massageMenIcon },
    { id: 3, title: 'Cleaning', icon: cleaningIcon },
    { id: 4, title: 'Electrician, Plumber & Carpenter', icon: electricianPlumberIcon },
    { id: 5, title: 'AC & Appliance Repair', icon: acApplianceRepairIcon },
  ];

  const serviceCategories =
    Array.isArray(categories) && categories.length > 0
      ? categories.map((cat) => ({
        ...cat,
        icon: toAssetUrl(cat.icon || cat.image) || defaultCategories.find((d) => d.title === cat.title)?.icon,
      }))
      : defaultCategories.map((d) => ({ ...d, icon: toAssetUrl(d.icon) }));

  return (
    <div className="px-4 pt-4 pb-2">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 drop-shadow-sm">Categories</h2>
        <button
          onClick={onSeeAllClick}
          className="font-semibold text-sm transition-all hover:scale-105 active:scale-95 text-gray-800 drop-shadow-sm"
          style={{ color: '#F59E0B' }}
        >
          See All
        </button>
      </div>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2">
        {serviceCategories.map((category, index) => {
          const iconSrc = toAssetUrl(category.icon || category.image);
          return (
            <div key={category.id} className="shrink-0">
              <CategoryCard
                title={category.title}
                icon={
                  <img
                    src={iconSrc}
                    alt={category.title}
                    className="w-8 h-8 object-contain"
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
  );
});

ServiceCategories.displayName = 'ServiceCategories';

export default ServiceCategories;

