import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { CalendarDaysIcon, ClockIcon, StarIcon } from 'lucide-react';
import { useIslamicDate } from '../../hooks/useIslamicDate';
import Spinner from '../../../../components/ui/spinner';
import HolidayCacheManager from './HolidayCacheManager';

function IslamicCalendarSection({ itemVariants }) {
  const { islamicDate, isLoading, error } = useIslamicDate();
  
  // Helper function to safely get values from potentially nested objects
  const safelyGetValue = (obj, defaultValue = '') => {
    if (!obj) return defaultValue;
    if (typeof obj === 'object' && obj.en) return obj.en;
    return obj;
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
        </div>
      );
    }

    return (
      <div className="flex flex-col space-y-4">
        {/* Current Islamic Date */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-slate-800">Islamic Date</h3>
          </div>
          <span className="text-md font-semibold bg-blue-100/40 backdrop-blur-sm text-blue-800 px-3 py-1 rounded">
            {islamicDate?.day} {safelyGetValue(islamicDate?.month)} {islamicDate?.year}H
          </span>
        </div>

        {/* Hijri and Gregorian Calendar */}
        <div className="flex items-center">
          <ClockIcon className="h-5 w-5 text-blue-500 mr-2" />
          <span className="text-slate-600">{islamicDate?.gregorian || "Today"}</span>
        </div>
        
        {/* Upcoming Events */}
        {islamicDate?.upcomingEvents && islamicDate.upcomingEvents.length > 0 && (
          <div className="mt-2">
            <h4 className="font-medium text-slate-800 mb-1">Upcoming Events</h4>
            <ul className="list-disc list-inside text-sm text-slate-600 pl-1">
              {islamicDate.upcomingEvents.slice(0, 3).map((event, idx) => (
                <li key={idx} className="mb-1">
                  {event.name} - {event.date}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Holidays */}
        {islamicDate?.holidays && islamicDate.holidays.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center mb-1">
              <StarIcon className="h-4 w-4 text-amber-500 mr-1" />
              <h4 className="font-medium text-slate-800">Islamic Holidays</h4>
            </div>
            <ul className="list-disc list-inside text-sm text-slate-600 pl-1">
              {islamicDate.holidays.slice(0, 2).map((holiday, idx) => (
                <li key={idx}>
                  {holiday.name} - {holiday.date}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Cache management (only visible in debug mode) */}
        <HolidayCacheManager />
      </div>
    );
  };

  return (
    <motion.div
      variants={itemVariants}
      className="glass-card p-5 rounded-lg shadow-md border border-blue-200/20 h-full"
    >
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Islamic Calendar</h2>
      {renderContent()}
    </motion.div>
  );
}

IslamicCalendarSection.propTypes = {
  itemVariants: PropTypes.object
};

export default IslamicCalendarSection;
