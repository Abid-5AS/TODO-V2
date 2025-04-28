import { useState, useCallback, useMemo } from 'react';
import { addMonths, startOfDay, isToday as dfnsIsToday, isAfter } from 'date-fns';

/**
 * Custom hook to manage the currently selected date for prayer tracking.
 * @param {Date} initialDate - The initial date to start with.
 * @returns {object} An object containing the current date and functions to modify it.
 */
export const usePrayerDateManager = (initialDate = new Date()) => {
  const [currentDate, setCurrentDate] = useState(startOfDay(new Date(initialDate)));

  // Memoize the current month and year for fetching monthly data
  const currentMonthYear = useMemo(() => {
    return { year: currentDate.getFullYear(), month: currentDate.getMonth() + 1 }; // 1-based month
  }, [currentDate]);

  // Check if the current date is today
  const isCurrentDateToday = useMemo(() => dfnsIsToday(currentDate), [currentDate]);
  
  // Check if the current date is in the future
  const isFutureDate = useMemo(() => isAfter(startOfDay(currentDate), startOfDay(new Date())), [currentDate]);

  // Function to change the current date
  const changeDate = useCallback((newDate) => {
    setCurrentDate(startOfDay(new Date(newDate)));
  }, []);

  // Function to change the current month
  const changeMonth = useCallback((increment) => {
    setCurrentDate(prevDate => addMonths(prevDate, increment));
  }, []);

  return {
    currentDate,
    changeDate,
    changeMonth,
    currentMonthYear,
    isCurrentDateToday,
    isFutureDate,
  };
};

export default usePrayerDateManager; 