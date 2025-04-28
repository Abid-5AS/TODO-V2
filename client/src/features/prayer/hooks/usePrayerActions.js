import { useCallback, useState } from 'react';
import { isToday, startOfDay } from 'date-fns';
import { logOrUpdatePrayerAPI } from '../services/prayerLogService';
import { useToast } from '../../../hooks/use-toast';
import { hasPrayerTimePassed } from '../helpers/prayerHelpers';

/**
 * Custom hook providing functions to log and modify prayer statuses.
 *
 * @param {object} params - Parameters including state and setters from other hooks.
 * @param {Date} params.currentDate - The currently selected date.
 * @param {object} params.dailyStatus - The current daily status object.
 * @param {Function} params.setDailyStatus - Setter for daily status.
 * @param {Function} params.setCalendarData - Setter for simple calendar data.
 * @param {Function} params.setDetailedCalendarData - Setter for detailed calendar data.
 * @param {Function} params.setStats - Setter for stats data.
 * @param {Function} params.setLastUpdated - Function to update the refresh trigger.
 * @param {object} params.prayerTimes - Prayer times object for validation.
 * @param {Function} params.fetchDailyLogs - Function to re-fetch daily logs.
 * @param {Function} params.fetchMonthlyData - Function to re-fetch monthly data.
 * @param {Function} params.fetchStats - Function to re-fetch stats.
 * @param {boolean} params.isCurrentDateToday - Flag if the current date is today.
 * @param {boolean} params.isFutureDate - Flag if the current date is in the future.
 * @returns {object} Action functions (logPrayer, togglePrayerStatus, togglePrayerCompleted) and loading/error states for actions.
 */
export const usePrayerActions = ({
  currentDate,
  dailyStatus,
  setDailyStatus,
  setLastUpdated,
  prayerTimes,
  fetchDailyLogs,
  fetchMonthlyData,
  fetchStats,
  isCurrentDateToday,
  isFutureDate,
}) => {
  const { toast } = useToast();
  const [loadingAction, setLoadingAction] = useState(false);
  const [errorAction, setErrorAction] = useState(null);

  // Move helper function to a separate file
  // const hasPrayerTimePassed = (...) => { ... };

  // --- Action Functions ---
  const logPrayer = useCallback(
    async (prayerName, status) => {
      if (!currentDate) return false;
      console.log(`[usePrayerActions] Logging ${prayerName} as ${status ?? 'null'} for ${currentDate.toISOString()}`);

      if (isFutureDate) {
        toast({ title: `Cannot mark prayers for future dates`, variant: 'destructive' });
        return false;
      }
      if (isCurrentDateToday && status?.toLowerCase() === 'completed' && !hasPrayerTimePassed(prayerName, prayerTimes)) {
        toast({ title: `Cannot mark ${prayerName} as completed`, description: "Prayer time hasn't arrived", variant: 'destructive' });
        return false;
      }

      setLoadingAction(true);
      setErrorAction(null);
      const previousStatus = { ...(dailyStatus || {}) };

      // *** Optimistic Update for Daily Status ONLY ***
      setDailyStatus(prev => ({ ...prev, [prayerName]: status }));
      
      // *** Removed Optimistic Updates for Calendar/Stats ***

      try {
        const response = await logOrUpdatePrayerAPI(currentDate, prayerName, status);
        if (!response.success) throw new Error(response.message || 'API error logging prayer');
        
        toast({ title: `${prayerName} marked as ${status ?? 'Not Logged'}` });
        
        // *** Refetch data AFTER successful API call ***
        console.log('[usePrayerActions] Refetching data after success...');
        const { year, month } = { year: currentDate.getFullYear(), month: currentDate.getMonth() + 1 };
        fetchDailyLogs(currentDate); // Ensure daily status is synced
        fetchMonthlyData(year, month); // Refresh calendar for the relevant month
        fetchStats(); // Refresh stats
        setLastUpdated(Date.now()); // Trigger any other listeners *after* fetches initiated

        return true;
      } catch (err) {
        console.error('logPrayer Error:', err);
        setErrorAction(err.message);
        toast({ title: `Error updating ${prayerName}`, description: err.message, variant: 'destructive' });
        
        // *** Revert Optimistic Daily Update ***
        setDailyStatus(previousStatus);
        
        // *** Refetch data AFTER error/revert ***
        console.log('[usePrayerActions] Refetching data after error...');
        const { year, month } = { year: currentDate.getFullYear(), month: currentDate.getMonth() + 1 };
        fetchDailyLogs(currentDate);
        fetchMonthlyData(year, month); 
        fetchStats(); 
        setLastUpdated(Date.now()); // Trigger any other listeners *after* fetches initiated
        
        return false;
      } finally {
        setLoadingAction(false);
      }
    },
    // Update dependencies 
    [currentDate, dailyStatus, prayerTimes, isCurrentDateToday, isFutureDate, toast, 
     setDailyStatus, setLastUpdated, 
     fetchDailyLogs, fetchMonthlyData, fetchStats] 
  );

  const togglePrayerCompleted = useCallback(
    async (prayerName) => {
      const currentPrayerStatus = dailyStatus?.[prayerName];
      const newStatus = currentPrayerStatus === 'Completed' ? 'Missed' : 'Completed';
      return await logPrayer(prayerName, newStatus);
    },
    [dailyStatus, logPrayer]
  );

  const togglePrayerStatus = useCallback(
    async (prayerName, status = null) => {
      if (!currentDate || isFutureDate) return;

      const currentStatus = dailyStatus?.[prayerName] || null;
      let newStatus = status;
      
      // Cycle logic: null -> completed -> missed -> null
      if (newStatus === null) { 
        if (currentStatus === null) newStatus = 'completed';
        else if (currentStatus?.toLowerCase() === 'completed') newStatus = 'missed';
        else newStatus = null; 
      }

      if (newStatus?.toLowerCase() === currentStatus?.toLowerCase()) {
          if (newStatus !== null || currentStatus !== null) { 
             // Allow redundant calls for now, backend handles upsert.
          }
      }

      // Call the main logPrayer function
      return await logPrayer(prayerName, newStatus);
    },
    [currentDate, isFutureDate, dailyStatus, logPrayer]
  );

  return {
    logPrayer,
    togglePrayerCompleted,
    togglePrayerStatus,
    loadingAction,
    errorAction,
  };
};

export default usePrayerActions; 