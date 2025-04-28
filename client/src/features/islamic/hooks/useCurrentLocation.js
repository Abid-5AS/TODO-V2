import { useState, useCallback } from 'react';
import axios from 'axios';
import { normalizeLocationData } from '../utils/locationUtils';

export const useCurrentLocation = (onSuccess) => {
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);
  const [geoError, setGeoError] = useState('');

  const getCurrentLocation = useCallback(() => {
    setIsGettingCurrentLocation(true);
    setGeoError('');

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported.');
      setIsGettingCurrentLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Reverse geocode to get address details
          const response = await axios.get(
            'https://nominatim.openstreetmap.org/reverse',
            {
              params: { lat: latitude, lon: longitude, format: 'json', addressdetails: 1 },
              headers: { 'User-Agent': 'Islamic Dashboard App' }, // Replace as needed
            }
          );

          const locationData = normalizeLocationData(
            { ...response.data, lat: latitude, lon: longitude },
            'reverse'
          );

          if (locationData) {
            if (onSuccess) onSuccess(locationData);
          } else {
            throw new Error('Failed to normalize current location data.');
          }
        } catch (err) {
          console.error('[useCurrentLocation] Error getting or processing current location:', err);
          setGeoError('Could not fetch location details. Using coordinates.');
          // Fallback to using coordinates directly
          const fallbackLocation = normalizeLocationData({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          if (fallbackLocation) {
            if (onSuccess) onSuccess(fallbackLocation);
          } else {
            setGeoError('Failed to get location. Please try searching.');
          }
        } finally {
          setIsGettingCurrentLocation(false);
        }
      },
      (error) => {
        console.error('[useCurrentLocation] Geolocation Error:', error);
        let message = 'Failed to get location.';
        if (error.code === error.PERMISSION_DENIED) message = 'Location permission denied.';
        else if (error.code === error.POSITION_UNAVAILABLE) message = 'Location unavailable.';
        else if (error.code === error.TIMEOUT) message = 'Location request timed out.';
        setGeoError(message);
        setIsGettingCurrentLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [onSuccess]);

  return {
    isGettingCurrentLocation,
    geoError,
    getCurrentLocation,
  };
}; 