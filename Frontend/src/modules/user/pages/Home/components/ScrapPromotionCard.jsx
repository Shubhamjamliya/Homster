import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiRefreshCw, FiTrendingUp } from 'react-icons/fi';
import { themeColors } from '../../../../../theme';

const ScrapPromotionCard = ({ onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      className="mx-4 overflow-hidden rounded-2xl relative cursor-pointer group shadow-md"
      onClick={onClick}
    >
      {/* Background with Brand Mesh Gradient */}
      <div 
        className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-105"
        style={{
          background: `linear-gradient(135deg, ${themeColors.brand.teal} 0%, #1a4d5e 100%)`
        }}
      />
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-400/20 rounded-full -ml-16 -mb-16 blur-xl" />

      <div className="relative z-10 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex-1 text-center md:text-left w-full">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider mb-2 border border-white/10">
            <FiRefreshCw className="w-3 h-3" />
            <span>Eco-Friendly Service</span>
          </div>
          
          <h2 className="text-[17px] sm:text-xl font-extrabold text-white mb-1 leading-snug">
            Turn Your <span className="text-teal-300">Scrap</span> into Instant <span className="text-amber-400">Cash</span>
          </h2>
          
          <p className="text-teal-50/85 text-xs sm:text-sm font-medium max-w-md mb-3 mx-auto md:mx-0 leading-relaxed">
            Get the best price for your scrap with easy doorstep pickup.
          </p>

          <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
            <button
              className="px-4 py-2 bg-white rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 group/btn active:scale-95"
              style={{ color: themeColors.brand.teal }}
            >
              Sell Scrap Now
              <FiArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
            </button>
            <div className="flex items-center gap-1.5 text-white/90 text-xs font-semibold">
              <div className="w-6 h-6 rounded-full bg-amber-400/20 flex items-center justify-center">
                <FiTrendingUp className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span>Best Market Rates</span>
            </div>
          </div>
        </div>

        {/* Visual Element on larger screens */}
        <div className="relative hidden md:block shrink-0">
          <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center relative overflow-hidden">
             <div className="text-4xl drop-shadow-xl">♻️</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ScrapPromotionCard;
