import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

const CurrentStreakCard = ({ currentStreak, streakText, itemVariants }) => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100 dark:from-orange-950/40 dark:to-yellow-950/40 dark:border-orange-900/30"
      variants={itemVariants}
    >
      <div className="text-orange-500 dark:text-orange-400 mb-1 sm:mb-2">
        <Flame size={28} className={currentStreak > 0 ? "animate-pulse" : ""} />
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-orange-700 dark:text-orange-300">
        {currentStreak}
      </div>
      <div className="text-sm text-orange-600 dark:text-orange-400 text-center mt-1">
        Current Streak
      </div>
      <div className="text-xs text-orange-500/70 dark:text-orange-400/70 text-center mt-1">
        {streakText}
      </div>
    </motion.div>
  );
};

export default CurrentStreakCard; 