// Date helper functions for prayer feature

/**
 * Check if a date is in the future
 * @param {Date|string} date - The date to check
 * @returns {boolean} - True if date is in the future
 */
export const isFutureDate = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  
  // Reset time parts to compare only the date
  today.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);
  
  return checkDate > today;
};

/**
 * Check if a date is today
 * @param {Date|string} date - The date to check
 * @returns {boolean} - True if date is today
 */
export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  
  return (
    today.getDate() === checkDate.getDate() &&
    today.getMonth() === checkDate.getMonth() &&
    today.getFullYear() === checkDate.getFullYear()
  );
};

/**
 * Format a date as YYYY-MM-DD for API calls and lookups
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
export const formatDateKey = (date) => {
  if (!date) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}; 