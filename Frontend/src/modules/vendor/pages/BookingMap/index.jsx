// BookingMap component for tracking vendor journey and arrival verification
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, OverlayView, PolylineF } from '@react-google-maps/api';
import { FiArrowLeft, FiNavigation, FiMapPin, FiCrosshair, FiPhone, FiClock, FiCheckCircle, FiX } from 'react-icons/fi';
import { FaMotorcycle } from 'react-icons/fa';
import { getBookingById, verifySelfVisit } from '../../services/bookingService';
import vendorService from '../../../../services/vendorService';
import { toast } from 'react-hot-toast';
import { useAppNotifications } from '../../../../hooks/useAppNotifications';

// Zomato-like Premium Map Style (Silver/Clean)
const mapStyles = [
  { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] },
  { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#dadada" }] },
  { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
  { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9c9c9" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }
];

const defaultCenter = { lat: 20.5937, lng: 78.9629 };
const libraries = ['places', 'geometry'];

const BookingMap = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState(null);
  const [map, setMap] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [routePath, setRoutePath] = useState([]);
  const [isAutoCenter, setIsAutoCenter] = useState(true);
  const [isNavigationMode, setIsNavigationMode] = useState(false);
  const [heading, setHeading] = useState(0); // Lifted state up
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [otpInput, setOtpInput] = useState(['', '', '', '']);
  const [actionLoading, setActionLoading] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries
  });

  const mapRef = useRef(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await getBookingById(id);
        const data = response.data || response;
        setBooking(data);

        // 1. Destination: Fixed Booking Address from DB
        const bAddr = data.address || {};

        if (bAddr.lat && bAddr.lng) {
          setCoords({ lat: parseFloat(bAddr.lat), lng: parseFloat(bAddr.lng) });
        } else {
          const addressStr = typeof bAddr === 'string' ? bAddr : `${bAddr.addressLine1 || ''}, ${bAddr.city || ''}, ${bAddr.state || ''} ${bAddr.pincode || ''}`;
          if (addressStr.replaceAll(',', '').trim() && !addressStr.toLowerCase().includes('current location')) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ address: addressStr }, (results, status) => {
              if (status === 'OK' && results[0]) {
                setCoords(results[0].geometry.location.toJSON());
              }
            });
          }
        }

      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    if (isLoaded) fetchBooking();
  }, [id, isLoaded]);

  // Watch Location
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, heading: gpsHeading } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });

          // Use GPS heading if available (more accurate for movement)
          if (gpsHeading !== null && !isNaN(gpsHeading)) {
            setHeading(gpsHeading);
          }
        },
        null,
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);
  const socket = useAppNotifications('vendor'); // Get socket instance 

  // ... 

  // Sync Location to Backend (Periodic)
  useEffect(() => {
    if (socket && id) {
      socket.emit('join_tracking', id);
    }
  }, [socket, id]);

  useEffect(() => {
    if (currentLocation && socket && id) {
      const syncInterval = setInterval(() => {
        if (currentLocation.lat && currentLocation.lng) {
          socket.emit('update_location', {
            bookingId: id,
            lat: currentLocation.lat,
            lng: currentLocation.lng
          });
        }
      }, 5000);

      return () => clearInterval(syncInterval);
    }
  }, [currentLocation, socket, id]);

  // ... existing code ...

  const prevLocationRef = useRef(null);

  // Calculate Route - Run ONCE
  // Calculate Route & Adjust Bounds
  useEffect(() => {
    if (isLoaded && currentLocation && coords && map) {
      if (!directions) {
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
          {
            origin: currentLocation,
            destination: coords,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              setDirections(result);
              const leg = result.routes[0].legs[0];
              setDistance(leg.distance.text);
              setDuration(leg.duration.text);
              setRoutePath(result.routes[0].overview_path); // Set path for animation
              map.fitBounds(result.routes[0].bounds);
            }
          }
        );
      } else if (isAutoCenter) {
        if (isNavigationMode) {
          map.panTo(currentLocation);
          map.setZoom(18);
          map.setTilt(45);
          map.setHeading(heading);
        } else {
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend(currentLocation);
          bounds.extend(coords);
          map.fitBounds(bounds, { top: 100, bottom: 250, left: 50, right: 50 });
        }
      }
    }
  }, [isLoaded, coords, map, directions, currentLocation, isAutoCenter, isNavigationMode, heading]);

  // Calculate Heading based on movement (Direction Sense)
  useEffect(() => {
    if (isLoaded && currentLocation && window.google) {
      if (prevLocationRef.current) {
        const start = new window.google.maps.LatLng(prevLocationRef.current);
        const end = new window.google.maps.LatLng(currentLocation);
        const distanceMoved = window.google.maps.geometry.spherical.computeDistanceBetween(start, end);

        // Update heading only if movement is significant (> 2 meters) to prevent jitter
        if (distanceMoved > 1) { // Reduced threshold
          const newHeading = window.google.maps.geometry.spherical.computeHeading(start, end);
          setHeading(newHeading);
        }
      } else if (coords) {
        // Initial heading towards job destination
        const start = new window.google.maps.LatLng(currentLocation);
        const end = new window.google.maps.LatLng(coords);
        setHeading(window.google.maps.geometry.spherical.computeHeading(start, end));
      }
      prevLocationRef.current = currentLocation;
    }
  }, [currentLocation, isLoaded, coords]);

  // Sync Map Heading & Tilt for Navigation Feel
  useEffect(() => {
    if (map && currentLocation && heading && isAutoCenter) {
      map.setHeading(heading);
      map.setTilt(45); // 45 degree tilt for 3D feel
    }
  }, [map, heading, isAutoCenter, currentLocation]);

  // Memoize Map Markers to prevent flickering/blinking
  const destinationMarker = useMemo(() => coords && (
    <OverlayView
      position={coords}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div className="relative -translate-x-1/2 -translate-y-[90%] pointer-events-none flex flex-col items-center">
        <FiMapPin className="w-10 h-10 text-red-600 drop-shadow-xl fill-red-600 stroke-white stroke-[1.5px]" />
        <div className="w-3 h-1 bg-black/20 rounded-full blur-[2px] mt-[-2px]"></div>
      </div>
    </OverlayView>
  ), [coords]);

  const riderMarker = useMemo(() => currentLocation && (
    <OverlayView
      position={currentLocation}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      {/* Container - centered on the coordinate */}
      <div
        style={{
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
          cursor: 'pointer'
        }}
      >
        {/* Icon Container - No background/border */}
        <div
          className="relative z-20 w-16 h-16 transition-transform duration-500 ease-in-out"
          style={{ transform: `rotate(${heading}deg)` }}
        >
          <img
            src="/rider-3D.png"
            alt="Rider"
            className="w-full h-full object-contain drop-shadow-xl"
          />
        </div>

        {/* Pulse Animation */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-teal-500/30 rounded-full animate-ping z-10 pointer-events-none"></div>

        {/* Shadow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-12 h-3 bg-black/20 blur-sm rounded-full z-0"></div>
      </div>
    </OverlayView>
  ), [currentLocation, heading]);

  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    zoomControl: false,
    mapTypeId: 'roadmap',
    gestureHandling: 'greedy',
    rotateControl: true,
    tiltControl: true,
    isFractionalZoomEnabled: true,
    mapId: mapId || '8e0a97af9386fefc',
  }), [mapId]);

  if (!isLoaded || loading) return <div className="h-screen bg-gray-100 flex items-center justify-center"><div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="h-screen flex flex-col relative bg-white overflow-hidden">
      {/* Top Floating Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
        <button
          onClick={() => navigate(-1)}
          className="pointer-events-auto bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg text-gray-700 hover:bg-white transition-all active:scale-95"
        >
          <FiArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 w-full h-full relative">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          defaultCenter={defaultCenter}
          defaultZoom={14}
          onLoad={map => {
            setMap(map);
            map.setTilt(0);
          }}
          onDragStart={() => setIsAutoCenter(false)}
          options={mapOptions}
        >
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: "#0F766E", // Dark Teal
                  strokeWeight: 8,
                  strokeOpacity: 1,
                  zIndex: 50
                }
              }}
            />
          )}

          {destinationMarker}
          {riderMarker}
        </GoogleMap>

        {/* Recenter Button */}
        {/* 3D / Rotate Button */}
        <button
          onClick={() => {
            if (map) {
              const currentTilt = map.getTilt();
              if (currentTilt > 0 || isNavigationMode) {
                // Switch to 2D / Exit Nav
                map.setTilt(0);
                map.setHeading(0);
                map.setZoom(14);
                setIsNavigationMode(false);
                toast("Switched to 2D Mode");
              } else {
                // Switch to 3D / Start Nav
                map.setTilt(45);
                setIsNavigationMode(true);
                setIsAutoCenter(true);
                toast.success("Switched to 3D Mode");
              }
            }
          }}
          className="absolute top-24 right-4 p-4 rounded-full shadow-2xl bg-white text-gray-700 z-50 active:scale-90 transition-all font-bold w-14 h-14 flex items-center justify-center border-2 border-gray-100"
          style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
        >
          <span className="text-sm font-black text-gray-800">{isNavigationMode ? '2D' : '3D'}</span>
        </button>

        {/* Recenter Button */}
        <button
          onClick={() => {
            setIsAutoCenter(true);
            if (map && currentLocation) {
              map.panTo(currentLocation);
              // Do NOT change zoom/tilt here, respect user's current mode
              if (!isNavigationMode) {
                map.setZoom(15);
              } else {
                map.setZoom(18); // If in nav mode, ensure close zoom
              }
            }
          }}
          className={`absolute top-40 right-4 p-4 rounded-full shadow-2xl transition-all active:scale-90 z-50 ${isAutoCenter ? 'bg-teal-600 text-white animate-pulse' : 'bg-white text-gray-700'}`}
          style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
        >
          <FiCrosshair className="w-6 h-6" />
        </button>
      </div>

      {/* Modern Bottom Card */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-20 p-6 pb-8 transition-transform duration-300">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>

        {/* Time & Distance Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-medium text-teal-600 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
              {duration ? `Trip time: ${duration}` : 'Calculating path...'}
            </p>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Job Location</h2>
          </div>
          {distance && (
            <div className="text-right">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Distance</p>
              <p className="text-xl font-bold text-gray-800">{distance}</p>
            </div>
          )}
        </div>

        {/* Address Section */}
        <div className="bg-gray-50 rounded-2xl p-4 flex items-start gap-4 mb-4 border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-teal-600 border border-gray-100 shrink-0">
            <FiMapPin className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 mb-0.5 truncate">Address</h3>
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
              {(() => {
                const addr = booking?.address;
                if (!addr) return 'Address loading...';
                if (typeof addr === 'string') return addr;
                return `${addr.addressLine2 ? addr.addressLine2 + ', ' : ''}${addr.addressLine1 || ''}, ${addr.city || ''} ${addr.pincode || ''}`;
              })()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {booking?.status === 'journey_started' && (
            <button
              onClick={() => setIsVisitModalOpen(true)}
              className="px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 transition-all active:scale-95"
            >
              <FiCheckCircle className="w-5 h-5" /> Reached
            </button>
          )}

          {(booking?.userId?.phone || booking?.customerPhone) && (
            <a href={`tel:${booking.userId?.phone || booking.customerPhone}`} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 transition-all active:scale-95">
              <FiPhone className="w-5 h-5" /> Call
            </a>
          )}
          <button
            onClick={() => {
              const bAddr = booking?.address;
              const addressStr = typeof bAddr === 'string' ? bAddr : `${bAddr.addressLine1 || ''}, ${bAddr.city || ''}`;
              const dest = coords ? `${coords.lat},${coords.lng}` : encodeURIComponent(addressStr);
              window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
            }}
            className="w-14 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl flex items-center justify-center transition-all active:scale-95"
          >
            <FiNavigation className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* OTP Modal - Redesigned for Clarity */}
      {isVisitModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 relative">

            {/* Modal Header/Banner */}
            <div className="h-24 bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center relative">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-20 h-20 bg-white rounded-full -translate-x-10 -translate-y-10" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-10 translate-y-10" />
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 mb-1">
                  <FiCheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <button
                onClick={() => {
                  setIsVisitModalOpen(false);
                  setOtpInput(['', '', '', '']);
                }}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Verify Arrival</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  Please enter the <span className="text-teal-600 font-bold">4-digit code</span> shared by the customer to start the service.
                </p>
              </div>

              {/* OTP Entry Boxes - High Visibility */}
              <div className="flex justify-center gap-3 mb-8">
                {otpInput.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    autoFocus={idx === 0}
                    className={`w-14 h-18 text-center text-3xl font-black rounded-2xl transition-all outline-none border-2 shadow-sm
                      ${digit
                        ? 'border-teal-500 bg-teal-50/30 text-teal-900 shadow-teal-100'
                        : 'border-gray-200 bg-gray-50 text-gray-900 focus:border-teal-400 focus:bg-white focus:shadow-lg focus:shadow-teal-100'
                      }`}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      if (value.length > 1) return;
                      const newOtp = [...otpInput];
                      newOtp[idx] = value;
                      setOtpInput(newOtp);
                      if (value && idx < 3) {
                        document.getElementById(`otp-input-${idx + 1}`)?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otpInput[idx] && idx > 0) {
                        document.getElementById(`otp-input-${idx - 1}`)?.focus();
                      }
                    }}
                  />
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={async () => {
                  const otp = otpInput.join('');
                  if (otp.length !== 4) return toast.error('Enter 4-digit OTP');

                  try {
                    setActionLoading(true);
                    if (!navigator.geolocation) {
                      toast.error('Geolocation required for verification');
                      return;
                    }

                    navigator.geolocation.getCurrentPosition(async (position) => {
                      try {
                        const location = { lat: position.coords.latitude, lng: position.coords.longitude };
                        const response = await verifySelfVisit(id, otp, location);
                        if (response.success) {
                          toast.success('Visit Verified Successfully!');
                          setIsVisitModalOpen(false);
                          navigate(`/vendor/booking/${id}`);
                        } else {
                          toast.error(response.message || 'Verification failed');
                        }
                      } catch (err) {
                        toast.error(err.response?.data?.message || 'Verification failed');
                      } finally {
                        setActionLoading(false);
                      }
                    }, (error) => {
                      toast.error('Please enable GPS to verify your location.');
                      setActionLoading(false);
                    });
                  } catch (error) {
                    toast.error('Something went wrong. Please try again.');
                    setActionLoading(false);
                  }
                }}
                disabled={actionLoading}
                className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-teal-600/20 transition-all active:scale-[0.98] disabled:bg-gray-200 disabled:shadow-none flex items-center justify-center gap-3"
              >
                {actionLoading ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FiCheckCircle className="w-6 h-6" />
                    Verify & Start Work
                  </>
                )}
              </button>

              <button
                onClick={() => setIsVisitModalOpen(false)}
                className="w-full mt-4 py-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                disabled={actionLoading}
              >
                Go Back to Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingMap;
