import { useState, useEffect } from "react";

/**
 * Custom hook for managing user settings with localStorage
 * @returns {Object} User settings and update functions
 */
export const useUserSettings = () => {
  const [settings, setSettings] = useState(() => {
    // Get settings from localStorage on initial load
    const savedSettings = localStorage.getItem("userSettings");
    return savedSettings ? JSON.parse(savedSettings) : {
      // Default settings
      calculationMethod: "mwl", // Muslim World League method by default
      timeAdjustments: {
        Fajr: 0,
        Sunrise: 0,
        Dhuhr: 0,
        Asr: 0,
        Maghrib: 0,
        Isha: 0
      },
      use12HourFormat: true,
      location: null
    };
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("userSettings", JSON.stringify(settings));
  }, [settings]);

  // Update calculation method
  const updateCalculationMethod = (method) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      calculationMethod: method
    }));
  };

  // Update time adjustments
  const updateTimeAdjustments = (adjustments) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      timeAdjustments: {
        ...prevSettings.timeAdjustments,
        ...adjustments
      }
    }));
  };

  // Update time format preference
  const updateTimeFormat = (use12Hour) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      use12HourFormat: use12Hour
    }));
  };

  // Update location
  const updateLocation = (location) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      location
    }));
  };

  return {
    settings,
    updateCalculationMethod,
    updateTimeAdjustments,
    updateTimeFormat,
    updateLocation
  };
}; 