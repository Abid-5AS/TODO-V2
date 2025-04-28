import React from 'react';
import { format } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DailyTrackerHeader = ({
  currentDate,
  isCurrentDateToday,
  isFuture,
  handlePrevDay,
  handleNextDay,
  handleToday,
}) => {
  return (
    <>
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
            disabled={isFuture} // Use isFuture prop
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
    </>
  );
};

export default DailyTrackerHeader; 