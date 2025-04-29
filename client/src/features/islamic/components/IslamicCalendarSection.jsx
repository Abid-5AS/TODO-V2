import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { CalendarDaysIcon, ClockIcon, StarIcon, RefreshCw } from 'lucide-react';
import { useIslamicDate } from '@/features/islamic/hooks/useIslamicDate';
import Spinner from '@/components/ui/spinner';
import { toast } from 'sonner';

function IslamicCalendarSection({ itemVariants, isLoading: externalLoading }) {
  const { islamicDate, isLoading: hookLoading, error, refreshIslamicDate } = useIslamicDate();
  
  // Combine loading states
  const isLoading = externalLoading || hookLoading;
  
  // Helper function to safely get values from potentially nested objects
  const safelyGetValue = (obj, defaultValue = '') => {
    if (!obj) return defaultValue;
    if (typeof obj === 'object' && obj.en) return obj.en;
    return obj;
  };

  const handleRefresh = () => {
    toast.info("Refreshing Islamic calendar data...");
    refreshIslamicDate();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-48">
          <Spinner size="md" color="blue" />
          <p className="text-blue-500 mt-2">Loading Islamic calendar...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-500 py-4">
          <p>Error loading Islamic calendar</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={handleRefresh}
            className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm flex items-center mx-auto"
          >
            <RefreshCw size={12} className="mr-1" /> Refresh
          </button>
        </div>
      );
    }

    const hasHolidays = islamicDate?.holidays && islamicDate.holidays.length > 0;

    return (
      <div className="flex flex-col space-y-4">
        {/* Current Islamic Date */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Islamic Date</h3>
          </div>
          <span className="text-md font-semibold bg-blue-100/40 backdrop-blur-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded">
            {islamicDate?.day} {safelyGetValue(islamicDate?.month)} {islamicDate?.year}H
          </span>
        </div>

        {/* Hijri and Gregorian Calendar */}
        <div className="flex items-center">
          <ClockIcon className="h-5 w-5 text-blue-500 mr-2" />
          <span className="text-slate-600 dark:text-slate-300">{islamicDate?.gregorianDateFormatted || "Today"}</span>
        </div>

        {/* Upcoming Events */}
        {islamicDate?.upcomingEvents && islamicDate.upcomingEvents.length > 0 && (
          <div className="mt-2">
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1">Upcoming Events</h4>
            <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 pl-1">
              {islamicDate.upcomingEvents.slice(0, 3).map((event, idx) => (
                <li key={idx} className="mb-1">
                  {event.name} - {event.hijriDate} ({event.gregorianDate})
                  {event.daysRemaining !== undefined && (
                    <span className="text-xs ml-2 text-blue-500">
                      {event.daysRemaining === 0 ? 
                        'today' : 
                        `in ~${event.daysRemaining} days`}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Holidays */}
        <div className="mt-2">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <StarIcon className="h-4 w-4 text-amber-500 mr-1" />
              <h4 className="font-medium text-slate-800 dark:text-slate-200">Islamic Holidays</h4>
            </div>
            <button 
              onClick={handleRefresh}
              className="p-1 rounded hover:bg-blue-100/50 text-blue-600"
              title="Refresh calendar data"
            >
              <RefreshCw size={14} />
            </button>
          </div>
          
          {hasHolidays ? (
            <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 pl-1">
              {islamicDate.holidays.slice(0, 3).map((holiday, idx) => (
                <li key={idx} className="mb-1">
                  {holiday.name} - {holiday.hijriDate} ({holiday.gregorianDate})
                </li>
              ))}
              {islamicDate.holidays.length > 3 && (
                <li className="text-xs text-slate-500 italic">
                  +{islamicDate.holidays.length - 3} more holidays
                </li>
              )}
            </ul>
          ) : (
            <div className="text-amber-500 text-sm p-2 bg-amber-50/50 dark:bg-amber-900/20 rounded">
              No holidays found. 
              <button 
                onClick={handleRefresh} 
                className="ml-2 underline text-blue-500"
              >
                Refresh data
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      variants={itemVariants}
      className="glass-card p-5 rounded-lg shadow-md border border-blue-200/20 h-full"
    >
      <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Islamic Calendar</h2>
      {renderContent()}
    </motion.div>
  );
}

IslamicCalendarSection.propTypes = {
  itemVariants: PropTypes.object,
  isLoading: PropTypes.bool
};

export default IslamicCalendarSection;
 