// Custom hook for fetching and managing prayer times
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { fetchTimezone } from "../utils/islamic/locationUtils";
import {
  timeStringToDate,
  addMinutes,
  subtractMinutes,
  calculateFallbackPrayerTimes,
  calculateProhibitedTimes,
} from "../utils/islamic/timeUtils";

export const usePrayerTimes = (location, settings) => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [prohibitedTimes, setProhibitedTimes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePrayer, setActivePrayer] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);

  // Fetch prayer times from API
  const fetchPrayerTimes = useCallback(async () => {
    if (!location) return;

    setIsLoading(true);
    setError(null);

    try {
      // Default to coordinates (0,0) if location is unavailable
      const lat = location?.lat || 0;
      const lng = location?.lon || location?.lng || 0;

      // Get timezone based on coordinates
      const timezone = await fetchTimezone(lat, lng);

      // Only proceed with API call if we have valid coordinates
      if (lat !== 0 || lng !== 0) {
        // Convert string method names to numerical method IDs for Al Adhan API
        // Default to 4 (Muslim World League) which is what Google appears to use by default
        let methodId = 4; // Muslim World League default (matches Google's default)
        
        if (settings?.calculationMethod === "standard") {
          methodId = 2; // Islamic Society of North America (ISNA)
        } else if (settings?.calculationMethod === "hanafi") {
          methodId = 1; // University of Islamic Sciences, Karachi (Hanafi)
        }
        
        const madhab = settings?.madhab || 1; // Default to 1 (Shafi)

        const today = new Date();
        const month = today.getMonth() + 1; // JavaScript months are 0-indexed
        const year = today.getFullYear();
        const day = today.getDate();

        const url = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${lat}&longitude=${lng}&method=${methodId}&school=${madhab}`;

        const response = await axios.get(url);

        if (response.data && response.data.data && response.data.data.timings) {
          let timings = response.data.data.timings;

          // Apply time adjustments if they exist in settings
          if (settings?.timeAdjustments) {
            Object.entries(settings.timeAdjustments).forEach(
              ([prayer, minutes]) => {
                if (timings[prayer] && minutes !== 0) {
                  const timeDate = timeStringToDate(timings[prayer]);
                  if (minutes > 0) {
                    const adjustedTime = addMinutes(timeDate, minutes);
                    timings[prayer] = adjustedTime;
                  } else {
                    const adjustedTime = subtractMinutes(
                      timeDate,
                      Math.abs(minutes)
                    );
                    timings[prayer] = adjustedTime;
                  }
                }
              }
            );
          }

          setPrayerTimes(timings);

          // Calculate and set prohibited times
          const prohibitedTimesList = calculateProhibitedTimes(timings);
          setProhibitedTimes(prohibitedTimesList);

          setError(null);
        } else {
          throw new Error("Invalid data format from prayer times API");
        }
      } else {
        // Use fallback calculation for default/demo values
        console.warn(
          "Using fallback prayer time calculations (no valid location)"
        );
        const fallbackTimes = calculateFallbackPrayerTimes(lat, lng);
        setPrayerTimes(fallbackTimes);

        // Calculate and set prohibited times with fallback data
        const prohibitedTimesList = calculateProhibitedTimes(fallbackTimes);
        setProhibitedTimes(prohibitedTimesList);

        setError("Location not available. Using estimated prayer times.");
      }
    } catch (error) {
      console.error("Error fetching prayer times:", error);

      // Use fallback calculation when API fails
      const fallbackTimes = calculateFallbackPrayerTimes(
        location?.lat || 0,
        location?.lon || location?.lng || 0
      );
      setPrayerTimes(fallbackTimes);

      // Calculate prohibited times with fallback data
      const prohibitedTimesList = calculateProhibitedTimes(fallbackTimes);
      setProhibitedTimes(prohibitedTimesList);

      setError(
        `Could not fetch prayer times: ${error.message}. Using estimated times.`
      );
    } finally {
      setIsLoading(false);
    }
  }, [location, settings]);

  // Function to update active prayer and remaining time
  const updateActivePrayer = useCallback(
    (currentTime) => {
      if (!prayerTimes) {
        return { activePrayer: null, remainingTime: null };
      }

      try {
        // Convert current time to Date
        const now = new Date();

        // Get next prayer time
        const { prayerName: nextPrayer, time: nextPrayerTime } =
          getNextPrayerTime(prayerTimes, now) || {};

        if (!nextPrayer) {
          // If no next prayer found today, assume Fajr tomorrow
          return { activePrayer: null, remainingTime: null };
        }

        // Get current prayer (the prayer that precedes the next prayer)
        let currentPrayer = null;

        // Define prayer order (including Sunrise for calculation, though it's not a Fard prayer)
        const prayerOrder = [
          "Fajr",
          "Sunrise",
          "Dhuhr",
          "Asr",
          "Maghrib",
          "Isha",
        ];

        // Find next prayer's index
        const nextPrayerIndex = prayerOrder.indexOf(nextPrayer);

        // Current prayer is the one before next prayer (or Isha if next is Fajr)
        if (nextPrayerIndex > 0) {
          currentPrayer = prayerOrder[nextPrayerIndex - 1];
          // Skip Sunrise as an active prayer since it's not a Fard prayer
          if (currentPrayer === "Sunrise") {
            currentPrayer = "Fajr";
          }
        } else if (nextPrayerIndex === 0) {
          // If next prayer is Fajr, current prayer is Isha
          currentPrayer = "Isha";
        }

        // Set active prayer as the current prayer
        const activePrayer = currentPrayer;

        // Calculate remaining time until next prayer
        const timeUntilNextPrayer = getRemainingTime(nextPrayerTime);

        return {
          activePrayer,
          remainingTime: formatRemainingTime(timeUntilNextPrayer),
        };
      } catch (error) {
        console.error("Error updating active prayer:", error);
        return { activePrayer: null, remainingTime: null };
      }
    },
    [prayerTimes]
  );

  // Helper function to get remaining time in milliseconds
  const getRemainingTime = (prayerTime) => {
    if (!prayerTime) return null;

    const [hours, minutes] = prayerTime.split(":").map(Number);

    const now = new Date();
    const prayerDate = new Date();
    prayerDate.setHours(hours, minutes, 0, 0);

    // If prayer time is in the past, set it to tomorrow
    if (prayerDate < now) {
      prayerDate.setDate(prayerDate.getDate() + 1);
    }

    const timeDiff = prayerDate - now;
    return timeDiff;
  };

  // Format remaining time in HH:MM:SS format
  const formatRemainingTime = (timeDiff) => {
    if (!timeDiff) return null;

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Helper function to get the next prayer time
  const getNextPrayerTime = (prayerTimes, currentTime) => {
    if (!prayerTimes) return null;

    // Define prayer order for Fard prayers (and Sunrise for calculation purposes)
    const prayers = [
      { name: "Fajr", time: prayerTimes.Fajr },
      { name: "Sunrise", time: prayerTimes.Sunrise },
      { name: "Dhuhr", time: prayerTimes.Dhuhr },
      { name: "Asr", time: prayerTimes.Asr },
      { name: "Maghrib", time: prayerTimes.Maghrib },
      { name: "Isha", time: prayerTimes.Isha },
    ];

    // Filter out any prayers without valid times
    const validPrayers = prayers.filter((prayer) => prayer.time);
    if (validPrayers.length === 0) return null;

    let nextPrayer = null;
    let closestTimeDiff = Infinity;

    for (const prayer of validPrayers) {
      try {
        const [hours, minutes] = prayer.time.split(":").map(Number);

        // Create Date object for prayer time
        const prayerDate = new Date(currentTime);
        prayerDate.setHours(hours, minutes, 0, 0);

        // If prayer time is in the past, consider it for tomorrow
        if (prayerDate < currentTime) {
          prayerDate.setDate(prayerDate.getDate() + 1);
        }

        const timeDiff = prayerDate - currentTime;

        if (timeDiff > 0 && timeDiff < closestTimeDiff) {
          closestTimeDiff = timeDiff;
          nextPrayer = { prayerName: prayer.name, time: prayer.time };
        }
      } catch (error) {
        console.error(
          `Error calculating next prayer time for ${prayer.name}:`,
          error
        );
      }
    }

    return nextPrayer;
  };

  // Fetch prayer times when location or settings change
  useEffect(() => {
    if (location) {
      fetchPrayerTimes();
    }
  }, [location, settings, fetchPrayerTimes]);

  // Update which prayer is active
  useEffect(() => {
    if (!prayerTimes) return;

    const updateActiveAndRemaining = () => {
      const { activePrayer: active, remainingTime: remaining } = updateActivePrayer(
        new Date()
      );
      setActivePrayer(active);
      setRemainingTime(remaining);
    };

    // Update immediately
    updateActiveAndRemaining();

    // Update every minute
    const interval = setInterval(updateActiveAndRemaining, 60000);

    return () => clearInterval(interval);
  }, [prayerTimes, updateActivePrayer]);

  // Function to refresh prayer times on demand
  const refreshPrayerTimes = useCallback(() => {
    if (location) {
      fetchPrayerTimes();
    }
  }, [location, fetchPrayerTimes]);

  return {
    prayerTimes,
    prohibitedTimes,
    isLoading,
    error,
    activePrayer,
    remainingTime,
    updateActivePrayer: (currentTime) => {
      const result = updateActivePrayer(currentTime);
      setActivePrayer(result.activePrayer);
      setRemainingTime(result.remainingTime);
      return result;
    },
    refreshPrayerTimes,
  };
};
