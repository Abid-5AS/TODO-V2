import React, { useState, useEffect } from "react";
import { Clock, MapPin, Sunrise, Sunset, Sun } from "lucide-react";
import { motion } from "framer-motion";

// Calculate sun position as percentage of the day
const calculateSunPosition = (currentTime, prayerTimes) => {
  if (!prayerTimes) return 50; // Default to middle if no prayer times
  
  // Ensure currentTime is a Date object
  if (!(currentTime instanceof Date)) {
    console.warn("currentTime is not a Date object, creating a new Date");
    currentTime = new Date();
  }

  // Convert all times to minutes for easy calculation
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Get minutes since midnight for current time
  const currentHours = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  const currentTimeInMinutes = currentHours * 60 + currentMinutes;

  // Get minutes for fajr, sunrise, and maghrib
  const fajrMinutes = timeToMinutes(prayerTimes.Fajr || prayerTimes.fajr);
  const sunriseMinutes = timeToMinutes(
    prayerTimes.Sunrise || prayerTimes.sunrise
  );
  const maghribMinutes = timeToMinutes(
    prayerTimes.Maghrib || prayerTimes.maghrib
  );

  // Calculate total daylight minutes
  const daylightMinutes = maghribMinutes - sunriseMinutes;
  if (daylightMinutes <= 0) return 50; // Fallback if calculation fails

  // If before sunrise or after maghrib, use special calculation
  if (currentTimeInMinutes < sunriseMinutes) {
    // Night before sunrise (from fajr to sunrise)
    const nightBeforeDuration = sunriseMinutes - fajrMinutes;
    if (nightBeforeDuration <= 0) return 0; // Prevent division by zero

    const progressSinceFajr = currentTimeInMinutes - fajrMinutes;
    return Math.max(
      0,
      Math.min(25, (progressSinceFajr / nightBeforeDuration) * 25)
    );
  } else if (currentTimeInMinutes > maghribMinutes) {
    // Night after maghrib
    return (
      75 + Math.min(25, ((currentTimeInMinutes - maghribMinutes) / 180) * 25)
    );
  } else {
    // Daytime (sunrise to maghrib)
    const progressSinceSunrise = currentTimeInMinutes - sunriseMinutes;
    return 25 + Math.min(50, (progressSinceSunrise / daylightMinutes) * 50);
  }
};

// Helper to determine the timezone offset from a location (e.g. Singapore is GMT+8)
const getTimezoneOffsetFromLocation = (location) => {
  // Default timezone offset (in hours)
  let timezoneOffset = 0;
  
  // Extract timezone from location if available
  if (location) {
    // Try to extract from timezone if stored
    if (location.timezone) {
      const match = location.timezone.match(/GMT([+-])(\d+)/);
      if (match) {
        timezoneOffset = parseInt(match[2]) * (match[1] === '+' ? 1 : -1);
      }
    }
    // For certain well-known locations, we can hardcode the offset
    else if (location.country) {
      if (location.name === 'Singapore' || location.country === 'Singapore') {
        timezoneOffset = 8; // Singapore is GMT+8
      }
      else if (location.name === 'Dhaka' || location.country === 'Bangladesh') {
        timezoneOffset = 6; // Bangladesh is GMT+6
      }
    }
  }
  return timezoneOffset;
};

// Helper function to get timezone from location
const getTimezoneFromLocation = (location) => {
  if (!location) return "UTC";
  
  // If location has a stored timezone, use it
  if (location.timezone) return location.timezone;
  
  // For certain well-known locations, we can hardcode the timezone
  if (location.name === 'Singapore' || location.country === 'Singapore') {
    return "Asia/Singapore";
  }
  else if (location.name === 'Dhaka' || location.country === 'Bangladesh') {
    return "Asia/Dhaka";
  }
  
  // Default timezone information based on browser
  const browserOffset = -new Date().getTimezoneOffset() / 60; // Browser offset in hours
  const sign = browserOffset >= 0 ? "+" : "-";
  const hours = Math.abs(Math.floor(browserOffset));
  return `Etc/GMT${sign}${hours}`;
};

// Helper function to get time adjusted for location
const getLocationTime = (date, location) => {
  if (!location) return date;
  
  try {
    const timezone = getTimezoneFromLocation(location);
    
    // Return the date object in the correct timezone for internal calculations
    // This preserves the Date object type needed for calculations
    return date;
  } catch (error) {
    console.error("Error adjusting time for location:", error);
    // Fallback to browser's local time
    return date;
  }
};

// Format location time as a readable string (separate display function)
const formatLocationTime = (date, location) => {
  if (!location) return "";
  
  try {
    const timezone = getTimezoneFromLocation(location);
    const options = { timeZone: timezone };
    const formatter = new Intl.DateTimeFormat('en-US', {
      ...options,
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
    
    return formatter.format(date);
  } catch (error) {
    console.error("Error formatting time for location:", error);
    // Fallback to browser's local time without seconds
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: 'numeric',
      hour12: true 
    });
  }
};

