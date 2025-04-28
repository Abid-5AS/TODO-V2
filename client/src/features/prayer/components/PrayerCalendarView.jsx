import React, { useMemo, useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { cn } from '../../../lib/utils';
import { usePrayerLog } from '../contexts/PrayerLogContext';
import { Skeleton } from '../../../components/ui/skeleton';
import CalendarHeader from './calendar/CalendarHeader';
import PrayerFilter from './calendar/PrayerFilter';
import CalendarGrid from './calendar/CalendarGrid';
import { getHeatmapColor } from '../helpers/prayerHelpers';

const PrayerCalendarView = () => {
  const {
    currentDate,
    calendarData,
    loading,
    error,
    changeMonth,
    prayerTypeFilters,
    togglePrayerTypeFilter,
    detailedCalendarData,
  } = usePrayerLog();

  // State for monitoring dark mode
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  // Listen for theme changes
  useEffect(() => {
    // Function to update dark mode state
    const updateThemeState = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    // Initial check
    updateThemeState();

    // Set up MutationObserver to watch for class changes on the html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateThemeState();
        }
      });
    });

    // Start observing
    observer.observe(document.documentElement, { attributes: true });

    // Clean up
    return () => observer.disconnect();
  }, []);

  // Generate calendar grid data
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = startOfMonth(currentDate);
    const lastDayOfMonth = endOfMonth(currentDate);
    
    // Get all days in the current month
    const days = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
    
    // Get the day of the week of the first day (0 = Sunday, 1 = Monday, etc.)
    const startingDayIndex = firstDayOfMonth.getDay();
    
    // Empty cells before the first day of the month
    const prefixDays = Array(startingDayIndex).fill(null);
    
    return [...prefixDays, ...days];
  }, [currentDate]);

  const handlePrevMonth = () => changeMonth(-1);
  const handleNextMonth = () => changeMonth(1);
  const handleCurrentMonth = () => changeMonth(0); // Reset to current month

  // Count active filters
  const activeFilterCount = Object.values(prayerTypeFilters).filter(Boolean).length;

  if (error?.calendar) {
    return (
      <div className="text-center p-4 text-red-500 dark:text-red-400">
        Error loading calendar data: {error.calendar}
      </div>
    );
  }

  // Format a specific date as YYYY-MM-DD for lookup in calendarData
  const formatDateKey = (date) => {
    return date ? format(date, 'yyyy-MM-dd') : '';
  };

  return (
    <div className="prayer-calendar glass-card p-5 rounded-lg shadow-md border border-emerald-300/20 bg-gradient-to-r from-emerald-50/10 to-blue-50/10 dark:from-emerald-950/20 dark:to-blue-950/20">
      {/* Use CalendarHeader Component */}
      <CalendarHeader 
        currentDate={currentDate}
        handlePrevMonth={handlePrevMonth}
        handleNextMonth={handleNextMonth}
        handleCurrentMonth={handleCurrentMonth}
      />

      {/* Use PrayerFilter Component */}
      <PrayerFilter 
        prayerTypeFilters={prayerTypeFilters}
        togglePrayerTypeFilter={togglePrayerTypeFilter}
        activeFilterCount={activeFilterCount}
      />

      {/* Calendar Grid Area */}
      {loading.calendar ? (
        <div className="grid grid-cols-7 gap-1">
          {Array(35).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded" />
          ))}
        </div>
      ) : (
        <CalendarGrid 
          calendarDays={calendarDays}
          calendarData={calendarData}
          detailedCalendarData={detailedCalendarData}
          formatDateKey={formatDateKey}
          currentDate={currentDate}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-2">
        <span className="text-xs text-muted-foreground">Prayers completed:</span>
        {[0, 1, 2, 3, 4, 5].map((count) => (
          <div key={count} className="flex items-center">
            <div
              className={cn(
                "w-4 h-4 rounded-sm mr-1",
                getHeatmapColor(count, isDarkMode)
              )}
            />
            <span className="text-xs text-muted-foreground">{count === 0 ? '0' : count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrayerCalendarView; 