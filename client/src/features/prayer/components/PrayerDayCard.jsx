import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Adjusted path
import { cn } from '@/lib/utils'; // Adjusted path
import { formatPrayerTime, getPrayerStatusColor } from '../helpers'; // Assuming helpers barrel file exists

const PrayerDayCard = ({
  prayerName,
  prayerTime, // Formatted time passed as prop
  prayerHasPassed,
  status, // completed, missed, or null
  isDisabled, // Combined disabled state
  isLoading, // Specific loading state for this card/action
  handleLogPrayer, // Function to call with prayerName and status ('completed' or 'missed')
  isCurrentDateToday // Needed for "Not time yet" text
}) => {

  // Get status badge UI elements based on prayer status
  // (Moved from DailyPrayerTracker, simplified)
  const getStatusBadge = (currentStatus) => {
    const statusLower = currentStatus?.toLowerCase();
    let badgeText = 'Not Logged';
    let icon = null;
    
    if (statusLower === 'completed') {
      badgeText = 'Completed';
      icon = <Check className="mr-1 h-3 w-3" />;
    } else if (statusLower === 'missed') {
      badgeText = 'Missed';
      icon = <X className="mr-1 h-3 w-3" />;
    } else if (statusLower === 'excused') {
      badgeText = 'Excused';
      // icon = <SomeIcon />; // Add if needed
    }

    return (
      <span className={cn(
        `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`,
        getPrayerStatusColor(statusLower) // Use helper for color classes
      )}>
        {icon}
        {badgeText}
      </span>
    );
  };

  // Log the values used for the 'Completed' button's disabled state
  if (prayerName === 'Fajr' || prayerName === 'Dhuhr') { // Only log for relevant prayers
    console.log(`[PrayerDayCard Render - ${prayerName}]`, {
      isLoading,
      isDisabled, // from parent DailyPrayerTracker
      isCurrentDateToday,
      prayerHasPassed,
      finalDisabledProp: isLoading || isDisabled || (isCurrentDateToday && !prayerHasPassed)
    });
  }

  return (
    <motion.div
      key={prayerName} // Key is managed by the parent map
      whileHover={{ scale: isDisabled ? 1.0 : 1.01 }}
      className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg shadow-sm transition-all duration-200 gap-3",
        isDisabled && "opacity-70",
        status?.toLowerCase() === 'completed'
          ? "bg-green-50 border border-green-100 dark:bg-green-900/20 dark:border-green-900/30"
          : status?.toLowerCase() === 'missed'
          ? "bg-red-50 border border-red-100 dark:bg-red-900/20 dark:border-red-900/30"
          : "bg-white/50 border border-gray-100 dark:bg-gray-800/20 dark:border-gray-700/20 hover:bg-gray-50 dark:hover:bg-gray-800/30"
      )}
    >
      {/* Prayer Name and Time */}
      <div className="flex items-center w-full sm:w-auto">
        <div className="mr-3 p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <Clock className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className={cn("text-md sm:text-lg font-medium", prayerHasPassed && status === null && "text-muted-foreground")}>
            {prayerName}
          </h3>
          <p className="text-sm text-muted-foreground flex flex-wrap items-center">
            <span className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
              {prayerTime}
            </span>
          </p>
        </div>
      </div>

      {/* Status Badge and Action Buttons */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end w-full sm:w-auto gap-2 sm:gap-3">
        <div className="w-full sm:w-auto sm:pr-3">{getStatusBadge(status)}</div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
          <Button
            variant="default"
            size="sm"
            className={cn(
              "flex-1 sm:flex-none justify-center",
              status === 'completed' 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            )}
            onClick={() => {
              // console.log('[PrayerDayCard] Completed Button Clicked!', { prayerName, isLoading, isDisabled });
              handleLogPrayer(prayerName, 'completed');
            }}
            // Disable if: loading, parent disabled (handles future/time not passed), OR already completed
            disabled={isLoading || isDisabled || status?.toLowerCase() === 'completed'}
          >
            {isLoading ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Check className="mr-1 h-3 w-3" />
            )}
            {/* Text updates based on isDisabled (parent) or if already completed */}
            {isDisabled 
              ? (isCurrentDateToday && !prayerHasPassed ? "Not time yet" : "Future") 
              : (status?.toLowerCase() === 'completed' ? "Completed" : "Mark Completed")} 
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "flex-1 sm:flex-none justify-center",
              status === 'missed' 
                ? "bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30" 
                : "border-red-200 text-red-700 hover:bg-red-50 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-900/10"
            )}
            onClick={() => handleLogPrayer(prayerName, 'missed')}
            // Disable if: loading, parent disabled (handles future/time not passed), OR already missed
            disabled={isLoading || isDisabled || status?.toLowerCase() === 'missed'}
          >
            {isLoading ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <X className="mr-1 h-3 w-3" />
            )}
            {/* Refined Text Logic: Show 'Missed' if status is missed, otherwise show 'Mark Missed' */}
            {status?.toLowerCase() === 'missed' ? "Missed" : "Mark Missed"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default PrayerDayCard; 