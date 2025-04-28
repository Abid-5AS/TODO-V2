import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, HelpCircle } from 'lucide-react';
import { usePrayerLog } from '../contexts/PrayerLogContext';
import { Skeleton } from '../../../components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../components/ui/tooltip';

// Import new stat components
import CurrentStreakCard from './stats/CurrentStreakCard';
import LongestStreakCard from './stats/LongestStreakCard';
import TotalPrayersCard from './stats/TotalPrayersCard';
import ConsistencyScore from './stats/ConsistencyScore';
import StreakInfo from './stats/StreakInfo';

const PrayerStatsDisplay = () => {
  const { stats, loading, error, calendarData, lastUpdated /*, refreshAllData */ } = usePrayerLog();

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
          {/* Use Extracted Components */}
          <CurrentStreakCard 
            currentStreak={stats.currentStreak} 
            streakText={getStreakText()} 
            itemVariants={itemVariants} 
          />
          <LongestStreakCard 
            longestStreak={stats.longestStreak} 
            itemVariants={itemVariants} 
          />
          <TotalPrayersCard 
            totalPrayersLogged={stats.totalPrayersLogged} 
            itemVariants={itemVariants} 
          />
        </motion.div>
      )}

      {/* Use Extracted Components */} 
      {!loading.stats && <ConsistencyScore consistencyMetrics={consistencyMetrics} />}
      {!loading.stats && <StreakInfo currentStreak={stats.currentStreak} />}
    </div>
  );
};

export default React.memo(PrayerStatsDisplay); 