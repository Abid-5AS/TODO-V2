import { useState, useCallback, useEffect } from 'react';
import { getDailyLogsAPI } from '../services/prayerLogService';
import { PRAYER_NAMES, initialDailyStatus } from './prayerLogConstants'; // Assuming constants are moved

/**
 * Custom hook to manage the daily prayer log status for a given date.
 * @param {Date} currentDate - The date for which to manage the status.
 * @returns {object} Daily status, loading state, error state, and fetch function.
 */
export const useDailyPrayerStatus = (currentDate) => {
  const [dailyStatus, setDailyStatus] = useState(initialDailyStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDailyLogs = useCallback(async (dateToFetch) => {
    if (!dateToFetch) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getDailyLogsAPI(dateToFetch);
      if (response.success) {
        // Ensure all prayer names are present in the returned data
        const completeStatus = PRAYER_NAMES.reduce((acc, name) => {
           acc[name] = response.data?.[name] || null;
           return acc;
        }, {});
        setDailyStatus(completeStatus);
      } else {
        throw new Error(response.message || 'Failed to fetch daily logs');
      }
    } catch (err) {
      console.error('fetchDailyLogs Error:', err);
      setError(err.message);
      setDailyStatus(initialDailyStatus); // Reset on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch daily logs when the currentDate changes
  useEffect(() => {
    fetchDailyLogs(currentDate);
  }, [currentDate, fetchDailyLogs]);

  return {
    dailyStatus,
    setDailyStatus, // Expose setter for optimistic updates
    loadingDailyStatus: loading,
    errorDailyStatus: error,
    fetchDailyLogs, // Expose fetch function if manual refresh needed
  };
};

export default useDailyPrayerStatus; 