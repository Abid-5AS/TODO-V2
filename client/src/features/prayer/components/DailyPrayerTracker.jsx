import React from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Check, X, Clock } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import { usePrayerLog } from '../hooks/usePrayerLog';
import { Skeleton } from '../../../components/ui/skeleton';

// Prayer time display information - would ideally come from prayer times API
const PRAYER_TIMES = {
  Fajr: '05:30 AM',
  Dhuhr: '12:30 PM',
  Asr: '03:45 PM',
  Maghrib: '06:30 PM',
  Isha: '08:00 PM',
};

// Prayer descriptions
const PRAYER_DESCRIPTIONS = {
  Fajr: 'Dawn Prayer',
  Dhuhr: 'Noon Prayer',
  Asr: 'Afternoon Prayer',
  Maghrib: 'Sunset Prayer',
  Isha: 'Night Prayer',
};

const DailyPrayerTracker = () => {
  const {
    currentDate,
    dailyStatus,
    loading,
    error,
    togglePrayerCompleted,
    changeDate,
    PRAYER_NAMES,
  } = usePrayerLog();

  const isToday = new Date().toDateString() === currentDate.toDateString();

  const handlePrevDay = () => changeDate(new Date(currentDate.setDate(currentDate.getDate() - 1)));
  const handleNextDay = () => changeDate(new Date(currentDate.setDate(currentDate.getDate() + 1)));
  const handleToday = () => changeDate(new Date());

  // Get status badge UI elements based on prayer status
  const getStatusBadge = (status) => {
    if (status === 'Completed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <Check className="mr-1 h-3 w-3" />
          Completed
        </span>
      );
    } else if (status === 'Missed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          <X className="mr-1 h-3 w-3" />
          Missed
        </span>
      );
    } else if (status === 'Excused') {
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
      </div>

      {/* Prayer Cards */}
      {loading.daily ? (
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
          {PRAYER_NAMES.map((prayer) => (
            <motion.div
              key={prayer}
              whileHover={{ scale: 1.01 }}
              className={cn(
                "flex flex-wrap md:flex-nowrap items-center justify-between p-3 rounded-lg shadow-sm transition-all duration-200",
                dailyStatus[prayer] === 'Completed'
                  ? "bg-green-50 border border-green-100 dark:bg-green-900/20 dark:border-green-900/30"
                  : dailyStatus[prayer] === 'Missed'
                  ? "bg-red-50 border border-red-100 dark:bg-red-900/20 dark:border-red-900/30"
                  : "bg-white/50 border border-gray-100 dark:bg-gray-800/20 dark:border-gray-700/20 hover:bg-gray-50 dark:hover:bg-gray-800/30"
              )}
            >
              <div className="flex items-center flex-1">
                <div className="mr-4 p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <Clock className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-medium">{prayer}</h3>
                  <p className="text-sm text-muted-foreground flex flex-wrap items-center">
                    <span className="mr-2">{PRAYER_DESCRIPTIONS[prayer]}</span>
                    {PRAYER_TIMES[prayer] && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                        {PRAYER_TIMES[prayer]}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-2 md:mt-0">
                <div className="pr-3">{getStatusBadge(dailyStatus[prayer])}</div>
                <Button
                  variant={dailyStatus[prayer] === 'Completed' ? "outline" : "default"}
                  size="sm"
                  className={cn(
                    dailyStatus[prayer] === 'Completed' 
                      ? "bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400 dark:bg-green-900/20 dark:hover:bg-green-900/30" 
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  )}
                  onClick={() => togglePrayerCompleted(prayer)}
                  disabled={loading.action}
                >
                  {dailyStatus[prayer] === 'Completed' ? 'Completed' : 'Mark as Completed'}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyPrayerTracker; 