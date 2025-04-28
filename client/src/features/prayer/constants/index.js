// Prayer constants

// Prayer names
export const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// Auto-refresh interval in milliseconds
export const AUTO_REFRESH_INTERVAL = 60000; // 1 minute

// Initial empty prayer status
export const initialDailyStatus = PRAYER_NAMES.reduce((acc, name) => {
  acc[name] = null; // null = not logged, 'Completed', 'Missed', 'Excused'
  return acc;
}, {});

// Initial stats object
export const initialStats = {
  currentStreak: 0,
  longestStreak: 0,
  totalPrayersLogged: 0,
  totalDaysLogged: 0,
  daysWithAllPrayers: 0,
  perfectDayPercentage: 0,
  prayerCompletionStats: {
    Fajr: 0,
    Dhuhr: 0,
    Asr: 0,
    Maghrib: 0,
    Isha: 0
  }
};

// Prayer status types
export const PRAYER_STATUS = {
  COMPLETED: 'completed',
  MISSED: 'missed',
  EXCUSED: 'excused',
  NOT_LOGGED: null
};

// --- Icons and Colors Section --- 
// Removed React import and specific icons from lucide-react

// Prayer icons as strings (to be mapped to components where used)
export const PRAYER_ICONS = {
  Fajr: 'Sunrise',
  Dhuhr: 'Sun', 
  Asr: 'Sun', // Component using this might apply rotation based on name
  Maghrib: 'Sunset',
  Isha: 'Moon'
};

// Prayer colors 
export const PRAYER_COLORS = {
  Fajr: "text-amber-600 dark:text-amber-400",
  Dhuhr: "text-orange-600 dark:text-orange-400",
  Asr: "text-yellow-600 dark:text-yellow-400",
  Maghrib: "text-red-600 dark:text-red-400",
  Isha: "text-indigo-600 dark:text-indigo-400"
}; 

// Removed old string-based PRAYER_ICONS definition
/*
export const PRAYER_ICONS = {
  Fajr: 'Sunrise',
  Dhuhr: 'Sun', 
  Asr: 'Sun', // Usually shown with rotation
  Maghrib: 'Sunset',
  Isha: 'Moon'
};
*/ 