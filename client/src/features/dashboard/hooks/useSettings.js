// Custom hook for managing Islamic dashboard settings
import { useState, useEffect, useCallback } from "react";

// Default settings object
const DEFAULT_SETTINGS = {
  calculationMethod: "mwl", // mwl (Muslim World League - Google default), standard (ISNA) or hanafi (Karachi)
  madhab: 1, // 1 for Hanafi, 2 for Shafi/Maliki/Hanbali
  timeAdjustments: {
    Fajr: 0,
    Sunrise: 0,
    Dhuhr: 0,
    Asr: 0,
    Maghrib: 0,
    Isha: 0,
  },
  use12HourFormat: true,
};

export const useSettings = () => {
  // Initialize settings from localStorage or use defaults
  const [settings, setSettings] = useState(() => {
    try {
      const savedSettings = localStorage.getItem("islamicDashboardSettings");

      if (!savedSettings) {
        // If no saved settings exist, use defaults and save them
        localStorage.setItem(
          "islamicDashboardSettings",
          JSON.stringify(DEFAULT_SETTINGS)
        );
        return DEFAULT_SETTINGS;
      }

      // Parse saved settings
      const parsedSettings = JSON.parse(savedSettings);

      // Ensure all required properties exist
      return {
        calculationMethod:
          parsedSettings.calculationMethod ||
          DEFAULT_SETTINGS.calculationMethod,
        madhab: parsedSettings.madhab || DEFAULT_SETTINGS.madhab,
        timeAdjustments: {
          ...DEFAULT_SETTINGS.timeAdjustments,
          ...(parsedSettings.timeAdjustments || {}),
        },
        use12HourFormat:
          parsedSettings.use12HourFormat !== undefined
            ? parsedSettings.use12HourFormat
            : DEFAULT_SETTINGS.use12HourFormat,
      };
    } catch (error) {
      console.error("Error loading settings:", error);
      // If there was an error, use defaults and save them
      localStorage.setItem(
        "islamicDashboardSettings",
        JSON.stringify(DEFAULT_SETTINGS)
      );
      return DEFAULT_SETTINGS;
    }
  });

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(
        "islamicDashboardSettings",
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error("Error saving settings to localStorage:", error);
    }
  }, [settings]);

  // Update calculation method
  const updateCalculationMethod = useCallback((method) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      calculationMethod: method,
    }));
  }, []);

  // Update madhab
  const updateMadhab = useCallback((madhab) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      madhab: madhab,
    }));
  }, []);

  // Update time adjustments
  const updateTimeAdjustments = useCallback((adjustments) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      timeAdjustments: {
        ...prevSettings.timeAdjustments,
        ...adjustments,
      },
    }));
  }, []);

  // Update time format
  const updateTimeFormat = useCallback((use12Hour) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      use12HourFormat: use12Hour,
    }));
  }, []);

  // Reset settings to defaults
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem(
      "islamicDashboardSettings",
      JSON.stringify(DEFAULT_SETTINGS)
    );
  }, []);

  return {
    settings,
    updateCalculationMethod,
    updateMadhab,
    updateTimeAdjustments,
    updateTimeFormat,
    resetSettings,
  };
};