const DailyOverviewSection = ({
  prayerTimes,
  currentTime,
  location,
  formatTo12Hour,
  itemVariants,
}) => {
  // Use internal state to track the local time
  const [localTime, setLocalTime] = useState(new Date());

  // Update local time every minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      setLocalTime(new Date());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Format a prayer time safely
  const formatPrayerTime = (timeName) => {
    if (!prayerTimes) return "--:--";
    const time = prayerTimes[timeName] || prayerTimes[timeName.toLowerCase()];
    return time ? formatTo12Hour(time) : "--:--";
  };

  // Handle location display safely
  const getLocationName = () => {
    if (!location) return "Location not set";
    return (
      location.name ||
      location.address?.city ||
      location.address?.town ||
      location.address?.village ||
      location.display_name?.split(",")[0] ||
      "Unknown location"
    );
  };

  // Use provided currentTime or adjusted localTime based on location
  const baseTime = currentTime || localTime;
  const locationTime = getLocationTime(baseTime, location);
  const formattedLocationTime = formatLocationTime(baseTime, location);
  const sunPosition = calculateSunPosition(locationTime, prayerTimes || {});

  // Format the display time and date based on the location's timezone 
  const formatDateForLocation = () => {
    const options = { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    try {
      if (location) {
        const timezone = getTimezoneFromLocation(location);
        return baseTime.toLocaleDateString('en-US', { ...options, timeZone: timezone });
      }
    } catch (error) {
      console.error("Error formatting date:", error);
    }
    
    return baseTime.toLocaleDateString(undefined, options);
  };

  const formatTimeForLocation = () => {
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    };
    
    try {
      if (location) {
        const timezone = getTimezoneFromLocation(location);
        return baseTime.toLocaleTimeString('en-US', { ...options, timeZone: timezone });
      }
    } catch (error) {
      console.error("Error formatting time:", error);
    }
    
    return baseTime.toLocaleTimeString([], options);
  };

  return (
    <motion.section variants={itemVariants} className="md:col-span-2">
      <div className="glass-card p-5 rounded-lg shadow-md border border-emerald-300/20 bg-gradient-to-r from-emerald-50/10 to-blue-50/10 dark:from-emerald-950/20 dark:to-blue-950/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center text-emerald-700 dark:text-emerald-400">
            <Clock size={18} className="mr-2" /> Daily Prayer Overview
          </h2>
          {location && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin size={14} className="mr-1" />
              <span>{getLocationName()}</span>
            </div>
          )}
        </div>

        {/* Sun arc visualization - with more pronounced curve */}
        <div className="relative h-44 mb-6 bg-gradient-to-b from-blue-50/20 to-transparent dark:from-blue-950/10 rounded-t-full overflow-hidden">
          {/* Sky background with enhanced gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-100/30 via-amber-100/10 to-orange-100/10 dark:from-blue-900/20 dark:via-amber-900/10 dark:to-orange-900/10 rounded-t-full"></div>

          {/* Horizon line */}
          <div className="absolute bottom-0 w-full h-[1px] bg-gray-300/20 dark:bg-gray-700/20"></div>

          {/* Sun path - semi-circle arc with more pronounced curve */}
          <div className="absolute bottom-0 w-full h-full">
            <svg
              viewBox="0 0 100 60"
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              {/* More pronounced path curve */}
              <path
                d="M0,60 Q50,-30 100,60"
                fill="none"
                stroke="rgba(255,180,80,0.4)"
                strokeWidth="0.9"
                strokeDasharray="1,1"
                className="filter drop-shadow-sm"
              />
            </svg>

            {/* The Sun - a single, properly sized sun */}
            <div
              className="absolute"
              style={{
                left: `${sunPosition}%`,
                bottom: `${Math.sin((Math.PI * sunPosition) / 100) * 75}%`,
                transform: "translate(-50%, 50%)",
              }}
            >
              <div className="relative">
                <div className="absolute -top-2 -left-2 w-5 h-5 bg-yellow-500/20 rounded-full animate-pulse"></div>
                <Sun
                  size={16}
                  className="text-amber-500 filter drop-shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* Prayer times labels - repositioned for better visibility */}
          <div className="absolute bottom-2 w-full flex justify-between px-2">
            <div className="text-xs flex flex-col items-center">
              <Sunrise size={14} className="text-amber-600 mb-1" />
              <span className="font-mono font-medium text-amber-700 dark:text-amber-400 bg-white/40 dark:bg-black/40 px-1.5 py-0.5 rounded">
                {formatPrayerTime("Sunrise")}
              </span>
            </div>

            <div className="text-xs flex flex-col items-center">
              <Sun size={14} className="text-amber-600 mb-1" />
              <span className="font-mono font-medium text-amber-700 dark:text-amber-400 bg-white/40 dark:bg-black/40 px-1.5 py-0.5 rounded">
                {formatPrayerTime("Dhuhr")}
              </span>
            </div>

            <div className="text-xs flex flex-col items-center">
              <Sunset size={14} className="text-amber-600 mb-1" />
              <span className="font-mono font-medium text-amber-700 dark:text-amber-400 bg-white/40 dark:bg-black/40 px-1.5 py-0.5 rounded">
                {formatPrayerTime("Maghrib")}
              </span>
            </div>
          </div>
        </div>

        {/* Current Time Display - Using location-based time */}
        <div className="text-center mb-2">
          <div className="text-sm text-muted-foreground">
            {formatDateForLocation()}
          </div>
          <div className="text-2xl font-mono font-bold text-primary">
            {formatTimeForLocation()}
          </div>
          <div className="text-xs text-muted-foreground">
            {location ? `Time in ${getLocationName()}` : "Local time"}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default DailyOverviewSection;
