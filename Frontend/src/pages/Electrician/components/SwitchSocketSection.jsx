import React from 'react';
import ServiceSection from '../../../components/common/ServiceSection';
import switchSocket from '../../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/switch&socket.jpg';

const SwitchSocketSection = ({ onAddClick, onViewDetails }) => {
  const services = [
    {
      id: 1,
      title: 'Switchbox installation',
      rating: '4.84',
      reviews: '20K',
      price: '239',
      duration: '30 mins',
      description: 'Installed in specified area for new power outlet',
      image: switchSocket,
    },
    {
      id: 2,
      title: 'AC switchbox installation',
      rating: '4.83',
      reviews: '13K',
      price: '249',
      duration: '30 mins',
      description: 'Dedicated switchbox for AC installation',
      image: switchSocket,
    },
    {
      id: 3,
      title: 'Switchboard installation',
      rating: '4.81',
      reviews: '20K',
      price: '169',
      duration: '30 mins',
      description: 'Installed in existing wiring connections within the year',
      image: switchSocket,
    },
    {
      id: 4,
      title: 'Wi-Fi smart switch installation',
      rating: '4.78',
      reviews: '755',
      price: '179',
      duration: '15 mins',
      description: 'Smart switch with Wi-Fi connectivity',
      image: switchSocket,
    },
    {
      id: 5,
      title: 'Switch/socket replacement',
      rating: '4.84',
      reviews: '78K',
      price: '49',
      duration: '10 mins',
      description: 'Replace existing switch or socket',
      image: switchSocket,
    },
    {
      id: 6,
      title: 'Switchboard/switchbox repair',
      rating: '4.84',
      reviews: '68K',
      price: '79',
      duration: '30 mins',
      description: 'Repair and fix switchboard issues',
      image: switchSocket,
    },
  ];

  return (
    <ServiceSection
      title="Switch & socket"
      services={services}
      onAddClick={onAddClick}
      onViewDetails={onViewDetails}
    />
  );
};

export default SwitchSocketSection;

