import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const serviceCategories = [
  { name: 'AC service', image: '/ServiceIcon/AC.jpeg', tone: '#8ad9e4', position: 'splash-service--one' },
  { name: 'Appliances', image: '/ServiceIcon/washing machine.jpeg', tone: '#ffd27d', position: 'splash-service--two' },
  { name: 'Kitchen care', image: '/ServiceIcon/kitchen.jpeg', tone: '#ffb394', position: 'splash-service--three' },
  { name: 'LED repair', image: '/ServiceIcon/LED.jpeg', tone: '#c7b8ff', position: 'splash-service--four' },
  { name: 'Chimney care', image: '/ServiceIcon/chiminy.jpeg', tone: '#9ee5c1', position: 'splash-service--five' },
  { name: 'Microwave', image: '/ServiceIcon/microwave.jpeg', tone: '#f7b5dc', position: 'splash-service--six' },
];

const SplashScreen = ({ onComplete }) => {
  const [leaving, setLeaving] = useState(false);
  const [activeService, setActiveService] = useState(0);

  useEffect(() => {
    const serviceTimer = window.setInterval(() => {
      setActiveService((current) => (current + 1) % serviceCategories.length);
    }, 520);
    const finishTimer = window.setTimeout(() => setLeaving(true), 3000);
    const completeTimer = window.setTimeout(onComplete, 3450);

    return () => {
      window.clearInterval(serviceTimer);
      window.clearTimeout(finishTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const skip = () => setLeaving(true);

  return (
    <AnimatePresence>
      {!leaving ? (
        <motion.main
          className="splash-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(6px)', transition: { duration: 0.45, ease: 'easeInOut' } }}
          aria-label="Loading Homster"
        >
          {/* Skip intro button top right */}
          <button className="splash-skip" onClick={skip} type="button">Skip intro ➔</button>

          {/* Main Stage with central logo and floating category icons */}
          <div className="splash-stage">
            {/* Ambient subtle glow background */}
            <div className="splash-glow splash-glow--center" aria-hidden="true" />

            {/* Orbiting / Floating 6 Service Categories (Guaranteed Zero Overlap) */}
            <div className="splash-floating-services" aria-hidden="true">
              {serviceCategories.map((category, index) => {
                const isActive = activeService === index;
                return (
                  <motion.div
                    className={`splash-floating-service ${category.position} ${isActive ? 'is-active' : ''}`}
                    key={category.name}
                    initial={{ opacity: 0, scale: 0.5, y: 15 }}
                    animate={{ opacity: 1, scale: isActive ? 1.12 : 1, y: 0 }}
                    transition={{ delay: 0.12 + index * 0.08, duration: 0.5, type: 'spring', stiffness: 180, damping: 15 }}
                  >
                    <div className="splash-floating-service__icon" style={{ '--service-tone': category.tone }}>
                      <img src={category.image} alt="" />
                    </div>
                    <span className="splash-floating-service__name">{category.name}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Central Homster Logo & Tagline */}
            <motion.div
              className="splash-center-logo"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 140 }}
            >
              <div className="splash-logo-img-wrapper">
                <img src="/Homster-logo.png" alt="Homster" />
              </div>
              
              <p className="splash-quick-tagline">Home services, simplified.</p>
              
              <div className="splash-service-cycle" aria-live="polite">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={serviceCategories[activeService].name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    style={{ color: serviceCategories[activeService].tone }}
                  >
                    • {serviceCategories[activeService].name}
                  </motion.span>
                </AnimatePresence>
              </div>

              <div className="splash-quick-loader"><span /></div>
            </motion.div>
          </div>

          {/* Footer bar */}
          <div className="splash-footer">
            <span className="splash-footer__dot" />
            <span>Making homes feel right • 100% Verified Experts</span>
          </div>
        </motion.main>
      ) : null}
    </AnimatePresence>
  );
};

export default SplashScreen;
