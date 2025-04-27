import React from "react";
import { Clock, MapPin, Sunrise, Sunset, Sun } from "lucide-react";
import { motion } from "framer-motion";

const DailyOverviewSection = ({
  prayerTimes,
  currentTime,
  location,
  formatTo12Hour,
  itemVariants,
}) => {
  // Calculate sun position as a percentage based on current time
  const calculateSunPosition = () => {
    const now = currentTime;
    const sunriseTime = timeStringToDate(prayerTimes.sunrise);
    const sunsetTime = timeStringToDate(prayerTimes.sunset);

    // Return 0 if before sunrise, 100 if after sunset
    if (now < sunriseTime) return 0;
    if (now > sunsetTime) return 100;

    // Calculate position percentage between sunrise and sunset
    const totalDayDuration = sunsetTime - sunriseTime;
    const elapsedTime = now - sunriseTime;
    return (elapsedTime / totalDayDuration) * 100;
  };

  // Convert time string to Date object
  const timeStringToDate = (timeStr) => {
    const now = new Date();
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date(now);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Get sun position from 0-100%
  const sunPosition = calculateSunPosition();

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
              <span>{location.displayName}</span>
            </div>
          )}
        </div>

        {/* Sun arc visualization */}
        <div className="relative h-40 mb-6 bg-gradient-to-b from-blue-50/20 to-transparent dark:from-blue-950/10 rounded-t-full overflow-hidden">
          {/* Sky background */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-100/30 to-orange-100/10 dark:from-blue-900/20 dark:to-amber-900/10 rounded-t-full"></div>

          {/* Sun path - semi-circle arc */}
          <div className="absolute bottom-0 left-0 w-full h-full">
            <svg viewBox="0 0 100 50" className="w-full h-full">
              {/* Dotted path line */}
              <path
                d="M0,50 Q50,0 100,50"
                fill="none"
                stroke="rgba(255,200,100,0.3)"
                strokeWidth="0.5"
                strokeDasharray="1,1"
              />

              {/* Actual sun position on path */}
              <circle
                cx={sunPosition}
                cy={50 - Math.sin((Math.PI * sunPosition) / 100) * 50}
                r="2"
                fill="orange"
                className="animate-pulse-slow"
              />
            </svg>

            {/* The Sun */}
            <div
              className="absolute"
              style={{
                left: `${sunPosition}%`,
                bottom: `${Math.sin((Math.PI * sunPosition) / 100) * 100}%`,
                transform: "translate(-50%, 50%)",
              }}
            >
              <div className="relative">
                <div className="absolute -top-3 -left-3 w-6 h-6 bg-yellow-500/20 rounded-full animate-pulse"></div>
                <Sun
                  size={18}
                  className="text-amber-500 filter drop-shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Prayer times labels */}
          <div className="absolute bottom-0 w-full flex justify-between px-4 pb-1">
            <div className="text-xs flex flex-col items-center">
              <Sunrise size={12} className="text-amber-600 mb-1" />
              <span className="font-mono font-medium text-amber-700 dark:text-amber-400">
                {formatTo12Hour(prayerTimes.sunrise)}
              </span>
            </div>

            <div className="text-xs flex flex-col items-center">
              <Sun size={12} className="text-amber-600 mb-1" />
              <span className="font-mono font-medium text-amber-700 dark:text-amber-400">
                {formatTo12Hour(prayerTimes.dhuhr)}
              </span>
            </div>

            <div className="text-xs flex flex-col items-center">
              <Sunset size={12} className="text-amber-600 mb-1" />
              <span className="font-mono font-medium text-amber-700 dark:text-amber-400">
                {formatTo12Hour(prayerTimes.sunset)}
              </span>
            </div>
          </div>
        </div>

        {/* Current Time Display */}
        <div className="text-center mb-2">
          <div className="text-sm text-muted-foreground">
            {currentTime.toLocaleDateString()}
          </div>
          <div className="text-2xl font-mono font-bold text-primary">
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
          </div>
          <div className="text-xs text-muted-foreground">
            Auto-updates daily based on your location
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default DailyOverviewSection;
