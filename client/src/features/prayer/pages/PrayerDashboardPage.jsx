import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import DailyPrayerTracker from '../components/DailyPrayerTracker';
import PrayerCalendarView from '../components/PrayerCalendarView';
import PrayerStatsDisplay from '../components/PrayerStatsDisplay';

// Animation variants for staggered entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
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

const PrayerDashboardPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold flex items-center justify-center text-emerald-700 dark:text-emerald-400">
          <Heart className="mr-2 h-8 w-8" />
          Prayer Tracker
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your daily prayers, build streaks, and enhance your spiritual journey
        </p>
      </div>

      {/* Dashboard Components */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Column: Daily Tracker and Stats */}
        <div className="flex flex-col gap-6">
          <motion.div variants={itemVariants}>
            <DailyPrayerTracker />
          </motion.div>
          <motion.div variants={itemVariants}>
            <PrayerStatsDisplay />
          </motion.div>
        </div>

        {/* Right Column: Calendar View */}
        <motion.div variants={itemVariants}>
          <PrayerCalendarView />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PrayerDashboardPage; 