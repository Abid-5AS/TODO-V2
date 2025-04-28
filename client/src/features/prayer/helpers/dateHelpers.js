// Date helper functions specific to prayer feature

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