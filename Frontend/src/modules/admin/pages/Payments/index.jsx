import React from 'react';
import { motion } from 'framer-motion';

const Payments = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="lg:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Payments</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage all payments</p>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-md">
        <p className="text-gray-600">Payments management page coming soon...</p>
      </div>
    </motion.div>
  );
};

export default Payments;

