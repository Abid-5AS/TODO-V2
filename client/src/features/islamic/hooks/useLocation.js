// Custom hook for managing locations
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  getCurrentLocationWithDetails,
  searchLocations,
} from "../utils/locationUtils";

export const useLocation = (maxSavedLocations = 5) => {
  const [location, setLocation] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load saved locations from localStorage
  useEffect(() => {
    try {
      // Load saved locations
      const savedLocs = localStorage.getItem("savedLocations");
      if (savedLocs) {
        setSavedLocations(JSON.parse(savedLocs));
      }

      // Try to load last used location
      const lastLocation = localStorage.getItem("lastLocation");
      if (lastLocation) {
        setLocation(JSON.parse(lastLocation));
      }
    } catch (error) {
      console.error("Error loading saved locations:", error);
      setError("Failed to load saved locations");
    }
  }, []);

  // Get user's current location
  const getCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const locationData = await getCurrentLocationWithDetails();

      setLocation(locationData);
      saveLocation(locationData);

      toast.success(
        `Location set to ${locationData.name}, ${locationData.country || ""}`
      );

      return locationData;
    } catch (error) {
      console.error("Error getting current location:", error);
      setError(error.message || "Failed to get current location");
      toast.error(error.message || "Failed to get current location");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search for locations
  const searchForLocations = useCallback(async (query) => {
    if (!query || query.length < 3) {
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await searchLocations(query);
      return results;
    } catch (error) {
      console.error("Error searching for locations:", error);
      setError("Failed to search locations");
      toast.error("Failed to search locations");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle selecting a location
  const selectLocation = useCallback((locationData) => {
    if (!locationData) {
      setError("Invalid location selected");
      return;
    }

    try {
      // Ensure we have valid coordinates
      const lat = parseFloat(locationData.lat);
      const lon = parseFloat(locationData.lon || locationData.lng);

      if (isNaN(lat) || isNaN(lon)) {
        throw new Error("Invalid coordinates");
      }

      // Normalize location object
      const normalizedLocation = {
        lat,
        lon,
        display_name:
          locationData.display_name ||
          locationData.fullName ||
          `${locationData.name}, ${locationData.country}`,
        address: locationData.address || {},
        name:
          locationData.name ||
          locationData.address?.city ||
          locationData.address?.town ||
          locationData.address?.village ||
          locationData.address?.county ||
          "Selected Location",
        country: locationData.country || locationData.address?.country || "",
      };

      setLocation(normalizedLocation);
      saveLocation(normalizedLocation);

      toast.success(
        `Location set to ${normalizedLocation.name}, ${
          normalizedLocation.country || ""
        }`
      );
    } catch (error) {
      console.error("Error selecting location:", error);
      setError("Invalid location data");
      toast.error("Invalid location data");
    }
  }, []);

  // Save location to localStorage
  const saveLocation = useCallback(
    (locationData) => {
      // Save last used location
      localStorage.setItem("lastLocation", JSON.stringify(locationData));

      // Update saved locations list
      setSavedLocations((prevLocations) => {
        // Check if location already exists in saved locations
        const locationExists = prevLocations.some(
          (loc) =>
            loc.lat === locationData.lat &&
            (loc.lon === locationData.lon || loc.lng === locationData.lng)
        );

        if (locationExists) {
          return prevLocations;
        }

        // Add new location to the beginning of the list and limit to maxSavedLocations
        const updatedLocations = [locationData, ...prevLocations].slice(
          0,
          maxSavedLocations
        );

        // Save to localStorage
        localStorage.setItem(
          "savedLocations",
          JSON.stringify(updatedLocations)
        );

        return updatedLocations;
      });
    },
    [maxSavedLocations]
  );

  return {
    location,
    savedLocations,
    isLoading,
    error,
    getCurrentLocation,
    searchForLocations,
    selectLocation,
  };
};
