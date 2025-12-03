import React from 'react';
import ProfessionalCard from '../../../components/common/ProfessionalCard';

const CelebratingProfessionals = ({ professionals, onProfessionalClick }) => {
  // Default professional cards if none provided
  const defaultProfessionals = [
    {
      id: 1,
      image: null,
    },
    {
      id: 2,
      image: null,
    },
    {
      id: 3,
      image: null,
    },
  ];

  const professionalList = professionals || defaultProfessionals;

  return (
    <div className="mb-6 border-t-4 border-gray-300 pt-6">
      {/* Title Section */}
      <div className="px-4 mb-4">
        <h2 className="text-2xl font-bold text-black mb-1">
          Celebrating professionals
        </h2>
        <p className="text-base text-black">
          Real lives, real impact
        </p>
      </div>

      {/* Horizontal Scrollable Professional Cards */}
      <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {professionalList.map((professional) => (
          <ProfessionalCard
            key={professional.id}
            image={professional.image}
            onClick={() => onProfessionalClick?.(professional)}
          />
        ))}
      </div>
    </div>
  );
};

export default CelebratingProfessionals;

