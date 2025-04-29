// Custom hook for managing locations
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  getCurrentLocationWithDetails,
  searchLocations,
} from "../utils/locationUtils";
import { normalizeLocationData } from "../utils/locationUtils";

export const useLocation = (maxSavedLocations = 5) => {
  const [location, setLocation] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Define saveLocation first as other callbacks depend on it
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

  // Load saved locations from localStorage
  useEffect(() => {
    let foundLastLocation = false;
    try {
      // Load saved locations
      const savedLocs = localStorage.getItem("savedLocations");
      if (savedLocs) {
        setSavedLocations(JSON.parse(savedLocs));
      }

      // Try to load last used location
      const lastLocation = localStorage.getItem("lastLocation");
      if (lastLocation) {
        console.log("[useLocation] Found lastLocation in localStorage");
        setLocation(JSON.parse(lastLocation));
        foundLastLocation = true;
      }
    } catch (error) {
      console.error("Error loading saved locations:", error);
      setError("Failed to load saved locations");
    }

    // If no last location was found, try getting current location automatically
    // Note: getCurrentLocation will be defined below, but due to closure, 
    // it should capture the correct reference when the effect runs.
    if (!foundLastLocation) {
      console.log("[useLocation] No lastLocation found, attempting getCurrentLocation...");
      // We need to reference getCurrentLocation indirectly here to avoid initialization issues
      // Or ensure the effect runs after all definitions. Standard useEffect dependency rules apply.
      // A direct call might be problematic depending on exact timing/bundler behavior.
      // Let's wrap it to be safe, though typically React handles this.
      const fetchCurrent = async () => {
         await getCurrentLocation();
      }
      fetchCurrent();
    }
    // Add getCurrentLocation to dependencies if linting requires, but be mindful of potential loops
    // if getCurrentLocation itself changes frequently. Given its definition, it shouldn't.
  }, []); // getCurrentLocation is technically a dependency but defined later.

  // Get user's current location
  const getCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const locationData = await getCurrentLocationWithDetails();

      // Ensure locationData exists before proceeding
      if (!locationData) {
          throw new Error("Failed to retrieve location details.");
      }
      
      setLocation(locationData);
      saveLocation(locationData); // Now saveLocation is defined

      toast.success(
        `Location set to ${locationData.name}, ${locationData.country || ""}`
      );

      return locationData;
    } catch (error) {
      console.error("Error getting current location:", error);
      const errorMsg = error.message || "Failed to get current location";
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [saveLocation]); // Added saveLocation dependency

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
    console.log('selectLocation called with:', locationData);

    if (!locationData) {
      console.error('selectLocation received null data');
      setError("Invalid location selected");
      return null;
    }

    try {
      // Use the utility function to normalize the data
      const normalizedLocation = normalizeLocationData(locationData, 'search'); // Assuming data from search

      if (!normalizedLocation) {
        console.error('Failed to normalize location data:', locationData);
        setError("Could not process location data");
        toast.error("Could not process location data");
        return null;
      }

      console.log('Setting location to:', normalizedLocation);
      setLocation(normalizedLocation);
      saveLocation(normalizedLocation); // saveLocation is now defined before this

      toast.success(
        `Location set to ${normalizedLocation.name}, ${
          normalizedLocation.country || ""
        }`
      );

      return normalizedLocation;
    } catch (error) {
      console.error("Error selecting location:", error);
      setError("Error selecting location");
      toast.error("Error selecting location");
      return null;
    }
  }, [saveLocation]); // Dependency array is now correct

  return {
    location,
    savedLocations,
    isLoading,
    error,
    getCurrentLocation,
    searchForLocations,
    selectLocation,
    // saveLocation is intentionally not returned if it's only internal
  };
};
