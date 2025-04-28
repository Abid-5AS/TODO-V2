// Custom hook for managing Islamic dashboard settings
import { useState, useEffect, useCallback } from "react";

// Default settings
const defaultSettings = {
  calculationMethod: "MWL",
  madhab: "SHAFI",
  timeAdjustments: {
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  },
  timeFormat: "12h",
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
          JSON.stringify(defaultSettings)
        );
        return defaultSettings;
      }

      // Parse saved settings
      const parsedSettings = JSON.parse(savedSettings);

      // Ensure all required properties exist
      return {
        calculationMethod:
          parsedSettings.calculationMethod ||
          defaultSettings.calculationMethod,
        madhab: parsedSettings.madhab || defaultSettings.madhab,
        timeAdjustments: {
          ...defaultSettings.timeAdjustments,
          ...(parsedSettings.timeAdjustments || {}),
        },
        timeFormat: parsedSettings.timeFormat || defaultSettings.timeFormat,
      };
    } catch (error) {
      console.error("Error loading settings:", error);
      // If there was an error, use defaults and save them
      localStorage.setItem(
        "islamicDashboardSettings",
        JSON.stringify(defaultSettings)
      );
      return defaultSettings;
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
      timeFormat: use12Hour,
    }));
  }, []);

  // Reset settings to defaults
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    localStorage.setItem(
      "islamicDashboardSettings",
      JSON.stringify(defaultSettings)
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
