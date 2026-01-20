import React from 'react';
import { motion } from 'framer-motion';

const LogoLoader = ({ fullScreen = true, size = "w-32 h-32" }) => {
  const containerClasses = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-white z-[9999]"
    : "flex items-center justify-center w-full h-full min-h-[200px]";

  return (
    <div className={containerClasses}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0.5 }}
        animate={{
          scale: [0.8, 1.1, 0.8],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`relative ${size} flex items-center justify-center`}
      >
        <img
          src="/Homster-logo.png"
          alt="Loading..."
          className="w-full h-full object-contain"
        />
        {/* Optional: Add a ripple effect or ring behind it */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-blue-100"
          animate={{
            scale: [1, 1.5],
            opacity: [1, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      </motion.div>
    </div>
  );
};

export default LogoLoader;
