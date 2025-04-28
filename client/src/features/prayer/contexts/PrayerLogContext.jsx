import React, { createContext, useState, useContext } from 'react';
// Removed unused imports: useCallback, useEffect, useMemo, moment, useToast, logOrUpdatePrayerAPI, getDailyLogsAPI, getMonthlyCalendarDataAPI, getPrayerStatsAPI, initialDailyStatus, initialStats, AUTO_REFRESH_INTERVAL, isFutureDate

// Import the specialized hooks
import { usePrayerDateManager } from '../hooks/usePrayerDateManager';
import { useDailyPrayerStatus } from '../hooks/useDailyPrayerStatus';
import { usePrayerCalendarData } from '../hooks/usePrayerCalendarData';
import { usePrayerStats } from '../hooks/usePrayerStats';
import { usePrayerActions } from '../hooks/usePrayerActions';
import { PRAYER_NAMES } from '../constants'; // Still needed for context value potentially

// Create a context to share prayer log state between components
export const PrayerLogContext = createContext(null);

/**
 * Provider component for prayer logging functionality, now using specialized hooks.
 */
export function PrayerLogProvider({ children, initialDate = new Date(), prayerTimes = null }) {
  // 1. Manage Date
  const { 
    currentDate, 
    changeDate, 
    changeMonth, 
    currentMonthYear, 
    isCurrentDateToday, 
    isFutureDate 
  } = usePrayerDateManager(initialDate);

  // 2. Manage Daily Status
  const {
    dailyStatus,
    setDailyStatus,
    loadingDailyStatus,
    errorDailyStatus,
    fetchDailyLogs // Keep fetch function if manual refresh is needed outside actions
  } = useDailyPrayerStatus(currentDate);
  
  // 3. Manage Calendar Data
  const {
    calendarData, // This is the filtered data
    // rawCalendarData, // Expose if needed
    detailedCalendarData,
    setCalendarData, // Setter needed for optimistic updates
    setDetailedCalendarData, // Setter needed for optimistic updates
    loadingCalendar,
    errorCalendar,
    prayerTypeFilters,
    togglePrayerTypeFilter,
    fetchMonthlyData // Keep fetch function if manual refresh is needed outside actions
  } = usePrayerCalendarData(currentMonthYear);

  // 4. Manage Stats Data
  const [lastUpdated, setLastUpdated] = useState(null); // Trigger for stats refresh
  const {
    stats,
    setStats, // Setter needed for optimistic updates
    loadingStats,
    errorStats,
    fetchStats // Keep fetch function if manual refresh is needed outside actions
  } = usePrayerStats(lastUpdated); // Pass trigger

  // 5. Manage Actions
  const {
    logPrayer, // Main action function
    togglePrayerCompleted, // Convenience wrapper
    togglePrayerStatus, // Convenience wrapper
    loadingAction,
    errorAction
  } = usePrayerActions({
    // Pass state and setters from other hooks
    currentDate,
    dailyStatus,
    setDailyStatus,
    setCalendarData, 
    setDetailedCalendarData,
    setStats,
    setLastUpdated,
    prayerTimes, // Pass prayerTimes prop from provider
    fetchDailyLogs, // Pass fetchers for revert logic
    fetchMonthlyData,
    fetchStats,
    isCurrentDateToday,
    isFutureDate,
  });
  
  // Consolidate loading and error states (optional, can expose individually)
  const loading = {
    daily: loadingDailyStatus,
    calendar: loadingCalendar,
    stats: loadingStats,
    action: loadingAction,
  };
  const error = {
    daily: errorDailyStatus,
    calendar: errorCalendar,
    stats: errorStats,
    action: errorAction,
  };

  // --- Removed Redundant Logic ---
  // Removed useState for: currentDate, dailyStatus, calendarData, detailedCalendarData, stats, loading, error, prayerTypeFilters, lastUpdated
  // Removed useMemo for: currentMonthYear, filteredCalendarData (handled in hooks)
  // Removed useCallback/useEffect for: fetchDailyLogs, fetchMonthlyData, fetchStats, changeDate, changeMonth, togglePrayerTypeFilter, togglePrayerStatus, refreshAllData, auto-refresh interval
  
  // Context value aggregates state and functions from hooks
  const value = {
    // Date Management
    currentDate,
    isCurrentDateToday,
    isFutureDate,
    changeDate,
    changeMonth,
    
    // Daily Status
    dailyStatus,
    // fetchDailyLogs, // Expose if refresh needed outside actions
    
    // Calendar Data
    calendarData, // Filtered data
    detailedCalendarData,
    prayerTypeFilters,
    togglePrayerTypeFilter,
    // fetchMonthlyData, // Expose if refresh needed outside actions

    // Stats Data
    stats,
    // fetchStats, // Expose if refresh needed outside actions
    
    // Actions
    logPrayer,
    togglePrayerCompleted,
    togglePrayerStatus,
    
    // Loading & Error States
    loading,
    error,

    // Misc
    PRAYER_NAMES, // Keep if needed by consumers
    lastUpdated, // Expose if needed
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