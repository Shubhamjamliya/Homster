import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, OverlayView, PolylineF } from '@react-google-maps/api';
import { FiArrowLeft, FiNavigation, FiMapPin, FiCrosshair, FiPhone, FiClock } from 'react-icons/fi';
import { FaMotorcycle } from 'react-icons/fa';
import { getBookingById } from '../../services/bookingService';
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

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places', 'geometry']
  });

  const mapRef = useRef(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await getBookingById(id);
        const data = response.data || response;
        setBooking(data);

        // Use saved coordinates if available
        const addressData = data.address || data.location || {};

        if (addressData.lat && addressData.lng) {
          setCoords({
            lat: parseFloat(addressData.lat),
            lng: parseFloat(addressData.lng)
          });
        } else {
          // Fallback to Geocoding
          const geocoder = new window.google.maps.Geocoder();
          const fullAddress = addressData.addressLine1
            ? `${addressData.addressLine1}, ${addressData.city || ''}, ${addressData.state || ''} ${addressData.pincode || ''}`
            : addressData.address || '';

          if (fullAddress) {
            geocoder.geocode({ address: fullAddress }, (results, status) => {
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
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
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
        // Continuous Focus: Update bounds to include both worker and destination
        // Only if user hasn't manually moved the map
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(currentLocation);
        bounds.extend(coords);
        map.fitBounds(bounds, { top: 100, bottom: 250, left: 50, right: 50 });
      }
    }
  }, [isLoaded, coords, map, directions, currentLocation, isAutoCenter]);

  const [heading, setHeading] = useState(0);

  // Calculate Heading (Orientation)
  useEffect(() => {
    if (isLoaded && currentLocation && coords && window.google) {
      const start = new window.google.maps.LatLng(currentLocation);
      const end = new window.google.maps.LatLng(coords);
      const headingVal = window.google.maps.geometry.spherical.computeHeading(start, end);
      setHeading(headingVal);
    }
  }, [isLoaded, currentLocation, coords]);

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

      <div className="flex-1 w-full h-full">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          defaultCenter={defaultCenter}
          defaultZoom={14}
          onLoad={map => setMap(map)}
          onDragStart={() => setIsAutoCenter(false)}
          options={{
            styles: mapStyles,
            disableDefaultUI: true,
            zoomControl: false,
            // Rotational & Premium Map Features
            tilt: 45,
            heading: 0,
            mapTypeId: 'roadmap',
            gestureHandling: 'greedy',
            rotateControl: true,
          }}
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

          {/* Destination Marker - Premium Pin */}
          {coords && (
            <OverlayView
              position={coords}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div className="relative -translate-x-1/2 -translate-y-full">
                <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white shadow-xl ring-4 ring-white relative z-10 animate-bounce">
                  <FiMapPin className="w-5 h-5 fill-current" />
                </div>
                <div className="w-4 h-4 bg-teal-600 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 z-0"></div>
                <div className="w-8 h-2 bg-black/20 rounded-[100%] absolute -bottom-3 left-1/2 -translate-x-1/2 blur-sm"></div>
              </div>
            </OverlayView>
          )}

          {/* Service Rider Marker */}
          {currentLocation && (
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
                    src="/rider.png"
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
          )}
        </GoogleMap>

        {/* Recenter Button */}
        <button
          onClick={() => {
            setIsAutoCenter(true);
            if (map && (currentLocation || coords)) {
              const bounds = new window.google.maps.LatLngBounds();
              if (currentLocation) bounds.extend(currentLocation);
              if (coords) bounds.extend(coords);
              map.fitBounds(bounds, { top: 100, bottom: 250, left: 50, right: 50 });
            }
          }}
          className={`absolute bottom-64 right-4 p-4 rounded-full shadow-2xl transition-all active:scale-90 z-20 ${isAutoCenter ? 'bg-teal-600 text-white' : 'bg-white text-gray-700'
            }`}
          style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
        >
          <FiCrosshair className={`w-6 h-6 ${isAutoCenter ? 'animate-pulse' : ''}`} />
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
                const addr = booking?.location?.address || booking?.address;
                if (!addr) return 'Address loading...';
                if (typeof addr === 'string') return addr;
                return `${addr.addressLine1 || ''}, ${addr.city || ''} ${addr.pincode || ''}`;
              })()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {(booking?.userId?.phone || booking?.customerPhone) && (
            <a href={`tel:${booking.userId?.phone || booking.customerPhone}`} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 transition-all active:scale-95">
              <FiPhone className="w-5 h-5" /> Call Customer
            </a>
          )}
          <button
            onClick={() => {
              const dest = coords ? `${coords.lat},${coords.lng}` : encodeURIComponent(booking?.location?.address);
              window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
            }}
            className="w-14 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl flex items-center justify-center transition-all active:scale-95"
          >
            <FiNavigation className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingMap;
