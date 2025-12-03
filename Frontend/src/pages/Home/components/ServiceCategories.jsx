import React from 'react';
import { 
  MdElectricalServices, 
  MdCable, 
  MdBuild, 
  MdAcUnit, 
  MdEmergency,
  MdHome 
} from 'react-icons/md';
import CategoryCard from '../../../components/common/CategoryCard';

const ServiceCategories = ({ categories, onCategoryClick }) => {
  // Default electrical service categories if none provided
  const defaultCategories = [
    { id: 1, title: 'Electrical Installation', icon: MdElectricalServices },
    { id: 2, title: 'Wiring & Rewiring', icon: MdCable },
    { id: 3, title: 'Appliance Repair', icon: MdBuild },
    { id: 4, title: 'AC & Appliance Repair', icon: MdAcUnit },
    { id: 5, title: 'Emergency Services', icon: MdEmergency },
    { id: 6, title: 'Smart Home Setup', icon: MdHome },
  ];

  const serviceCategories = categories || defaultCategories;

  return (
    <div className="px-4 mb-6">
      <div className="grid grid-cols-3 gap-4">
        {serviceCategories.map((category) => {
          const IconComponent = category.icon;
          return (
            <CategoryCard
              key={category.id}
              title={category.title}
              icon={<IconComponent className="w-8 h-8 text-gray-600" />}
              onClick={() => onCategoryClick?.(category)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ServiceCategories;

