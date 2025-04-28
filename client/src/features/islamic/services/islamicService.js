// src/features/islamic/services/islamicService.js
// Service functions for the Islamic feature

import axios from 'axios';
import { fetchTimezone } from '../utils/locationUtils'; // Assuming fetchTimezone is needed here
import {
  timeStringToDate as baseTimeStringToDate,
  addMinutes,
} from "../utils/timeUtils";

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

/**
 * Fetches prayer times directly from Aladhan API and applies settings.
 * @param {Object} location - The location object with lat and lon.
 * @param {Object} settings - Prayer time calculation settings (calculationMethod, timeAdjustments, madhab).
 * @param {string} dateString - The date in YYYY-MM-DD format.
 * @returns {Promise<Object>} - Object with { success: boolean, data: timings | null, error: string | null }
 */
export const fetchAndProcessPrayerTimes = async (location, settings, dateString) => {
  const lat = location?.lat || 0;
  const lon = location?.lon || location?.lng || 0;

  if (lat === 0 && lon === 0) {
    return { success: false, data: null, error: "Invalid coordinates (lat=0, lon=0)" };
  }

  try {
    // Fetch timezone (optional, API might handle it based on coords)
    // let timezone;
    // try {
    //   timezone = await fetchTimezone(lat, lon);
    // } catch (tzError) {
    //   console.warn("Could not fetch timezone, proceeding without it:", tzError);
    // }

    let methodId = 4; // Muslim World League default
    if (settings?.calculationMethod === "standard") methodId = 2;
    else if (settings?.calculationMethod === "hanafi") methodId = 1;
    const madhab = settings?.madhab || 1; // Default to 1 (Shafi)

    const url = `https://api.aladhan.com/v1/timings/${dateString}?latitude=${lat}&longitude=${lon}&method=${methodId}&school=${madhab}`;
    const response = await axios.get(url);

    if (response.data && response.data.data && response.data.data.timings) {
      let timings = response.data.data.timings;

      // Apply time adjustments
      if (settings?.timeAdjustments) {
        Object.entries(settings.timeAdjustments).forEach(([prayer, minutes]) => {
          if (timings[prayer] && minutes !== 0) {
            try {
              // Ensure baseTimeStringToDate handles the format correctly
              const timeDate = baseTimeStringToDate(timings[prayer]);
              const adjustedTime = addMinutes(timeDate, minutes);
              // Assuming addMinutes returns HH:MM format or compatible
              timings[prayer] = adjustedTime; 
            } catch (e) {
              console.error(`Error adjusting time for ${prayer}: ${timings[prayer]}`, e);
            }
          }
        });
      }
      return { success: true, data: timings, error: null };
    } else {
      throw new Error("Invalid data format from Aladhan API");
    }
  } catch (apiError) {
    console.error("Error fetching/processing prayer times from Aladhan API:", apiError);
    return {
      success: false,
      data: null,
      error: apiError.message || "Could not fetch prayer times from Aladhan API",
    };
  }
}; 