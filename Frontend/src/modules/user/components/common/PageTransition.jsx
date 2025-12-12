import React, { useEffect, useState, cloneElement } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('entering');

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('exiting');
    }
  }, [location.pathname, displayLocation.pathname]);

  useEffect(() => {
    if (transitionStage === 'exiting') {
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('entering');
      }, 200); // Match exit animation duration

      return () => clearTimeout(timer);
    }
  }, [transitionStage, location]);

  return (
    <div
      className={`min-h-screen ${transitionStage === 'entering'
        ? 'animate-page-enter'
        : 'animate-page-exit'
        }`}
      style={{
        animationFillMode: 'both',
        // Removed position: 'relative' to allow fixed elements to work correctly
        // Removed isolation: 'isolate' for better performance
      }}
    >
      {cloneElement(children, { location: displayLocation })}
    </div>
  );
};

export default PageTransition;

