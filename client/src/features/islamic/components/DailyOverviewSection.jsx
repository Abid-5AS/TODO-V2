import React, { useState, useEffect, useMemo } from "react";
import { Clock, MapPin, Sunrise, Sunset, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { 
  formatTo12Hour, 
  calculateSunPosition, 
  formatDateForLocation, 
  formatTimeForLocation 
} from "@/features/islamic/utils/timeUtils";

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

const DailyOverviewSection = ({
  prayerTimes,
  location,
  formatTo12Hour: formatTimeFunc, // Renamed to avoid conflict with imported function
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
    // Use the passed formatTimeFunc prop which respects user settings
    return time ? formatTimeFunc(time) : "--:--"; 
  };

  const getLocationName = () => {
     if (!location) return "Location not set";
     return location.name || location.display_name?.split(",")[0] || "Unknown location";
  };
  
  // Get formatted date and time strings using localTime and location
  const displayDate = formatDateForLocation(localTime, location);
  const displayTime = formatTimeForLocation(localTime, location);

  // Determine background based on sun position (0 = sunrise, 100 = sunset)
  const isNight = calculatedSunPosition <= 0 || calculatedSunPosition >= 100;
  const backgroundClass = isNight
    ? "bg-gradient-to-b from-slate-800/30 via-indigo-900/20 to-slate-900/30 dark:from-slate-900/40 dark:via-indigo-950/30 dark:to-black/50"
    : "bg-gradient-to-b from-blue-100/30 via-amber-100/10 to-orange-100/10 dark:from-blue-900/20 dark:via-amber-900/10 dark:to-orange-900/10";

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
         <div className="relative h-44 mb-6 rounded-t-full overflow-hidden">
           {/* Dynamic Background */}
           <div className={`absolute inset-0 ${backgroundClass} rounded-t-full`}></div> 
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
