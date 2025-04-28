/**
 * Islamic feature constants
 */

// Prayer calculation methods
export const CALCULATION_METHODS = {
  STANDARD: {
    id: "standard",
    name: "Standard - ISNA (North America)",
    description: "Islamic Society of North America - Fajr: 15°, Isha: 15°",
    method: 2, // For API calls (aladhan.com)
  },
  HANAFI: {
    id: "hanafi",
    name: "Hanafi - Karachi (Pakistan, India, Bangladesh)",
    description: "University of Islamic Sciences, Karachi - Fajr: 18°, Isha: 18°",
    method: 1, // For API calls
  },
  MWL: {
    id: "mwl",
    name: "Muslim World League (Default on Google)",
    description: "Used in Europe, Far East - Fajr: 18°, Isha: 17°",
    method: 3, // For API calls
  },
};

// Prayer times that can be adjusted by user
export const ADJUSTABLE_PRAYERS = [
  "Fajr",
  "Sunrise", 
  "Dhuhr", 
  "Asr", 
  "Maghrib", 
  "Isha"
];

// Default prayer time adjustments (in minutes)
export const DEFAULT_PRAYER_ADJUSTMENTS = {
  Fajr: 0,
  Sunrise: 0,
  Dhuhr: 0,
  Asr: 0,
  Maghrib: 0,
  Isha: 0,
};

// Keys for local storage
export const STORAGE_KEYS = {
  PRAYER_ADJUSTMENTS: "prayer_time_adjustments",
  CALCULATION_METHOD: "prayer_calculation_method",
  TIME_FORMAT: "prayer_time_format",
  SAVED_LOCATIONS: "saved_prayer_locations",
  CURRENT_LOCATION: "current_prayer_location",
  LAST_PRAYER_TIMES: "last_prayer_times",
}; 