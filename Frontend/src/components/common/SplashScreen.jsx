import React, { useEffect, useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const serviceCategories = [
  { name: 'AC Service',      image: '/ServiceIcon/AC.jpeg',              tone: '#347989', borderTone: '#7ecad6' },
  { name: 'Appliances',      image: '/ServiceIcon/washing machine.jpeg', tone: '#d68f35', borderTone: '#f7c37b' },
  { name: 'Kitchen Care',    image: '/ServiceIcon/kitchen.jpeg',         tone: '#bb5f36', borderTone: '#efa081' },
  { name: 'LED Repair',      image: '/ServiceIcon/LED.jpeg',             tone: '#584ec6', borderTone: '#b6affb' },
  { name: 'Chimney Care',    image: '/ServiceIcon/chiminy.jpeg',         tone: '#188656', borderTone: '#82e2b3' },
  { name: 'Microwave',       image: '/ServiceIcon/microwave.jpeg',       tone: '#b5337e', borderTone: '#f49ece' },
];

const TAGLINE = 'Home services, simplified.';

const SplashScreen = ({ onComplete }) => {
  const [leaving, setLeaving] = useState(false);
  const [activeService, setActiveService] = useState(0);
  const [taglineChars, setTaglineChars] = useState(0);

  useEffect(() => {
    // Cycle active service icon
    const serviceTimer = window.setInterval(() => {
      setActiveService((c) => (c + 1) % serviceCategories.length);
    }, 620);

    // Letter-by-letter tagline reveal
    let charIdx = 0;
    const charTimer = window.setInterval(() => {
      charIdx += 1;
      setTaglineChars(charIdx);
      if (charIdx >= TAGLINE.length) window.clearInterval(charTimer);
    }, 38);

    // Exit
    const finishTimer = window.setTimeout(() => setLeaving(true), 3200);
    const completeTimer = window.setTimeout(onComplete, 3650);

    return () => {
      window.clearInterval(serviceTimer);
      window.clearInterval(charTimer);
      window.clearTimeout(finishTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const skip = () => {
    setLeaving(true);
    window.setTimeout(onComplete, 420);
  };

  const renderedTagline = useMemo(() => (
    TAGLINE.split('').map((char, i) => (
      <span
        key={i}
        style={{
          opacity: i < taglineChars ? 1 : 0,
          transform: i < taglineChars ? 'translateY(0)' : 'translateY(4px)',
          display: 'inline-block',
          transition: `opacity 0.16s ease ${i * 0.005}s, transform 0.2s ease ${i * 0.005}s`,
          whiteSpace: char === ' ' ? 'pre' : 'normal',
        }}
      >
        {char}
      </span>
    ))
  ), [taglineChars]);

  const activeCategory = serviceCategories[activeService];

  return (
    <AnimatePresence>
      {!leaving ? (
        <motion.main
          className="splash-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            y: -24,
            scale: 0.98,
            filter: 'blur(6px)',
            transition: { duration: 0.42, ease: [0.4, 0, 0.2, 1] }
          }}
          aria-label="Loading Homster"
        >
          {/* Skip Pill Button */}
          <button className="splash-skip" onClick={skip} type="button">Skip ➔</button>

          {/* Connected Orbital Stage */}
          <div className="splash-stage">
            {/* SVG Connected Orbital Rings */}
            <svg className="splash-orbit-svg" viewBox="-200 -240 400 480" aria-hidden="true">
              <defs>
                <linearGradient id="splashOrbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#347989" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#D68F35" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#347989" stopOpacity="0.4" />
                </linearGradient>
                <radialGradient id="splashHubGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(52, 121, 137, 0.08)" />
                  <stop offset="65%" stopColor="rgba(214, 143, 53, 0.04)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>

              {/* Ambient hub aura */}
              <circle cx="0" cy="0" r="115" fill="url(#splashHubGlow)" />

              {/* Primary Elliptical Orbital Track passing through all 6 satellites */}
              <ellipse
                cx="0"
                cy="0"
                rx="140"
                ry="185"
                fill="none"
                stroke="url(#splashOrbitGrad)"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                className="splash-orbit-track"
              />

              {/* Inner Concentric Hairline Echo */}
              <ellipse
                cx="0"
                cy="0"
                rx="102"
                ry="132"
                fill="none"
                stroke="rgba(52, 121, 137, 0.16)"
                strokeWidth="1"
              />
            </svg>

            {/* 6 Satellite Nodes on the Orbit Track */}
            <div className="splash-orbit-constellation" aria-hidden="true">
              {serviceCategories.map((category, index) => {
                const isActive = activeService === index;
                return (
                  <motion.div
                    className={`splash-orbit-node splash-orbit-node--${index} ${isActive ? 'is-active' : ''}`}
                    key={category.name}
                    initial={{ opacity: 0, scale: 0.3 }}
                    animate={{ opacity: 1, scale: isActive ? 1.15 : 1 }}
                    transition={{ delay: 0.08 + index * 0.06, duration: 0.45, type: 'spring', stiffness: 180, damping: 18 }}
                    style={{
                      '--node-tone': category.tone,
                      '--node-border': category.borderTone,
                    }}
                    title={category.name}
                  >
                    <div className="splash-orbit-node__disc">
                      <img src={category.image} alt={category.name} />
                    </div>

                    {/* Active micro badge */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.span
                          className="splash-orbit-node__label"
                          initial={{ opacity: 0, y: 3, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.18 }}
                        >
                          {category.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Central Homster Core Hub */}
            <motion.div
              className="splash-center-core"
              initial={{ opacity: 0, scale: 0.88, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.65, type: 'spring', stiffness: 140, damping: 18 }}
            >
              <div className="splash-logo-img-wrapper">
                <img src="/Homster-logo.png" alt="Homster" />
              </div>

              <p className="splash-core-tagline" aria-label={TAGLINE}>
                {renderedTagline}
              </p>

              {/* Active Service Pill */}
              <div className="splash-service-pill-wrap" aria-live="polite">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCategory.name}
                    className="splash-service-pill"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      color: activeCategory.tone,
                      borderColor: activeCategory.borderTone,
                      backgroundColor: `color-mix(in srgb, ${activeCategory.tone} 9%, #ffffff)`,
                    }}
                  >
                    <span className="splash-service-pill__dot" style={{ backgroundColor: activeCategory.tone }} />
                    <span className="splash-service-pill__text">{activeCategory.name}</span>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="splash-core-loader"><span /></div>
            </motion.div>
          </div>

          {/* Floating Pill Footer */}
          <div className="splash-footer">
            <span className="splash-footer__dot" />
            <span>100% Verified Experts · Making homes feel right</span>
          </div>
        </motion.main>
      ) : null}
    </AnimatePresence>
  );
};

export default SplashScreen;
