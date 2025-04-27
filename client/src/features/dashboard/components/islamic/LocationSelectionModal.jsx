import React, { useState, useEffect } from "react";
import { MapPin, Loader2, Navigation, Search, X } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const LocationSelectionModal = ({
  isOpen,
  onClose,
  onLocationSelect,
  savedLocations = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Set up debounce for search queries
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        setDebouncedQuery(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch location suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length > 2) {
      searchForLocationSuggestions(debouncedQuery);
    }
  }, [debouncedQuery]);

  const searchForLocationSuggestions = async (query) => {
    if (!query.trim()) return;

    setIsLoading(true);

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5`
      );

      if (response.data && response.data.length > 0) {
        setSuggestions(
          response.data.map((item) => {
            return {
              displayName: item.display_name,
              latitude: item.lat,
              longitude: item.lon,
              city:
                item.address?.city ||
                item.address?.town ||
                item.address?.village ||
                item.display_name.split(",")[0],
              country:
                item.address?.country ||
                item.display_name
                  .split(",")
                  [item.display_name.split(",").length - 1].trim(),
            };
          })
        );
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error searching location:", error);
      toast.error("Failed to search location. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getUserLocation = () => {
    setIsLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            // Reverse geocode to get location name
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );

            const locationData = {
              latitude,
              longitude,
              name: response.data.display_name.split(",")[0],
              city:
                response.data.address.city ||
                response.data.address.town ||
                response.data.address.village,
              country: response.data.address.country,
              displayName: `${
                response.data.address.city ||
                response.data.address.town ||
                response.data.address.village
              }, ${response.data.address.country}`,
            };

            onLocationSelect(locationData);
            toast.success("Location detected successfully");
          } catch (error) {
            console.error("Error getting location details:", error);
            toast.error(
              "Failed to get location details. Please try entering your location manually."
            );
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error(
            "Unable to detect location. Please enter your location manually."
          );
          setIsLoading(false);
        }
      );
    } else {
      toast.error(
        "Geolocation is not supported by your browser. Please enter your location manually."
      );
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white/20 dark:bg-zinc-900/50 backdrop-blur-lg rounded-lg shadow-xl max-w-md w-full p-6 border border-white/20 dark:border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Set Your Location</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Prayer times are based on your location. Please select a method to set
          your location:
        </p>

        <button
          className="w-full mb-3 flex items-center justify-center gap-2 p-3 bg-emerald-100/60 dark:bg-emerald-900/30 hover:bg-emerald-200/60 dark:hover:bg-emerald-800/30 text-emerald-800 dark:text-emerald-300 rounded-lg transition-colors backdrop-blur-sm"
          onClick={getUserLocation}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          <span>Use My Current Location</span>
        </button>

        <div className="relative mb-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                className="w-full p-3 bg-white/30 dark:bg-zinc-800/30 border border-white/30 dark:border-zinc-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary backdrop-blur-sm"
                placeholder="Search for a city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && searchForLocationSuggestions(searchQuery)
                }
              />
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md rounded-lg shadow-lg max-h-60 overflow-y-auto z-10 border border-gray-200 dark:border-zinc-700">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={`${suggestion.displayName}-${index}`}
                      className="p-2 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer flex items-center gap-2"
                      onClick={() => {
                        const locationData = {
                          latitude: suggestion.latitude,
                          longitude: suggestion.longitude,
                          name: suggestion.city,
                          city: suggestion.city,
                          country: suggestion.country,
                          displayName: `${suggestion.city}, ${suggestion.country}`,
                        };
                        onLocationSelect(locationData);
                        setSuggestions([]);
                        setSearchQuery("");
                      }}
                    >
                      <MapPin
                        size={14}
                        className="text-primary flex-shrink-0"
                      />
                      <span className="text-sm truncate">
                        {suggestion.displayName}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              className="p-3 bg-primary/90 hover:bg-primary text-white rounded-lg transition-colors"
              onClick={() => searchForLocationSuggestions(searchQuery)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {savedLocations.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Recent Locations</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {savedLocations.map((loc, index) => (
                <button
                  key={index}
                  className="w-full text-left p-2 text-sm rounded-md hover:bg-black/10 dark:hover:bg-white/10 flex items-center"
                  onClick={() => {
                    onLocationSelect(loc);
                  }}
                >
                  <MapPin className="h-3 w-3 mr-2 text-primary" />
                  {loc.displayName}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSelectionModal;
