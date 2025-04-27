// Time-related utility functions for Islamic dashboard

/**
 * Convert time string to Date object
 * @param {string} timeString - Time in format "HH:MM"
 * @param {Date} baseDate - Base date to use for the time
 * @returns {Date} Date object
 */
export const timeStringToDate = (timeString, baseDate = new Date()) => {
  if (!timeString) return null;

  const [hours, minutes] = timeString.split(":").map(Number);
  // Use provided date as the base for consistency
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);

  return date;
};

/**
 * Add minutes to a time string
 * @param {string|Date} timeString - Time string or Date object
 * @param {number} minutes - Minutes to add
 * @returns {string} Time string in format "HH:MM"
 */
export const addMinutes = (timeString, minutes) => {
  if (!timeString) return null;

  const date =
    typeof timeString === "string"
      ? timeStringToDate(timeString)
      : new Date(timeString);

  date.setMinutes(date.getMinutes() + minutes);

  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

/**
 * Subtract minutes from a time string
 * @param {string|Date} timeString - Time string or Date object
 * @param {number} minutes - Minutes to subtract
 * @returns {string} Time string in format "HH:MM"
 */
export const subtractMinutes = (timeString, minutes) => {
  return addMinutes(timeString, -minutes);
};

/**
 * Format time to 12-hour format
 * @param {string} timeString - Time string in format "HH:MM"
 * @param {boolean} use12HourFormat - Whether to use 12-hour format
 * @returns {string} Formatted time string
 */
export const formatTo12Hour = (timeString, use12HourFormat = true) => {
  if (!timeString || timeString === "--:--") return timeString || "--:--";
  if (!use12HourFormat) return timeString;

  try {
    const [hours, minutes] = timeString.split(":").map(Number);

    // Validate hours and minutes are valid numbers
    if (isNaN(hours) || isNaN(minutes)) {
      return timeString;
    }

    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;

    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
  } catch (error) {
    console.error("Error formatting time:", error);
    return timeString || "--:--";
  }
};

/**
 * Check if current time is between two times
 * @param {Date} currentTime - Current time
 * @param {Date} startTime - Start time
 * @param {Date} endTime - End time
 * @returns {boolean} Whether current time is between start and end
 */
export const isTimeBetween = (currentTime, startTime, endTime) => {
  return currentTime >= startTime && currentTime < endTime;
};

/**
 * Get time difference between two Date objects
 * @param {Date} start - Start time
 * @param {Date} end - End time
 * @returns {Object} Object with hours and minutes
 */
export const getTimeDifference = (start, end) => {
  const diff = Math.max(0, end - start);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes };
};

/**
 * Calculate fallback prayer times when API fails
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @returns {Object} Object containing prayer times
 */
