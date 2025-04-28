import { useState, useEffect, useCallback } from 'react';
import { formatTimeToHHMMSS } from "@/utils/timeUtils"; // Using absolute path
import { getTimezoneOffsetFromLocation } from "../utils/timeUtils"; // Use helper from timeUtils

// Helper to convert HH:MM string to minutes since midnight
const timeStringToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return null;
    const [hours, minutes] = timeStr.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;
    return hours * 60 + minutes;
};

export const useActivePrayerStatus = (prayerTimes, location) => {
    const [activePrayer, setActivePrayer] = useState(null);
    const [remainingTime, setRemainingTime] = useState(null);

    // Helper to get current minutes since midnight at the location's timezone
    const getCurrentMinutesAtLocation = useCallback(() => {
        const now = new Date();
        // Calculate offset in minutes (positive for East, negative for West)
        const offsetMinutes = getTimezoneOffsetFromLocation(location);
        
        // Get UTC time in minutes since midnight
        const utcHours = now.getUTCHours();
        const utcMinutes = now.getUTCMinutes();
        const utcTotalMinutes = utcHours * 60 + utcMinutes;
        
        // Apply offset
        let localTotalMinutes = utcTotalMinutes + offsetMinutes;
        
        // Handle wraparound (ensure result is within 0 to 1439)
        localTotalMinutes = (localTotalMinutes + 1440) % 1440; 

        return localTotalMinutes;
    }, [location]);

    const getNextPrayerInfo = useCallback((currentMinutesSinceMidnight) => {
        if (!prayerTimes) return null;

        const prayerOrder = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
        let nextPrayer = null;
        let minDiff = Infinity;

        for (const prayerName of prayerOrder) {
            // Try both capitalized and lowercase keys, preferring capitalized
            const prayerTimeStr = prayerTimes[prayerName] || prayerTimes[prayerName.toLowerCase()];
            const prayerMinutes = timeStringToMinutes(prayerTimeStr);

            if (prayerMinutes === null) continue;

            let diff = prayerMinutes - currentMinutesSinceMidnight;
            if (diff < 0) {
                diff += 1440; // Add minutes in a day (24 * 60)
            }

            if (diff < minDiff) {
                minDiff = diff;
                nextPrayer = { prayerName, time: prayerTimeStr, diffMinutes: minDiff };
            }
        }

        // Fallback if no prayer found (should only happen with invalid data/edge cases)
        if (!nextPrayer && (prayerTimes.Fajr || prayerTimes.fajr)) {
            const fajrTimeStr = prayerTimes.Fajr || prayerTimes.fajr;
            const fajrMinutes = timeStringToMinutes(fajrTimeStr);
            if (fajrMinutes !== null) {
                let diff = fajrMinutes - currentMinutesSinceMidnight + 1440;
                nextPrayer = { prayerName: "Fajr", time: fajrTimeStr, diffMinutes: diff };
            }
        }

        return nextPrayer;
    }, [prayerTimes]);

    const updateActivePrayerState = useCallback(() => {
        const currentMinutesSinceMidnight = getCurrentMinutesAtLocation();
        const nextPrayerInfo = getNextPrayerInfo(currentMinutesSinceMidnight);

        let currentPrayerName = null;
        let remainingMillis = null;

        if (nextPrayerInfo) {
            const prayerOrder = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
            const nextIndex = prayerOrder.indexOf(nextPrayerInfo.prayerName);

            if (nextIndex === 0) {
                currentPrayerName = "Isha"; // If next is Fajr, current is Isha
            } else if (nextIndex > 0) {
                currentPrayerName = prayerOrder[nextIndex - 1];
                // Treat Sunrise time as belonging to Fajr period for active prayer display
                if (currentPrayerName === "Sunrise") {
                    currentPrayerName = "Fajr";
                }
            }
            remainingMillis = nextPrayerInfo.diffMinutes * 60 * 1000;
        }

        // Only update state if the value has actually changed
        setActivePrayer((prev) => (prev !== currentPrayerName ? currentPrayerName : prev));
        setRemainingTime((prev) => {
            const newRemaining = remainingMillis ? formatTimeToHHMMSS(remainingMillis) : null;
            return prev !== newRemaining ? newRemaining : prev;
        });

    }, [prayerTimes, location, getNextPrayerInfo, getCurrentMinutesAtLocation]);

    // Update active prayer periodically and when prayerTimes/location change
    useEffect(() => {
        if (!prayerTimes || !location) {
            setActivePrayer(null);
            setRemainingTime(null);
            return;
        }

        updateActivePrayerState(); // Initial calculation
        const interval = setInterval(updateActivePrayerState, 60000); // Update every minute

        return () => clearInterval(interval); // Cleanup interval
    }, [prayerTimes, location, updateActivePrayerState]);

    return { activePrayer, remainingTime };
}; 