import React from 'react';
import SimpleServiceCard from '../../../components/common/SimpleServiceCard';
import smartHomeAutomationImage from '../../../assets/images/pages/Home/NewAndNoteworthy/smart-home-automation.jpg';
import electricalPanelUpgradeImage from '../../../assets/images/pages/Home/NewAndNoteworthy/electrical-panel-upgrade.jpg';
import ledLightingImage from '../../../assets/images/pages/Home/NewAndNoteworthy/led-lightning-installation.jpg';
import acServiceImage from '../../../assets/images/pages/Home/NewAndNoteworthy/ac-services-repair.jpg';

const NewAndNoteworthy = ({ services, onServiceClick }) => {
  // Default electrical services if none provided
  const defaultServices = [
    {
      id: 1,
      title: 'Smart Home Automation',
      image: smartHomeAutomationImage,
    },
    {
      id: 2,
      title: 'Electrical Panel Upgrade',
      image: electricalPanelUpgradeImage,
    },
    {
      id: 3,
      title: 'LED Lighting Installation',
      image: ledLightingImage,
    },
    {
      id: 4,
      title: 'AC Service and Repair',
      image: acServiceImage,
    },
  ];

  const serviceList = services || defaultServices;

  return (
    <div className="mb-6 border-t-4 border-gray-300 pt-6">
      <div className="px-4 mb-4">
        <h2 className="text-xl font-bold text-black">
          New and noteworthy
        </h2>
      </div>

      {/* Horizontal Scrollable Service Cards */}
      <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {serviceList.map((service) => (
          <SimpleServiceCard
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

export default NewAndNoteworthy;

