import React from 'react';
import { Calendar } from 'lucide-react';

const StreakInfo = ({ currentStreak }) => {
  if (currentStreak <= 0) return null;

  return (
    <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
      <div className="flex items-start">
        <Calendar size={16} className="mr-2 mt-1 text-orange-500 dark:text-orange-400 flex-shrink-0" />
        <div className="text-xs text-orange-700 dark:text-orange-300">
          <span className="font-medium">Keep your streak alive!</span> Remember to complete all five prayers daily. Your streak counts days where you complete all prayers.
        </div>
      </div>
    </div>
  );
};

export default StreakInfo; 