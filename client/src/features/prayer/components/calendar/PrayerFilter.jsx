import React from 'react';
import { Filter, Sunrise, Sun, Sunset, Moon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PRAYER_ICONS, PRAYER_COLORS } from '../../constants';

// Helper component map to render icons based on string names
const IconComponents = {
  Sunrise: <Sunrise size={16} />,
  Sun: <Sun size={16} />,
  Sunset: <Sunset size={16} />,
  Moon: <Moon size={16} />
};

const PrayerFilter = ({ 
  prayerTypeFilters, 
  togglePrayerTypeFilter, 
  activeFilterCount 
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <Filter size={16} className="mr-2 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Prayer Type</span>
        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({activeFilterCount}/5 active)</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.keys(prayerTypeFilters).map(prayerName => {
          const iconName = PRAYER_ICONS[prayerName]; // Get the string name (e.g., 'Sunrise')
          const IconComponent = IconComponents[iconName]; // Get the component from the map
          
          // Handle potential rotation for Asr icon specifically
          const iconElement = prayerName === 'Asr' && iconName === 'Sun' 
            ? React.cloneElement(IconComponent, { className: "rotate-45" })
            : IconComponent;
            
          return (
            <Badge
              key={prayerName}
              variant={prayerTypeFilters[prayerName] ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-all",
                prayerTypeFilters[prayerName] && "bg-emerald-600 hover:bg-emerald-700"
              )}
              onClick={() => togglePrayerTypeFilter(prayerName)}
            >
              <span className={cn("mr-1", PRAYER_COLORS[prayerName])}>
                {iconElement || <div style={{width: 16, height: 16}}></div>} {/* Render the element or placeholder */} 
              </span>
              {prayerName}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};

export default PrayerFilter; 