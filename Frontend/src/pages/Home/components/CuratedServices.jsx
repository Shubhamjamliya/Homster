import React from 'react';
import ServiceCard from '../../../components/common/ServiceCard';
import homeWiringImage from '../../../assets/images/pages/Home/CuratedServices/home-wiring.jpg';
import acRepairImage from '../../../assets/images/pages/Home/CuratedServices/ac-repair-service.jpg';
import smartHomeSetupImage from '../../../assets/images/pages/Home/CuratedServices/smart home setup.jpg';
import electricalPanelImage from '../../../assets/images/pages/Home/CuratedServices/electrical-panel-upgrade.jpg';

const CuratedServices = ({ services, onServiceClick }) => {
  // Default electrical services if none provided
  const defaultServices = [
    {
      id: 1,
      title: 'Home Wiring Installation',
      image: homeWiringImage,
    },
    {
      id: 2,
      title: 'AC Repair & Service',
      image: acRepairImage,
    },
    {
      id: 3,
      title: 'Smart Home Setup',
      image: smartHomeSetupImage,
    },
    {
      id: 4,
      title: 'Electrical Panel Upgrade',
      image: electricalPanelImage,
    },
  ];

  const serviceList = services || defaultServices;

  return (
    <div className="mb-6 border-t-4 border-gray-300 pt-6">
      {/* Progress Indicator */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-1 bg-gray-200 rounded-full">
          <div className="w-8 h-1 bg-gray-600 rounded-full"></div>
        </div>
      </div>

      {/* Title Section */}
      <div className="px-4 mb-4">
        <h2 className="text-2xl font-bold text-black mb-1">
          Thoughtful curations
        </h2>
        <p className="text-base text-black">
          of our finest experiences
        </p>
      </div>

      {/* Horizontal Scrollable Service Cards */}
      <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {serviceList.map((service) => (
          <ServiceCard
            key={service.id}
            title={service.title}
            image={service.image}
            onClick={() => onServiceClick?.(service)}
          />
        ))}
      </div>
    </div>
  );
};

export default CuratedServices;

