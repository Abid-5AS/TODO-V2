import React, { useMemo, useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sunrise, Sun, Sunset, Moon, Star, Filter, Check } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import { usePrayerLog } from '../hooks/usePrayerLog.jsx';
import { Skeleton } from '../../../components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../components/ui/tooltip';
import { Badge } from '../../../components/ui/badge';

// Define color gradients for prayer count
const getHeatmapColor = (count, isDarkMode = false) => {
  if (!count) return isDarkMode ? 'bg-gray-800' : 'bg-gray-100';
  
  // Light mode colors (green gradient)
  const lightColors = {
    1: 'bg-green-100', // very light green
    2: 'bg-green-200',
    3: 'bg-green-300',
    4: 'bg-green-400',
    5: 'bg-green-500', // full green
  };
  
  // Dark mode colors (green gradient, darker base)
  const darkColors = {
    1: 'bg-green-900/30', // very dark transparent green
    2: 'bg-green-800/40',
    3: 'bg-green-700/50',
    4: 'bg-green-600/60',
    5: 'bg-green-500/70', // more vibrant green
  };
  
  // Ensure count is at most 5
  const normalizedCount = Math.min(count, 5);
  
  return isDarkMode ? darkColors[normalizedCount] : lightColors[normalizedCount];
};

// Prayer type configuration
const PRAYER_ICONS = {
  Fajr: <Sunrise size={16} />,
  Dhuhr: <Sun size={16} />,
  Asr: <Sun size={16} className="rotate-45" />,
  Maghrib: <Sunset size={16} />,
  Isha: <Moon size={16} />
};

const PRAYER_COLORS = {
  Fajr: "text-amber-600 dark:text-amber-400",
  Dhuhr: "text-orange-600 dark:text-orange-400",
  Asr: "text-yellow-600 dark:text-yellow-400",
  Maghrib: "text-red-600 dark:text-red-400",
  Isha: "text-indigo-600 dark:text-indigo-400"
};

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
    lastUpdated,
    refreshAllData
  } = usePrayerLog();

  // Debug logs to track changes in calendarData
  useEffect(() => {
    console.log('[PrayerCalendarView] calendarData changed:', calendarData);
  }, [calendarData]);

  useEffect(() => {
    console.log('[PrayerCalendarView] detailedCalendarData changed:', detailedCalendarData);
  }, [detailedCalendarData]);

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

  // Refresh calendar data when a prayer is marked in another component
  useEffect(() => {
    if (lastUpdated) {
      console.log(`[PrayerCalendarView] lastUpdated changed: ${lastUpdated}`);
      
      // Always refresh when the lastUpdated timestamp changes
      // This ensures the calendar stays in sync with prayer status changes
      console.log(`[PrayerCalendarView] Triggering calendar data refresh`);
      
      // Use a small timeout to ensure the refresh happens after all state updates
      const refreshTimer = setTimeout(() => {
        refreshAllData();
      }, 100);
      
      return () => clearTimeout(refreshTimer);
    }
  }, [lastUpdated, refreshAllData]);

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
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold flex items-center text-emerald-700 dark:text-emerald-400">
          <CalendarIcon size={18} className="mr-2" /> Prayer Calendar
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handlePrevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleCurrentMonth}
            className="h-8 text-xs px-2"
          >
            Current Month
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Month Display */}
      <div className="text-center mb-4">
        <div className="text-2xl font-bold">
          {format(currentDate, 'MMMM yyyy')}
        </div>
      </div>

      {/* Prayer Type Filters */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Filter size={16} className="mr-2 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Prayer Type</span>
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({activeFilterCount}/5 active)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.keys(prayerTypeFilters).map(prayerName => (
            <Badge
              key={prayerName}
              variant={prayerTypeFilters[prayerName] ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-all",
                prayerTypeFilters[prayerName] && "bg-emerald-600 hover:bg-emerald-700"
              )}
              onClick={() => togglePrayerTypeFilter(prayerName)}
            >
              <span className={cn("mr-1", PRAYER_COLORS[prayerName])}>
                {PRAYER_ICONS[prayerName]}
              </span>
              {prayerName}
            </Badge>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      {loading.calendar ? (
        <div className="grid grid-cols-7 gap-1">
          {Array(35).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded" />
          ))}
        </div>
      ) : (
        <div>
          {/* Day headings */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (!day) {
                // Empty cell
                return <div key={`empty-${index}`} className="h-12 rounded-md" />;
              }

              const dateKey = formatDateKey(day);
              // Get prayers for this day if additional data is available
              const prayersForDay = {}; // This would come from a more detailed API response
              
              // Total prayer count for this day
              const prayerCount = calendarData[dateKey] || 0;
              
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);

              return (
                <TooltipProvider key={dateKey}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "h-12 flex flex-col items-center justify-center rounded-md transition-colors",
                          getHeatmapColor(prayerCount, isDarkMode),
                          !isCurrentMonth && "opacity-40",
                          isCurrentDay && "ring-2 ring-emerald-500 dark:ring-emerald-400"
                        )}
                      >
                        <div className={cn(
                          "text-sm font-medium",
                          prayerCount >= 4 ? "text-white dark:text-white" : "text-gray-700 dark:text-gray-300"
                        )}>
                          {format(day, 'd')}
                        </div>
                        {prayerCount > 0 && (
                          <div className={cn(
                            "text-xs",
                            prayerCount >= 4 ? "text-white/80 dark:text-white/80" : "text-gray-500 dark:text-gray-400"
                          )}>
                            {prayerCount}/5
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <div className="text-xs p-1">
                        <div className="font-semibold mb-1">{format(day, 'MMMM d, yyyy')}</div>
                        <div className="mb-1">{prayerCount} prayer{prayerCount !== 1 ? 's' : ''} completed</div>
                        
                        {/* Display detailed prayers if available */}
                        {prayerCount > 0 && (
                          <div className="pt-1 border-t border-gray-200 dark:border-gray-700">
                            {Object.keys(PRAYER_ICONS).map(prayer => {
                              // Get prayer data from detailedCalendarData if available
                              const detailedData = detailedCalendarData && detailedCalendarData[dateKey];
                              const isCompleted = detailedData && detailedData[prayer];
                              
                              return (
                                <div 
                                  key={prayer} 
                                  className={cn(
                                    "flex items-center gap-1 py-0.5",
                                    isCompleted ? PRAYER_COLORS[prayer] : "text-gray-400 dark:text-gray-600"
                                  )}
                                >
                                  <span className="mr-1">{PRAYER_ICONS[prayer]}</span>
                                  <span>{prayer}</span>
                                  {isCompleted && (
                                    <span className="ml-auto">
                                      <Check size={12} />
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>
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