// Custom hook for fetching and managing Islamic date
import { useState, useEffect, useCallback, useMemo } from "react";
import moment from "moment";
// import "moment-hijri"; // Remove moment-hijri import
import { useUserSettings } from "./useUserSettings";
import { useIslamicHolidays } from "./useIslamicHolidays"; // Import the new hook
import { gregorianToHijri } from "@tabby_ai/hijri-converter";

// Array of Hijri month names (adjust based on desired language/transliteration)
const hijriMonthNames = [
  "Muharram", "Safar", "Rabi' al-awwal", "Rabi' al-thani",
  "Jumada al-ula", "Jumada al-ukhra", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
];

/**
 * Hook to get Islamic date and holiday information
 * @param {Object} location - User location data
 * @returns {Object} Islamic date data, loading state, and error
 */
export const useIslamicDate = (location) => {
  const [currentHijriComponents, setCurrentHijriComponents] = useState(null);
  const [islamicDate, setIslamicDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { settings } = useUserSettings();

  // Use the new hook for holidays
  const { holidays, upcomingEvents, isLoadingHolidays, holidayError, refreshHolidays } = useIslamicHolidays(currentHijriComponents);

  // Recalculate Hijri components when the date changes (e.g., midnight)
  const calculateCurrentHijri = useCallback(() => {
    try {
      const today = new Date();
      const hijriToday = gregorianToHijri({
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate(),
      });
      setCurrentHijriComponents(hijriToday); // Store { day, month, year }
      setError(null); // Clear previous errors on successful calculation
    } catch (err) {
      console.error("Error calculating Hijri components:", err);
      setError("Could not calculate Hijri date components.");
      setCurrentHijriComponents(null);
    }
  }, []);

  // Format the final date object whenever components or holidays change
  const formatAndSetDate = useCallback(() => {
    if (!currentHijriComponents) {
        // Use fallback if calculation failed
        const fallback = getFallbackIslamicDate();
        setIslamicDate(formatIslamicDate(fallback)); 
        setIsLoading(false); // Stop loading even on fallback
        return;
    }

    // Format the main date parts
    const monthName = hijriMonthNames[currentHijriComponents.month - 1] || "";
    const hijriDateFormatted = `${currentHijriComponents.day} ${monthName} ${currentHijriComponents.year} AH`;
    const todayMoment = moment(); // Use current moment for formatting Gregorian
    const gregorianDateFormatted = todayMoment.format('MMMM D, YYYY');

    // Basic structure with core date info
    const formattedData = {
        day: currentHijriComponents.day,
        weekday: { en: todayMoment.format('dddd'), ar: '' }, // Add AR later if needed
        month: { en: monthName, ar: '' },
        year: currentHijriComponents.year,
        hijriDateFormatted,
        gregorianDateFormatted,
        gregorianDate: todayMoment.format('YYYY-MM-DD'),
        holidays: holidays || [], // Use data from useIslamicHolidays
        upcomingEvents: upcomingEvents || [], // Use data from useIslamicHolidays
    };

    setIslamicDate(formattedData);
    // Set loading state based on BOTH date calculation and holiday loading
    setIsLoading(isLoadingHolidays); 
    // Combine errors if necessary, prioritize holiday error?
    setError(holidayError); 

  }, [currentHijriComponents, holidays, upcomingEvents, isLoadingHolidays, holidayError]);

  // Initial calculation and setup interval for date component refresh
  useEffect(() => {
    calculateCurrentHijri(); // Calculate initial date
    const interval = setInterval(calculateCurrentHijri, 60 * 60 * 1000); // Refresh hourly
    return () => clearInterval(interval);
  }, [calculateCurrentHijri]);

  // Effect to format the date whenever components or holiday data change
  useEffect(() => {
    formatAndSetDate();
  }, [formatAndSetDate]);

  // Manual refresh function - refreshes both date components and holidays
  const refreshIslamicDate = useCallback(() => {
    console.log("Manual refresh of Islamic date & holidays requested");
    calculateCurrentHijri(); // Recalculate date components
    refreshHolidays(); // Trigger holiday refresh (clears its cache)
  }, [calculateCurrentHijri, refreshHolidays]);

  // Fallback function (simplified, only returns components)
  const getFallbackIslamicDate = () => {
    try {
        const today = new Date();
        return gregorianToHijri({
            year: today.getFullYear(),
            month: today.getMonth() + 1,
            day: today.getDate(),
        });
    } catch (err) {
        console.error("Error in fallback Hijri calculation:", err);
        return null;
    }
  };

  /**
   * Format Islamic date with additional information
   * @param {Object} hijriDate - The hijri date object with raw components
   * @returns {Object | null} Formatted Islamic date or null on error
   */
  const formatIslamicDate = (hijriDate) => {
    if (!hijriDate || !hijriDate.year) return null; // Check if valid data passed

    // Get month name from the array using 1-indexed month number
    const monthName = hijriMonthNames[hijriDate.month - 1] || "";

    // Format dates for display
    const hijriDateFormatted = `${hijriDate.day} ${monthName} ${hijriDate.year} AH`;

    // Get today's date for formatting Gregorian date
    const today = new Date();
    const gregorianDateFormatted = moment(today).format('MMMM D, YYYY');
    const gregorianFormattedDate = moment(today).format('YYYY-MM-DD');

    // Process holidays to include formatted dates
    const holidays = (hijriDate.holidays || []).map(holiday => {
       // Simple Hijri format for holidays
       const formattedDate = `${holiday.day} ${hijriMonthNames[holiday.month - 1] || ''} ${hijriDate.year}`;

       return {
        ...holiday,
        date: formattedDate
      };
    });

    // Create the formatted object
    return {
      day: hijriDate.day,
      weekday: {
        en: moment(today).format('dddd'),
        ar: '' // We can enhance this if needed
      },
      month: {
        en: monthName, // Use looked-up month name
        ar: '' // We can enhance this if needed
      },
      year: hijriDate.year,
      hijriDateFormatted,
      gregorianDateFormatted,
      gregorianDate: gregorianFormattedDate,
      holidays,
      upcomingEvents: hijriDate.upcomingEvents || []
    };
  };

  // The hook returns these values
  return { islamicDate, isLoading, error, refreshIslamicDate };
};

// Remove default export
 