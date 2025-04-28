import { useState, useEffect, useCallback } from 'react';
import moment from 'moment'; // Keep moment for date diff calculations

// Constants (could be moved to islamic/constants)
const HOLIDAY_STORAGE_KEY = "islamic_holiday_data";
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

// Helper to convert Hijri date components to an approximate Gregorian moment object
// NOTE: This is a simplification for calculating date differences. For precise display
// or conversion, a dedicated library is better.
const approximateHijriToGregorianMoment = (day, month, year, currentGregorianYear) => {
    // Very rough approximation: map Hijri month to Gregorian month offset
    // This doesn't account for the ~11 day difference per year accurately.
    // A better approach might involve a library or more complex calculation.
    const approxGregorianMonth = (month - 1 + (currentGregorianYear - year) * 11 / 30) % 12;
    return moment().year(currentGregorianYear).month(approxGregorianMonth).date(day);
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
            // 1. Check localStorage for cached data
            const storedData = localStorage.getItem(HOLIDAY_STORAGE_KEY);
            let holidayData = null;
            let calculatedHolidays = [];
            let calculatedUpcoming = [];

            if (storedData) {
                try {
                    const parsedData = JSON.parse(storedData);
                    const currentTime = new Date().getTime();
                    const isDataValid = (currentTime - parsedData.timestamp) < ONE_MONTH_IN_MS;
                    
                    // Check if data is valid and belongs to the current Hijri year
                    if (isDataValid && parsedData.data && Array.isArray(parsedData.data.holidays) && parsedData.hijriYear === currentHijriDateComponents.year) {
                        console.log("[useIslamicHolidays] Using cached holiday data for year", currentHijriDateComponents.year);
                        holidayData = parsedData.data;
                        calculatedHolidays = holidayData.holidays || [];
                        calculatedUpcoming = holidayData.upcomingEvents || [];
                    } else {
                        console.log("[useIslamicHolidays] Cached holiday data invalid or for wrong year, generating new data");
                        localStorage.removeItem(HOLIDAY_STORAGE_KEY);
                    }
                } catch (parseError) {
                    console.error("[useIslamicHolidays] Error parsing stored holiday data:", parseError);
                    localStorage.removeItem(HOLIDAY_STORAGE_KEY);
                }
            }

            // 2. Generate if not cached or invalid
            if (!holidayData) {
                console.log("[useIslamicHolidays] Generating new Islamic holiday data for year", currentHijriDateComponents.year);
                const currentMoment = moment(); // Use current Gregorian date for diff calculation
                const currentHijriYear = currentHijriDateComponents.year;
                const currentHijriMonth = currentHijriDateComponents.month;
                const currentHijriDay = currentHijriDateComponents.day;
                
                calculatedHolidays = [...baseHolidays]; // Use the base list
                calculatedUpcoming = [];

                baseHolidays.forEach(holiday => {
                    // Approximate Gregorian date for the holiday in the current Hijri year
                    const approxHolidayMoment = approximateHijriToGregorianMoment(holiday.day, holiday.month, currentHijriYear, currentMoment.year());
                    
                    // Calculate days remaining (can be negative if past)
                    const daysRemaining = approxHolidayMoment.diff(currentMoment, 'days');

                    // Add to upcoming events if within threshold and not past
                    if (daysRemaining >= 0 && daysRemaining <= UPCOMING_EVENT_THRESHOLD_DAYS) {
                        calculatedUpcoming.push({
                            ...holiday,
                            daysRemaining: daysRemaining,
                            date: `${holiday.day}/${holiday.month}/${currentHijriYear}` // Simple Hijri date string
                        });
                    }
                });

                // Sort upcoming events by days remaining
                calculatedUpcoming.sort((a, b) => a.daysRemaining - b.daysRemaining);

                // Cache the newly generated data with timestamp and year
                const dataToStore = { 
                    holidays: calculatedHolidays, 
                    upcomingEvents: calculatedUpcoming 
                };
                localStorage.setItem(HOLIDAY_STORAGE_KEY, JSON.stringify({ 
                    timestamp: new Date().getTime(), 
                    hijriYear: currentHijriYear, 
                    data: dataToStore 
                }));
                holidayData = dataToStore;
            }

            setHolidays(calculatedHolidays);
            setUpcomingEvents(calculatedUpcoming);

        } catch (error) {
            console.error("[useIslamicHolidays] Error loading holidays:", error);
            setHolidayError("Could not load holiday information.");
            setHolidays([...baseHolidays]); // Fallback to base holidays
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
        console.log("[useIslamicHolidays] Clearing cache and refreshing holidays.");
        localStorage.removeItem(HOLIDAY_STORAGE_KEY);
        loadHolidaysAndEvents();
    }, [loadHolidaysAndEvents]);

    return { holidays, upcomingEvents, isLoadingHolidays, holidayError, refreshHolidays };
}; 