export const calculateFallbackPrayerTimes = (latitude, longitude) => {
  // Use a simplified calculation based on latitude and season
  const today = new Date();
  const month = today.getMonth() + 1;
  const isSummer = month >= 4 && month <= 9;

  // Format time helper function
  const formatTime = (hours, minutes) => {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };

  // Base times (these will be adjusted)
  let fajrHour,
    sunriseHour,
    sunriseMinute,
    dhuhrHour,
    dhuhrMinute,
    asrHour,
    asrMinute,
    maghribHour,
    ishaHour,
    ishaMinute;

  // Latitude-based adjustments
  if (Math.abs(latitude) > 45) {
    // High latitude (shorter days in winter, longer in summer)
    if (isSummer) {
      fajrHour = 3;
      fajrMinute = 30;
      sunriseHour = 5;
      sunriseMinute = 0;
      dhuhrHour = 12;
      dhuhrMinute = 30;
      asrHour = 16;
      asrMinute = 30;
      maghribHour = 20;
      maghribMinute = 0;
      ishaHour = 22;
      ishaMinute = 0;
    } else {
      fajrHour = 5;
      fajrMinute = 30;
      sunriseHour = 7;
      sunriseMinute = 0;
      dhuhrHour = 12;
      dhuhrMinute = 0;
      asrHour = 14;
      asrMinute = 30;
      maghribHour = 16;
      maghribMinute = 30;
      ishaHour = 18;
      ishaMinute = 0;
    }
  } else if (Math.abs(latitude) > 30) {
    // Mid latitude
    if (isSummer) {
      fajrHour = 4;
      fajrMinute = 0;
      sunriseHour = 5;
      sunriseMinute = 30;
      dhuhrHour = 12;
      dhuhrMinute = 15;
      asrHour = 16;
      asrMinute = 0;
      maghribHour = 19;
      maghribMinute = 30;
      ishaHour = 21;
      ishaMinute = 0;
    } else {
      fajrHour = 5;
      fajrMinute = 0;
      sunriseHour = 6;
      sunriseMinute = 30;
      dhuhrHour = 12;
      dhuhrMinute = 0;
      asrHour = 15;
      asrMinute = 0;
      maghribHour = 17;
      maghribMinute = 30;
      ishaHour = 19;
      ishaMinute = 0;
    }
  } else {
    // Low latitude (equatorial regions)
    if (isSummer) {
      fajrHour = 4;
      fajrMinute = 30;
      sunriseHour = 5;
      sunriseMinute = 45;
      dhuhrHour = 12;
      dhuhrMinute = 15;
      asrHour = 15;
      asrMinute = 45;
      maghribHour = 18;
      maghribMinute = 45;
      ishaHour = 20;
      ishaMinute = 0;
    } else {
      fajrHour = 4;
      fajrMinute = 45;
      sunriseHour = 6;
      sunriseMinute = 0;
      dhuhrHour = 12;
      dhuhrMinute = 0;
      asrHour = 15;
      asrMinute = 30;
      maghribHour = 18;
      maghribMinute = 0;
      ishaHour = 19;
      ishaMinute = 15;
    }
  }

  const fajrTime = formatTime(fajrHour, fajrMinute);
  const sunriseTime = formatTime(sunriseHour, sunriseMinute);
  const dhuhrTime = formatTime(dhuhrHour, dhuhrMinute);
  const asrTime = formatTime(asrHour, asrMinute);
  const maghribTime = formatTime(maghribHour, maghribMinute || 0);
  const ishaTime = formatTime(ishaHour, ishaMinute);

  // Calculate sunset (just before maghrib)
  const sunsetTime = subtractMinutes(maghribTime, 3);

  // Calculate midnight (halfway between maghrib and fajr)
  const maghribDate = timeStringToDate(maghribTime);
  const fajrDate = timeStringToDate(fajrTime);
  let midnightDate;

  if (fajrDate < maghribDate) {
    // Add a day to fajr time for correct calculation
    fajrDate.setDate(fajrDate.getDate() + 1);
  }

  const midpointMs =
    maghribDate.getTime() + (fajrDate.getTime() - maghribDate.getTime()) / 2;
  midnightDate = new Date(midpointMs);
  const midnightTime = formatTime(
    midnightDate.getHours(),
    midnightDate.getMinutes()
  );

  // Calculate Imsak (typically 10 minutes before Fajr)
  const imsakTime = subtractMinutes(fajrTime, 10);

  // Calculate first third and last third of night
  const nightDurationMs = fajrDate.getTime() - maghribDate.getTime();
  const firstThirdDate = new Date(maghribDate.getTime() + nightDurationMs / 3);
  const lastThirdDate = new Date(
    maghribDate.getTime() + (nightDurationMs * 2) / 3
  );

  const firstThirdTime = formatTime(
    firstThirdDate.getHours(),
    firstThirdDate.getMinutes()
  );
  const lastThirdTime = formatTime(
    lastThirdDate.getHours(),
    lastThirdDate.getMinutes()
  );

  // Return the calculated times in the same format as the API would
  return {
    Fajr: fajrTime,
    Sunrise: sunriseTime,
    Dhuhr: dhuhrTime,
    Asr: asrTime,
    Sunset: sunsetTime,
    Maghrib: maghribTime,
    Isha: ishaTime,
    Midnight: midnightTime,
    Imsak: imsakTime,
    Firstthird: firstThirdTime,
    Lastthird: lastThirdTime,
  };
};

/**
 * Calculate prohibited prayer times
 * @param {Object} timings - Prayer timings object
 * @param {Function} formatTimeFunc - Function to format time
 * @returns {Array} Array of prohibited times
 */
export const calculateProhibitedTimes = (
  timings,
  formatTimeFunc = formatTo12Hour
) => {
  if (!timings) return [];

  // Make sure all required prayer times exist
  if (
    !timings.Fajr ||
    !timings.Sunrise ||
    !timings.Dhuhr ||
    !timings.Asr ||
    !timings.Maghrib
  ) {
    return [];
  }

  // Return array of prohibited times with icon types instead of JSX
  return [
    {
      name: "After Fajr Until Sunrise",
      reason:
        "After Fajr prayer until the sun has risen to the height of a spear (approx. 15 minutes after sunrise)",
      time: `${formatTimeFunc(timings.Fajr)} - ${formatTimeFunc(
        addMinutes(timings.Sunrise, 15)
      )}`,
      iconType: "sunrise",
    },
    {
      name: "During Sunrise",
      reason: "When the sun is rising (approx. 15-20 minutes after dawn)",
      time: `${formatTimeFunc(
        subtractMinutes(timings.Sunrise, 5)
      )} - ${formatTimeFunc(addMinutes(timings.Sunrise, 15))}`,
      iconType: "sun",
    },
    {
      name: "At Zenith",
      reason:
        "When the sun is at its highest point at noon (approx. 10-15 minutes before Dhuhr)",
      time: `${formatTimeFunc(
        subtractMinutes(timings.Dhuhr, 15)
      )} - ${formatTimeFunc(timings.Dhuhr)}`,
      iconType: "sun",
    },
    {
      name: "During Sunset",
      reason: "When the sun is setting (approx. 15 minutes before Maghrib)",
      time: `${formatTimeFunc(
        subtractMinutes(timings.Maghrib, 15)
      )} - ${formatTimeFunc(timings.Maghrib)}`,
      iconType: "sunset",
    },
    {
      name: "After Asr Until Maghrib",
      reason: "From after Asr prayer until the sun has set completely",
      time: `${formatTimeFunc(timings.Asr)} - ${formatTimeFunc(
        timings.Maghrib
      )}`,
      iconType: "sunset",
    },
  ];
};
