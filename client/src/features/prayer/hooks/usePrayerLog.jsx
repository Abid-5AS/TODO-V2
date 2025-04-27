import { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { format, isBefore, isAfter, addMonths, parseISO } from 'date-fns';
import moment from 'moment';
import {
  logOrUpdatePrayerAPI,
  getDailyLogsAPI,
  getMonthlyCalendarDataAPI,
  getPrayerStatsAPI,
} from '../services/prayerLogService';
import { useToast } from '../../../hooks/use-toast';

const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// Auto-refresh interval in milliseconds
const AUTO_REFRESH_INTERVAL = 60000; // 1 minute

// Initial empty states
const initialDailyStatus = PRAYER_NAMES.reduce((acc, name) => {
  acc[name] = null; // null = not logged, 'Completed', 'Missed', 'Excused'
  return acc;
}, {});

const initialStats = {
  currentStreak: 0,
  longestStreak: 0,
  totalPrayersLogged: 0,
  totalDaysLogged: 0,
  daysWithAllPrayers: 0,
  perfectDayPercentage: 0,
  prayerCompletionStats: {
    Fajr: 0,
    Dhuhr: 0,
    Asr: 0,
    Maghrib: 0,
    Isha: 0
  }
};

// Helper to check if a date is in the future
const isFutureDate = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  
  // Reset time parts to compare only the date
  today.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);
  
  return checkDate > today;
};

// Helper to check if a prayer time has passed
const hasPrayerTimePassed = (prayerName, prayerTimes) => {
  if (!prayerTimes) return false;
  
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentMinutesSinceMidnight = currentHour * 60 + currentMinute;
  
  // Try to get the prayer time from the prayerTimes object
  const prayerTimeStr = prayerTimes[prayerName] || prayerTimes[prayerName.toLowerCase()];
  if (!prayerTimeStr || typeof prayerTimeStr !== 'string' || !prayerTimeStr.includes(':')) return false;
  
  // Convert prayer time to minutes since midnight
  const [prayerHour, prayerMinute] = prayerTimeStr.split(':').map(Number);
  if (isNaN(prayerHour) || isNaN(prayerMinute)) return false;
  
  const prayerMinutesSinceMidnight = prayerHour * 60 + prayerMinute;
  
  // Prayer time has passed if current time is later
  return currentMinutesSinceMidnight >= prayerMinutesSinceMidnight;
};

// Create a context to share prayer log state between components
const PrayerLogContext = createContext(null);

