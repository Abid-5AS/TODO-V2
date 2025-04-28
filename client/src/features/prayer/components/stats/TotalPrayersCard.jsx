import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const TotalPrayersCard = ({ totalPrayersLogged, itemVariants }) => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 dark:from-emerald-950/40 dark:to-green-950/40 dark:border-emerald-900/30 sm:col-span-2 lg:col-span-1"
      variants={itemVariants}
    >
      <div className="text-emerald-500 dark:text-emerald-400 mb-1 sm:mb-2">
        <CheckCircle size={28} />
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-300">
        {totalPrayersLogged}
      </div>
      <div className="text-sm text-emerald-600 dark:text-emerald-400 text-center mt-1">
        Total Prayers Logged
      </div>
      <div className="text-xs text-emerald-500/70 dark:text-emerald-400/70 text-center mt-1">
        {totalPrayersLogged > 0 
          ? `${Math.floor(totalPrayersLogged / 5)} days worth of prayers recorded` 
          : 'Start logging your prayers today!'}
      </div>
      {/* Optional: Keep the comment explaining the calculation or remove */}
      {/* 
        Days worth of prayers = Total Completed Prayers ÷ 5
        ...
      */}
    </motion.div>
  );
};

export default TotalPrayersCard; 