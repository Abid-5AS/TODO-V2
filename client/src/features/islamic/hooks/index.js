// src/features/islamic/hooks/index.js
// Export all Islamic hooks (excluding those moved to sub-features)

// export { default as useQuranTracker } from './useQuranTracker'; // Moved to quran/
export { default as useSettings } from './useSettings';
export { default as useLocation } from './useLocation';
export { default as usePrayerTimes } from './usePrayerTimes';
export { default as useIslamicDate } from './useIslamicDate';
export { default as useUserSettings } from './useUserSettings';
export { default as useLocationSearch } from './useLocationSearch'; // Added new hook