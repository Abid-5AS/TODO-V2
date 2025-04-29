import React, { createContext, useState, useContext } from 'react';

// Import the specialized hooks
import { usePrayerDateManager } from '../hooks/usePrayerDateManager';
import { useDailyPrayerStatus } from '../hooks/useDailyPrayerStatus';
import { usePrayerCalendarData } from '../hooks/usePrayerCalendarData';
import { usePrayerStats } from '../hooks/usePrayerStats';
import { usePrayerActions } from '../hooks/usePrayerActions';
import { PRAYER_NAMES } from '../constants';

// Create a context to share prayer log state between components
export const PrayerLogContext = createContext(null);

/**
 * Provider component for prayer logging functionality, using specialized hooks.
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
    fetchDailyLogs // Needed for usePrayerActions revert logic
  } = useDailyPrayerStatus(currentDate);
  
  // 3. Manage Calendar Data
  const {
    calendarData, 
    rawCalendarData,
    detailedCalendarData,
    setCalendarData, 
    setDetailedCalendarData, 
    loadingCalendar,
    errorCalendar,
    prayerTypeFilters,
    togglePrayerTypeFilter,
    fetchMonthlyData // Needed for usePrayerActions revert logic
  } = usePrayerCalendarData(currentMonthYear);
  
  // 4. Manage Stats Data
  const [lastUpdated, setLastUpdated] = useState(null);
  const {
    stats,
    setStats, 
    loadingStats,
    errorStats,
    fetchStats // Needed for usePrayerActions revert logic
  } = usePrayerStats(lastUpdated); 

  // 5. Manage Actions
  const {
    logPrayer,
    togglePrayerCompleted,
    togglePrayerStatus,
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
    prayerTimes, 
    fetchDailyLogs, 
    fetchMonthlyData,
    fetchStats,
    isCurrentDateToday,
    isFutureDate,
  });

  // Consolidate loading and error states 
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
    
    // Calendar Data
    calendarData, 
    rawCalendarData,
    detailedCalendarData,
    prayerTypeFilters,
    togglePrayerTypeFilter,

    // Stats Data
    stats,
    
    // Actions
    logPrayer,
    togglePrayerCompleted,
    togglePrayerStatus,
    
    // Loading & Error States
    loading,
    error,

    // Misc
    PRAYER_NAMES, 
    lastUpdated,
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