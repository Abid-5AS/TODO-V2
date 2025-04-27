import React, { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import { usePrayerLog } from '../hooks/usePrayerLog';
import { Skeleton } from '../../../components/ui/skeleton';

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

const PrayerCalendarView = () => {
  const {
    currentDate,
    calendarData,
    loading,
    error,
    changeMonth,
  } = usePrayerLog();

  // Check if dark mode is enabled (implement according to your app's theme system)
  const isDarkMode = document.documentElement.classList.contains('dark');

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
      <div className="text-center mb-6">
        <div className="text-2xl font-bold">
          {format(currentDate, 'MMMM yyyy')}
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
              const prayerCount = calendarData[dateKey] || 0;
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={dateKey}
                  className={cn(
                    "h-12 flex flex-col items-center justify-center rounded-md transition-colors",
                    getHeatmapColor(prayerCount, isDarkMode),
                    !isCurrentMonth && "opacity-40",
                    isCurrentDay && "ring-2 ring-emerald-500 dark:ring-emerald-400"
                  )}
                  title={`${format(day, 'MMM d, yyyy')}: ${prayerCount} prayer${prayerCount !== 1 ? 's' : ''} completed`}
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