import { useState, useEffect, useCallback, useMemo } from 'react';
import moment from 'moment';
import {
  logOrUpdatePrayerAPI,
  getDailyLogsAPI,
  getMonthlyCalendarDataAPI,
  getPrayerStatsAPI,
} from '../services/prayerLogService';
import { useToast } from '../../../hooks/use-toast'; // Assuming toast hook exists

const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// Initial empty states
const initialDailyStatus = PRAYER_NAMES.reduce((acc, name) => {
  acc[name] = null; // null = not logged, 'Completed', 'Missed', 'Excused'
  return acc;
}, {});

const initialStats = {
  currentStreak: 0,
  longestStreak: 0,
  totalPrayersLogged: 0,
};

export const usePrayerLog = (initialDate = new Date()) => {
  const [currentDate, setCurrentDate] = useState(moment(initialDate).startOf('day').toDate());
  const [dailyStatus, setDailyStatus] = useState(initialDailyStatus);
  const [calendarData, setCalendarData] = useState({}); // { 'YYYY-MM-DD': count }
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState({
    daily: false,
    calendar: false,
    stats: false,
    action: false, // For individual prayer logging actions
  });
  const [error, setError] = useState({
    daily: null,
    calendar: null,
    stats: null,
    action: null,
  });
  const { toast } = useToast();

  const currentMonthYear = useMemo(() => {
    const m = moment(currentDate);
    return { year: m.year(), month: m.month() + 1 }; // 1-based month
  }, [currentDate]);

  // --- Fetching Functions ---

  const fetchDailyLogs = useCallback(async (dateToFetch) => {
    setLoading((prev) => ({ ...prev, daily: true }));
    setError((prev) => ({ ...prev, daily: null }));
    try {
      const response = await getDailyLogsAPI(dateToFetch);
      if (response.success) {
        setDailyStatus(response.data || initialDailyStatus);
      } else {
        throw new Error(response.message || 'Failed to fetch daily logs');
      }
    } catch (err) {
      console.error('fetchDailyLogs Error:', err);
      setError((prev) => ({ ...prev, daily: err.message }));
      setDailyStatus(initialDailyStatus); // Reset on error
    } finally {
      setLoading((prev) => ({ ...prev, daily: false }));
    }
  }, []);

  const fetchMonthlyData = useCallback(async (year, month) => {
    setLoading((prev) => ({ ...prev, calendar: true }));
    setError((prev) => ({ ...prev, calendar: null }));
    try {
      const response = await getMonthlyCalendarDataAPI(year, month);
      if (response.success) {
        setCalendarData(response.data || {});
      } else {
        throw new Error(response.message || 'Failed to fetch calendar data');
      }
    } catch (err) {
      console.error('fetchMonthlyData Error:', err);
      setError((prev) => ({ ...prev, calendar: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, calendar: false }));
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setLoading((prev) => ({ ...prev, stats: true }));
    setError((prev) => ({ ...prev, stats: null }));
    try {
      const response = await getPrayerStatsAPI();
      if (response.success) {
        setStats(response.data || initialStats);
      } else {
        throw new Error(response.message || 'Failed to fetch stats');
      }
    } catch (err) {
      console.error('fetchStats Error:', err);
      setError((prev) => ({ ...prev, stats: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, stats: false }));
    }
  }, []);

  // --- Initial Data Load and Reloads ---

  // Fetch daily logs when currentDate changes
  useEffect(() => {
    fetchDailyLogs(currentDate);
  }, [currentDate, fetchDailyLogs]);

  // Fetch monthly data when month/year changes
  useEffect(() => {
    fetchMonthlyData(currentMonthYear.year, currentMonthYear.month);
    // Fetch stats whenever the month changes (or maybe less frequently?)
    fetchStats();
  }, [currentMonthYear.year, currentMonthYear.month, fetchMonthlyData, fetchStats]);

  // --- Action Functions ---

  const logPrayer = useCallback(
    async (prayerName, status = 'Completed') => {
      setLoading((prev) => ({ ...prev, action: true }));
      setError((prev) => ({ ...prev, action: null }));

      // Optimistic UI Update
      const previousStatus = { ...dailyStatus };
      setDailyStatus((prev) => ({ ...prev, [prayerName]: status }));

      try {
        const response = await logOrUpdatePrayerAPI(currentDate, prayerName, status);
        if (!response.success) {
          throw new Error(response.message || 'API error logging prayer');
        }
        // On success, refetch related data to ensure consistency
        toast({ title: `${prayerName} marked as ${status}` });
        await fetchDailyLogs(currentDate); // Refresh daily view
        await fetchMonthlyData(currentMonthYear.year, currentMonthYear.month); // Refresh calendar heatmap
        await fetchStats(); // Refresh stats (streak might change)
      } catch (err) {
        console.error('logPrayer Error:', err);
        setError((prev) => ({ ...prev, action: err.message }));
        toast({ title: `Error updating ${prayerName}`, description: err.message, variant: 'destructive' });
        // Revert optimistic update on failure
        setDailyStatus(previousStatus);
      } finally {
        setLoading((prev) => ({ ...prev, action: false }));
      }
    },
    [currentDate, dailyStatus, fetchDailyLogs, fetchMonthlyData, fetchStats, currentMonthYear, toast]
  );

  const togglePrayerCompleted = useCallback(
    async (prayerName) => {
        const currentPrayerStatus = dailyStatus[prayerName];
        // If currently 'Completed', mark as null (effectively un-logging it - needs API support or just UI)
        // If null or other status, mark as 'Completed'
        const newStatus = currentPrayerStatus === 'Completed' ? 'Missed' : 'Completed'; // Simple toggle for now

        // For a true "un-log", the API might need a DELETE or a specific status like 'NotLogged'
        // Sticking with toggling Completed/Missed for this example.
        await logPrayer(prayerName, newStatus);
    },
    [dailyStatus, logPrayer]
  );


  // --- Date Navigation ---

  const changeDate = useCallback((newDate) => {
    setCurrentDate(moment(newDate).startOf('day').toDate());
    // Daily logs will refetch automatically via useEffect
  }, []);

  const changeMonth = useCallback((increment) => {
      setCurrentDate(prevDate => moment(prevDate).add(increment, 'months').toDate());
      // Monthly data will refetch automatically via useEffect
  }, []);


  return {
    currentDate,
    dailyStatus,
    calendarData,
    stats,
    loading,
    error,
    logPrayer,
    togglePrayerCompleted,
    changeDate,
    changeMonth,
    PRAYER_NAMES,
  };
}; 