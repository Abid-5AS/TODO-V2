// src/features/islamic/hooks/index.js
// Export all Islamic hooks (excluding those moved to sub-features)

// export { default as useQuranTracker } from './useQuranTracker'; // Moved to quran/
export { useSettings } from './useSettings';
export { useLocation } from './useLocation';
export { usePrayerTimes } from './usePrayerTimes';
export { useIslamicDate } from './useIslamicDate';
export { useUserSettings } from './useUserSettings';
export { useLocationSearch } from './useLocationSearch'; // Added new hook
export { useCurrentLocation } from './useCurrentLocation'; // Added export
export { useActivePrayerStatus } from './useActivePrayerStatus'; // Added export
export { useIslamicHolidays } from './useIslamicHolidays'; // Added export
export { useIslamicPageUIState } from './useIslamicPageUIState'; // Added export