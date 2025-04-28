import { useCallback, useState } from 'react';
import { isToday, startOfDay } from 'date-fns';
import { logOrUpdatePrayerAPI } from '../services/prayerLogService';
import { useToast } from '../../../hooks/use-toast';

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
  setCalendarData,
  setDetailedCalendarData,
  setStats,
  setLastUpdated,
  prayerTimes,
  fetchDailyLogs, // Needed for reverting optimistic updates
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
    async (prayerName, status = 'Completed') => {
      if (!currentDate) return false;
      console.log(`[usePrayerActions] Logging ${prayerName} as ${status} for ${currentDate.toISOString()}`);

      if (isFutureDate) {
        toast({ title: `Cannot mark prayers for future dates`, variant: 'destructive' });
        return false;
      }
      if (isCurrentDateToday && status === 'Completed' && !hasPrayerTimePassed(prayerName, prayerTimes)) {
        toast({ title: `Cannot mark ${prayerName} as completed`, description: "Prayer time hasn't arrived", variant: 'destructive' });
        return false;
      }

      setLoadingAction(true);
      setErrorAction(null);
      const previousStatus = { ...(dailyStatus || {}) }; // Ensure dailyStatus is an object
      const previousSpecificStatus = previousStatus[prayerName] || null;

      // *** Start Optimistic Updates ***
      setDailyStatus(prev => ({ ...prev, [prayerName]: status }));

      if (isCurrentDateToday) {
        const todayStr = startOfDay(currentDate).toISOString().split('T')[0];
        
        // Calendar Data
        setCalendarData(prev => {
          const currentCount = prev[todayStr] || 0;
          let newCount = currentCount;
          if (status === 'Completed' && previousSpecificStatus !== 'Completed') {
            newCount = currentCount + 1;
          } else if (status !== 'Completed' && previousSpecificStatus === 'Completed') {
            newCount = Math.max(0, currentCount - 1);
          }
          return newCount !== currentCount ? { ...prev, [todayStr]: newCount } : prev;
        });

        // Detailed Calendar Data
        setDetailedCalendarData(prev => {
          const updatedData = { ...prev };
          if (!updatedData[todayStr]) updatedData[todayStr] = {};
          if (status === 'Completed' || status === 'Missed' || status === 'Excused') { // Store actual status
             updatedData[todayStr][prayerName] = status;
          } else {
             delete updatedData[todayStr][prayerName]; // Remove if status is null
          }
          return updatedData;
        });

        // Stats Data
        setStats(prev => {
            let totalPrayersChange = 0;
            if (status === 'Completed' && previousSpecificStatus !== 'Completed') {
                totalPrayersChange = 1;
            } else if (status !== 'Completed' && previousSpecificStatus === 'Completed') {
                totalPrayersChange = -1;
            }
            if(totalPrayersChange === 0) return prev; // No change needed
            
            const updatedPrayerStats = { ...prev.prayerCompletionStats };
            updatedPrayerStats[prayerName] = Math.max(0, (prev.prayerCompletionStats[prayerName] || 0) + totalPrayersChange);

            return {
                ...prev,
                totalPrayersLogged: Math.max(0, prev.totalPrayersLogged + totalPrayersChange),
                prayerCompletionStats: updatedPrayerStats
            };
        });
      }
      // *** End Optimistic Updates ***

      // Trigger refresh for stats via usePrayerStats hook
      const timestamp = Date.now();
      setLastUpdated(timestamp);

      try {
        const response = await logOrUpdatePrayerAPI(currentDate, prayerName, status);
        if (!response.success) throw new Error(response.message || 'API error logging prayer');
        toast({ title: `${prayerName} marked as ${status}` });
        fetchDailyLogs(currentDate); // Re-fetch daily logs to confirm server state
        return true;
      } catch (err) {
        console.error('logPrayer Error:', err);
        setErrorAction(err.message);
        toast({ title: `Error updating ${prayerName}`, description: err.message, variant: 'destructive' });
        
        // *** Start Revert Optimistic Updates ***
        setDailyStatus(previousStatus);
        // Re-fetch calendar/stats instead of trying to calculate reverse delta
        const { year, month } = { year: currentDate.getFullYear(), month: currentDate.getMonth() + 1 };
        fetchMonthlyData(year, month);
        fetchStats(); 
        // *** End Revert Optimistic Updates ***
        
        return false;
      } finally {
        setLoadingAction(false);
      }
    },
    // Dependencies needed for the function logic and optimistic updates
    [currentDate, dailyStatus, prayerTimes, isCurrentDateToday, isFutureDate, toast, 
     setDailyStatus, setCalendarData, setDetailedCalendarData, setStats, setLastUpdated, 
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
      if (newStatus === null) {
        if (currentStatus === null) newStatus = 'completed';
        else if (currentStatus === 'completed') newStatus = 'missed';
        else newStatus = null; // Cycle back to null from missed/excused
      }

      if (newStatus?.toLowerCase() === currentStatus?.toLowerCase()) return; // Allow null -> 'Completed' vs 'completed'

      // Call the main logPrayer function to handle API and optimistic updates
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