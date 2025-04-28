import React from 'react';
import usePrayerLog from '../hooks/usePrayerLog.jsx';
import { Skeleton } from '../../../components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Sunrise, Sun, Sunset, Moon, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const PrayerTypeStats = () => {
  const { stats, loading, error } = usePrayerLog();

  if (error?.stats) {
    return (
      <div className="text-center p-4 text-red-500 dark:text-red-400">
        Error loading stats: {error.stats}
      </div>
    );
  }

  if (loading.stats) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Prayer Type Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Extract prayer stats
  const prayerStats = stats.prayerCompletionStats || {
    Fajr: 0,
    Dhuhr: 0,
    Asr: 0,
    Maghrib: 0,
    Isha: 0,
  };

  // Find the max value for scaling bars
  const maxValue = Math.max(...Object.values(prayerStats), 1);

  // Prayer type configuration
  const prayerTypes = [
    {
      name: 'Fajr',
      count: prayerStats.Fajr,
      icon: <Sunrise size={18} />,
      color: 'bg-amber-500/80 dark:bg-amber-600/80',
      textColor: 'text-amber-800 dark:text-amber-200',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      borderColor: 'border-amber-200 dark:border-amber-800',
    },
    {
      name: 'Dhuhr',
      count: prayerStats.Dhuhr,
      icon: <Sun size={18} />,
      color: 'bg-orange-500/80 dark:bg-orange-600/80',
      textColor: 'text-orange-800 dark:text-orange-200',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      borderColor: 'border-orange-200 dark:border-orange-800',
    },
    {
      name: 'Asr',
      count: prayerStats.Asr,
      icon: <Sun size={18} />,
      color: 'bg-yellow-500/80 dark:bg-yellow-600/80',
      textColor: 'text-yellow-800 dark:text-yellow-200',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
    },
    {
      name: 'Maghrib',
      count: prayerStats.Maghrib,
      icon: <Sunset size={18} />,
      color: 'bg-red-500/80 dark:bg-red-600/80',
      textColor: 'text-red-800 dark:text-red-200',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      borderColor: 'border-red-200 dark:border-red-800',
    },
    {
      name: 'Isha',
      count: prayerStats.Isha,
      icon: <Moon size={18} />,
      color: 'bg-indigo-500/80 dark:bg-indigo-600/80',
      textColor: 'text-indigo-800 dark:text-indigo-200',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
    },
  ];

  return (
    <Card className="w-full bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2">
          <Star className="h-5 w-5 text-blue-500" />
          Prayer Type Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {prayerTypes.map((prayer) => (
            <div key={prayer.name} className={`rounded-md p-2 ${prayer.bgColor} border ${prayer.borderColor}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`${prayer.textColor}`}>{prayer.icon}</span>
                  <span className={`font-medium ${prayer.textColor}`}>{prayer.name}</span>
                </div>
                <span className={`text-sm font-semibold ${prayer.textColor}`}>{prayer.count}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${prayer.color}`}
                  style={{ width: `${Math.max((prayer.count / maxValue) * 100, 3)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {stats.totalPrayersLogged > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
            Based on {stats.totalPrayersLogged} prayers logged across {stats.totalDaysLogged || 0} days
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrayerTypeStats; 