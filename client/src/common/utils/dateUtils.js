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