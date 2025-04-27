// Custom hook for fetching and managing prayer times
import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { fetchTimezone } from "../utils/islamic/locationUtils";
import {
  timeStringToDate as baseTimeStringToDate,
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

// Helper to convert HH:MM string to minutes since midnight
const timeStringToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return null;
  const [hours, minutes] = timeStr.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

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

  // Helper to determine the timezone offset from a location
  const getTimezoneFromLocation = (location) => {
    if (!location) return "";
    
    // If location has a stored timezone, use it
    if (location.timezone) return location.timezone;
    
    // For certain well-known locations, we can hardcode the timezone
    if (location.name === 'Singapore' || location.country === 'Singapore') {
      return "Asia/Singapore";
    }
    else if (location.name === 'Dhaka' || location.country === 'Bangladesh') {
      return "Asia/Dhaka";
    }
    
    // Default timezone information
    const browserOffset = -new Date().getTimezoneOffset() / 60; // Browser offset in hours
    const sign = browserOffset >= 0 ? "+" : "-";
    const hours = Math.abs(Math.floor(browserOffset));
    return `Etc/GMT${sign}${hours}`;
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
    const cacheKey = `prayerTimes_${lat}_${lng}_${todayStr}_${getTimezoneFromLocation(location)}`;

    // 1. Try loading from cache first
    const cachedData = getLocalStorageItem(cacheKey);
    if (cachedData) {
      console.log("Using cached prayer times for", cacheKey);
      setPrayerTimes(cachedData);
      setProhibitedTimes(calculateProhibitedTimes(cachedData));
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
                  const timeDate = baseTimeStringToDate(timings[prayer]);
                  const adjustedTime = addMinutes(timeDate, minutes);
                  timings[prayer] = adjustedTime;
                }
              }
            );
          }

          setPrayerTimes(timings);
          setLocalStorageItem(cacheKey, timings); // Cache the fetched data
          setProhibitedTimes(calculateProhibitedTimes(timings));
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
        setProhibitedTimes(calculateProhibitedTimes(memoizedFallbackTimes));
        setError("Location coordinates invalid. Using estimated prayer times.");
      }
    } catch (apiError) {
      console.error("Error fetching prayer times from API:", apiError);
      // Fallback if API fails
      setPrayerTimes(memoizedFallbackTimes);
      setProhibitedTimes(calculateProhibitedTimes(memoizedFallbackTimes));
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

  const getNextPrayerInfo = useCallback((currentMinutesSinceMidnight) => {
    if (!prayerTimes) return null;

    const prayerOrder = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
    let nextPrayer = null;
    let minDiff = Infinity;

    for (const prayerName of prayerOrder) {
      const prayerTimeStr = prayerTimes[prayerName] || prayerTimes[prayerName.toLowerCase()];
      const prayerMinutes = timeStringToMinutes(prayerTimeStr);

      if (prayerMinutes === null) continue; // Skip if time is invalid

      let diff = prayerMinutes - currentMinutesSinceMidnight;
      
      // If difference is negative, it means the prayer is tomorrow
      if (diff < 0) {
        diff += 24 * 60; // Add minutes in a day
      }

      if (diff < minDiff) {
        minDiff = diff;
        nextPrayer = { prayerName, time: prayerTimeStr, diffMinutes: minDiff };
      }
    }
    
    // If the closest prayer is still negative after adding 24h (shouldn't happen with valid data)
    // or if no prayer found, default to Fajr as next
    if (!nextPrayer && (prayerTimes.Fajr || prayerTimes.fajr)) {
       const fajrTimeStr = prayerTimes.Fajr || prayerTimes.fajr;
       const fajrMinutes = timeStringToMinutes(fajrTimeStr);
       if (fajrMinutes !== null) {
           let diff = fajrMinutes - currentMinutesSinceMidnight + (24 * 60); // Ensure it's tomorrow
           nextPrayer = { prayerName: "Fajr", time: fajrTimeStr, diffMinutes: diff };
       }
    }

    return nextPrayer;
  }, [prayerTimes]);

  // Helper to get current minutes since midnight at the location's timezone
  const getCurrentMinutesAtLocation = (location) => {
    const now = new Date();
    if (!location) {
      return now.getHours() * 60 + now.getMinutes(); // fallback to browser time
    }

    try {
      const tz = getTimezoneFromLocation(location) || Intl.DateTimeFormat().resolvedOptions().timeZone;
      const formatter = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: tz,
      });
      const parts = formatter.formatToParts(now);
      const hourPart = parts.find((p) => p.type === 'hour');
      const minutePart = parts.find((p) => p.type === 'minute');
      const hours = hourPart ? parseInt(hourPart.value, 10) : now.getHours();
      const minutes = minutePart ? parseInt(minutePart.value, 10) : now.getMinutes();
      return hours * 60 + minutes;
    } catch (err) {
      console.warn('Could not calculate current minutes at location, falling back to browser time', err);
      return now.getHours() * 60 + now.getMinutes();
    }
  };

  const updateActivePrayerState = useCallback(() => {
    const currentMinutesSinceMidnight = getCurrentMinutesAtLocation(location);

    const nextPrayerInfo = getNextPrayerInfo(currentMinutesSinceMidnight);

    let currentPrayerName = null;
    let remainingMillis = null;

    if (nextPrayerInfo) {
      const prayerOrder = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
      const nextIndex = prayerOrder.indexOf(nextPrayerInfo.prayerName);

      if (nextIndex === 0) {
        currentPrayerName = "Isha";
      } else if (nextIndex > 0) {
        currentPrayerName = prayerOrder[nextIndex - 1];
        if (currentPrayerName === "Sunrise") currentPrayerName = "Fajr";
      }
      remainingMillis = nextPrayerInfo.diffMinutes * 60 * 1000;
    }

    setActivePrayer((prev) => (prev !== currentPrayerName ? currentPrayerName : prev));
    setRemainingTime((prev) => {
      const newRemaining = remainingMillis ? formatTimeToHHMMSS(remainingMillis) : null;
      return prev !== newRemaining ? newRemaining : prev;
    });
  }, [prayerTimes, location, getNextPrayerInfo]);

  // Update active prayer periodically and when prayerTimes change
  useEffect(() => {
    if (!prayerTimes) {
        setActivePrayer(null);
        setRemainingTime(null);
        return;
    }
    
    updateActivePrayerState(); // Initial calculation
    const interval = setInterval(updateActivePrayerState, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [prayerTimes, updateActivePrayerState]);

  // Function to refresh prayer times on demand (clears cache first)
  const refreshPrayerTimes = useCallback(() => {
    if (!location) return;
    const lat = location?.lat || 0;
    const lng = location?.lon || location?.lng || 0;
    const todayStr = getTodayDateString();
    const cacheKey = `prayerTimes_${lat}_${lng}_${todayStr}_${getTimezoneFromLocation(location)}`;
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
    refreshPrayerTimes,
  };
};