// Create a provider component
export function PrayerLogProvider({ children, initialDate = new Date(), prayerTimes = null }) {
  const [currentDate, setCurrentDate] = useState(moment(initialDate).startOf('day').toDate());
  const [dailyStatus, setDailyStatus] = useState(initialDailyStatus);
  const [calendarData, setCalendarData] = useState({}); // { 'YYYY-MM-DD': count }
  const [detailedCalendarData, setDetailedCalendarData] = useState({}); // { 'YYYY-MM-DD': { 'Fajr': 1, 'Dhuhr': 1, ... } }
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
  // Filter state for calendar
  const [prayerTypeFilters, setPrayerTypeFilters] = useState({
    Fajr: true,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true
  });
  const { toast } = useToast();
  
  // Track when prayer status has been updated
  const [lastUpdated, setLastUpdated] = useState(null);

  const currentMonthYear = useMemo(() => {
    const m = moment(currentDate);
    return { year: m.year(), month: m.month() + 1 }; // 1-based month
  }, [currentDate]);

  // Filter calendar data based on prayer type filters
  const filteredCalendarData = useMemo(() => {
    // If all filters are active or no detailedData, return original data
    const allFiltersActive = Object.values(prayerTypeFilters).every(Boolean);
    if (allFiltersActive || !detailedCalendarData || Object.keys(detailedCalendarData).length === 0) {
      return calendarData;
    }

    // Create filtered data
    const result = {};
    Object.keys(detailedCalendarData).forEach(date => {
      const prayerCounts = detailedCalendarData[date];
      let totalCount = 0;
      
      // Count only prayers that match active filters
      Object.keys(prayerCounts).forEach(prayer => {
        if (prayerTypeFilters[prayer]) {
          totalCount += prayerCounts[prayer];
        }
      });
      
      if (totalCount > 0) {
        result[date] = totalCount;
      }
    });
    
    return result;
  }, [calendarData, detailedCalendarData, prayerTypeFilters]);

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
    if (typeof year !== 'number' || typeof month !== 'number' || month < 1 || month > 12) {
      console.error('fetchMonthlyData Error: Invalid year/month arguments.', { year, month });
      setError((prev) => ({ ...prev, calendar: 'Invalid date arguments for calendar.' }));
      return;
    }
    setLoading((prev) => ({ ...prev, calendar: true }));
    setError((prev) => ({ ...prev, calendar: null }));
    try {
      const response = await getMonthlyCalendarDataAPI(year, month);
      if (response.success) {
        setCalendarData(response.data || {});
        // Handle detailed calendar data if available
        if (response.detailedData) {
          setDetailedCalendarData(response.detailedData);
        } else {
          setDetailedCalendarData({});
        }
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
    fetchStats();
  }, [currentMonthYear.year, currentMonthYear.month, fetchMonthlyData, fetchStats]);

  // Auto-refresh data periodically
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      const now = new Date();
      const isViewingToday = moment(currentDate).isSame(moment(now), 'day');
      if (isViewingToday) {
        fetchDailyLogs(currentDate);
        fetchMonthlyData(currentMonthYear.year, currentMonthYear.month);
        fetchStats();
      }
    }, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(refreshInterval);
  }, [currentDate, currentMonthYear, fetchDailyLogs, fetchMonthlyData, fetchStats]);

  // --- Action Functions ---
  const logPrayer = useCallback(
    async (prayerName, status = 'Completed') => {
      console.log(`[usePrayerLog] Logging ${prayerName} as ${status}`);
      
      // Validate: Don't allow logging prayers for future dates
      if (isFutureDate(currentDate)) {
        toast({ 
          title: `Cannot mark prayers for future dates`,
          variant: 'destructive'
        });
        return false;
      }
      
      // For today's date, don't allow logging prayers whose time hasn't come yet
      const isToday = moment(currentDate).isSame(moment(), 'day');
      if (isToday && status === 'Completed' && !hasPrayerTimePassed(prayerName, prayerTimes)) {
        toast({ 
          title: `Cannot mark ${prayerName} as completed`,
          description: "The prayer time hasn't arrived yet", 
          variant: 'destructive'
        });
        return false;
      }

      setLoading((prev) => ({ ...prev, action: true }));
      setError((prev) => ({ ...prev, action: null }));

      // Optimistic UI Update
      const previousStatus = { ...dailyStatus };
      
      // Optimistically update daily status
      setDailyStatus((prev) => ({ ...prev, [prayerName]: status }));
      console.log(`[usePrayerLog] Updated dailyStatus optimistically: ${prayerName} => ${status}`);
      
      // Optimistically update calendar data for today's count
      if (isToday) {
        const todayStr = moment(currentDate).format('YYYY-MM-DD');
        const currentCount = calendarData[todayStr] || 0;
        
        // Calculate the new count based on the status change
        let newCount = currentCount;
        if (status === 'Completed' && previousStatus[prayerName] !== 'Completed') {
          newCount = currentCount + 1;
        } else if (status !== 'Completed' && previousStatus[prayerName] === 'Completed') {
          newCount = Math.max(0, currentCount - 1);
        }
        
        // Update calendar data optimistically
        if (newCount !== currentCount) {
          console.log(`[usePrayerLog] Updating calendarData - date: ${todayStr}, count: ${currentCount} -> ${newCount}`);
          
          // Important: Use functional updates to ensure we're working with the latest state
          setCalendarData(prev => {
            const updated = {
              ...prev,
              [todayStr]: newCount
            };
            console.log(`[usePrayerLog] New calendarData:`, updated);
            return updated;
          });
          
          // Update detailed calendar data optimistically
          setDetailedCalendarData(prev => {
            const updatedData = { ...prev };
            if (!updatedData[todayStr]) {
              updatedData[todayStr] = {};
            }
            
            // Update the specific prayer count in detailed data
            if (status === 'Completed') {
              updatedData[todayStr][prayerName] = 1;
            } else {
              delete updatedData[todayStr][prayerName];
            }
            
            console.log(`[usePrayerLog] New detailedCalendarData:`, updatedData);
            return updatedData;
          });
          
          // Also optimistically update stats for immediate feedback
          if (status === 'Completed') {
            setStats(prev => ({
              ...prev,
              totalPrayersLogged: prev.totalPrayersLogged + 1,
              prayerCompletionStats: {
                ...prev.prayerCompletionStats,
                [prayerName]: prev.prayerCompletionStats[prayerName] + 1
              }
            }));
          } else if (status !== 'Completed' && previousStatus[prayerName] === 'Completed') {
            setStats(prev => ({
              ...prev,
              totalPrayersLogged: Math.max(0, prev.totalPrayersLogged - 1),
              prayerCompletionStats: {
                ...prev.prayerCompletionStats,
                [prayerName]: Math.max(0, prev.prayerCompletionStats[prayerName] - 1)
              }
            }));
          }
        }
      }
      
      // Set lastUpdated to trigger UI refresh
      const timestamp = new Date().getTime();
      console.log(`[usePrayerLog] Setting lastUpdated: ${timestamp}`);
      setLastUpdated(timestamp);

      try {
        console.log(`[usePrayerLog] Sending API request to log prayer`);
        const response = await logOrUpdatePrayerAPI(currentDate, prayerName, status);
        if (!response.success) {
          throw new Error(response.message || 'API error logging prayer');
        }
        
        toast({ title: `${prayerName} marked as ${status}` });
        console.log(`[usePrayerLog] API request successful, refreshing data`);
        
        // Refresh all data to ensure consistency across the UI
        // Use Promise.allSettled instead of Promise.all to ensure all promises complete even if one fails
        const refreshPromises = [
          fetchDailyLogs(currentDate),
          fetchMonthlyData(currentMonthYear.year, currentMonthYear.month),
          fetchStats()
        ];
        
        // Wait for all refresh operations but don't block UI
        Promise.allSettled(refreshPromises).then(results => {
          console.log(`[usePrayerLog] All data refresh completed`);
          // If any failed, log them but don't disrupt the user experience
          results.forEach((result, index) => {
            if (result.status === 'rejected') {
              console.error(`Refresh operation ${index} failed:`, result.reason);
            }
          });
        });
        
        return true;
      } catch (err) {
        console.error('logPrayer Error:', err);
        setError((prev) => ({ ...prev, action: err.message }));
        toast({ 
          title: `Error updating ${prayerName}`, 
          description: err.message, 
          variant: 'destructive' 
        });
        
        // Revert optimistic updates on failure
        console.log(`[usePrayerLog] API request failed, reverting optimistic updates`);
        setDailyStatus(previousStatus);
        
        // Also refresh calendar data to revert optimistic updates
        fetchMonthlyData(currentMonthYear.year, currentMonthYear.month);
        fetchStats(); // Also revert stats
        
        return false;
      } finally {
        setLoading((prev) => ({ ...prev, action: false }));
      }
    },
    [currentDate, dailyStatus, calendarData, prayerTimes, fetchDailyLogs, fetchMonthlyData, fetchStats, toast]
  );

  const togglePrayerCompleted = useCallback(
    async (prayerName) => {
      const currentPrayerStatus = dailyStatus[prayerName];
      // If currently 'Completed', mark as 'Missed'
      // If null or other status, mark as 'Completed'
      const newStatus = currentPrayerStatus === 'Completed' ? 'Missed' : 'Completed';
      return await logPrayer(prayerName, newStatus);
    },
    [dailyStatus, logPrayer]
  );

  // --- Date Navigation ---
  const changeDate = useCallback((newDate) => {
    setCurrentDate(moment(newDate).startOf('day').toDate());
  }, []);

  const changeMonth = useCallback((increment) => {
    setCurrentDate(prevDate => moment(prevDate).add(increment, 'months').toDate());
  }, []);

  // Toggle prayer type filter for calendar
  const togglePrayerTypeFilter = useCallback((prayerName) => {
    setPrayerTypeFilters(prev => ({
      ...prev,
      [prayerName]: !prev[prayerName]
    }));
  }, []);

  // Force refresh all data
  const refreshAllData = useCallback(async () => {
    await Promise.all([
      fetchDailyLogs(currentDate),
      fetchMonthlyData(currentMonthYear.year, currentMonthYear.month),
      fetchStats()
    ]);
  }, [currentDate, currentMonthYear, fetchDailyLogs, fetchMonthlyData, fetchStats]);

  // Add a dedicated effect for refreshing statistics when dailyStatus changes
  useEffect(() => {
    if (lastUpdated) {
      // Refresh stats immediately when a prayer is marked
      console.log(`[usePrayerLog] lastUpdated changed (${lastUpdated}), refreshing stats`);
      fetchStats();
    }
  }, [lastUpdated, fetchStats]);

  // Toggle a prayer status (completed, missed, default)
  const togglePrayerStatus = async (prayerName, status = null) => {
    if (!currentDate || isFutureDate(currentDate)) return;

    // Get the current status for optimization
    const currentStatus = dailyStatus[prayerName] || null;
    
    // If status is null, cycle through statuses: null -> completed -> missed -> null
    let newStatus = status;
    if (newStatus === null) {
      if (currentStatus === null) newStatus = 'completed';
      else if (currentStatus === 'completed') newStatus = 'missed';
      else newStatus = null;
    }

    // Skip if no change
    if (newStatus === currentStatus) return;

    const dateKey = moment(currentDate).format('yyyy-MM-dd');
    
    // Optimistic UI update for daily status
    setDailyStatus(prev => ({
      ...prev,
      [prayerName]: newStatus
    }));

    // Optimistic UI update for calendar data
    setCalendarData(prev => {
      const existingCount = prev[dateKey] || 0;
      let newCount = existingCount;
      
      // Adjust count based on status changes
      if (currentStatus === 'completed' && newStatus !== 'completed') {
        newCount = Math.max(0, existingCount - 1);
      } else if (currentStatus !== 'completed' && newStatus === 'completed') {
        newCount = existingCount + 1;
      }
      
      // Only update if count changed
      if (newCount !== existingCount) {
        console.log(`[togglePrayerStatus] Updating calendar data for ${dateKey}: ${existingCount} -> ${newCount}`);
        return {
          ...prev,
          [dateKey]: newCount
        };
      }
      return prev;
    });
    
    // Optimistic UI update for detailed calendar data
    setDetailedCalendarData(prev => {
      const dayData = prev[dateKey] || {};
      console.log(`[togglePrayerStatus] Updating detailed calendar data for ${dateKey}, prayer: ${prayerName}, status: ${newStatus === 'completed'}`);
      return {
        ...prev,
        [dateKey]: {
          ...dayData,
          [prayerName]: newStatus === 'completed'
        }
      };
    });

    // Optimistic UI update for stats
    setStats(prev => {
      let totalPrayersChange = 0;
      if (currentStatus === 'completed' && newStatus !== 'completed') {
        totalPrayersChange = -1;
      } else if (currentStatus !== 'completed' && newStatus === 'completed') {
        totalPrayersChange = 1;
      }
      
      // Only "completed" status counts toward the total
      const updatedStats = {
        ...prev,
        totalPrayersLogged: Math.max(0, prev.totalPrayersLogged + totalPrayersChange)
      };
      
      console.log(`[togglePrayerStatus] Updating stats, total prayers: ${prev.totalPrayersLogged} -> ${updatedStats.totalPrayersLogged}`);
      return updatedStats;
    });

    // Update lastUpdated timestamp immediately to trigger refreshes in other components
    const updateTimestamp = Date.now();
    setLastUpdated(updateTimestamp);
    console.log(`[togglePrayerStatus] Setting lastUpdated timestamp: ${updateTimestamp}`);

    try {
      // API call to update the prayer status
      const response = await logOrUpdatePrayerAPI(currentDate, prayerName, newStatus);
      
      // Force refresh data to ensure everything is in sync after API response
      await Promise.all([
        fetchDailyLogs(currentDate),
        fetchMonthlyData(currentMonthYear.year, currentMonthYear.month),
        fetchStats()
      ]);
      
      return response;
    } catch (error) {
      console.error('Failed to update prayer status:', error);
      
      // Revert optimistic updates on error
      fetchDailyLogs(currentDate);
      fetchMonthlyData(currentMonthYear.year, currentMonthYear.month);
      fetchStats();
      
      setError(prev => ({
        ...prev,
        updatePrayer: error.message || 'Failed to update prayer status'
      }));
      
      return null;
    }
  };

  // Prepare the value for the context
  const contextValue = {
    currentDate,
    dailyStatus,
    calendarData: filteredCalendarData,
    detailedCalendarData,
    stats,
    loading,
    error,
    logPrayer,
    togglePrayerCompleted,
    changeDate,
    changeMonth,
    refreshAllData,
    PRAYER_NAMES,
    prayerTypeFilters,
    togglePrayerTypeFilter,
    lastUpdated,
    togglePrayerStatus
  };

  return (
    <PrayerLogContext.Provider value={contextValue}>
      {children}
    </PrayerLogContext.Provider>
  );
}

