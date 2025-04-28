// src/features/islamic/index.js
// Export all Islamic feature components and hooks

export { default as DailyQuranVerse } from './components/DailyQuranVerse';
export { default as DailyOverviewSection } from './components/DailyOverviewSection';
export { default as ProhibitedTimesSection } from './components/ProhibitedTimesSection';
export { default as IslamicCalendarSection } from './components/IslamicCalendarSection';
export { default as HolidayCacheManager } from './components/HolidayCacheManager';
export { default as PrayerTimesSection } from './components/PrayerTimesSection';
export { default as DebugSection } from './components/DebugSection';
export { default as SettingsModal } from './components/SettingsModal';
export { default as LocationSelectionModal } from './components/LocationSelectionModal';

// Re-export hooks (these will be created next)
export { useIslamicDate } from './hooks/useIslamicDate';
export { usePrayerTimes } from './hooks/usePrayerTimes';
export { useSettings } from './hooks/useSettings'; 