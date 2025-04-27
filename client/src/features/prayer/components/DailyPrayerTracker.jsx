import React, { useContext, useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Check, X, Clock, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import { usePrayerLog } from '../hooks/usePrayerLog.jsx';
import { Skeleton } from '../../../components/ui/skeleton';
import { usePrayerTimes } from '../../dashboard/hooks/usePrayerTimes';
import { useLocation } from '../../dashboard/hooks/useLocation';

const DailyPrayerTracker = () => {
  // Get the location and prayer times
  const { location } = useLocation();
  const { prayerTimes, isLoading: isPrayerTimesLoading } = usePrayerTimes(location);

  // Local loading state for individual prayer buttons
  const [loadingPrayer, setLoadingPrayer] = useState({});

  // Get prayer log hook - Call without arguments to use context
  const {
    currentDate,
    dailyStatus, // This will now come from the provider
    loading,
    error,
    changeDate,
    PRAYER_NAMES,
    togglePrayerStatus // This will now come from the provider
  } = usePrayerLog(); // <-- Removed arguments

  const isToday = new Date().toDateString() === currentDate.toDateString();
  const isFutureDate = currentDate > new Date().setHours(0, 0, 0, 0);

  const handlePrevDay = () => changeDate(new Date(currentDate.setDate(currentDate.getDate() - 1)));
  const handleNextDay = () => changeDate(new Date(currentDate.setDate(currentDate.getDate() + 1)));
  const handleToday = () => changeDate(new Date());

  // Enhanced prayer logging with local loading state
  const handleLogPrayer = async (prayerName, status) => {
    // Set local loading state for this specific prayer
    setLoadingPrayer(prev => ({ ...prev, [prayerName]: true }));
    
    try {
      // Backend status is already in the correct format ('completed'/'missed')
      // Call the togglePrayerStatus function from the hook
      await togglePrayerStatus(prayerName, status);
      
      console.log(`[DailyPrayerTracker] Successfully logged ${prayerName} as ${status}`);
    } catch (error) {
      console.error(`Error logging ${prayerName} as ${status}:`, error);
    } finally {
      // Clear loading state after operation completes
      setLoadingPrayer(prev => ({ ...prev, [prayerName]: false }));
    }
  };

  // Helper to format prayer time for display
  const formatPrayerTime = (prayerName) => {
    if (!prayerTimes) return "--:--";
    
    // Try to get the prayer time in standard format (case sensitive)
    const time = prayerTimes[prayerName] || prayerTimes[prayerName.toLowerCase()];
    if (!time) return "--:--";
    
    // Format the time for display (12-hour format)
    try {
      const [hours, minutes] = time.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return time; // Fall back to original format if parsing fails
      
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      console.error("Error formatting prayer time:", error);
      return time; // Return original if formatting fails
    }
  };

  // Helper to check if a prayer time has already passed today
  const hasPrayerTimePassed = (prayerName) => {
    if (!prayerTimes || !isToday) return true; // Allow marking for past days
    
    const prayerTimeStr = prayerTimes[prayerName] || prayerTimes[prayerName.toLowerCase()];
    if (!prayerTimeStr || typeof prayerTimeStr !== 'string') return false;
    
    const [prayerHour, prayerMinute] = prayerTimeStr.split(':').map(Number);
    if (isNaN(prayerHour) || isNaN(prayerMinute)) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Compare times
    return (currentHour > prayerHour || 
           (currentHour === prayerHour && currentMinute >= prayerMinute));
  };

  // Get status badge UI elements based on prayer status
  const getStatusBadge = (status) => {
    // Convert lowercase backend status to UI capitalized format
    const displayStatus = status === 'completed' ? 'Completed' : 
                        status === 'missed' ? 'Missed' : 
                        status === 'excused' ? 'Excused' : null;
                        
    if (displayStatus === 'Completed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <Check className="mr-1 h-3 w-3" />
          Completed
        </span>
      );
    } else if (displayStatus === 'Missed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          <X className="mr-1 h-3 w-3" />
          Missed
        </span>
      );
    } else if (displayStatus === 'Excused') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          Excused
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
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
    <div className="prayer-tracker glass-card p-5 rounded-lg shadow-md border border-emerald-300/20 bg-gradient-to-r from-emerald-50/10 to-blue-50/10 dark:from-emerald-950/20 dark:to-blue-950/20">
      {/* Header with date navigation */}
      <div className="flex justify-between items-center mb-6">
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
              isToday && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            )}
          >
            {isToday ? "Today" : "Go to Today"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleNextDay}
            aria-label="Next day"
            disabled={isFutureDate} // Disable going to future dates
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Current date display */}
      <div className="text-center mb-6">
        <div className="text-sm text-muted-foreground">
          {format(currentDate, 'EEEE')}
        </div>
        <div className="text-2xl font-bold">
          {format(currentDate, 'MMMM d, yyyy')}
        </div>
        
        {isFutureDate && (
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
            const prayerHasPassed = hasPrayerTimePassed(prayer);
            const isDisabled = isFutureDate || (isToday && !prayerHasPassed);
            const isPrayerLoading = loadingPrayer[prayer] || loading.action;
            
            return (
              <motion.div
                key={prayer}
                whileHover={{ scale: isDisabled ? 1.0 : 1.01 }}
                className={cn(
                  "flex flex-wrap md:flex-nowrap items-center justify-between p-3 rounded-lg shadow-sm transition-all duration-200",
                  isDisabled && "opacity-70",
                  dailyStatus[prayer] === 'completed'
                    ? "bg-green-50 border border-green-100 dark:bg-green-900/20 dark:border-green-900/30"
                    : dailyStatus[prayer] === 'missed'
                    ? "bg-red-50 border border-red-100 dark:bg-red-900/20 dark:border-red-900/30"
                    : "bg-white/50 border border-gray-100 dark:bg-gray-800/20 dark:border-gray-700/20 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                )}
              >
                <div className="flex items-center flex-1">
                  <div className="mr-4 p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <Clock className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className={cn("text-lg font-medium", prayerHasPassed && dailyStatus[prayer] === null && "text-muted-foreground")}>
                          {prayer}
                        </h3>
                        <p className="text-sm text-muted-foreground flex flex-wrap items-center">
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                            {formatPrayerTime(prayer)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-2 md:mt-0">
                  <div className="pr-3">{getStatusBadge(dailyStatus[prayer])}</div>
                  <div className="flex space-x-2">
                    <Button
                      variant="default"
                      size="sm"
                      className={cn(
                        dailyStatus[prayer] === 'completed' 
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
                      {isDisabled ? (isToday ? "Not time yet" : "Future") : "Completed"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        dailyStatus[prayer] === 'missed' 
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