// The hook to use the context
export const usePrayerLog = (initialDate, prayerTimes) => {
  const context = useContext(PrayerLogContext);
  
  // If context doesn't exist, it means we're not inside a provider
  // In that case, create a local instance of the hook state (backward compatibility)
  if (!context) {
    console.warn(`[usePrayerLog] PrayerLogContext not found. For optimal performance, 
      wrap your component tree with PrayerLogProvider at a higher level.`);
    
    // Return a standalone instance for backward compatibility
    // This is NOT recommended for production as it won't share state between components
    return usePrayerLogStandalone(initialDate, prayerTimes);
  }
  
  return context;
};

// The original hook logic (now renamed) to maintain backward compatibility
const usePrayerLogStandalone = (initialDate = new Date(), prayerTimes = null) => {
  // Original hook implementation
  // ... (all the code from the original hook)
  const [currentDate, setCurrentDate] = useState(moment(initialDate).startOf('day').toDate());
  const [dailyStatus, setDailyStatus] = useState(initialDailyStatus);
  // ... and so on
  
  // Since this is so extensive, instead of duplicating all the logic,
  // we'll alert the developer to use the Provider pattern instead
  console.error(`WARNING: You're using usePrayerLog without a PrayerLogProvider. 
    This creates multiple independent instances and prevents real-time updates between components.
    Please wrap your component tree with <PrayerLogProvider> for proper state sharing.`);

  // Return a minimal implementation so things don't break completely
  return {
    currentDate: initialDate,
    dailyStatus: initialDailyStatus,
    calendarData: {},
    detailedCalendarData: {},
    stats: initialStats,
    loading: { daily: false, calendar: false, stats: false, action: false },
    error: { daily: null, calendar: null, stats: null, action: null },
    logPrayer: async () => { 
      console.error("Cannot log prayer without PrayerLogProvider"); 
      return false;
    },
    togglePrayerCompleted: async () => { 
      console.error("Cannot toggle prayer without PrayerLogProvider"); 
      return false;
    },
    changeDate: () => console.error("Cannot change date without PrayerLogProvider"),
    changeMonth: () => console.error("Cannot change month without PrayerLogProvider"),
    refreshAllData: async () => console.error("Cannot refresh data without PrayerLogProvider"),
    PRAYER_NAMES,
    prayerTypeFilters: { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true },
    togglePrayerTypeFilter: () => console.error("Cannot toggle filter without PrayerLogProvider"),
    lastUpdated: null,
    togglePrayerStatus: async () => { 
      console.error("Cannot toggle prayer status without PrayerLogProvider"); 
      return false;
    }
  };
}; 