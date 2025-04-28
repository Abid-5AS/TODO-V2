// src/features/prayer/hooks/prayerLogConstants.js

export const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export const initialDailyStatus = PRAYER_NAMES.reduce((acc, name) => {
  acc[name] = null; // null = not logged, 'Completed', 'Missed', 'Excused'
  return acc;
}, {});

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