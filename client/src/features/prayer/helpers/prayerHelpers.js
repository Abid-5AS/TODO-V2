import moment from 'moment';

// Helper functions related to prayer times and status

/**
 * Check if a prayer time has already passed for the current day
 * @param {string} prayerName - Name of the prayer (Fajr, Dhuhr, etc.)
 * @param {Object} prayerTimes - Object containing prayer times
 * @returns {boolean} - True if the prayer time has passed
 */
export const hasPrayerTimePassed = (prayerName, prayerTimes) => {
  if (!prayerTimes) return false;
  
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentMinutesSinceMidnight = currentHour * 60 + currentMinute;
  
  // Try to get the prayer time from the prayerTimes object
  const prayerTimeStr = prayerTimes[prayerName] || prayerTimes[prayerName.toLowerCase()];
  if (!prayerTimeStr || typeof prayerTimeStr !== 'string' || !prayerTimeStr.includes(':')) return false;
  
  // Convert prayer time to minutes since midnight
  const [prayerHour, prayerMinute] = prayerTimeStr.split(':').map(Number);
  if (isNaN(prayerHour) || isNaN(prayerMinute)) return false;
  
  const prayerMinutesSinceMidnight = prayerHour * 60 + prayerMinute;
  
  // Prayer time has passed if current time is later
  return currentMinutesSinceMidnight >= prayerMinutesSinceMidnight;
};

/**
 * Format prayer time for display in 12-hour format with AM/PM
 * @param {string} prayerName - Name of the prayer
 * @param {Object} prayerTimes - Object containing prayer times
 * @returns {string} - Formatted time string
 */
export const formatPrayerTime = (prayerName, prayerTimes) => {
  if (!prayerTimes) return "--:--";
  
  // Try to get the prayer time in standard format (case sensitive)
  const time = prayerTimes[prayerName] || prayerTimes[prayerName.toLowerCase()];
  if (!time) return "--:--";
  
  // Format the time for display (12-hour format)
  try {
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return time; // Fall back to original format if parsing fails
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error("Error formatting prayer time:", error);
    return time; // Return original if formatting fails
  }
};

/**
 * Get calculation method name for display
 * @param {string} method - Calculation method code
 * @returns {string} - Human-readable method name
 */
export const getPrayerCalculationMethodName = (method) => {
  const methods = {
    'MWL': 'Muslim World League',
    'ISNA': 'Islamic Society of North America',
    'Egypt': 'Egyptian General Authority of Survey',
    'Makkah': 'Umm al-Qura University, Makkah',
    'Karachi': 'University of Islamic Sciences, Karachi',
    'Tehran': 'Institute of Geophysics, University of Tehran',
    'Jafari': 'Shia Ithna Ashari, Leva Research Institute, Qum'
  };
  
  return methods[method] || method;
};

/**
 * Get color classes for prayer status badges
 * @param {string} status - Prayer status (completed, missed, etc.)
 * @returns {string} - Tailwind CSS classes
 */
export const getPrayerStatusColor = (status) => {
  // Convert any case status to lowercase for comparison
  const statusLower = status?.toLowerCase();
  
  switch(statusLower) {
    case 'completed':
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case 'missed':
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    case 'excused':
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
}; 