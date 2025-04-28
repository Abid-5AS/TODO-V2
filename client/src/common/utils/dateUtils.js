/**
 * Common date utility functions used across features
 */

/**
 * Gets today's date in YYYY-MM-DD format.
 * @returns {string} Today's date string.
 */
export const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}; 

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

// Add other common date utils here as needed 