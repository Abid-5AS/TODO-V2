// Islamic date utility functions
import axios from "axios";

/**
 * Fetch Islamic date from API
 * @param {number} year - Gregorian year
 * @param {number} month - Gregorian month (1-12)
 * @param {number} day - Gregorian day
 * @returns {Promise<Object>} Islamic date object
 */
export const fetchIslamicDateFromApi = async (year, month, day) => {
  try {
    const response = await axios.get(
      `https://api.aladhan.com/v1/gToH/${day}-${month}-${year}`
    );

    if (response.data && response.data.data && response.data.data.hijri) {
      return response.data.data.hijri;
    }
    throw new Error("Invalid data format from Aladhan API");
  } catch (error) {
    console.error("Error fetching Islamic date:", error);
    throw error;
  }
};

/**
 * Get days until an Islamic date
 * @param {number} currentMonth - Current Islamic month (1-12)
 * @param {number} currentDay - Current Islamic day
 * @param {number} targetMonth - Target Islamic month (1-12)
 * @param {number} targetDay - Target Islamic day
 * @returns {number} Days until target date
 */
export const getDaysUntil = (
  currentMonth,
  currentDay,
  targetMonth,
  targetDay
) => {
  const islamicMonthDays = {
    1: 30,
    2: 29,
    3: 30,
    4: 29,
    5: 30,
    6: 29,
    7: 30,
    8: 29,
    9: 30,
    10: 29,
    11: 30,
    12: 29,
  };

  let daysLeft = 0;

  if (currentMonth === targetMonth) {
    daysLeft = targetDay - currentDay;
  } else {
    // Days left in current month
    daysLeft = islamicMonthDays[currentMonth] - currentDay;

    // Add days for months in between
    let monthCounter = (currentMonth % 12) + 1;
    while (monthCounter !== targetMonth) {
      daysLeft += islamicMonthDays[monthCounter];
      monthCounter = (monthCounter % 12) + 1;
    }

    // Add days in target month
    daysLeft += targetDay;
  }

  return daysLeft;
};

/**
 * Get upcoming Islamic events based on current Islamic date
 * @param {Object} hijri - Islamic date object from API
 * @returns {Array} Array of upcoming events
 */
export const getUpcomingEvents = (hijri) => {
  if (!hijri) return [];

  const upcomingEvents = [];
  const currentMonth = parseInt(hijri.month.number);
  const currentDay = parseInt(hijri.day);

  // Ramadan
  if (currentMonth < 9 || (currentMonth === 9 && currentDay < 1)) {
    const daysUntilRamadan =
      currentMonth < 9 ? getDaysUntil(currentMonth, currentDay, 9, 1) : 0;
    upcomingEvents.push({
      name: "Ramadan",
      date: "1 Ramadan",
      daysLeft: daysUntilRamadan,
    });
  }

  // Laylat al-Qadr (estimated on 27th Ramadan)
  if (currentMonth < 9 || (currentMonth === 9 && currentDay < 27)) {
    const daysUntilLaylat =
      currentMonth < 9
        ? getDaysUntil(currentMonth, currentDay, 9, 27)
        : 27 - currentDay;
    upcomingEvents.push({
      name: "Laylat al-Qadr",
      date: "27 Ramadan",
      daysLeft: daysUntilLaylat,
    });
  }

  // Eid al-Fitr
  if (currentMonth < 10 || (currentMonth === 10 && currentDay < 1)) {
    const daysUntilEidFitr =
      currentMonth < 10 ? getDaysUntil(currentMonth, currentDay, 10, 1) : 0;
    upcomingEvents.push({
      name: "Eid al-Fitr",
      date: "1 Shawwal",
      daysLeft: daysUntilEidFitr,
    });
  }

  // Eid al-Adha
  if (currentMonth < 12 || (currentMonth === 12 && currentDay < 10)) {
    const daysUntilEidAdha =
      currentMonth < 12
        ? getDaysUntil(currentMonth, currentDay, 12, 10)
        : 10 - currentDay;
    upcomingEvents.push({
      name: "Eid al-Adha",
      date: "10 Dhul-Hijjah",
      daysLeft: daysUntilEidAdha,
    });
  }

  // Hijri New Year
  if (currentMonth < 1 || (currentMonth === 1 && currentDay < 1)) {
    const daysUntilNewYear =
      currentMonth < 1 ? getDaysUntil(currentMonth, currentDay, 1, 1) : 0;
    upcomingEvents.push({
      name: "Islamic New Year",
      date: "1 Muharram",
      daysLeft: daysUntilNewYear,
    });
  } else {
    const daysUntilNextNewYear =
      getDaysUntil(currentMonth, currentDay, 1, 1) + 354;
    upcomingEvents.push({
      name: "Next Islamic New Year",
      date: "1 Muharram",
      daysLeft: daysUntilNextNewYear,
    });
  }

  // Sort by closest event
  return upcomingEvents.sort((a, b) => a.daysLeft - b.daysLeft);
};

/**
 * Format Islamic date object into display format
 * @param {Object} hijri - Islamic date object from API
 * @param {Date} today - Today's Gregorian date
 * @returns {Object} Formatted Islamic date object
 */
export const formatIslamicDate = (hijri, today = new Date()) => {
  if (!hijri) return null;

  // Get upcoming events
  const upcomingEvents = getUpcomingEvents(hijri);

  return {
    day: hijri.day,
    month: hijri.month.en,
    year: hijri.year,
    format: `${hijri.day} ${hijri.month.en} ${hijri.year} AH`,
    gregorian: `${today.getDate()} ${today.toLocaleString("default", {
      month: "long",
    })} ${today.getFullYear()}`,
    upcomingEvents: upcomingEvents.slice(0, 3), // Show only 3 closest events
  };
};
