import React, { useRef, useEffect, useState, Fragment, useCallback } from 'react';
import {
  MapPin,
  Search,
  Loader2,
  X,
  Save,
  LocateFixed,
  Map,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import axios from 'axios'; // Keep axios for reverse geocoding
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';
import { useLocationSearch } from '../hooks/useLocationSearch';
import LocationSuggestions from './LocationSuggestions';
import RecentLocations from './RecentLocations';

// Helper function to normalize location data (can be moved to a utils file if needed)
const normalizeLocationData = (data, type = 'search') => {
  if (!data) return null;

  const lat = parseFloat(data.lat);
  const lon = parseFloat(data.lon || data.lng);

  if (isNaN(lat) || isNaN(lon)) {
    console.error('Invalid coordinates received:', data);
    return null; // Or throw an error
  }

  let name = 'Selected Location';
  if (type === 'reverse') {
    name =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      'Current Location';
  } else if (type === 'search' || type === 'recent') {
    name =
      data.name || // Use pre-normalized name if available
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      (data.display_name ? data.display_name.split(',')[0] : name);
  }

  const displayName = data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;

  return {
    lat,
    lon,
    display_name: displayName,
    address: data.address || {},
    name: name,
    country: data.country || data.address?.country || '',
  };
};

const LocationSelectionModal = ({
  isOpen,
  onClose,
  onSelectLocation,
  savedLocations = [], // Passed from parent
}) => {
  const searchInputRef = useRef(null);
  const modalRef = useRef(null);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [showSuggestionsUI, setShowSuggestionsUI] = useState(false);

  // Use the extracted hook for search logic
  const {
    searchQuery,
    searchResults,
    isSearching,
    error: searchError,
    handleSearchChange,
    clearSearch,
  } = useLocationSearch();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      clearSearch();
      setGeoError('');
      setIsGettingCurrentLocation(false);
      setShowSuggestionsUI(false);
      // Focus search input after modal animation
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      // Ensure suggestions are hidden when closing
      setShowSuggestionsUI(false);
    }
  }, [isOpen, clearSearch]);

  // Show suggestions UI only when focused and results/loading/error exist
  useEffect(() => {
    if (searchQuery.length > 2 && (isSearching || searchResults.length > 0 || searchError)) {
      setShowSuggestionsUI(true);
    } else {
      setShowSuggestionsUI(false);
    }
  }, [searchQuery, isSearching, searchResults, searchError]);

  // Handle clicks outside the search input/suggestions to hide suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        // Click outside the modal panel itself (redundant with Dialog onClose, but safe)
        // onClose(); // Dialog handles this
      } else if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target) &&
        !event.target.closest('.location-suggestions-container') // Check parent
      ) {
        setShowSuggestionsUI(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGetCurrentLocation = useCallback(() => {
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
            handleSelectAndClose(locationData);
          } else {
            throw new Error('Failed to normalize current location data.');
          }
        } catch (err) {
          console.error('Error getting or processing current location:', err);
          setGeoError('Could not fetch location details. Using coordinates.');
          // Fallback to using coordinates directly
          const fallbackLocation = normalizeLocationData({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          if (fallbackLocation) {
            handleSelectAndClose(fallbackLocation);
          } else {
            setGeoError('Failed to get location. Please try searching.');
          }
        } finally {
          setIsGettingCurrentLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation Error:', error);
        let message = 'Failed to get location.';
        if (error.code === error.PERMISSION_DENIED) message = 'Location permission denied.';
        else if (error.code === error.POSITION_UNAVAILABLE) message = 'Location unavailable.';
        else if (error.code === error.TIMEOUT) message = 'Location request timed out.';
        setGeoError(message);
        setIsGettingCurrentLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [onSelectLocation, onClose]);

  const handleSelectAndClose = useCallback(
    (location) => {
      const normalized = normalizeLocationData(location);
      if (normalized) {
        onSelectLocation(normalized);
        clearSearch();
        setShowSuggestionsUI(false);
        onClose();
      } else {
        // Handle case where normalization fails (e.g., show toast)
        console.error('Failed to select location due to normalization error');
        // Potentially show an error message to the user
      }
    },
    [onSelectLocation, onClose, clearSearch]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        setShowSuggestionsUI(false);
        // Optionally clear search or close modal based on preference
        // clearSearch();
        // onClose();
      } else if (e.key === 'Enter' && !isSearching && searchQuery.length > 2) {
        // Allow explicit search on Enter if needed, though hook handles debounced search
        // searchLocations(searchQuery); // Already handled by hook usually
      }
    },
    [searchQuery, isSearching]
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => {
          setShowSuggestionsUI(false);
          onClose();
        }}
        initialFocus={searchInputRef} // Set initial focus on the input
      >
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal Content */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                ref={modalRef} // Ref for click outside detection
                className="w-full max-w-md transform overflow-visible rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center">
                    <Map className="w-5 h-5 mr-2" />
                    Select Location
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                {/* Current Location Button */}
                <button
                  onClick={handleGetCurrentLocation}
                  disabled={isGettingCurrentLocation}
                  className="w-full flex items-center justify-between p-3 mb-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center">
                    <LocateFixed className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-gray-800 dark:text-white">Use current location</span>
                  </div>
                  {isGettingCurrentLocation ? (
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-blue-500" />
                  )}
                </button>

                {/* Geolocation Error Display */}
                {geoError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md text-sm flex items-start">
                    <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                    <span>{geoError}</span>
                  </div>
                )}

                {/* Search Input & Suggestions Area */}
                <div className="relative mb-4">
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search for a city or address..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyDown={handleKeyDown}
                      onFocus={() => searchQuery.length > 2 && setShowSuggestionsUI(true)}
                      className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none"
                      aria-label="Search for location"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        aria-label="Clear search"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  {/* Suggestions Component - container div for click outside detection */}
                  <div className="relative location-suggestions-container">
                    <AnimatePresence>
                      {showSuggestionsUI && (
                        <LocationSuggestions
                          suggestions={searchResults}
                          isLoading={isSearching}
                          error={searchError}
                          onSelect={handleSelectAndClose}
                          isVisible={showSuggestionsUI} // Explicit visibility control
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Recent Locations Component */}
                <RecentLocations locations={savedLocations} onSelect={handleSelectAndClose} />

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default LocationSelectionModal;
