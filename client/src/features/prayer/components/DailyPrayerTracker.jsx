import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePrayerTimes } from '@/features/islamic/hooks/usePrayerTimes';
import { useLocation } from '@/features/islamic/hooks/useLocation';
import { usePrayerLog } from '@/features/prayer/contexts/PrayerLogContext';
import { PRAYER_NAMES } from '@/features/prayer/constants';
import { formatPrayerTime, hasPrayerTimePassed } from '@/features/prayer/helpers';
import { isToday, isFutureDate } from '@/common/utils/dateUtils';
import DailyTrackerHeader from './DailyTrackerHeader';
import PrayerDayCard from './PrayerDayCard';

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

  if (error?.daily) {
    return (
      <div className="text-center p-4 text-red-500 dark:text-red-400">
        Error loading prayers: {error.daily}
      </div>
    );
  }

  return (
    <div className="prayer-tracker glass-card p-4 sm:p-5 rounded-lg shadow-md border border-emerald-300/20 bg-gradient-to-r from-emerald-50/10 to-blue-50/10 dark:from-emerald-950/20 dark:to-blue-950/20">
      {/* Use DailyTrackerHeader Component */}
      <DailyTrackerHeader 
        currentDate={currentDate}
        isCurrentDateToday={isCurrentDateToday}
        isFuture={isFuture}
        handlePrevDay={handlePrevDay}
        handleNextDay={handleNextDay}
        handleToday={handleToday}
      />

      {/* Prayer Cards List */}
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
            // Pass combined loading state for the specific prayer action
            const isPrayerLoading = loadingPrayer[prayer] || loading.action;
            
            return (
              <PrayerDayCard
                key={prayer} // Key remains on the mapped element
                prayerName={prayer}
                prayerTime={formatPrayerTime(prayer, prayerTimes)}
                prayerHasPassed={prayerHasPassed}
                status={dailyStatus[prayer]} // Pass the status directly
                isDisabled={isDisabled}
                isLoading={isPrayerLoading}
                handleLogPrayer={handleLogPrayer} // Pass the logging handler
                isCurrentDateToday={isCurrentDateToday}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DailyPrayerTracker; 