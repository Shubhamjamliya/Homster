import React from 'react';
import SimpleServiceCard from '../../../components/common/SimpleServiceCard';
import waterPurifierImage from '../../../assets/images/pages/Home/NewAndNoteworthy/water-purifiers.png';
import bathroomCleaningImage from '../../../assets/images/pages/Home/NewAndNoteworthy/bathroom-cleaning.png';
import hairStudioImage from '../../../assets/images/pages/Home/NewAndNoteworthy/hair-studio.png';
import acRepairImage from '../../../assets/images/pages/Home/NewAndNoteworthy/ac-repair.png';

const NewAndNoteworthy = ({ services, onServiceClick }) => {
  // Default electrical services if none provided
  const defaultServices = [
    {
      id: 1,
      title: 'Native Water Purifier',
      image: waterPurifierImage,
    },
    {
      id: 2,
      title: 'Bathroom & Kitchen Cleaning',
      image: bathroomCleaningImage,
    },
    {
      id: 3,
      title: 'Hair Studio for Women',
      image: hairStudioImage,
    },
    {
      id: 4,
      title: 'AC Service and Repair',
      image: acRepairImage,
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
      <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
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

