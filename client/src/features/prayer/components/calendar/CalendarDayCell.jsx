import React from 'react';
import { format, isSameMonth, isToday } from 'date-fns';
import { Check, Sunrise, Sun, Sunset, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PRAYER_ICONS, PRAYER_COLORS } from '../../constants';
import { getHeatmapColor } from '../../helpers/prayerHelpers';

// Helper component map (can be shared if moved to a helper file)
const IconComponents = {
  Sunrise: <Sunrise size={16} />,
  Sun: <Sun size={16} />,
  Sunset: <Sunset size={16} />,
  Moon: <Moon size={16} />
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
                  const iconName = PRAYER_ICONS[prayer];
                  const IconComponent = IconComponents[iconName];
                  
                  // Handle Asr rotation
                  const iconElement = prayer === 'Asr' && iconName === 'Sun'
                    ? React.cloneElement(IconComponent, { className: "rotate-45" })
                    : IconComponent;

                  return (
                    <div 
                      key={prayer} 
                      className={cn(
                        "flex items-center gap-1 py-0.5",
                        isCompleted ? PRAYER_COLORS[prayer] : "text-gray-400 dark:text-gray-600"
                      )}
                    >
                      <span className="mr-1">{iconElement || <div style={{width: 16, height: 16}}></div>}</span>
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