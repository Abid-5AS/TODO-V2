import { useState, useEffect, useCallback } from 'react';
import moment from 'moment'; // Keep moment for date diff calculations
import { hijriToGregorian } from '@tabby_ai/hijri-converter'; // Import the converter

// Constants (could be moved to islamic/constants)
const HOLIDAY_STORAGE_KEY = "islamic_holiday_data_v2"; // Changed key for new structure
const ONE_MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000; // Approximation
const UPCOMING_EVENT_THRESHOLD_DAYS = 60; // Show events within the next 60 days

// Base Islamic holidays (day/month)
const baseHolidays = [
    { day: 1, month: 1, name: "Islamic New Year", type: "religious" },
    { day: 10, month: 1, name: "Day of Ashura", type: "religious" },
    { day: 12, month: 3, name: "Mawlid al-Nabi", type: "religious" },
    { day: 27, month: 7, name: "Laylat al-Miraj", type: "religious" },
    { day: 15, month: 8, name: "Laylat al-Baraat", type: "religious" },
    { day: 1, month: 9, name: "Beginning of Ramadan", type: "religious" },
    { day: 27, month: 9, name: "Laylat al-Qadr", type: "religious" },
    { day: 1, month: 10, name: "Eid al-Fitr", type: "religious" },
    { day: 8, month: 12, name: "Day of Arafah", type: "religious" },
    { day: 10, month: 12, name: "Eid al-Adha", type: "religious" }
];

// Array of Hijri month names (consistent with useIslamicDate)
const hijriMonthNames = [
  "Muharram", "Safar", "Rabi' al-awwal", "Rabi' al-thani",
  "Jumada al-ula", "Jumada al-ukhra", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
];

// Helper to get Gregorian date object from Hijri components
const getGregorianDateFromHijri = (day, month, year) => {
    try {
        const gregorian = hijriToGregorian({ year, month, day });
        // Create a JS Date object (month is 0-indexed)
        return new Date(gregorian.year, gregorian.month - 1, gregorian.day);
    } catch (e) {
        console.error(`Error converting Hijri ${day}/${month}/${year} to Gregorian:`, e);
        return null;
    }
};

export const useIslamicHolidays = (currentHijriDateComponents) => {
    const [holidays, setHolidays] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [isLoadingHolidays, setIsLoadingHolidays] = useState(true);
    const [holidayError, setHolidayError] = useState(null);

    const loadHolidaysAndEvents = useCallback(async () => {
        if (!currentHijriDateComponents || !currentHijriDateComponents.year) {
            setIsLoadingHolidays(false);
            setHolidayError("Missing current Hijri date components.");
            return;
        }

        setIsLoadingHolidays(true);
        setHolidayError(null);

        try {
            const currentHijriYear = currentHijriDateComponents.year;
            const cacheKey = `${HOLIDAY_STORAGE_KEY}_${currentHijriYear}`; // Year-specific cache key

            // 1. Check localStorage for cached data for the CURRENT Hijri year
            const storedData = localStorage.getItem(cacheKey);
            let holidayData = null;
            let processedHolidays = [];
            let calculatedUpcoming = [];

            if (storedData) {
                try {
                    const parsedData = JSON.parse(storedData);
                    const currentTime = new Date().getTime();
                    const isDataValid = (currentTime - parsedData.timestamp) < ONE_MONTH_IN_MS;

                    if (isDataValid && parsedData.data && Array.isArray(parsedData.data.holidays)) {
                        console.log("[useIslamicHolidays] Using cached holiday data for year", currentHijriYear);
                        holidayData = parsedData.data;
                        processedHolidays = holidayData.holidays || [];
                        calculatedUpcoming = holidayData.upcomingEvents || [];
                    } else {
                        console.log("[useIslamicHolidays] Cached holiday data invalid or expired, generating new data for year", currentHijriYear);
                        localStorage.removeItem(cacheKey);
                    }
                } catch (parseError) {
                    console.error("[useIslamicHolidays] Error parsing stored holiday data:", parseError);
                    localStorage.removeItem(cacheKey);
                }
            }

            // 2. Generate if not cached or invalid
            if (!holidayData) {
                console.log("[useIslamicHolidays] Generating new Islamic holiday data for year", currentHijriYear);
                const currentMoment = moment(); // Use current Gregorian date for diff calculation
                processedHolidays = [];
                calculatedUpcoming = [];

                baseHolidays.forEach(holiday => {
                    const hijriDate = { day: holiday.day, month: holiday.month, year: currentHijriYear };
                    const gregorianDateObj = getGregorianDateFromHijri(hijriDate.day, hijriDate.month, hijriDate.year);

                    if (!gregorianDateObj) return; // Skip if conversion failed

                    const gregorianMoment = moment(gregorianDateObj);
                    const hijriDateFormatted = `${hijriDate.day} ${hijriMonthNames[hijriDate.month - 1] || ''} ${hijriDate.year}`;
                    const gregorianDateFormatted = gregorianMoment.format('MMM D, YYYY');

                    // Calculate days remaining (can be negative if past)
                    const daysRemaining = gregorianMoment.diff(currentMoment, 'days');

                    const processedHoliday = {
                        ...holiday,
                        hijriDate: hijriDateFormatted,
                        gregorianDate: gregorianDateFormatted,
                        daysRemaining: daysRemaining
                    };

                    processedHolidays.push(processedHoliday);

                    // Add to upcoming events if within threshold and not past
                    if (daysRemaining >= 0 && daysRemaining <= UPCOMING_EVENT_THRESHOLD_DAYS) {
                        calculatedUpcoming.push(processedHoliday); // Add the fully processed holiday
                    }
                });

                // Sort upcoming events by days remaining
                calculatedUpcoming.sort((a, b) => a.daysRemaining - b.daysRemaining);

                // Cache the newly generated data with timestamp
                const dataToStore = {
                    holidays: processedHolidays,
                    upcomingEvents: calculatedUpcoming
                };
                localStorage.setItem(cacheKey, JSON.stringify({
                    timestamp: new Date().getTime(),
                    data: dataToStore
                }));
            }

            setHolidays(processedHolidays);
            setUpcomingEvents(calculatedUpcoming);

        } catch (error) {
            console.error("[useIslamicHolidays] Error loading holidays:", error);
            setHolidayError("Could not load holiday information.");
            setHolidays([]); // Fallback to empty
            setUpcomingEvents([]);
        } finally {
            setIsLoadingHolidays(false);
        }
    }, [currentHijriDateComponents]);

    useEffect(() => {
        loadHolidaysAndEvents();
    }, [loadHolidaysAndEvents]);

    // Function to manually clear cache and refresh
    const refreshHolidays = useCallback(() => {
        const year = currentHijriDateComponents?.year;
        if (year) {
          const cacheKey = `${HOLIDAY_STORAGE_KEY}_${year}`;
          console.log(`[useIslamicHolidays] Clearing cache (${cacheKey}) and refreshing holidays.`);
          localStorage.removeItem(cacheKey);
        }
        loadHolidaysAndEvents();
    }, [loadHolidaysAndEvents, currentHijriDateComponents]);

    return { holidays, upcomingEvents, isLoadingHolidays, holidayError, refreshHolidays };
}; 