import React from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';

const LongestStreakCard = ({ longestStreak, itemVariants }) => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 dark:from-blue-950/40 dark:to-indigo-950/40 dark:border-blue-900/30"
      variants={itemVariants}
    >
      <div className="text-blue-500 dark:text-blue-400 mb-1 sm:mb-2">
        <Award size={28} />
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-300">
        {longestStreak}
      </div>
      <div className="text-sm text-blue-600 dark:text-blue-400 text-center mt-1">
        Longest Streak
      </div>
      <div className="text-xs text-blue-500/70 dark:text-blue-400/70 text-center mt-1">
        {longestStreak > 0 
          ? `Your personal best: ${longestStreak} consecutive day${longestStreak !== 1 ? 's' : ''}` 
          : 'Complete all prayers today to start your record!'}
      </div>
    </motion.div>
  );
};

export default LongestStreakCard; 