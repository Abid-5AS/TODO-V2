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
    fajrMinute,
    sunriseHour,
    sunriseMinute,
    dhuhrHour,
    dhuhrMinute,
    asrHour,
    asrMinute,
    maghribHour,
    maghribMinute,
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

  const fajrTime = formatTime(fajrHour, fajrMinute || 0);
  const sunriseTime = formatTime(sunriseHour, sunriseMinute || 0);
  const dhuhrTime = formatTime(dhuhrHour, dhuhrMinute || 0);
  const asrTime = formatTime(asrHour, asrMinute || 0);
  const maghribTime = formatTime(maghribHour, maghribMinute || 0);
  const ishaTime = formatTime(ishaHour, ishaMinute || 0);

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
      name: "During Sunrise",
      reason: "When the sun is rising (approx. 15-20 minutes after dawn)",
      time: `${formatTimeFunc(
        timings.Sunrise
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

/**
 * Get timezone offset in minutes from a location
 * @param {Object} location - Location object
 * @returns {number} Timezone offset in minutes (positive for east, negative for west)
 */
export const getTimezoneOffsetFromLocation = (location) => {
  if (!location) return -new Date().getTimezoneOffset(); // Default to browser's timezone offset
  
  // If location has a timezone string, use it to calculate offset
  if (location.timezone) {
    try {
      // Get current date in UTC
      const now = new Date();
      
      // Format date to get timezone offset from location's timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: location.timezone,
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        hour12: false
      });
      
      // Parse parts to create date object in location's timezone
      const parts = formatter.formatToParts(now);
      const getPartValue = (type) => {
        const part = parts.find(p => p.type === type);
        return part ? parseInt(part.value, 10) : 0;
      };
      
      // Create date objects for both UTC and location timezone
      const year = getPartValue('year');
      const month = getPartValue('month') - 1; // Month is 0-indexed in Date
      const day = getPartValue('day');
      const hour = getPartValue('hour');
      const minute = getPartValue('minute');
      
      const locationTime = new Date(Date.UTC(year, month, day, hour, minute));
      const utcTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 
                                        now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes()));
      
      // Calculate offset in minutes
      return Math.round((locationTime - utcTime) / 60000);
    } catch (err) {
      console.error("Error calculating timezone offset from timezone string:", err);
    }
  }
  
  // Handle special cases
  if (location.name === 'Singapore' || location.country === 'Singapore') return 480; // UTC+8
  if (location.name === 'Dhaka' || location.country === 'Bangladesh') return 360; // UTC+6
  
  // If location has offset in decimal hours, convert to minutes
  if (typeof location.gmtOffset === 'number') {
    return location.gmtOffset * 60;
  }
  
  // Last resort: use browser's timezone
  return -new Date().getTimezoneOffset();
};

/**
 * Get timezone string from location
 * @param {Object} location - Location object
 * @returns {string} Timezone string
 */
export const getTimezoneFromLocation = (location) => {
  if (!location) return Intl.DateTimeFormat().resolvedOptions().timeZone; // Default to browser timezone
  if (location.timezone) return location.timezone;
  // Add more specific fallbacks if needed
  if (location.name === 'Singapore' || location.country === 'Singapore') return "Asia/Singapore";
  if (location.name === 'Dhaka' || location.country === 'Bangladesh') return "Asia/Dhaka";
  // Fallback based on browser offset
  const browserOffset = -new Date().getTimezoneOffset() / 60;
  const sign = browserOffset >= 0 ? "+" : "-";
  const hours = Math.abs(Math.floor(browserOffset));
  return `Etc/GMT${sign}${hours}`;
};

/**
 * Calculate sun position as percentage of the day
 * @param {Date} currentTime - Current time
 * @param {Object} prayerTimes - Prayer times object
 * @param {Object} location - Location object
 * @returns {number} Sun position as percentage (0-100)
 */
export const calculateSunPosition = (currentTime, prayerTimes, location) => {
  // **Robust Check:** Ensure prayerTimes is an object and has essential times (case-insensitive)
  const hasRequiredTimes = Boolean(
    prayerTimes &&
    typeof prayerTimes === 'object' &&
    (prayerTimes.Sunrise || prayerTimes.sunrise) &&
    (prayerTimes.Dhuhr || prayerTimes.dhuhr) &&
    (prayerTimes.Maghrib || prayerTimes.Sunset || prayerTimes.maghrib || prayerTimes.sunset)
  );

  if (!hasRequiredTimes) {
    console.warn("calculateSunPosition: Invalid or incomplete prayerTimes", prayerTimes);
    return 50; // Default to middle
  }
  
  if (!(currentTime instanceof Date)) {
    console.warn("calculateSunPosition: currentTime is not a Date object");
    currentTime = new Date(); 
  }

  // Helper to convert "HH:MM" to minutes since midnight
  const timeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    return (isNaN(h) || isNaN(m)) ? 0 : h * 60 + m;
  };

  // Compute current time at the location in minutes since midnight
  let currentTimeInMinutes;
  try {
    const tz = getTimezoneFromLocation(location) || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const fmt = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz });
    const parts = fmt.formatToParts(currentTime);
    const hourPart = parts.find(p => p.type === 'hour');
    const minutePart = parts.find(p => p.type === 'minute');
    const hours = hourPart ? parseInt(hourPart.value, 10) : currentTime.getHours();
    const minutes = minutePart ? parseInt(minutePart.value, 10) : currentTime.getMinutes();
    currentTimeInMinutes = hours * 60 + minutes;
  } catch (err) {
    console.warn('calculateSunPosition: timezone conversion failed, falling back to browser time', err);
    currentTimeInMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  }

  // Get minutes for key prayer times (case-insensitive access)
  const sunriseMinutes = timeToMinutes(prayerTimes.Sunrise || prayerTimes.sunrise);
  const dhuhrMinutes = timeToMinutes(prayerTimes.Dhuhr || prayerTimes.dhuhr);

  const maghribMinutes = timeToMinutes(
    prayerTimes.Maghrib || prayerTimes.Sunset || prayerTimes.maghrib || prayerTimes.sunset
  );
  const fajrMinutes = timeToMinutes(prayerTimes.Fajr || prayerTimes.fajr); // Needed for pre-sunrise

  // Basic validation
  if (sunriseMinutes <= 0 || dhuhrMinutes <= 0 || maghribMinutes <= 0) {
    console.warn("calculateSunPosition: Invalid prayer time minutes", { sunriseMinutes, dhuhrMinutes, maghribMinutes });
    return 50;
  }

  const daylightMinutes = maghribMinutes - sunriseMinutes;
  if (daylightMinutes <= 0) {
    console.warn("calculateSunPosition: Invalid daylight duration", { daylightMinutes });
    return 50;
  }

  let position = 50; // Default

  // --- Calculation Logic --- (Simplified for clarity)
  if (currentTimeInMinutes < sunriseMinutes) {
    // Before sunrise
    const nightBeforeDuration = sunriseMinutes - (fajrMinutes || sunriseMinutes - 90); // Approx Fajr if missing
    if (nightBeforeDuration > 0) {
      const progress = currentTimeInMinutes - (fajrMinutes || sunriseMinutes - 90);
      position = Math.max(0, Math.min(25, (progress / nightBeforeDuration) * 25));
    }
  } else if (currentTimeInMinutes > maghribMinutes) {
    // After Maghrib
    position = 75 + Math.min(25, ((currentTimeInMinutes - maghribMinutes) / 180) * 25); // Assume night lasts ~3 hours for viz
  } else {
    // Daytime
    if (currentTimeInMinutes <= dhuhrMinutes) {
      // Morning (Sunrise to Dhuhr: 25% -> 50%)
      const morningDuration = dhuhrMinutes - sunriseMinutes;
      if (morningDuration > 0) {
        const progress = currentTimeInMinutes - sunriseMinutes;
        position = 25 + (progress / morningDuration) * 25;
      }
    } else {
      // Afternoon (Dhuhr to Maghrib: 50% -> 75%)
      const afternoonDuration = maghribMinutes - dhuhrMinutes;
      if (afternoonDuration > 0) {
        const progress = currentTimeInMinutes - dhuhrMinutes;
        position = 50 + (progress / afternoonDuration) * 25;
      }
    }
  }

  position = Math.max(0, Math.min(100, position)); // Clamp between 0 and 100
  
  return position;
};

/**
 * Format a date for display in the location's timezone
 * @param {Date} dateToFormat - Date to format
 * @param {Object} location - Location object
 * @returns {string} Formatted date string
 */
export const formatDateForLocation = (dateToFormat, location) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  try {
    const targetTimezone = getTimezoneFromLocation(location);
    return dateToFormat.toLocaleDateString('en-US', { ...options, timeZone: targetTimezone });
  } catch (error) {
    console.error("Error formatting date for location:", error);
    return dateToFormat.toLocaleDateString(undefined, options); // Fallback to browser locale/timezone
  }
};

/**
 * Format a time for display in the location's timezone
 * @param {Date} dateToFormat - Date to format
 * @param {Object} location - Location object
 * @returns {string} Formatted time string
 */
export const formatTimeForLocation = (dateToFormat, location) => {
  const options = { hour: "2-digit", minute: "2-digit", hour12: true };
  try {
    const targetTimezone = getTimezoneFromLocation(location);
    return dateToFormat.toLocaleTimeString('en-US', { ...options, timeZone: targetTimezone });
  } catch (error) { 
    console.error("Error formatting time for location:", error);
    return dateToFormat.toLocaleTimeString([], options); // Fallback to browser locale/timezone
  }
};
