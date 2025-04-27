// Custom hook for fetching and managing Islamic date
import { useState, useEffect, useCallback } from "react";
import moment from "moment";
// import "moment-hijri"; // Remove moment-hijri import
import useUserSettings from "./useUserSettings";
import { gregorianToHijri } from "@tabby_ai/hijri-converter";

// Array of Hijri month names (adjust based on desired language/transliteration)
const hijriMonthNames = [
  "Muharram", "Safar", "Rabi' al-awwal", "Rabi' al-thani",
  "Jumada al-ula", "Jumada al-ukhra", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
];

/**
 * Hook to get Islamic date and holiday information
 * @returns {Object} Islamic date data, loading state, and error
 */
export const useIslamicDate = () => {
  const [islamicDate, setIslamicDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { settings } = useUserSettings();

  // Constants for local storage
  const HOLIDAY_STORAGE_KEY = "islamic_holiday_data";
  const ONE_MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

  useEffect(() => {
    let isMounted = true;
    let refreshInterval = null;

    const fetchData = async () => {
      if (!isMounted) return;

      setIsLoading(true);
      try {
        const today = new Date(); // Use standard Date object
        const todayMoment = moment(today); // Use moment for formatting if needed

        // Get Hijri date using the converter
        const hijriToday = gregorianToHijri({
          year: today.getFullYear(),
          month: today.getMonth() + 1, // JS month is 0-indexed
          day: today.getDate(),
        });

        // Basic Islamic date information using converter results
        const baseIslamicDate = {
          day: hijriToday.day,
          month: hijriToday.month, // Keep month number (1-indexed)
          year: hijriToday.year,
          weekday: todayMoment.format('dddd'), // Use moment for weekday name
          gregorian: {
            day: today.getDate(),
            month: today.getMonth() + 1,
            year: today.getFullYear(),
            formattedDate: todayMoment.format('YYYY-MM-DD'),
          },
        };

        // Get country code from user settings if available
        const countryCode = settings?.location?.countryCode || null;

        // Fetch or get from cache holidays and upcoming events
        // Pass the current Gregorian date and the calculated Hijri date
        const { holidays, upcomingEvents } = await fetchHolidaysAndEvents(countryCode, today, baseIslamicDate);

        if (isMounted) {
          // Format and set the Islamic date with holidays and upcoming events
          setIslamicDate(formatIslamicDate({
            ...baseIslamicDate,
            holidays,
            upcomingEvents
          }));
          setIsLoading(false);
          setError(null);
        }
      } catch (err) {
        console.error("Error in useIslamicDate:", err);

        if (isMounted) {
          // Fallback to basic date information if processing fails
          const fallbackDate = getFallbackIslamicDate(); // This now returns raw components
          setIslamicDate(formatIslamicDate(fallbackDate)); // Format the fallback data
          setError("Could not fetch complete Islamic date information");
          setIsLoading(false);
        }
      }
    };

    // Get basic Islamic date using the converter as fallback
    const getFallbackIslamicDate = () => {
       try {
        const today = new Date(); // Use standard Date object
        const todayMoment = moment(today);

        // Use the imported converter function
        const hijriToday = gregorianToHijri({
          year: today.getFullYear(),
          month: today.getMonth() + 1, // JS month is 0-indexed
          day: today.getDate(),
        });

        // Return raw components needed by formatIslamicDate
        return {
          day: hijriToday.day,
          month: hijriToday.month, // Keep month number (1-indexed)
          year: hijriToday.year,
          weekday: todayMoment.format('dddd'),
          gregorian: {
            day: today.getDate(),
            month: today.getMonth() + 1,
            year: today.getFullYear(),
            formattedDate: todayMoment.format('YYYY-MM-DD'),
          },
          holidays: [], // Provide empty array for fallback
          upcomingEvents: [], // Provide empty array for fallback
        };
      } catch (err) {
        console.error("Error in fallback Hijri calculation:", err);
        // Return null or a structure indicating error to formatIslamicDate
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

      // Format Gregorian date with month name
      const gregorianDateFormatted = moment(hijriDate.gregorian.formattedDate).format('MMMM D, YYYY');

      // Process holidays to include formatted dates
      const holidays = (hijriDate.holidays || []).map(holiday => {
         // Construct Gregorian date for the holiday this Hijri year for formatting
         // This is an approximation as Hijri-Gregorian conversion is complex
         // A more robust solution might involve converting holiday Hijri date back to Gregorian
         const holidayGregorianApprox = moment().year(hijriDate.gregorian.year).month(holiday.month - 1).date(holiday.day); // Approximation!
         const formattedDate = `${holiday.day} ${hijriMonthNames[holiday.month - 1] || ''} ${hijriDate.year}`; // Simple Hijri format

         return {
          ...holiday,
          date: formattedDate // Display simple Hijri date for holiday
        };
      });

      // Create the formatted object
      return {
        day: hijriDate.day,
        weekday: {
          en: hijriDate.weekday,
          ar: '' // We can enhance this if needed
        },
        month: {
          en: monthName, // Use looked-up month name
          ar: '' // We can enhance this if needed
        },
        year: hijriDate.year,
        hijriDateFormatted,
        gregorianDateFormatted,
        gregorianDate: hijriDate.gregorian?.formattedDate || moment().format('YYYY-MM-DD'),
        holidays,
        upcomingEvents: hijriDate.upcomingEvents || []
      };
    };

    /**
     * Fetch Islamic holidays and upcoming events from cache or generate them
     * @param {string | null} countryCode - Optional country code for regional holidays
     * @param {Date} currentGregorianDate - The current Gregorian date object
     * @param {Object} currentHijriDateComponents - Current Hijri date {day, month, year}
     * @returns {Promise<Object>} Holidays and upcoming events
     */
    const fetchHolidaysAndEvents = async (countryCode, currentGregorianDate, currentHijriDateComponents) => {
      try {
        // Check localStorage for cached data
        const storedData = localStorage.getItem(HOLIDAY_STORAGE_KEY);
        let holidayData = null;

        if (storedData) {
          const parsedData = JSON.parse(storedData);
          const currentTime = new Date().getTime();
          const isDataValid = (currentTime - parsedData.timestamp) < ONE_MONTH_IN_MS;
          if (isDataValid) {
            console.log("Using cached holiday data from localStorage");
            holidayData = parsedData.data;
          } else {
            console.log("Cached holiday data is older than one month, fetching fresh data");
          }
        }

        if (!holidayData) {
           // Base Islamic holidays (day/month)
          const baseHolidays = [ /* ... holiday definitions ... as before */ ];

          // Calculate days left using moment's diff after constructing approximate Gregorian dates
          const currentMoment = moment(currentGregorianDate);
          const currentHijriYear = currentHijriDateComponents.year;

          const holidays = baseHolidays.map(holiday => {
            // Approximate Gregorian date for the holiday in the current or next Hijri year
            // This needs careful handling of year transitions
            let holidayGregorianApprox;
            let hijriYearForHoliday = currentHijriYear;

            // Convert current Hijri date to comparable number (e.g., YYYYMMDD)
            const currentHijriComparable = currentHijriDateComponents.year * 10000 +
                                           currentHijriDateComponents.month * 100 +
                                           currentHijriDateComponents.day;
            const holidayComparableThisYear = currentHijriYear * 10000 +
                                              holiday.month * 100 +
                                              holiday.day;

            if (holidayComparableThisYear < currentHijriComparable) {
                 // Holiday already passed this Hijri year, calculate for next year
                 hijriYearForHoliday = currentHijriYear + 1;
            }

            // We need a function to convert Hijri back to Gregorian for accurate diff
            // Since @tabby_ai/hijri-converter only does G->H, we'll use an approximation or library
            // For now, approximate diff (less accurate):
            let daysLeftApprox = (holiday.month - currentHijriDateComponents.month) * 30 + (holiday.day - currentHijriDateComponents.day);
            if(daysLeftApprox < 0) daysLeftApprox += 354; // Rough approximation

            // TODO: Implement accurate Hijri to Gregorian conversion for precise diff

            return { ...holiday, daysLeft: daysLeftApprox }; // Using approximation for now
          });

          holidayData = {
            holidays: holidays.sort((a, b) => a.daysLeft - b.daysLeft),
            upcomingEvents: []
          };

          localStorage.setItem(HOLIDAY_STORAGE_KEY, JSON.stringify({ timestamp: new Date().getTime(), data: holidayData }));
          console.log("Saved new holiday data to localStorage");
        }

        // Calculate upcoming events (check next 3 Gregorian days)
        const upcomingEvents = [];
        for (let i = 1; i <= 3; i++) {
          const checkGregorianDate = moment(currentGregorianDate).add(i, 'days').toDate();
          const hijriCheckDate = gregorianToHijri({
              year: checkGregorianDate.getFullYear(),
              month: checkGregorianDate.getMonth() + 1,
              day: checkGregorianDate.getDate(),
          });

          for (const holiday of holidayData.holidays) {
            if (holiday.day === hijriCheckDate.day && holiday.month === hijriCheckDate.month) {
              upcomingEvents.push({
                ...holiday,
                daysLeft: i,
                date: `${hijriCheckDate.day} ${hijriMonthNames[hijriCheckDate.month - 1] || ''} ${hijriCheckDate.year}`
              });
            }
          }
        }

        return {
          holidays: holidayData.holidays,
          upcomingEvents
        };
      } catch (error) {
        console.error("Error in fetchHolidaysAndEvents:", error);
        return { holidays: [], upcomingEvents: [] };
      }
    };

    fetchData();
    refreshInterval = setInterval(fetchData, 60 * 60 * 1000);

    return () => {
      isMounted = false;
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [settings?.location?.countryCode]); // Dependency remains settings

  return { islamicDate, isLoading, error };
};

// Keep default export for backward compatibility
export default useIslamicDate;
