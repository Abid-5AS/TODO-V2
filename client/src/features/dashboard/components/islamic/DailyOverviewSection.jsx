import React from "react";
import { Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const DailyOverviewSection = ({
  prayerTimes,
  currentTime,
  location,
  formatTo12Hour,
  itemVariants,
}) => {
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

        {/* Daily timings overview - arc visualization */}
        <div className="relative h-24 mb-6 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-full overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-between px-8">
            <div className="text-xs text-center">
              <div className="font-medium text-emerald-700 dark:text-emerald-400">
                Fajr
              </div>
              <div className="font-mono">
                {formatTo12Hour(prayerTimes.fajr)}
              </div>
            </div>
            <div className="text-xs text-center">
              <div className="font-medium text-amber-600">Sunrise</div>
              <div className="font-mono">
                {formatTo12Hour(prayerTimes.sunrise)}
              </div>
            </div>
            <div className="text-xs text-center">
              <div className="font-medium text-orange-600">Maghrib</div>
              <div className="font-mono">
                {formatTo12Hour(prayerTimes.maghrib)}
              </div>
            </div>
          </div>

          {/* Current time indicator */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-amber-400 to-orange-400"></div>
          <div className="absolute -bottom-1 w-full flex justify-between px-4 text-[10px] text-muted-foreground">
            <span>{formatTo12Hour(prayerTimes.fajr)}</span>
            <span>{formatTo12Hour(prayerTimes.dhuhr)}</span>
            <span>{formatTo12Hour(prayerTimes.maghrib)}</span>
          </div>

          {/* Current time marker */}
          <div
            className="absolute top-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse"
            style={{
              left: `${
                ((currentTime.getHours() * 60 + currentTime.getMinutes()) /
                  (24 * 60)) *
                100
              }%`,
            }}
          ></div>
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
