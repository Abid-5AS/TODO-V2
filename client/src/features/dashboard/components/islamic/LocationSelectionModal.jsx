import React, { useRef, useEffect, useState } from "react";
import {
  MapPin,
  Search,
  Navigation,
  Loader2,
  X,
  Clock,
  Save,
  ArrowRight,
  Bookmark,
  History,
  ChevronRight,
  Check,
  LocateFixed,
  Map,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

const LocationSelectionModal = ({
  isOpen,
  onClose,
  onSelectLocation,
  savedLocations = [],
  isGettingLocation,
  onGetCurrentLocation,
}) => {
  const searchInputRef = useRef(null);
  const modalRef = useRef(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState([]);
  const resultsRef = useRef(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimerRef = useRef(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [geoError, setGeoError] = useState("");
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSearchInput("");
      setSearchQuery("");
      setSearchResults([]);
      setError("");
      setGeoError("");

      // Focus search input after a small delay (allows modal to fully render)
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setError("");

    if (query.length > 2) {
      setIsSearching(true);
      debounceTimerRef.current = setTimeout(() => {
        searchLocations(query);
      }, 500);
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
      setIsSearching(false);
    }
  };

  const searchLocations = async (query) => {
    if (!query || query.length < 3) {
      setIsSearching(false);
      return;
    }

    try {
      setError("");

      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: query,
            format: "json",
            addressdetails: 1,
            limit: 5,
          },
          headers: {
            "User-Agent": "Islamic Dashboard",
          },
        }
      );

      if (response.data && response.data.length > 0) {
        // Process and normalize location data
        const normalizedResults = response.data.map((item) => ({
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          display_name: item.display_name,
          address: item.address || {},
          // Ensure these properties exist for consistent access
          name:
            item.address?.city ||
            item.address?.town ||
            item.address?.village ||
            item.address?.county ||
            item.display_name.split(",")[0],
          country:
            item.address?.country ||
            item.display_name.split(",").slice(-1)[0].trim() ||
            "",
        }));

        setSearchResults(normalizedResults);
        setShowSuggestions(true);
      } else {
        setSearchResults([]);
        setError("No locations found. Try a different search term.");
      }
    } catch (error) {
      console.error("Error searching for locations:", error);
      setError("Failed to search locations. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getCurrentLocation = () => {
    setIsLoading(true);
    setError("");
    setGeoError("");

    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const response = await axios.get(
            "https://nominatim.openstreetmap.org/reverse",
            {
              params: {
                lat: latitude,
                lon: longitude,
                format: "json",
                addressdetails: 1,
              },
              headers: {
                "User-Agent": "Islamic Dashboard",
              },
            }
          );

          if (response.data) {
            // Normalize the location data
            const locationData = {
              lat: latitude,
              lon: longitude,
              display_name: response.data.display_name,
              address: response.data.address || {},
              name:
                response.data.address?.city ||
                response.data.address?.town ||
                response.data.address?.village ||
                response.data.address?.county ||
                "Current Location",
              country: response.data.address?.country || "",
            };

            onSelectLocation(locationData);
            onClose();
          }
        } catch (error) {
          console.error("Error getting location name:", error);
          setError("Failed to get your location details. Please try again.");

          // Even if reverse geocoding fails, we can still use the coordinates
          if (position && position.coords) {
            const { latitude, longitude } = position.coords;
            const fallbackLocation = {
              lat: latitude,
              lon: longitude,
              display_name: `Coordinates: ${latitude.toFixed(
                4
              )}, ${longitude.toFixed(4)}`,
              address: {},
              name: "Current Location",
              country: "",
            };

            onSelectLocation(fallbackLocation);
            onClose();
          }
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Failed to get your location.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location permission denied. Please enable location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }

        setError(errorMessage);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSelectLocation = (location) => {
    if (!location) {
      setError("Invalid location selected. Please try again.");
      return;
    }

    try {
      // Ensure we have valid coordinates
      const lat = parseFloat(location.lat);
      const lon = parseFloat(location.lon || location.lng);

      if (isNaN(lat) || isNaN(lon)) {
        throw new Error("Invalid coordinates");
      }

      // Normalize location object
      const normalizedLocation = {
        lat,
        lon,
        display_name:
          location.display_name ||
          location.fullName ||
          `${location.name}, ${location.country}`,
        address: location.address || {},
        name:
          location.name ||
          location.address?.city ||
          location.address?.town ||
          location.address?.village ||
          location.address?.county ||
          "Selected Location",
        country: location.country || location.address?.country || "",
      };

      onSelectLocation(normalizedLocation);
      setSearchQuery("");
      setSearchResults([]);
      onClose();
    } catch (error) {
      console.error("Error processing location:", error);
      setError(
        "Invalid location data. Please try selecting a different location."
      );
    }
  };

  const handleKeyDown = (e, location = null) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
      onClose();
    } else if (e.key === "Enter") {
      if (searchQuery.trim().length >= 3 && !isSearching) {
        searchLocations(searchQuery);
      } else if (location) {
        handleSelectLocation(location);
      }
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center"
                  >
                    <Map className="w-5 h-5 mr-2" />
                    Select Location
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                <button
                  onClick={getCurrentLocation}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between p-3 mb-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center">
                    <LocateFixed className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-gray-800 dark:text-white">
                      Use current location
                    </span>
                  </div>
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-blue-500" />
                  )}
                </button>

                {geoError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md text-sm flex items-start">
                    <AlertCircle
                      size={16}
                      className="mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>{geoError}</span>
                  </div>
                )}

                <div className="relative mb-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (searchQuery.trim().length >= 3) {
                        searchLocations(searchQuery);
                      }
                    }}
                    className="relative"
                  >
                    <div className="relative" ref={searchRef}>
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search for a city or address..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={(e) => handleKeyDown(e)}
                        onFocus={() =>
                          searchQuery.length > 2 && setShowSuggestions(true)
                        }
                        className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setSearchResults([]);
                            setShowSuggestions(false);
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="mt-2 w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center"
                      disabled={
                        isSearching ||
                        !searchQuery.trim() ||
                        searchQuery.length < 3
                      }
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        "Search"
                      )}
                    </button>
                  </form>

                  <AnimatePresence>
                    {showSuggestions && searchResults.length > 0 && (
                      <motion.div
                        ref={suggestionsRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-56 overflow-y-auto"
                      >
                        {isSearching ? (
                          <div className="p-3 flex items-center justify-center text-gray-500 dark:text-gray-400">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading suggestions...
                          </div>
                        ) : (
                          <ul>
                            {searchResults.map((location, index) => (
                              <li key={`${location.display_name}-${index}`}>
                                <button
                                  type="button"
                                  onClick={() => handleSelectLocation(location)}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                                >
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                                    <div>
                                      <p className="font-medium text-gray-900 dark:text-white">
                                        {location.name || "Unknown location"}
                                      </p>
                                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                        {location.display_name}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {searchResults.length > 0 && !showSuggestions && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Search Results
                    </h4>
                    <ul className="space-y-2">
                      {searchResults.map((result, index) => (
                        <li key={`result-${index}`}>
                          <button
                            onClick={() => handleSelectLocation(result)}
                            className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <div className="flex items-center">
                              <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {result.name || "Unknown location"}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                  {result.display_name}
                                </p>
                              </div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {savedLocations && savedLocations.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                      <History className="h-4 w-4 mr-1" />
                      Recent Locations
                    </h4>
                    <ul className="space-y-2">
                      {savedLocations.map((location, index) => (
                        <li key={`recent-${index}`}>
                          <button
                            onClick={() => handleSelectLocation(location)}
                            className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {location.name ||
                                      location.address?.city ||
                                      location.address?.town ||
                                      location.address?.village ||
                                      location.address?.county ||
                                      (location.display_name
                                        ? location.display_name.split(",")[0]
                                        : "Saved Location")}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {location.display_name ||
                                      `${location.lat.toFixed(4)}, ${(
                                        location.lon || location.lng
                                      ).toFixed(4)}`}
                                  </p>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {error && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default LocationSelectionModal;
