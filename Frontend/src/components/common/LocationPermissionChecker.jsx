// Location Permission Checker Component for Homster
import React, { useState, useEffect } from 'react';
import LocationAccessModal from './LocationAccessModal';

export const LocationPermissionChecker = () => {
    const [showModal, setShowModal] = useState(false);
    const [userType, setUserType] = useState('user');

    useEffect(() => {
        // ... previous user logic ...
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const vendorData = JSON.parse(localStorage.getItem('vendorData') || '{}');
        const workerData = JSON.parse(localStorage.getItem('workerData') || '{}');

        let type = 'user';
        if (vendorData._id || vendorData.id) type = 'vendor';
        else if (workerData._id || workerData.id) type = 'worker';
        setUserType(type);

        const checkPermission = async (isManualTrigger = false) => {
            // Check if we already have it in local state to avoid repeated flashes
            const hasGrantedPreviously = localStorage.getItem('location_granted') === 'true';

            // If manual trigger, always show or try to get location
            if (isManualTrigger) {
                setShowModal(true);
                return;
            }

            // Fallback for browsers without permissions API (Mobile Safari, etc.)
            if (!navigator.permissions) {
                if (!hasGrantedPreviously) {
                    setTimeout(() => setShowModal(true), 1500);
                }
                return;
            }

            try {
                const status = await navigator.permissions.query({ name: 'geolocation' });

                // Show modal if prompt state or denied state and not granted previously
                if (status.state === 'prompt' || (status.state === 'denied' && !hasGrantedPreviously)) {
                    setTimeout(() => setShowModal(true), 1200);
                }

                status.onchange = () => {
                    if (status.state === 'granted') {
                        setShowModal(false);
                        localStorage.setItem('location_granted', 'true');
                    } else if (status.state === 'denied') {
                        setShowModal(true);
                        localStorage.removeItem('location_granted');
                    }
                };
            } catch (error) {
                // If query fails, it's safer to show the modal if no previous grant
                if (!hasGrantedPreviously) {
                    setTimeout(() => setShowModal(true), 1500);
                }
            }
        };

        // Automatic check on mount with a small delay for better mobile behavior
        const timer = setTimeout(() => {
            checkPermission(false);
        }, 1000);

        // Global listener for manual triggers
        const handleManualTrigger = () => {
            console.log('Manual location trigger received');
            setShowModal(true);
        };
        window.addEventListener('requestLocationPrompt', handleManualTrigger);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('requestLocationPrompt', handleManualTrigger);
        };
    }, []);



    const handleSuccess = (coords) => {
        console.log('Location granted:', coords);
        localStorage.setItem('location_granted', 'true');
        // You can dispatch a global event or update context here
        window.dispatchEvent(new CustomEvent('locationUpdate', { detail: coords }));
    };


    const handleClose = () => {
        setShowModal(false);
    };

    return (
        <LocationAccessModal
            isOpen={showModal}
            onClose={handleClose}
            onSuccess={handleSuccess}
            userType={userType}
        />
    );
};
