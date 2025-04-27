// Custom hook for fetching and managing prayer times
import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { fetchTimezone } from "../utils/islamic/locationUtils";
import {
  timeStringToDate,
  addMinutes,
  subtractMinutes,
  calculateFallbackPrayerTimes,
  calculateProhibitedTimes,
} from "../utils/islamic/timeUtils";
import { formatTimeToHHMMSS } from "../../../utils/timeUtils";
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from "../../../utils/localStorageUtils"; // Import localStorage helpers

export const usePrayerTimes = (location, settings) => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [prohibitedTimes, setProhibitedTimes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePrayer, setActivePrayer] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);

  // Get today's date in YYYY-MM-DD format for the cache key
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Memoize the fallback prayer times object
  const memoizedFallbackTimes = useMemo(() => {
    return calculateFallbackPrayerTimes(0, 0);
  }, []);

  // Fetch prayer times from API or Cache
  const loadPrayerTimes = useCallback(async () => {
    if (!location) return;

    const lat = location?.lat || 0;
    const lng = location?.lon || location?.lng || 0;
    const todayStr = getTodayDateString();
    const cacheKey = `prayerTimes_${lat}_${lng}_${todayStr}`;

    // 1. Try loading from cache first
    const cachedData = getLocalStorageItem(cacheKey);
    if (cachedData) {
      console.log("Using cached prayer times for", cacheKey);
      setPrayerTimes(cachedData);
      const prohibited = calculateProhibitedTimes(cachedData);
      setProhibitedTimes(prohibited);
      setError(null); // Clear any previous error
      setIsLoading(false); // Not loading if using cache
      return; // Exit if cache is valid
    }

    // 2. If not in cache or cache is stale, fetch from API
    console.log("Fetching prayer times from API for", cacheKey);
    setIsLoading(true);
    setError(null);

    // --- API Fetch Logic (adapted from previous fetchPrayerTimes) ---
    try {
      // Only proceed with API call if we have valid coordinates (lat/lng are non-zero)
      if (lat !== 0 || lng !== 0) {
        // Fetch timezone first (handle potential errors)
        let timezone;
        try {
          timezone = await fetchTimezone(lat, lng);
        } catch (tzError) {
          console.error("Error fetching timezone:", tzError);
          // Don't block prayer time fetching, but maybe log or use a default?
          // For now, we proceed without a specific timezone, relying on the API's default handling.
        }

        let methodId = 4; // Muslim World League default
        if (settings?.calculationMethod === "standard") methodId = 2;
        else if (settings?.calculationMethod === "hanafi") methodId = 1;
        const madhab = settings?.madhab || 1; // Default to 1 (Shafi)

        const url = `https://api.aladhan.com/v1/timings/${todayStr}?latitude=${lat}&longitude=${lng}&method=${methodId}&school=${madhab}`;
        const response = await axios.get(url);

        if (response.data && response.data.data && response.data.data.timings) {
          let timings = response.data.data.timings;

          // Apply time adjustments
          if (settings?.timeAdjustments) {
            Object.entries(settings.timeAdjustments).forEach(
              ([prayer, minutes]) => {
                if (timings[prayer] && minutes !== 0) {
                  const timeDate = timeStringToDate(timings[prayer]);
                  const adjustedTime = addMinutes(timeDate, minutes);
                  timings[prayer] = adjustedTime;
                }
              }
            );
          }

          setPrayerTimes(timings);
          setLocalStorageItem(cacheKey, timings); // Cache the fetched data
          const prohibited = calculateProhibitedTimes(timings);
          setProhibitedTimes(prohibited);
          setError(null);
        } else {
          throw new Error("Invalid data format from prayer times API");
        }
      } else {
        // Handle invalid coordinates (use fallback)
        console.warn(
          "Using fallback prayer times (invalid coordinates: lat=0, lng=0)"
        );
        setPrayerTimes(memoizedFallbackTimes);
        const prohibited = calculateProhibitedTimes(memoizedFallbackTimes);
        setProhibitedTimes(prohibited);
        setError("Location coordinates invalid. Using estimated prayer times.");
      }
    } catch (apiError) {
      console.error("Error fetching prayer times from API:", apiError);
      // Fallback if API fails
      setPrayerTimes(memoizedFallbackTimes);
      const prohibited = calculateProhibitedTimes(memoizedFallbackTimes);
      setProhibitedTimes(prohibited);
      setError(
        `Could not fetch prayer times: ${apiError.message}. Using estimated times.`
      );
    } finally {
      setIsLoading(false);
    }
  }, [location, settings, memoizedFallbackTimes]); // Depend on location, settings

  // Effect to load prayer times on mount or when dependencies change
  useEffect(() => {
    if (location) {
      loadPrayerTimes();
    }
    // Clear prayer times if location becomes null
    else {
      setPrayerTimes(null);
      setProhibitedTimes([]);
      setActivePrayer(null);
      setRemainingTime(null);
      setError(null);
      setIsLoading(false);
    }
  }, [location, settings, loadPrayerTimes]); // loadPrayerTimes is memoized

  // ----- Active Prayer Calculation Logic (mostly unchanged) -----

  // Function to update active prayer and remaining time (Internal Logic)
  const updateActivePrayer = useCallback(
    (currentTime) => {
      if (!prayerTimes) {
        return { activePrayer: null, remainingTime: null };
      }
      try {
        const now = new Date();
        const { prayerName: nextPrayer, time: nextPrayerTime } =
          getNextPrayerTime(prayerTimes, now) || {};

        if (!nextPrayer) return { activePrayer: null, remainingTime: null };

        let currentPrayer = null;
        const prayerOrder = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
        const nextPrayerIndex = prayerOrder.indexOf(nextPrayer);

        if (nextPrayerIndex > 0) {
          currentPrayer = prayerOrder[nextPrayerIndex - 1];
          if (currentPrayer === "Sunrise") currentPrayer = "Fajr";
        } else if (nextPrayerIndex === 0) {
          currentPrayer = "Isha";
        }

        const timeUntilNextPrayer = getRemainingTime(nextPrayerTime);

        return {
          activePrayer: currentPrayer,
          remainingTime: formatRemainingTime(timeUntilNextPrayer),
        };
      } catch (error) {
        console.error("Error updating active prayer:", error);
        return { activePrayer: null, remainingTime: null };
      }
    },
    [prayerTimes] // Depends only on prayerTimes
  );

  // Helper function to get remaining time in milliseconds
  const getRemainingTime = (prayerTime) => {
     if (!prayerTime) return null;
     const [hours, minutes] = prayerTime.split(":").map(Number);
     const now = new Date();
     const prayerDate = new Date();
     prayerDate.setHours(hours, minutes, 0, 0);
     if (prayerDate < now) {
       prayerDate.setDate(prayerDate.getDate() + 1);
     }
     return prayerDate - now;
  };

  // Use our utility function instead of local implementation
  const formatRemainingTime = (timeDiff) => {
    return formatTimeToHHMMSS(timeDiff);
  };

  // Helper function to get the next prayer time
  const getNextPrayerTime = (prayerTimes, currentTime) => {
     if (!prayerTimes) return null;
     const prayers = [
       { name: "Fajr", time: prayerTimes.Fajr },
       { name: "Sunrise", time: prayerTimes.Sunrise },
       { name: "Dhuhr", time: prayerTimes.Dhuhr },
       { name: "Asr", time: prayerTimes.Asr },
       { name: "Maghrib", time: prayerTimes.Maghrib },
       { name: "Isha", time: prayerTimes.Isha },
     ];
     const validPrayers = prayers.filter((p) => p.time);
     if (validPrayers.length === 0) return null;

     let nextPrayer = null;
     let closestTimeDiff = Infinity;

     for (const prayer of validPrayers) {
       try {
         const [hours, minutes] = prayer.time.split(":").map(Number);
         const prayerDate = new Date(currentTime);
         prayerDate.setHours(hours, minutes, 0, 0);
         if (prayerDate < currentTime) prayerDate.setDate(prayerDate.getDate() + 1);
         const timeDiff = prayerDate - currentTime;
         if (timeDiff > 0 && timeDiff < closestTimeDiff) {
           closestTimeDiff = timeDiff;
           nextPrayer = { prayerName: prayer.name, time: prayer.time };
         }
       } catch (error) {
         console.error(`Error calc next prayer for ${prayer.name}:`, error);
       }
     }
     return nextPrayer;
  };

  // Update which prayer is active (Effect runs when prayerTimes changes)
  useEffect(() => {
    console.log("useEffect [prayerTimes] running. prayerTimes:", prayerTimes);
    if (!prayerTimes) return;

    const updateActiveAndRemaining = () => {
      const { activePrayer: active, remainingTime: remaining } = updateActivePrayer(new Date());
      // Only update state if the values actually changed to prevent potential loops
      if (active !== activePrayer) {
        setActivePrayer(active);
      }
      if (remaining !== remainingTime) {
        setRemainingTime(remaining);
      }
    };

    updateActiveAndRemaining(); // Update immediately
    const interval = setInterval(updateActiveAndRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  // Remove activePrayer and remainingTime from dependencies
  }, [prayerTimes, updateActivePrayer]);

  // Function to refresh prayer times on demand (clears cache first)
  const refreshPrayerTimes = useCallback(() => {
    if (!location) return;
    const lat = location?.lat || 0;
    const lng = location?.lon || location?.lng || 0;
    const todayStr = getTodayDateString();
    const cacheKey = `prayerTimes_${lat}_${lng}_${todayStr}`;
    localStorage.removeItem(cacheKey); // Remove current cache
    console.log("Cache cleared, refreshing prayer times for", cacheKey);
    loadPrayerTimes(); // Reload (will fetch from API)
  }, [location, loadPrayerTimes]);

  return {
    prayerTimes,
    prohibitedTimes,
    isLoading,
    error,
    activePrayer,
    remainingTime,
    refreshPrayerTimes, // Expose the refresh function
  };
};
