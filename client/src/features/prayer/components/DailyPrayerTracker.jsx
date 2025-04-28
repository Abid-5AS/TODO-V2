import React, { useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Check, X, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { usePrayerTimes } from '@/features/islamic/hooks/usePrayerTimes';
import { useLocation } from '@/features/islamic/hooks/useLocation';
import { usePrayerLog } from '@/features/prayer/contexts/PrayerLogContext';
import { PRAYER_NAMES } from '@/features/prayer/constants';
import { formatPrayerTime, hasPrayerTimePassed, getPrayerStatusColor } from '@/features/prayer/helpers';
import { isToday, isFutureDate } from '@/common/utils/dateUtils';

const DailyPrayerTracker = () => {
  // Get the location and prayer times
  const { location } = useLocation();
  const { prayerTimes, isLoading: isPrayerTimesLoading } = usePrayerTimes(location);

  // Local loading state for individual prayer buttons
  const [loadingPrayer, setLoadingPrayer] = useState({});

  // Get prayer log hook from context
  const {
    currentDate,
    dailyStatus,
    loading,
    error,
    changeDate,
    togglePrayerStatus
  } = usePrayerLog();

  // Use isToday from common utils
  const isCurrentDateToday = isToday(currentDate);
  // Use isFutureDate from common utils (or context if preferred)
  // const isFutureDate = currentDate > new Date().setHours(0, 0, 0, 0); // Old calculation
  const isFuture = isFutureDate(currentDate); // Using the helper

  const handlePrevDay = () => changeDate(new Date(currentDate.setDate(currentDate.getDate() - 1)));
  const handleNextDay = () => changeDate(new Date(currentDate.setDate(currentDate.getDate() + 1)));
  const handleToday = () => changeDate(new Date());

  // Enhanced prayer logging with local loading state
  const handleLogPrayer = async (prayerName, status) => {
    // Set local loading state for this specific prayer
    setLoadingPrayer(prev => ({ ...prev, [prayerName]: true }));
    
    try {
      // Call the togglePrayerStatus function from the context
      await togglePrayerStatus(prayerName, status);
      
      console.log(`[DailyPrayerTracker] Successfully logged ${prayerName} as ${status}`);
    } catch (error) {
      console.error(`Error logging ${prayerName} as ${status}:`, error);
    } finally {
      // Clear loading state after operation completes
      setLoadingPrayer(prev => ({ ...prev, [prayerName]: false }));
    }
  };

  // Get status badge UI elements based on prayer status
  const getStatusBadge = (status) => {
    // Convert any case status to lowercase for comparison
    const statusLower = status?.toLowerCase();
    
    // Compare with lowercase values
    if (statusLower === 'completed') {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPrayerStatusColor('completed')}`}>
          <Check className="mr-1 h-3 w-3" />
          Completed
        </span>
      );
    } else if (statusLower === 'missed') {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPrayerStatusColor('missed')}`}>
          <X className="mr-1 h-3 w-3" />
          Missed
        </span>
      );
    } else if (statusLower === 'excused') {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPrayerStatusColor('excused')}`}>
          Excused
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPrayerStatusColor(null)}`}>
        Not Logged
      </span>
    );
  };

  if (error?.daily) {
    return (
      <div className="text-center p-4 text-red-500 dark:text-red-400">
        Error loading prayers: {error.daily}
      </div>
    );
  }

  return (
    <div className="prayer-tracker glass-card p-4 sm:p-5 rounded-lg shadow-md border border-emerald-300/20 bg-gradient-to-r from-emerald-50/10 to-blue-50/10 dark:from-emerald-950/20 dark:to-blue-950/20">
      {/* Header with date navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-2">
        <h2 className="text-lg font-semibold flex items-center text-emerald-700 dark:text-emerald-400">
          <Calendar size={18} className="mr-2" /> Daily Prayer Tracker
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handlePrevDay}
            aria-label="Previous day"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleToday}
            className={cn(
              "h-8 text-xs px-2",
              isCurrentDateToday && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            )}
          >
            {isCurrentDateToday ? "Today" : "Go to Today"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleNextDay}
            aria-label="Next day"
            disabled={isFuture} // Disable going to future dates
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Current date display */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="text-sm text-muted-foreground">
          {format(currentDate, 'EEEE')}
        </div>
        <div className="text-xl sm:text-2xl font-bold">
          {format(currentDate, 'MMMM d, yyyy')}
        </div>
        
        {isFuture && (
          <div className="mt-2 text-sm text-amber-600 dark:text-amber-400">
            Cannot track prayers for future dates
          </div>
        )}
      </div>

      {/* Prayer Cards */}
      {loading.daily || isPrayerTimesLoading ? (
        // Loading skeleton
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center p-3 rounded-lg bg-white/20 dark:bg-black/10">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {PRAYER_NAMES.map((prayer) => {
            const prayerHasPassed = hasPrayerTimePassed(prayer, prayerTimes);
            const isDisabled = isFuture || (isCurrentDateToday && !prayerHasPassed);
            const isPrayerLoading = loadingPrayer[prayer] || loading.action;
            
            return (
              <motion.div
                key={prayer}
                whileHover={{ scale: isDisabled ? 1.0 : 1.01 }}
                className={cn(
                  "flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg shadow-sm transition-all duration-200 gap-3",
                  isDisabled && "opacity-70",
                  dailyStatus[prayer]?.toLowerCase() === 'completed'
                    ? "bg-green-50 border border-green-100 dark:bg-green-900/20 dark:border-green-900/30"
                    : dailyStatus[prayer]?.toLowerCase() === 'missed'
                    ? "bg-red-50 border border-red-100 dark:bg-red-900/20 dark:border-red-900/30"
                    : "bg-white/50 border border-gray-100 dark:bg-gray-800/20 dark:border-gray-700/20 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                )}
              >
                <div className="flex items-center w-full sm:w-auto">
                  <div className="mr-3 p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <Clock className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className={cn("text-md sm:text-lg font-medium", prayerHasPassed && dailyStatus[prayer] === null && "text-muted-foreground")}>
                      {prayer}
                    </h3>
                    <p className="text-sm text-muted-foreground flex flex-wrap items-center">
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                        {formatPrayerTime(prayer, prayerTimes)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end w-full sm:w-auto gap-2 sm:gap-3">
                  <div className="w-full sm:w-auto sm:pr-3">{getStatusBadge(dailyStatus[prayer])}</div>
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
                    <Button
                      variant="default"
                      size="sm"
                      className={cn(
                        "flex-1 sm:flex-none justify-center",
                        dailyStatus[prayer]?.toLowerCase() === 'completed' 
                          ? "bg-green-600 hover:bg-green-700 text-white" 
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      )}
                      onClick={() => handleLogPrayer(prayer, 'completed')}
                      disabled={loading.action || isDisabled || isPrayerLoading}
                    >
                      {isPrayerLoading ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="mr-1 h-3 w-3" />
                      )}
                      {isDisabled ? (isCurrentDateToday ? "Not time yet" : "Future") : "Completed"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "flex-1 sm:flex-none justify-center",
                        dailyStatus[prayer]?.toLowerCase() === 'missed' 
                          ? "bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30" 
                          : "border-red-200 text-red-700 hover:bg-red-50 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-900/10"
                      )}
                      onClick={() => handleLogPrayer(prayer, 'missed')}
                      disabled={loading.action || isDisabled || isPrayerLoading}
                    >
                      {isPrayerLoading ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <X className="mr-1 h-3 w-3" />
                      )}
                      Missed
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DailyPrayerTracker; 