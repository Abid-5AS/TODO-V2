import React, { createContext, useState, useCallback, useEffect, useMemo, useContext } from 'react';
import moment from 'moment';
import { useToast } from '@/hooks/use-toast';
import {
  logOrUpdatePrayerAPI,
  getDailyLogsAPI,
  getMonthlyCalendarDataAPI,
  getPrayerStatsAPI
} from '../services/prayerLogService';
import { 
  PRAYER_NAMES, 
  initialDailyStatus, 
  initialStats, 
  AUTO_REFRESH_INTERVAL 
} from '../constants';
import { isFutureDate } from '../helpers/dateHelpers';

// Create a context to share prayer log state between components
export const PrayerLogContext = createContext(null);

/**
 * Provider component for prayer logging functionality
 */
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

  // --- Action Functions ---
  const changeDate = useCallback((newDate) => {
    setCurrentDate(moment(newDate).startOf('day').toDate());
  }, []);

  const changeMonth = useCallback((monthDelta) => {
    // monthDelta can be a number (relative) or 0 (reset to current month)
    if (monthDelta === 0) {
      // Reset to current month
      setCurrentDate(moment().startOf('day').toDate());
    } else {
      // Move relative to current date
      setCurrentDate((prevDate) => moment(prevDate).add(monthDelta, 'months').startOf('day').toDate());
    }
  }, []);

  const togglePrayerTypeFilter = useCallback((prayerName) => {
    setPrayerTypeFilters(prev => ({
      ...prev,
      [prayerName]: !prev[prayerName]
    }));
  }, []);

  // Core function to log or update prayer status
  const togglePrayerStatus = useCallback(async (prayerName, status = null) => {
    // Don't allow logging for future dates
    if (isFutureDate(currentDate)) {
      toast({
        title: "Cannot log prayers for future dates",
        description: "Please select today or a past date to log prayers.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading((prev) => ({ ...prev, action: true }));
    setError((prev) => ({ ...prev, action: null }));
    
    try {
      // If status is null, we are toggling, otherwise we are setting a specific status
      const curStatus = dailyStatus[prayerName]?.toLowerCase();
      let newStatus = status;
      
      // Only toggle if no specific status is provided
      if (newStatus === null) {
        if (curStatus === 'completed') {
          newStatus = 'missed';
        } else if (curStatus === 'missed') {
          newStatus = null; // Reset to not logged
        } else {
          newStatus = 'completed';
        }
      }
      
      // Send API request to update prayer status
      const response = await logOrUpdatePrayerAPI(
        currentDate,
        prayerName,
        newStatus
      );
      
      if (response.success) {
        // Update local state
        setDailyStatus((prev) => ({
          ...prev,
          [prayerName]: newStatus
        }));
        
        // Update lastUpdated timestamp to trigger refreshes
        setLastUpdated(new Date().getTime());
        
        // Visual feedback
        toast({
          title: `Prayer ${newStatus === null ? 'Reset' : newStatus}`,
          description: `${prayerName} prayer ${newStatus === null ? 'status has been reset' : `marked as ${newStatus}`}.`,
          variant: newStatus === 'completed' ? 'default' : (newStatus === 'missed' ? 'destructive' : 'secondary'),
        });
      } else {
        throw new Error(response.message || 'Failed to update prayer status');
      }
    } catch (err) {
      console.error('togglePrayerStatus Error:', err);
      setError((prev) => ({ ...prev, action: err.message }));
      toast({
        title: "Action failed",
        description: err.message || "Could not update prayer status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
    }
  }, [currentDate, dailyStatus, toast]);

  // Function to refresh all data
  const refreshAllData = useCallback(() => {
    fetchDailyLogs(currentDate);
    fetchMonthlyData(currentMonthYear.year, currentMonthYear.month);
    fetchStats();
  }, [currentDate, currentMonthYear, fetchDailyLogs, fetchMonthlyData, fetchStats]);

  // Initial data load on mount and when date changes
  useEffect(() => {
    fetchDailyLogs(currentDate);
  }, [currentDate, fetchDailyLogs]);

  // Load calendar data when month/year changes
  useEffect(() => {
    fetchMonthlyData(currentMonthYear.year, currentMonthYear.month);
  }, [currentMonthYear, fetchMonthlyData]);

  // Load stats on initial render
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Set up periodic refresh for today's prayers
  useEffect(() => {
    if (moment(currentDate).isSame(moment(), 'day')) {
      const intervalId = setInterval(() => {
        console.log('[PrayerLogProvider] Auto-refreshing prayer data');
        fetchDailyLogs(currentDate);
      }, AUTO_REFRESH_INTERVAL);
      
      return () => clearInterval(intervalId);
    }
  }, [currentDate, fetchDailyLogs]);

  // Context value
  const value = {
    currentDate,
    dailyStatus,
    calendarData: filteredCalendarData,
    detailedCalendarData,
    stats,
    loading,
    error,
    prayerTypeFilters,
    lastUpdated,
    PRAYER_NAMES,
    // Actions
    changeDate,
    changeMonth,
    togglePrayerStatus,
    togglePrayerTypeFilter,
    refreshAllData,
  };

  return (
    <PrayerLogContext.Provider value={value}>
      {children}
    </PrayerLogContext.Provider>
  );
}

/**
 * Hook to consume the PrayerLog context
 */
export const usePrayerLog = () => {
  const context = useContext(PrayerLogContext);
  if (!context) {
    throw new Error('usePrayerLog must be used within a PrayerLogProvider');
  }
  return context;
}; 