// src/features/islamic/services/islamicService.js
// Service functions for the Islamic feature

import axios from 'axios';

/**
 * Fetches prayer times for a given location
 * @param {Object} location - The location object with lat and lng
 * @param {Object} settings - Prayer time calculation settings
 * @returns {Promise<Object>} - The prayer times data
 */
export const fetchPrayerTimes = async (location, settings) => {
  try {
    const response = await axios.get(`/api/prayer-times`, {
      params: {
        lat: location.lat,
        lng: location.lng,
        method: settings?.calculationMethod || 'mwl',
        adjustments: settings?.timeAdjustments
      }
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Fetches Islamic date information
 * @param {Object} location - The location object with lat and lng
 * @returns {Promise<Object>} - The Islamic date data
 */
export const fetchIslamicDate = async (location) => {
  try {
    const response = await axios.get(`/api/islamic-date`, {
      params: {
        lat: location.lat,
        lng: location.lng
      }
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error fetching Islamic date:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Saves user's prayer time settings
 * @param {Object} settings - The settings object
 * @returns {Promise<Object>} - The save result
 */
export const savePrayerSettings = async (settings) => {
  try {
    const response = await axios.post(`/api/prayer-settings`, settings);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error saving prayer settings:", error);
    return {
      success: false,
      error: error.message
    };
  }
}; 