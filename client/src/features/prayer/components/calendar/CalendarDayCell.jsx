import React from 'react';
import { format, isSameMonth, isToday } from 'date-fns';
import { Sunrise, Sun, Sunset, Moon, Check } from 'lucide-react'; // Added icons needed for tooltip
import { cn } from '@/lib/utils'; // Adjusted path
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Adjusted path

// Constants defined here for self-containment or passed as props
const PRAYER_ICONS = {
  Fajr: <Sunrise size={16} />,
  Dhuhr: <Sun size={16} />,
  Asr: <Sun size={16} className="rotate-45" />,
  Maghrib: <Sunset size={16} />,
  Isha: <Moon size={16} />
};

const PRAYER_COLORS = {
  Fajr: "text-amber-600 dark:text-amber-400",
  Dhuhr: "text-orange-600 dark:text-orange-400",
  Asr: "text-yellow-600 dark:text-yellow-400",
  Maghrib: "text-red-600 dark:text-red-400",
  Isha: "text-indigo-600 dark:text-indigo-400"
};

// Define color gradients for prayer count (copied from parent)
const getHeatmapColor = (count, isDarkMode = false) => {
  if (!count) return isDarkMode ? 'bg-gray-800' : 'bg-gray-100';
  const lightColors = { 1: 'bg-green-100', 2: 'bg-green-200', 3: 'bg-green-300', 4: 'bg-green-400', 5: 'bg-green-500' };
  const darkColors = { 1: 'bg-green-900/30', 2: 'bg-green-800/40', 3: 'bg-green-700/50', 4: 'bg-green-600/60', 5: 'bg-green-500/70' };
  const normalizedCount = Math.min(count, 5);
  return isDarkMode ? darkColors[normalizedCount] : lightColors[normalizedCount];
};

const CalendarDayCell = ({ 
  day, 
  prayerCount, 
  detailedDataForDay, 
  isCurrentMonth, 
  isCurrentDay, 
  isDarkMode 
}) => {

  if (!day) {
    // Render empty cell for days outside the month grid start/end
    return <div className="h-12 rounded-md" />;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "h-12 flex flex-col items-center justify-center rounded-md transition-colors",
              getHeatmapColor(prayerCount, isDarkMode),
              !isCurrentMonth && "opacity-40",
              isCurrentDay && "ring-2 ring-emerald-500 dark:ring-emerald-400"
            )}
          >
            <div className={cn(
              "text-sm font-medium",
              prayerCount >= 4 ? "text-white dark:text-white" : "text-gray-700 dark:text-gray-300"
            )}>
              {format(day, 'd')}
            </div>
            {prayerCount > 0 && (
              <div className={cn(
                "text-xs",
                prayerCount >= 4 ? "text-white/80 dark:text-white/80" : "text-gray-500 dark:text-gray-400"
              )}>
                {prayerCount}/5
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <div className="text-xs p-1">
            <div className="font-semibold mb-1">{format(day, 'MMMM d, yyyy')}</div>
            <div className="mb-1">{prayerCount} prayer{prayerCount !== 1 ? 's' : ''} completed</div>
            
            {/* Display detailed prayers if available */}
            {prayerCount > 0 && (
              <div className="pt-1 border-t border-gray-200 dark:border-gray-700">
                {Object.keys(PRAYER_ICONS).map(prayer => {
                  const isCompleted = detailedDataForDay && detailedDataForDay[prayer];
                  
                  return (
                    <div 
                      key={prayer} 
                      className={cn(
                        "flex items-center gap-1 py-0.5",
                        isCompleted ? PRAYER_COLORS[prayer] : "text-gray-400 dark:text-gray-600"
                      )}
                    >
                      <span className="mr-1">{PRAYER_ICONS[prayer]}</span>
                      <span>{prayer}</span>
                      {isCompleted && (
                        <span className="ml-auto">
                          <Check size={12} />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CalendarDayCell; 