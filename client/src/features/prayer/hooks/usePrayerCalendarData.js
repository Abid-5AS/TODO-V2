import { useState, useCallback, useEffect, useMemo } from 'react';
import { getMonthlyCalendarDataAPI } from '../services/prayerLogService';
import { PRAYER_NAMES } from '../constants'; // Corrected path

/**
 * Custom hook to manage monthly prayer calendar data.
 * @param {object} currentMonthYear - Object with { year: number, month: number }.
 * @returns {object} Calendar data, loading/error states, filter state, and related functions.
 */
export const usePrayerCalendarData = (currentMonthYear) => {
  const [calendarData, setCalendarData] = useState({}); // { 'YYYY-MM-DD': count }
  const [detailedCalendarData, setDetailedCalendarData] = useState({}); // { 'YYYY-MM-DD': { 'Fajr': 1, ... } }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prayerTypeFilters, setPrayerTypeFilters] = useState(() => 
    PRAYER_NAMES.reduce((acc, name) => ({ ...acc, [name]: true }), {})
  );

  // Fetch monthly calendar data when month/year changes
  const fetchMonthlyData = useCallback(async (year, month) => {
    if (typeof year !== 'number' || typeof month !== 'number' || month < 1 || month > 12) {
      console.error('fetchMonthlyData Error: Invalid year/month arguments.', { year, month });
      setError('Invalid date arguments for calendar.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getMonthlyCalendarDataAPI(year, month);
      if (response.success) {
        setCalendarData(response.data || {});
        setDetailedCalendarData(response.detailedData || {});
      } else {
        throw new Error(response.message || 'Failed to fetch calendar data');
      }
    } catch (err) {
      console.error('fetchMonthlyData Error:', err);
      setError(err.message);
      // Optionally reset data on error
      // setCalendarData({});
      // setDetailedCalendarData({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentMonthYear) {
      fetchMonthlyData(currentMonthYear.year, currentMonthYear.month);
    }
  }, [currentMonthYear, fetchMonthlyData]);

  // Filter calendar data based on prayer type filters
  const filteredCalendarData = useMemo(() => {
    const allFiltersActive = Object.values(prayerTypeFilters).every(Boolean);
    if (allFiltersActive || !detailedCalendarData || Object.keys(detailedCalendarData).length === 0) {
      return calendarData;
    }

    const result = {};
    Object.keys(detailedCalendarData).forEach(date => {
      const prayerStatuses = detailedCalendarData[date] || {}; // Get status object for the date
      let completedCount = 0;
      
      // Count completed prayers that match active filters
      Object.keys(prayerStatuses).forEach(prayer => {
         // Ensure prayer exists in PRAYER_NAMES and filter is active
         if (PRAYER_NAMES.includes(prayer) && prayerTypeFilters[prayer]) {
           // Check if the status for this prayer is a string and 'completed' (case-insensitive)
           if (typeof prayerStatuses[prayer] === 'string' && prayerStatuses[prayer].toLowerCase() === 'completed') {
              completedCount++;
           }
         }
      });
      
      // Always add the date to the result, even if the filtered count is 0.
      result[date] = completedCount;
    });
    
    return result;
  }, [calendarData, detailedCalendarData, prayerTypeFilters]);

  // Toggle prayer type filter for calendar
  const togglePrayerTypeFilter = useCallback((prayerName) => {
    if (PRAYER_NAMES.includes(prayerName)) { // Ensure valid prayer name
        setPrayerTypeFilters(prev => ({
        ...prev,
        [prayerName]: !prev[prayerName]
        }));
    }
  }, []);

  return {
    calendarData: filteredCalendarData, // Return the filtered data
    rawCalendarData: calendarData, // Also expose raw data if needed elsewhere
    detailedCalendarData,
    setCalendarData, // Expose setters for optimistic updates from provider
    setDetailedCalendarData,
    loadingCalendar: loading,
    errorCalendar: error,
    prayerTypeFilters,
    togglePrayerTypeFilter,
    fetchMonthlyData, // Expose fetch function for manual refresh
  };
};

export default usePrayerCalendarData; 