import React from 'react';
import CategoryCard from '../../../components/common/CategoryCard';
import womensSalonIcon from '../../../assets/images/icons/services/womens-salon-spa-icon.png';
import massageMenIcon from '../../../assets/images/icons/services/massage-men-icon.png';
import cleaningIcon from '../../../assets/images/icons/services/cleaning-icon.png';
import electricianPlumberIcon from '../../../assets/images/icons/services/electrician-plumber-carpenter-icon.png';
import acApplianceRepairIcon from '../../../assets/images/icons/services/ac-appliance-repair-icon.png';
import nativeWaterPurifierIcon from '../../../assets/images/icons/services/water-purifier-icon.png';

const ServiceCategories = ({ categories, onCategoryClick }) => {
  // Urban Company service categories
  const defaultCategories = [
    { id: 1, title: "Women's Salon & Spa", icon: womensSalonIcon },
    { id: 2, title: 'Massage for Men', icon: massageMenIcon },
    { id: 3, title: 'Cleaning', icon: cleaningIcon },
    { id: 4, title: 'Electrician, Plumber & Carpenter', icon: electricianPlumberIcon },
    { id: 5, title: 'AC & Appliance Repair', icon: acApplianceRepairIcon },
    { id: 6, title: 'Native Water Purifier', icon: nativeWaterPurifierIcon, hasSaleBadge: true },
  ];

  const serviceCategories = categories || defaultCategories;

  return (
    <div className="px-4 mb-6">
      <div className="grid grid-cols-3 gap-2">
        {serviceCategories.map((category) => {
          return (
            <CategoryCard
              key={category.id}
              title={category.title}
              icon={<img src={category.icon} alt={category.title} className="w-10 h-10 object-contain" />}
              onClick={() => onCategoryClick?.(category)}
              hasSaleBadge={category.hasSaleBadge}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ServiceCategories;

