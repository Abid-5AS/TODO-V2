import React from 'react';
import { Percent, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Adjusted path
import { cn } from '@/lib/utils'; // Adjusted path

const ConsistencyScore = ({ consistencyMetrics }) => {
  if (!consistencyMetrics) return null; // Or render a placeholder

  return (
    <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-100 dark:border-gray-800/50">
      <div className="flex flex-wrap justify-between items-center mb-2 gap-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
          <Percent size={16} className="mr-1 text-emerald-500 dark:text-emerald-400" />
          Consistency Score
        </span>
        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          {consistencyMetrics.perfectDayRate}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={cn(
            "h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 dark:from-emerald-500 dark:to-emerald-400",
          )}
          style={{ width: `${consistencyMetrics.perfectDayRate}%` }}
        ></div>
      </div>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        Percentage of tracked days with all 5 prayers completed
      </div>
      
      {consistencyMetrics.totalDaysLogged > 0 && (
        <div className="mt-3 flex flex-wrap justify-between items-center gap-1">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Perfect days: {consistencyMetrics.daysWithCompletePrayers} of {consistencyMetrics.totalDaysLogged} tracked
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
  );
};

export default ConsistencyScore; 