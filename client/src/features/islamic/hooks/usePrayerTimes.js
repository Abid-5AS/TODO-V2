// Custom hook for fetching and managing prayer times
import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchAndProcessPrayerTimes } from "../services"; // Use the new service function
import {
  calculateFallbackPrayerTimes,
  calculateProhibitedTimes,
  getTimezoneFromLocation, // Keep for cache key generation
} from "../utils/timeUtils";
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from "@/utils/localStorageUtils";
import { useActivePrayerStatus } from "./useActivePrayerStatus"; // Import the new hook
import { getTodayDateString } from "@/common/utils/dateUtils";

// Helper to get today's date string (can be moved to common utils later)

export const usePrayerTimes = (location, settings) => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [prohibitedTimes, setProhibitedTimes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get active prayer status from the dedicated hook
  const { activePrayer, remainingTime } = useActivePrayerStatus(prayerTimes, location);

  // Memoize fallback times (unchanged)
  const memoizedFallbackTimes = useMemo(() => {
    return calculateFallbackPrayerTimes(0, 0); // Maybe pass location?
  }, []);

  // Fetch prayer times from Service or Cache
  const loadPrayerTimes = useCallback(async () => {
    if (!location) {
      console.log("[usePrayerTimes] No location provided, exiting loadPrayerTimes.");
      return;
    }

    const lat = location?.lat || 0;
    const lng = location?.lon || location?.lng || 0;
    const todayStr = getTodayDateString();
    const timezoneIdentifier = getTimezoneFromLocation(location); // Use util function
    const cacheKey = `prayerTimes_${lat}_${lng}_${todayStr}_${timezoneIdentifier}`;

    // --- TEMPORARILY DISABLED CACHE CHECK FOR DEBUGGING ---
    // const cachedData = getLocalStorageItem(cacheKey);
    // if (cachedData) {
    //   console.log("[usePrayerTimes] Found cached data unexpectedly, exiting loadPrayerTimes.", cachedData);
    //   setPrayerTimes(cachedData);
    //   setProhibitedTimes(calculateProhibitedTimes(cachedData));
    //   setError(null);
    //   setIsLoading(false);
    //   return;
    // }
    // --- END TEMP DISABLE ---

    // 2. Fetch from Service
    console.log("[usePrayerTimes] Fetching prayer times from Service for", cacheKey);
    setIsLoading(true);
    setError(null);

    try {
      // Log the settings being used for the fetch
      console.log('[usePrayerTimes] Fetching with settings:', JSON.stringify(settings));

      const result = await fetchAndProcessPrayerTimes(location, settings, todayStr);

      if (result.success && result.data) {
        console.log("[usePrayerTimes] Fetched successfully from service");
        // Log the data AFTER adjustments from the service
        console.log('[usePrayerTimes] Processed timings received:', JSON.stringify(result.data));

        setPrayerTimes(result.data);
        setLocalStorageItem(cacheKey, result.data);
        setProhibitedTimes(calculateProhibitedTimes(result.data));
        setError(null);
      } else if (lat === 0 && lng === 0) {
        console.warn("[usePrayerTimes] Using fallback (invalid coordinates)");
        setPrayerTimes(memoizedFallbackTimes);
        setProhibitedTimes(calculateProhibitedTimes(memoizedFallbackTimes));
        setError("Location invalid. Using estimated times.");
      } else {
        console.error("[usePrayerTimes] Service fetch failed, using fallback", result.error);
        setPrayerTimes(memoizedFallbackTimes);
        setProhibitedTimes(calculateProhibitedTimes(memoizedFallbackTimes));
        setError(
          `Could not fetch prayer times: ${result.error || 'Unknown error'}. Using estimated times.`
        );
      }
    } catch (serviceError) {
      // Catch errors during the service call itself (e.g., network)
      console.error("[usePrayerTimes] Error calling prayer time service:", serviceError);
      setPrayerTimes(memoizedFallbackTimes);
      setProhibitedTimes(calculateProhibitedTimes(memoizedFallbackTimes));
      setError(
        `Service error: ${serviceError.message}. Using estimated times.`
      );
    } finally {
      setIsLoading(false);
    }
  }, [location, settings, memoizedFallbackTimes]);

  // Effect to load prayer times (unchanged structure)
  useEffect(() => {
    console.log("[usePrayerTimes] useEffect triggered. Location:", location);
    if (location) {
      loadPrayerTimes();
    } else {
      setPrayerTimes(null);
      setProhibitedTimes([]);
      // Active prayer state is handled by useActivePrayerStatus hook
      setError(null);
      setIsLoading(false);
    }
  }, [location, settings, loadPrayerTimes]);

  // Function to refresh prayer times on demand
  const refreshPrayerTimes = useCallback(() => {
    if (!location) return;
    const lat = location?.lat || 0;
    const lng = location?.lon || location?.lng || 0;
    const todayStr = getTodayDateString();
    const timezoneIdentifier = getTimezoneFromLocation(location); // Use util
    const cacheKey = `prayerTimes_${lat}_${lng}_${todayStr}_${timezoneIdentifier}`;
    try {
      localStorage.removeItem(cacheKey);
      console.log("[usePrayerTimes] Cache cleared, refreshing prayer times for", cacheKey);
      loadPrayerTimes(); // Reload (will fetch from Service)
    } catch (e) {
      console.error("Error removing item from localStorage:", e);
      // Proceed with loading anyway, but log the error
      loadPrayerTimes();
    }
  }, [location, loadPrayerTimes]);

  return {
    prayerTimes,
    prohibitedTimes,
    isLoading,
    error,
    activePrayer, // Provided by useActivePrayerStatus
    remainingTime, // Provided by useActivePrayerStatus
    refreshPrayerTimes,
  };
};
 