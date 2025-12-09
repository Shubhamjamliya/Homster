import React, { useState, useEffect } from 'react';
import { FiX, FiShare2, FiChevronDown, FiChevronUp, FiShield, FiAward, FiUmbrella, FiInfo } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';
import { MdBuild } from 'react-icons/md';
import bookConsultation from '../../../assets/images/pages/Home/ServiceCategorySection/ElectricalServices/book.jpg';

const ServiceDetailModal = ({ isOpen, onClose, service }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      setIsClosing(false);
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const handleAddToCart = () => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const cartItem = {
      id: Date.now(),
      title: service?.title || service?.name || 'Service',
      price: parseInt(service?.price?.replace(/,/g, '') || service?.price || 0),
      serviceCount: 1,
      description: service?.description || service?.subtitle || service?.title || 'Service',
      icon: service?.icon || service?.image || null,
      category: 'Electrician',
      originalPrice: service?.originalPrice ? parseInt(service.originalPrice.replace(/,/g, '')) : null,
      rating: service?.rating || '4.81',
      reviews: service?.reviews || '20K',
      duration: service?.duration || '30 mins',
    };
    cartItems.push(cartItem);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    window.dispatchEvent(new Event('cartUpdated'));
    handleClose();
  };

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  if (!isOpen && !isClosing) return null;

  // Default service data if not provided
  const serviceData = service || {
    title: 'Switchboard installation',
    rating: '4.81',
    reviews: '20K',
    price: '169',
    duration: '30 mins',
  };

  const faqs = [
    {
      question: 'Does the cost include spare parts?',
      answer: 'No, spare parts are not included in the base cost. If spare parts are needed, the electrician will source them from the local market and you will be charged separately.',
    },
    {
      question: 'What if any issue occurs during installation?',
      answer: 'The service is covered by a 30-day warranty for any issues after installation. If any problem occurs during installation, our technician will resolve it immediately.',
    },
    {
      question: 'What if anything gets damaged?',
      answer: 'We provide up to ₹10,000 damage cover under our uccover promise. Any accidental damage during service will be covered.',
    },
    {
      question: 'Are spare parts covered under warranty?',
      answer: 'Spare parts purchased separately are covered under warranty for the duration specified by the manufacturer.',
    },
    {
      question: 'Will the electrician buy installation material (wire, nails, etc.)?',
      answer: 'Yes, if required, the electrician can source installation materials from the local market. The cost will be added to your bill.',
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Close Button - Above Modal */}
        <div className="absolute -top-12 right-4 z-[60]">
          <button
            onClick={handleClose}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
          >
            <FiX className="w-6 h-6 text-gray-800" />
          </button>
        </div>

        {/* Modal */}
        <div
          className={`bg-white rounded-t-3xl ${
            isClosing ? 'animate-slide-down' : 'animate-slide-up'
          }`}
          style={{
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10 shrink-0">
            <h1 className="text-xl font-bold text-black">Electrician</h1>
          </div>

          {/* Content - Scrollable */}
          <div
            className="overflow-y-auto flex-1"
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain'
            }}
          >
            <div className="px-4 py-4">
              {/* Service Detail Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                <h2 className="text-xl font-bold text-black mb-2">{serviceData.title}</h2>
                <div className="flex items-center gap-1 mb-2">
                  <AiFillStar className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-700">
                    {serviceData.rating} ({serviceData.reviews} reviews)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-black">₹{serviceData.price}</span>
                    {serviceData.duration && (
                      <>
                        <span className="text-sm text-gray-600">•</span>
                        <span className="text-sm text-gray-600">{serviceData.duration}</span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                    style={{
                      backgroundColor: '#00a6a6',
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#008a8a'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#00a6a6'}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Our Process Section */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-black mb-3">Our process</h3>
                <div className="space-y-4">
                  {[
                    { number: 1, title: 'Inspection', description: 'We will check the space where you want to install the switchboard' },
                    { number: 2, title: 'Installation', description: 'We will install the switchboard with care' },
                    { number: 3, title: 'Cleanup', description: 'We will clean the area once work is done' },
                    { number: 4, title: 'Warranty activation', description: 'The service is covered by a 30-day warranty for any issues after installation' },
                  ].map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#00a6a6', color: 'white' }}>
                          <span className="text-sm font-bold">{step.number}</span>
                        </div>
                        {index < 3 && (
                          <div className="w-0.5 h-full bg-gray-300 mt-2" style={{ minHeight: '40px' }}></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <h4 className="text-base font-semibold text-black mb-1">{step.title}</h4>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Please Note Section */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-black mb-3">Please note</h3>
                <div className="space-y-3">
                  {[
                    'Provide a ladder, if required',
                    'If spare parts are needed, the electrician will source them from the local market',
                  ].map((note, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(0, 166, 166, 0.1)' }}>
                        <FiInfo className="w-3 h-3" style={{ color: '#00a6a6' }} />
                      </div>
                      <p className="text-sm text-gray-700 flex-1">{note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Technicians Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-black">Top technicians</h3>
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 border-2" style={{ borderColor: '#00a6a6' }}>
                    <img
                      src={bookConsultation}
                      alt="Technician"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: <FiShield className="w-5 h-5" style={{ color: '#00a6a6' }} />, text: 'Background verified' },
                    { icon: <MdBuild className="w-5 h-5" style={{ color: '#00a6a6' }} />, text: 'Trained across all major brands' },
                    { icon: <FiAward className="w-5 h-5" style={{ color: '#00a6a6' }} />, text: 'Certified under Skill India Programme' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 166, 166, 0.1)' }}>
                        {item.icon}
                      </div>
                      <p className="text-sm text-gray-700">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Appzeto Cover Promise Section */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: '#00a6a6' }}>
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <h3 className="text-lg font-bold text-black">Appzeto cover promise</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: <FiShield className="w-5 h-5" style={{ color: '#00a6a6' }} />, text: 'Up to 30 days of warranty' },
                    { icon: <FiUmbrella className="w-5 h-5" style={{ color: '#00a6a6' }} />, text: 'Up to ₹10,000 damage cover' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white/60 rounded-lg p-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 166, 166, 0.1)' }}>
                        {item.icon}
                      </div>
                      <p className="text-sm font-medium text-gray-800">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Frequently Asked Questions Section */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-black mb-3">Frequently asked questions</h3>
                <div className="space-y-2">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-gray-200 pb-3 last:border-0">
                      <button
                        onClick={() => toggleFAQ(index)}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <span className="text-sm text-black pr-4">{faq.question}</span>
                        {expandedFAQ === index ? (
                          <FiChevronUp className="w-5 h-5 text-gray-600 shrink-0" />
                        ) : (
                          <FiChevronDown className="w-5 h-5 text-gray-600 shrink-0" />
                        )}
                      </button>
                      {expandedFAQ === index && (
                        <p className="text-sm text-gray-600 mt-2">{faq.answer}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Share Section */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-700 mb-3">Share this service with your loved ones</p>
                <button
                  className="w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: '#00a6a6' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#008a8a'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#00a6a6'}
                >
                  <FiShare2 className="w-4 h-4" />
                  Share
                </button>
              </div>

              {/* Rating Summary Section */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <AiFillStar className="w-5 h-5 text-yellow-400" />
                  <span className="text-lg font-bold text-black">{serviceData.rating}</span>
                  <span className="text-sm text-gray-600">({serviceData.reviews} reviews)</span>
                </div>
                <div className="space-y-2">
                  {[
                    { stars: 5, count: '18K', percentage: 90 },
                    { stars: 4, count: '516', percentage: 5 },
                    { stars: 3, count: '213', percentage: 2 },
                    { stars: 2, count: '89', percentage: 1 },
                    { stars: 1, count: '510', percentage: 2 },
                  ].map((rating, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-sm text-gray-700 w-8">★ {rating.stars}</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black rounded-full"
                          style={{ width: `${rating.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{rating.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* All Reviews Section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-black">All reviews</h3>
                  <button className="text-sm font-medium" style={{ color: '#00a6a6' }}>
                    Filter
                  </button>
                </div>
                
                {/* Filter Buttons */}
                <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
                  {['Most detailed', 'In my area', 'Frequent users'].map((filter, index) => (
                    <button
                      key={index}
                      className={`px-4 py-2 rounded-lg text-sm font-medium shrink-0 transition-colors ${
                        index === 0 ? 'border-2' : 'border'
                      }`}
                      style={index === 0 ? {
                        borderColor: '#00a6a6',
                        backgroundColor: 'rgba(0, 166, 166, 0.1)',
                        color: '#00a6a6'
                      } : {
                        borderColor: '#e5e7eb',
                        backgroundColor: 'white',
                        color: '#374151'
                      }}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {[
                    {
                      name: 'Paramesh Krishnan',
                      date: 'Dec 1, 2025',
                      services: 'For One Switchboard (Install), Fan Repair, One Switchboard (Repair), Fan Replacement, Fan Uninstallation',
                      rating: 5,
                      review: 'Every kind and gentle. He came even when there was a cyclone warning here on Monday. Shows his responsibility over his job. Had complete satisfaction over the job. Wo ....',
                      showReadMore: true
                    },
                    {
                      name: 'Sasireka',
                      date: 'Dec 3, 2025',
                      services: 'For One Switchboard (Install), One Switch/Socket Replacement',
                      rating: 5,
                      review: 'Done the work in time he himself purchased item required and finished the job in time',
                      showReadMore: false
                    },
                    {
                      name: 'P K Jena',
                      date: 'Dec 2, 2025',
                      services: 'For One Switchboard (Install), One Switch/Socket Replacement',
                      rating: 5,
                      review: 'He is an excellent person having proficiency in electrical works.',
                      showReadMore: false
                    },
                  ].map((review, index) => (
                    <div key={index} className="border-b pb-4 last:border-0" style={{ borderColor: '#6b7280' }}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-black mb-1">{review.name}</h4>
                          <p className="text-xs text-gray-600 mb-1">{review.date} • {review.services}</p>
                        </div>
                        <div className="px-2 py-1 rounded flex items-center gap-1" style={{ backgroundColor: '#10b981' }}>
                          <AiFillStar className="w-3 h-3 text-white" />
                          <span className="text-xs font-semibold text-white">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">
                        {review.review}
                        {review.showReadMore && (
                          <button className="text-sm font-medium ml-1" style={{ color: '#00a6a6' }}>
                            read more
                          </button>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceDetailModal;

