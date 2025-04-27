/**
 * Time utility functions for formatting and calculating time-related values
 */

/**
 * Format milliseconds into a HH:MM:SS string format
 * @param {number} timeDiff - Time difference in milliseconds
 * @returns {string|null} Formatted time string in HH:MM:SS format
 */
export const formatTimeToHHMMSS = (timeDiff) => {
  if (!timeDiff) return null;

  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * Convert HH:MM:SS format to human-readable format
 * @param {string} timeStr - Time string in HH:MM:SS format
 * @returns {string} Human-readable time format (e.g., "2h 30m" or "45m 20s")
 */
export const formatTimeHumanReadable = (timeStr) => {
  if (!timeStr || timeStr === "--:--:--") return "N/A";

  const [hours, minutes, seconds] = timeStr.split(":").map(Number);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Format time from 24-hour to 12-hour format
 * @param {string} time - Time in 24-hour format (HH:MM)
 * @returns {string} Time in 12-hour format with AM/PM
 */
export const formatTo12Hour = (time) => {
  if (!time || time === "--:--") return time;
  
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
}; 