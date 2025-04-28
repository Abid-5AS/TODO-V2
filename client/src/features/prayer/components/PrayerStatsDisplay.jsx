import React, { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Award, Percent, CheckCircle, BarChart2, Calendar, HelpCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import usePrayerLog from '../hooks/usePrayerLog.jsx';
import { Skeleton } from '../../../components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../components/ui/tooltip';

const PrayerStatsDisplay = () => {
  const { stats, loading, error, calendarData, lastUpdated, refreshAllData } = usePrayerLog();

  // Force refresh when component mounts or when prayers are updated
  useEffect(() => {
    if (lastUpdated) {
      console.log(`[PrayerStatsDisplay] lastUpdated changed: ${lastUpdated}`);
      
      // Use a small timeout to ensure the refresh happens after all state updates
      const refreshTimer = setTimeout(() => {
        console.log(`[PrayerStatsDisplay] Refreshing stats data`);
        refreshAllData();
      }, 150); // Slightly longer timeout than calendar to ensure sequential updates
      
      return () => clearTimeout(refreshTimer);
    }
  }, [lastUpdated, refreshAllData]);

  // Calculate consistency metrics
  const consistencyMetrics = useMemo(() => {
    if (!calendarData || Object.keys(calendarData).length === 0) {
      return {
        completionRate: 0,
        daysWithCompletePrayers: 0,
        totalDaysLogged: 0
      };
    }

    // Count days with all 5 prayers logged
    const daysWithCompletePrayers = Object.values(calendarData).filter(count => count >= 5).length;
    const totalDaysLogged = Object.keys(calendarData).length;
    
    // Calculate completion percentage (% of logged days with all 5 prayers)
    const perfectDayRate = totalDaysLogged > 0 
      ? Math.round((daysWithCompletePrayers / totalDaysLogged) * 100) 
      : 0;
    
    // Overall completion rate based on total prayers
    const completionRate = Math.min(
      100,
      stats.totalPrayersLogged > 0
        ? Math.round((stats.totalPrayersLogged / (stats.totalPrayersLogged + 50)) * 100)
        : 0
    );

    return {
      completionRate,
      perfectDayRate,
      daysWithCompletePrayers,
      totalDaysLogged
    };
  }, [calendarData, stats.totalPrayersLogged]);

  if (error?.stats) {
    return (
      <div className="text-center p-4 text-red-500 dark:text-red-400">
        Error loading stats: {error.stats}
      </div>
    );
  }

  // Animation variants for the stat cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  // Get streak text
  const getStreakText = () => {
    if (stats.currentStreak === 0) {
      return "Start a streak by completing all 5 prayers today!";
    } else if (stats.currentStreak === 1) {
      return "You've prayed all 5 prayers for 1 day. Keep going!";
    } else {
      return `${stats.currentStreak} consecutive days with all 5 prayers completed!`;
    }
  };

  return (
    <div className="prayer-stats glass-card p-4 sm:p-5 rounded-lg shadow-md border border-emerald-300/20 bg-gradient-to-r from-emerald-50/10 to-blue-50/10 dark:from-emerald-950/20 dark:to-blue-950/20">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-lg font-semibold flex items-center text-emerald-700 dark:text-emerald-400">
          <BarChart2 size={18} className="mr-2" /> Prayer Statistics
        </h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none">
                <HelpCircle size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="text-xs">
                Your streak counts days where you complete all 5 daily prayers.
                Missing even one prayer resets your streak. Yesterday counts if you haven't logged today yet.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {loading.stats ? (
        // Loading skeleton
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg bg-white/20 dark:bg-black/10">
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Current Streak */}
          <motion.div 
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100 dark:from-orange-950/40 dark:to-yellow-950/40 dark:border-orange-900/30"
            variants={itemVariants}
          >
            <div className="text-orange-500 dark:text-orange-400 mb-1 sm:mb-2">
              <Flame size={28} className={stats.currentStreak > 0 ? "animate-pulse" : ""} />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-orange-700 dark:text-orange-300">
              {stats.currentStreak}
            </div>
            <div className="text-sm text-orange-600 dark:text-orange-400 text-center mt-1">
              Current Streak
            </div>
            <div className="text-xs text-orange-500/70 dark:text-orange-400/70 text-center mt-1">
              {getStreakText()}
            </div>
          </motion.div>

          {/* Longest Streak */}
          <motion.div 
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 dark:from-blue-950/40 dark:to-indigo-950/40 dark:border-blue-900/30"
            variants={itemVariants}
          >
            <div className="text-blue-500 dark:text-blue-400 mb-1 sm:mb-2">
              <Award size={28} />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-300">
              {stats.longestStreak}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400 text-center mt-1">
              Longest Streak
            </div>
            <div className="text-xs text-blue-500/70 dark:text-blue-400/70 text-center mt-1">
              {stats.longestStreak > 0 
                ? `Your personal best: ${stats.longestStreak} consecutive day${stats.longestStreak !== 1 ? 's' : ''}` 
                : 'Complete all prayers today to start your record!'}
            </div>
          </motion.div>

          {/* Total Prayers Logged */}
          <motion.div 
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 dark:from-emerald-950/40 dark:to-green-950/40 dark:border-emerald-900/30 sm:col-span-2 lg:col-span-1"
            variants={itemVariants}
          >
            <div className="text-emerald-500 dark:text-emerald-400 mb-1 sm:mb-2">
              <CheckCircle size={28} />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-300">
              {stats.totalPrayersLogged}
            </div>
            <div className="text-sm text-emerald-600 dark:text-emerald-400 text-center mt-1">
              Total Prayers Logged
            </div>
            <div className="text-xs text-emerald-500/70 dark:text-emerald-400/70 text-center mt-1">
              {stats.totalPrayersLogged > 0 
                ? `${Math.floor(stats.totalPrayersLogged / 5)} days worth of prayers recorded` 
                : 'Start logging your prayers today!'}
            </div>
            {/* 
              Days worth of prayers = Total Completed Prayers ÷ 5
              This calculation divides the total number of completed prayers by 5 (since there are 5 prayers per day)
              to estimate how many "full days" of prayers have been recorded, regardless of which specific days they were logged on.
              Example: 17 completed prayers = 3.4 days = "3 days worth of prayers"
            */}
          </motion.div>
        </motion.div>
      )}

      {/* Completion Progress Bar */}
      {!loading.stats && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-100 dark:border-gray-800/50">
          <div className="flex flex-wrap justify-between items-center mb-2 gap-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <Percent size={16} className="mr-1 text-emerald-500 dark:text-emerald-400" />
              Consistency Score
            </span>
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {consistencyMetrics.completionRate}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 dark:from-emerald-500 dark:to-emerald-400",
              )}
              style={{ width: `${consistencyMetrics.completionRate}%` }}
            ></div>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            Based on your prayer logging activity
          </div>
          
          {consistencyMetrics.totalDaysLogged > 0 && (
            <div className="mt-3 flex flex-wrap justify-between items-center gap-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Perfect days: {consistencyMetrics.daysWithCompletePrayers} of {consistencyMetrics.totalDaysLogged} ({consistencyMetrics.perfectDayRate}%)
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none">
                      <HelpCircle size={12} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="text-xs">
                      Perfect days are days where you completed all 5 prayers.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      )}

      {/* Streak information */}
      {!loading.stats && stats.currentStreak > 0 && (
        <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
          <div className="flex items-start">
            <Calendar size={16} className="mr-2 mt-1 text-orange-500 dark:text-orange-400 flex-shrink-0" />
            <div className="text-xs text-orange-700 dark:text-orange-300">
              <span className="font-medium">Keep your streak alive!</span> Remember to complete all five prayers daily. Your streak counts days where you complete all prayers.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(PrayerStatsDisplay); 