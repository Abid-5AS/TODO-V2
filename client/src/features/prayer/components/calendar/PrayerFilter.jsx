import React from 'react';
import { Filter, Sunrise, Sun, Sunset, Moon } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; // Adjusted path
import { cn } from '@/lib/utils'; // Adjusted path

// Moved from PrayerCalendarView
const PRAYER_ICONS = {
  Fajr: <Sunrise size={16} />,
  Dhuhr: <Sun size={16} />,
  Asr: <Sun size={16} className="rotate-45" />,
  Maghrib: <Sunset size={16} />,
  Isha: <Moon size={16} />
};

// Moved from PrayerCalendarView
const PRAYER_COLORS = {
  Fajr: "text-amber-600 dark:text-amber-400",
  Dhuhr: "text-orange-600 dark:text-orange-400",
  Asr: "text-yellow-600 dark:text-yellow-400",
  Maghrib: "text-red-600 dark:text-red-400",
  Isha: "text-indigo-600 dark:text-indigo-400"
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
        {Object.keys(prayerTypeFilters).map(prayerName => (
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
              {PRAYER_ICONS[prayerName]}
            </span>
            {prayerName}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default PrayerFilter; 