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
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';
import { useLocationSearch, useCurrentLocation } from '../hooks';
import { normalizeLocationData } from '../utils/locationUtils';
import LocationSuggestions from './LocationSuggestions';
import RecentLocations from './RecentLocations';

const LocationSelectionModal = ({
  isOpen,
  onClose,
  onSelectLocation,
  savedLocations = [],
}) => {
  const searchInputRef = useRef(null);
  const modalRef = useRef(null);
  const [showSuggestionsUI, setShowSuggestionsUI] = useState(false);

  const {
    searchQuery,
    searchResults,
    isSearching,
    error: searchError,
    handleSearchChange,
    clearSearch,
  } = useLocationSearch();

  const {
    isGettingCurrentLocation,
    geoError,
    getCurrentLocation,
  } = useCurrentLocation(handleSelectAndClose);

  const handleSelectAndClose = useCallback(
    (location) => {
      const normalized = normalizeLocationData(location);
      if (normalized) {
        onSelectLocation(normalized);
        clearSearch();
        setShowSuggestionsUI(false);
        onClose();
      } else {
        console.error('Failed to select location due to normalization error');
      }
    },
    [onSelectLocation, onClose, clearSearch]
  );

  useEffect(() => {
    if (isOpen) {
      clearSearch();
      setShowSuggestionsUI(false);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setShowSuggestionsUI(false);
    }
  }, [isOpen, clearSearch]);

  useEffect(() => {
    if (searchQuery.length > 2 && (isSearching || searchResults.length > 0 || searchError)) {
      setShowSuggestionsUI(true);
    } else {
      setShowSuggestionsUI(false);
    }
  }, [searchQuery, isSearching, searchResults, searchError]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        // Handled by Dialog
      } else if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target) &&
        !event.target.closest('.location-suggestions-container') 
      ) {
        setShowSuggestionsUI(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGetCurrentLocationClick = () => {
    getCurrentLocation();
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        setShowSuggestionsUI(false);
      } 
    },
    []
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
        initialFocus={searchInputRef}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                ref={modalRef}
                className="w-full max-w-md transform overflow-hidden rounded-2xl glass-card p-6 text-left align-middle shadow-xl transition-all"
                onKeyDown={handleKeyDown}
              >
                <Dialog.Title
                  as="h3"
                  className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 flex items-center"
                >
                  <MapPin className="mr-2 h-5 w-5 text-primary" />
                  Select Location
                </Dialog.Title>
                
                <button 
                  onClick={onClose} 
                  className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>

                <div className="mt-4 relative">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search for city or area..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={() => searchQuery.length > 2 && setShowSuggestionsUI(true)}
                      className="pl-10 pr-10 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        aria-label="Clear search"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                  
                  <AnimatePresence>
                    {showSuggestionsUI && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto location-suggestions-container"
                      >
                        <LocationSuggestions 
                          results={searchResults}
                          isLoading={isSearching}
                          error={searchError}
                          onSelect={handleSelectAndClose}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-4">
                  <button
                    onClick={handleGetCurrentLocationClick}
                    disabled={isGettingCurrentLocation}
                    className="w-full inline-flex justify-center items-center rounded-md border border-transparent bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGettingCurrentLocation ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LocateFixed className="mr-2 h-4 w-4" />
                    )}
                    Use Current Location
                  </button>
                  {geoError && (
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle size={14} className="mr-1 flex-shrink-0" />
                      {geoError}
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Recent Locations</h4>
                  <RecentLocations locations={savedLocations} onSelect={handleSelectAndClose} />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default LocationSelectionModal;
