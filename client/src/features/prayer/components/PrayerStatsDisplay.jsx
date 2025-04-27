import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Award, Percent, CheckCircle, BarChart2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { usePrayerLog } from '../hooks/usePrayerLog';
import { Skeleton } from '../../../components/ui/skeleton';

const PrayerStatsDisplay = () => {
  const { stats, loading, error } = usePrayerLog();

  if (error?.stats) {
    return (
      <div className="text-center p-4 text-red-500 dark:text-red-400">
        Error loading stats: {error.stats}
      </div>
    );
  }

  // Calculate a rough completion percentage (could be more sophisticated)
  const completionRate = Math.min(
    100,
    stats.totalPrayersLogged > 0
      ? Math.round((stats.totalPrayersLogged / (stats.totalPrayersLogged + 50)) * 100)
      : 0
  );

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

  return (
    <div className="prayer-stats glass-card p-5 rounded-lg shadow-md border border-emerald-300/20 bg-gradient-to-r from-emerald-50/10 to-blue-50/10 dark:from-emerald-950/20 dark:to-blue-950/20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold flex items-center text-emerald-700 dark:text-emerald-400">
          <BarChart2 size={18} className="mr-2" /> Prayer Statistics
        </h2>
      </div>

      {loading.stats ? (
        // Loading skeleton
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg bg-white/20 dark:bg-black/10">
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Current Streak */}
          <motion.div 
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100 dark:from-orange-950/40 dark:to-yellow-950/40 dark:border-orange-900/30"
            variants={itemVariants}
          >
            <div className="text-orange-500 dark:text-orange-400 mb-2">
              <Flame size={32} />
            </div>
            <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">
              {stats.currentStreak}
            </div>
            <div className="text-sm text-orange-600 dark:text-orange-400 text-center mt-1">
              Current Streak
            </div>
            <div className="text-xs text-orange-500/70 dark:text-orange-400/70 text-center mt-1">
              {stats.currentStreak > 0 
                ? `${stats.currentStreak} consecutive day${stats.currentStreak !== 1 ? 's' : ''} with all prayers` 
                : 'Start a streak by completing all prayers today!'}
            </div>
          </motion.div>

          {/* Longest Streak */}
          <motion.div 
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 dark:from-blue-950/40 dark:to-indigo-950/40 dark:border-blue-900/30"
            variants={itemVariants}
          >
            <div className="text-blue-500 dark:text-blue-400 mb-2">
              <Award size={32} />
            </div>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
              {stats.longestStreak}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400 text-center mt-1">
              Longest Streak
            </div>
            <div className="text-xs text-blue-500/70 dark:text-blue-400/70 text-center mt-1">
              {stats.longestStreak > 0 
                ? `${stats.longestStreak} consecutive day${stats.longestStreak !== 1 ? 's' : ''} record` 
                : 'Complete all prayers today to start a streak!'}
            </div>
          </motion.div>

          {/* Completion Rate */}
          <motion.div 
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 dark:from-emerald-950/40 dark:to-green-950/40 dark:border-emerald-900/30"
            variants={itemVariants}
          >
            <div className="text-emerald-500 dark:text-emerald-400 mb-2">
              <CheckCircle size={32} />
            </div>
            <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
              {stats.totalPrayersLogged}
            </div>
            <div className="text-sm text-emerald-600 dark:text-emerald-400 text-center mt-1">
              Total Prayers Logged
            </div>
            <div className="text-xs text-emerald-500/70 dark:text-emerald-400/70 text-center mt-1">
              Keep up the great work!
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Completion Progress Bar */}
      {!loading.stats && (
        <div className="mt-6 p-4 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-100 dark:border-gray-800/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <Percent size={16} className="mr-1 text-emerald-500 dark:text-emerald-400" />
              Consistency Score
            </span>
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {completionRate}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 dark:from-emerald-500 dark:to-emerald-400",
              )}
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            Based on your prayer logging activity
          </div>
        </div>
      )}
    </div>
  );
};

export default PrayerStatsDisplay; 