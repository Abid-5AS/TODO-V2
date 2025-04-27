import axiosInstance from '../../../api/axiosInstance'; // Corrected import path
import moment from 'moment';

const API_BASE = '/api/prayer-logs';

// Format date to YYYY-MM-DD string for API calls
const formatDateForAPI = (date) => moment(date).format('YYYY-MM-DD');

/**
 * Logs or updates the status of a specific prayer for a given date.
 * @param {Date | string} date - The date of the prayer (Date object or YYYY-MM-DD string).
 * @param {string} prayerName - The name of the prayer (e.g., 'Fajr').
 * @param {string} status - The status to set ('Completed', 'Missed', 'Excused').
 * @returns {Promise<object>} - The API response data.
 */
export const logOrUpdatePrayerAPI = async (date, prayerName, status = 'Completed') => {
  try {
    const prayer_date = formatDateForAPI(date);
    const response = await axiosInstance.post(`${API_BASE}/`, {
      prayer_date,
      prayer_name: prayerName,
      status,
    });
    return response.data; // Expecting { success: boolean, data: PrayerLog }
  } catch (error) {
    console.error('Error logging/updating prayer:', error.response?.data || error.message);
    // Return a consistent error format or re-throw
    return { success: false, message: error.response?.data?.message || 'Failed to update prayer status.' };
  }
};

/**
 * Fetches the status of all prayers for a specific date.
 * @param {Date | string} date - The date to fetch logs for (Date object or YYYY-MM-DD string).
 * @returns {Promise<object>} - The API response data containing daily statuses.
 */
export const getDailyLogsAPI = async (date) => {
  try {
    const dateString = formatDateForAPI(date);
    const response = await axiosInstance.get(`${API_BASE}/daily`, {
      params: { date: dateString },
    });
    return response.data; // Expecting { success: boolean, data: { Fajr: 'Completed' | null, ... } }
  } catch (error) {
    console.error('Error fetching daily prayer logs:', error.response?.data || error.message);
    return { success: false, data: {}, message: error.response?.data?.message || 'Failed to fetch daily logs.' };
  }
};

/**
 * Fetches the count of completed prayers for each day in a given month.
 * @param {number} year - The year.
 * @param {number} month - The month (1-12).
 * @returns {Promise<object>} - The API response data containing calendar counts.
 */
export const getMonthlyCalendarDataAPI = async (year, month) => {
  try {
    const monthString = `${year}-${String(month).padStart(2, '0')}`;
    const response = await axiosInstance.get(`${API_BASE}/calendar`, {
      params: { month: monthString },
    });
    return response.data; // Expecting { success: boolean, data: { 'YYYY-MM-DD': count, ... } }
  } catch (error) {
    console.error('Error fetching monthly calendar data:', error.response?.data || error.message);
    return { success: false, data: {}, message: error.response?.data?.message || 'Failed to fetch calendar data.' };
  }
};

/**
 * Fetches prayer statistics like streaks and total counts.
 * @returns {Promise<object>} - The API response data containing stats.
 */
export const getPrayerStatsAPI = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/stats`);
    return response.data; // Expecting { success: boolean, data: { currentStreak, longestStreak, ... } }
  } catch (error) {
    console.error('Error fetching prayer stats:', error.response?.data || error.message);
    return { success: false, data: {}, message: error.response?.data?.message || 'Failed to fetch prayer stats.' };
  }
}; 