import React, { useState, useEffect, useRef } from 'react';

/**
 * LazyImage Component - Optimized image loading with:
 * - Intersection Observer for lazy loading
 * - Loading placeholder
 * - Error fallback
 * - Optional blur-up effect
 * 
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for accessibility
 * @param {string} className - Additional CSS classes
 * @param {string} placeholder - Placeholder color or gradient
 * @param {function} onLoad - Callback when image loads
 * @param {function} onError - Callback on error
 * @param {ReactNode} fallback - Custom fallback component
 */
const LazyImage = ({
  src,
  alt = '',
  className = '',
  placeholder = '#E5E7EB',
  onLoad,
  onError,
  fallback,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  // Show fallback if error and fallback provided
  if (hasError && fallback) {
    return fallback;
  }

  // Default error fallback
  if (hasError) {
    return (
      <div
        ref={imgRef}
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ backgroundColor: placeholder }}
      >
        <svg className="w-1/3 h-1/3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder while loading */}
      {!isLoaded && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{ backgroundColor: placeholder }}
        />
      )}

      {/* Actual image - only load when in view */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          loading="lazy" // Native lazy loading as backup
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
