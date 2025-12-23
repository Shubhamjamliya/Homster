import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, OverlayView, PolylineF } from '@react-google-maps/api';
import { FiArrowLeft, FiNavigation, FiMapPin, FiCrosshair, FiPhone } from 'react-icons/fi';
import { bookingService } from '../../../../services/bookingService';
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

const BookingTrack = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState(null);
  const [map, setMap] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null); // Rider Location
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [routePath, setRoutePath] = useState([]);
  const [isAutoCenter, setIsAutoCenter] = useState(true);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const socket = useAppNotifications('user'); // Get socket

  // ... existing state ... 

  // Listen for Live Location Updates via Socket.IO
  useEffect(() => {
    if (socket && id) {
      // Join the specific booking room for tracking
      socket.emit('join_tracking', id);

      const handleLocationUpdate = (data) => {
        if (data.lat && data.lng) {
          setCurrentLocation({ lat: parseFloat(data.lat), lng: parseFloat(data.lng) });
        }
      };

      socket.on('live_location_update', handleLocationUpdate);

      return () => {
        socket.off('live_location_update', handleLocationUpdate);
      };
    }
  }, [socket, id]);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries
  });

  // Load Booking Data & Poll for Location (Fallback & Status Check)
  useEffect(() => {
    let intervalId;

    const fetchBooking = async (isFirstLoad = false) => {
      try {
        const response = await bookingService.getById(id);
        if (response.success) {
          setBooking(response.data);

          if (isFirstLoad) {
            const geocoder = new window.google.maps.Geocoder();

            // 1. Geocode User/Destination Address (Prioritize Saved Coords)
            const addr = response.data.address || {};

            if (addr.lat && addr.lng) {
              setCoords({ lat: parseFloat(addr.lat), lng: parseFloat(addr.lng) });
            } else {
              const addressStr = typeof addr === 'string' ? addr : `${addr.addressLine1 || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.pincode || ''}`;
              if (addressStr.replaceAll(',', '').trim()) {
                geocoder.geocode({ address: addressStr }, (results, status) => {
                  if (status === 'OK' && results[0]) {
                    setCoords(results[0].geometry.location.toJSON());
                  }
                });
              }
            }

            // 2. Geocode Worker/Vendor for Initial "Current Location" (Start Point)
            // Use workerId (Worker) or vendorId (Vendor)
            // Workers usually have 'location', Vendors have 'address' populated
            const provider = response.data.workerId || response.data.vendorId;

            if (provider) {
              const pAddr = provider.location || provider.address || {};

              if (pAddr.lat && pAddr.lng) {
                const startLoc = { lat: parseFloat(pAddr.lat), lng: parseFloat(pAddr.lng) };
                setCurrentLocation(prev => prev || startLoc);
              } else {
                const providerAddressStr = typeof pAddr === 'string' ? pAddr : `${pAddr.addressLine1 || ''}, ${pAddr.city || ''}, ${pAddr.state || ''} ${pAddr.pincode || ''}`;
                if (providerAddressStr.replaceAll(',', '').trim()) {
                  geocoder.geocode({ address: providerAddressStr }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                      const startLoc = results[0].geometry.location.toJSON();
                      // Only update if still null (socket might have fired already)
                      setCurrentLocation(prev => prev || startLoc);
                    }
                  });
                }
              }
            }
          }
        }
      } catch (error) {
      } finally {
        if (isFirstLoad) setLoading(false);
      }
    };

    if (isLoaded) {
      fetchBooking(true);
      intervalId = setInterval(() => fetchBooking(false), 10000);
    }

    return () => clearInterval(intervalId);
  }, [id, isLoaded]);

  const [heading, setHeading] = useState(0);

  // Calculate Heading
  useEffect(() => {
    if (isLoaded && currentLocation && coords && window.google) {
      const start = new window.google.maps.LatLng(currentLocation);
      const end = new window.google.maps.LatLng(coords);
      const headingVal = window.google.maps.geometry.spherical.computeHeading(start, end);
      setHeading(headingVal);
    }
  }, [isLoaded, currentLocation, coords]);

  // Simulate Rider Location (Since we don't have real rider GPS stream yet for User App)
  // Ideally this would come from a websocket or Firebase subscription
  // Fallback: Set initial position to allow route calculation
  /* 
  // Simulation Removed: Waiting for Real Backend Location Updates
  // Ideally, use a WebSocket or periodic fetch here to update `currentLocation`
  // with the real rider's GPS coordinates.
  */

  // Calculate Route & Adjust Bounds
  useEffect(() => {
    if (isLoaded && currentLocation && coords && map) {
      // 1. Calculate directions if not done
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
              setRoutePath(result.routes[0].overview_path);
              map.fitBounds(result.routes[0].bounds);
            }
          }
        );
      } else if (isAutoCenter) {
        // 2. Continuous Focus: Update bounds to include both rider and destination
        // This ensures the "pure track" is always visible without "jumping" solely to rider
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(currentLocation);
        bounds.extend(coords);

        // Add some padding
        map.fitBounds(bounds, { top: 100, bottom: 250, left: 50, right: 50 });
      }
    }
  }, [isLoaded, coords, map, directions, currentLocation, isAutoCenter]);

  if (!isLoaded || loading) return <div className="h-screen bg-white flex items-center justify-center"><div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div></div>;

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
          onZoomChanged={() => {
            // Only disable if it's a programmatic zoom check is complicated, 
            // but usually we want to stop auto-centering if user zooms.
            // However, fitBounds triggers zoom changed. So we check user interaction.
          }}
          options={{
            styles: mapStyles,
            disableDefaultUI: true,
            zoomControl: false,
            // Rotational & Premium Map Features
            tilt: 45,
            heading: 0,
            mapTypeId: 'roadmap',
            gestureHandling: 'greedy', // Better for mobile tracking
            rotateControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
          }}
        >
          {directions && (
            <>
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressMarkers: true,
                  suppressPolylines: true
                }}
              />
              <PolylineF
                path={routePath}
                options={{
                  strokeColor: "#0F766E",
                  strokeWeight: 6,
                  strokeOpacity: 0.8,
                  zIndex: 50
                }}
              />
            </>
          )}

          {/* User Location (Destination) Marker */}
          {coords && (
            <OverlayView
              position={coords}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div className="relative -translate-x-1/2 -translate-y-full">
                <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white shadow-xl ring-4 ring-white relative z-10">
                  <FiMapPin className="w-5 h-5 fill-current" />
                </div>
                <div className="w-4 h-4 bg-teal-600 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 z-0"></div>
                <div className="w-8 h-2 bg-black/20 rounded-[100%] absolute -bottom-3 left-1/2 -translate-x-1/2 blur-sm"></div>
              </div>
            </OverlayView>
          )}

          {/* Rider Marker (Service Agent) */}
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

        {/* Floating Action Buttons */}
        <div className="absolute bottom-32 right-4 flex flex-col gap-3 z-20">
          <button
            onClick={() => {
              setIsAutoCenter(true);
              if (map && currentLocation && coords) {
                const bounds = new window.google.maps.LatLngBounds();
                bounds.extend(currentLocation);
                bounds.extend(coords);
                map.fitBounds(bounds, { top: 100, bottom: 250, left: 50, right: 50 });
              }
            }}
            className={`p-4 rounded-full shadow-2xl transition-all active:scale-90 ${isAutoCenter ? 'bg-teal-600 text-white' : 'bg-white text-gray-700'
              }`}
            style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
          >
            <FiCrosshair className={`w-6 h-6 ${isAutoCenter ? 'animate-pulse' : ''}`} />
          </button>
        </div>

        {/* Recenter Button */}
        <button
          onClick={() => {
            if (map && (currentLocation || coords)) {
              const bounds = new window.google.maps.LatLngBounds();
              if (currentLocation) bounds.extend(currentLocation);
              if (coords) bounds.extend(coords);
              map.fitBounds(bounds);
            }
          }}
          className="absolute bottom-60 right-4 p-3 bg-white rounded-full shadow-lg text-gray-700 z-10 active:scale-95"
        >
          <FiCrosshair className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Status Card */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-20 p-6 pb-8">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-medium text-teal-600 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
              {duration ? `Arriving in ${duration}` : 'Calculating time...'}
            </p>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">On the way</h2>
          </div>
          {distance && (
            <div className="text-right">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Distance</p>
              <p className="text-xl font-bold text-gray-800">{distance}</p>
            </div>
          )}
        </div>

        {/* Address Info */}
        <div className="bg-gray-50 rounded-2xl p-4 flex items-start gap-4 mb-4 border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md text-teal-600 border border-gray-100 shrink-0">
            <FiMapPin className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 mb-0.5">Your Location</h3>
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
              {booking?.address?.addressLine1 || booking?.address || 'Loading address...'}
            </p>
          </div>
        </div>

        {/* Agent Info (Mock) */}
        <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 mb-4 border border-gray-100">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-white shadow-md overflow-hidden">
            {/* Ideally fetch worker photo */}
            <img src="https://ui-avatars.com/api/?name=Service+Agent&background=0d9488&color=fff" alt="Agent" className="w-full h-full" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 line-clamp-1">{booking?.assignedTo?.name || 'Service Partner'}</h3>
            <p className="text-xs text-gray-500">Verified Professional</p>
          </div>

          {/* Call Button */}
          {(booking?.assignedTo?.phone || booking?.vendorPhone) && (
            <a href={`tel:${booking.assignedTo?.phone || booking.vendorPhone}`} className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center active:scale-90 transition-transform">
              <FiPhone className="w-5 h-5" />
            </a>
          )}
        </div>

      </div>
    </div>
  );
};

export default BookingTrack;
