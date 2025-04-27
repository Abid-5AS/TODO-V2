import React, { useState, useEffect, useMemo } from "react";
import { Clock, MapPin, Sunrise, Sunset, Sun } from "lucide-react";
import { motion } from "framer-motion";

// Helper function to get timezone string from location (remains useful for formatting)
const getTimezoneFromLocation = (location) => {
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

// Calculate sun position as percentage of the day
const calculateSunPosition = (currentTime, prayerTimes, location) => {
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
  
  // console.log(`Calculated sun position: ${position.toFixed(2)}% (Browser Time: ${currentHours}:${currentMinutes} (${currentTimeInMinutes}m), Dhuhr: ${dhuhrMinutes}m)`);

  return position;
};

const DailyOverviewSection = ({
  prayerTimes,
  location,
  formatTo12Hour, // Keep this prop if needed elsewhere, but use Intl for local display
  itemVariants,
}) => {
  const [localTime, setLocalTime] = useState(new Date()); // Represents browser's current time

  useEffect(() => {
    const updateTime = () => setLocalTime(new Date());
    updateTime(); 
    const intervalId = setInterval(updateTime, 15000); // Update every 15s
    return () => clearInterval(intervalId);
  }, []); // No dependency on location needed here

  // Check if prayer times are valid (must have Sunrise, Dhuhr, and Maghrib/Sunset)
  const hasValidPrayerTimes = Boolean(
    prayerTimes &&
    typeof prayerTimes === 'object' &&
    (prayerTimes.Sunrise || prayerTimes.sunrise) &&
    (prayerTimes.Dhuhr || prayerTimes.dhuhr) &&
    (prayerTimes.Maghrib || prayerTimes.Sunset || prayerTimes.maghrib || prayerTimes.sunset)
  );

  // Calculate sun position *only if* times are valid, otherwise default
  const calculatedSunPosition = useMemo(() => {
    console.log("[Memo] Recalculating sun position. Has valid times:", hasValidPrayerTimes);
    if (hasValidPrayerTimes) {
      console.log("[Memo] Running calculateSunPosition with:", { localTime: localTime?.toISOString(), prayerTimes, location });
      const position = calculateSunPosition(localTime, prayerTimes, location);
      console.log("[Memo] Calculated Position:", position);
      return position;
    }
    console.log("[Memo] Returning default position 50.");
    return 50; // Default to middle if times aren't valid yet
  }, [localTime, prayerTimes, location, hasValidPrayerTimes]); // Recalculate when time or prayerTimes change

  // Format prayer times using the provided formatter (potentially 12/24hr based on settings)
  const formatPrayerTimeDisplay = (timeName) => {
    if (!prayerTimes) return "--:--";
    const time = prayerTimes[timeName] || prayerTimes[timeName.toLowerCase()];
    // Use the passed formatTo12Hour prop which respects user settings
    return time ? formatTo12Hour(time) : "--:--"; 
  };

  const getLocationName = () => {
     if (!location) return "Location not set";
     return location.name || location.display_name?.split(",")[0] || "Unknown location";
  };
  
  // Format the *browser's* localTime for display in the *location's* timezone
  const formatDateForDisplay = (dateToFormat, location) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    try {
      const targetTimezone = getTimezoneFromLocation(location);
      return dateToFormat.toLocaleDateString('en-US', { ...options, timeZone: targetTimezone });
    } catch (error) {
      // console.error("Error formatting date for location:", error);
      return dateToFormat.toLocaleDateString(undefined, options); // Fallback to browser locale/timezone
    }
  };

  const formatTimeForDisplay = (dateToFormat, location) => {
    const options = { hour: "2-digit", minute: "2-digit", hour12: true };
    try {
       const targetTimezone = getTimezoneFromLocation(location);
       return dateToFormat.toLocaleTimeString('en-US', { ...options, timeZone: targetTimezone });
    } catch (error) { 
      // console.error("Error formatting time for location:", error);
      return dateToFormat.toLocaleTimeString([], options); // Fallback to browser locale/timezone
    }
  };
  
  // Get formatted date and time strings using localTime and location
  const displayDate = formatDateForDisplay(localTime, location);
  const displayTime = formatTimeForDisplay(localTime, location);

  return (
    <motion.section variants={itemVariants} className="md:col-span-2">
       <div className="glass-card p-5 rounded-lg shadow-md border border-emerald-300/20 bg-gradient-to-r from-emerald-50/10 to-blue-50/10 dark:from-emerald-950/20 dark:to-blue-950/20">
         {/* Header */}
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
 
         {/* Sun Arc Visualization */}
         <div className="relative h-44 mb-6 bg-gradient-to-b from-blue-50/20 to-transparent dark:from-blue-950/10 rounded-t-full overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-b from-blue-100/30 via-amber-100/10 to-orange-100/10 dark:from-blue-900/20 dark:via-amber-900/10 dark:to-orange-900/10 rounded-t-full"></div>
           <div className="absolute bottom-0 w-full h-[1px] bg-gray-300/20 dark:bg-gray-700/20"></div>
 
           {/* Conditional Sun Path/Icon */} 
           {hasValidPrayerTimes ? (
             <div className="absolute bottom-0 w-full h-full">
               <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="w-full h-full">
                 <path d="M0,60 Q50,-30 100,60" fill="none" stroke="rgba(255,180,80,0.4)" strokeWidth="0.9" strokeDasharray="1,1" className="filter drop-shadow-sm"/>
               </svg>
               <div className="absolute" style={{ left: `${calculatedSunPosition}%`, bottom: (() => {
                 const bottomValue = Math.sin((Math.PI * calculatedSunPosition) / 100) * 75;
                 // console.log(`[Render] Sun Bottom Style: ${bottomValue}% (Position: ${calculatedSunPosition}%)`);
                 return `${bottomValue}%`;
               })(), transform: "translate(-50%, 50%)" }}>
                 <div className="relative">
                   <div className="absolute -top-2 -left-2 w-5 h-5 bg-yellow-500/20 rounded-full animate-pulse"></div>
                   <Sun size={16} className="text-amber-500 filter drop-shadow-lg" />
                 </div>
               </div>
               {import.meta.env.DEV && <div className="absolute w-1 h-1 bg-red-500 rounded-full" style={{ left: '50%', bottom: `${Math.sin(Math.PI / 2) * 75}%`, transform: "translate(-50%, 50%)" }} title="Midpoint (50%)" />} 
             </div>
           ) : (
             <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">Loading sun position...</div>
           )}
 
           {/* Prayer Time Labels */} 
           <div className="absolute bottom-2 w-full flex justify-between px-2">
             <div className="text-xs flex flex-col items-center">
               <Sunrise size={14} className="text-amber-600 mb-1" />
               <span className="font-mono font-medium text-amber-700 dark:text-amber-400 bg-white/40 dark:bg-black/40 px-1.5 py-0.5 rounded">
                 {formatPrayerTimeDisplay("Sunrise")}
               </span>
             </div>
             <div className="text-xs flex flex-col items-center">
               <Sun size={14} className="text-amber-600 mb-1" />
               <span className="font-mono font-medium text-amber-700 dark:text-amber-400 bg-white/40 dark:bg-black/40 px-1.5 py-0.5 rounded">
                 {formatPrayerTimeDisplay("Dhuhr")}
               </span>
             </div>
             <div className="text-xs flex flex-col items-center">
               <Sunset size={14} className="text-amber-600 mb-1" />
               <span className="font-mono font-medium text-amber-700 dark:text-amber-400 bg-white/40 dark:bg-black/40 px-1.5 py-0.5 rounded">
                 {formatPrayerTimeDisplay("Maghrib")}
               </span>
             </div>
           </div>
         </div>
 
         {/* Current Time Display */} 
         <div className="text-center mb-2">
           <div className="text-sm text-muted-foreground">{displayDate}</div>
           <div className="text-2xl font-mono font-bold text-primary">{displayTime}</div>
           <div className="text-xs text-muted-foreground">
             {location ? `Time in ${getLocationName()}` : "Local time"}
           </div>
         </div>
       </div>
     </motion.section>
  );
};

export default DailyOverviewSection;
