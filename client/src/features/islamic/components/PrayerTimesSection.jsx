import React from "react";
import { Clock, Loader2, SunIcon, SunriseIcon, SunsetIcon, MoonIcon } from "lucide-react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { formatTimeHumanReadable, formatTo12Hour as format12Hour } from "@/utils/timeUtils";

// Helper to get the next prayer time
const getNextPrayerTime = (prayerName, prayerTimes) => {
  if (!prayerTimes) return null;

  const prayers = [
    { name: "Fajr", time: prayerTimes.Fajr },
    { name: "Sunrise", time: prayerTimes.Sunrise },
    { name: "Dhuhr", time: prayerTimes.Dhuhr },
    { name: "Asr", time: prayerTimes.Asr },
    { name: "Maghrib", time: prayerTimes.Maghrib },
    { name: "Isha", time: prayerTimes.Isha },
  ].filter((p) => p.time); // Filter out any prayers without times

  const currentPrayerIndex = prayers.findIndex((p) => p.name === prayerName);
  if (currentPrayerIndex === -1) return null;

  // Get the next prayer
  const nextPrayerIndex = (currentPrayerIndex + 1) % prayers.length;
  return prayers[nextPrayerIndex].time;
};

const PrayerTimesSection = ({
  prayerTimes,
  isLoading,
  activePrayer,
  nextPrayer,
  remainingTime,
  itemVariants,
}) => {
  if (!prayerTimes && isLoading) {
    return (
      <motion.div
        className="glass-card p-5 rounded-lg shadow-md border border-blue-200/20 flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        variants={itemVariants}
      >
        <div className="flex items-center justify-center h-60">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 dark:text-blue-400" />
          <span className="ml-2 text-slate-600 dark:text-slate-300">
            Loading prayer times...
          </span>
        </div>
      </motion.div>
    );
  }

  // Define the prayer order and their end times
  const prayerDetails = [
    {
      id: "fajr",
      name: "Fajr",
      description: "Dawn Prayer",
      icon: <SunriseIcon size={18} className="text-blue-600/90 dark:text-blue-400" />,
      startTime: prayerTimes?.Fajr || "--:--",
      endTime: prayerTimes?.Sunrise || "--:--",
    },
    {
      id: "dhuhr",
      name: "Dhuhr",
      description: "Noon Prayer",
      icon: <SunIcon size={18} className="text-amber-500 dark:text-amber-400" />,
      startTime: prayerTimes?.Dhuhr || "--:--",
      endTime: prayerTimes?.Asr || "--:--",
    },
    {
      id: "asr",
      name: "Asr",
      description: "Afternoon Prayer",
      icon: <SunIcon size={18} className="text-orange-500 dark:text-orange-400" />,
      startTime: prayerTimes?.Asr || "--:--",
      endTime: prayerTimes?.Maghrib || "--:--",
    },
    {
      id: "maghrib",
      name: "Maghrib",
      description: "Sunset Prayer",
      icon: <SunsetIcon size={18} className="text-purple-600 dark:text-purple-400" />,
      startTime: prayerTimes?.Maghrib || "--:--",
      endTime: prayerTimes?.Isha || "--:--",
    },
    {
      id: "isha",
      name: "Isha",
      description: "Night Prayer",
      icon: <MoonIcon size={18} className="text-indigo-600 dark:text-indigo-400" />,
      startTime: prayerTimes?.Isha || "--:--",
      // Isha ends at midnight for calculation purposes
      endTime: prayerTimes?.Midnight || "--:--",
    },
  ];

  // For debugging
  console.log("Prayer Times in PrayerTimesSection:", prayerTimes);
  console.log("Active Prayer:", activePrayer);
  console.log("Next Prayer:", nextPrayer);

  return (
    <motion.div
      className="glass-card p-5 rounded-lg shadow-md border border-blue-200/20 flex flex-col h-full"
      variants={itemVariants}
    >
      <div className="flex items-center mb-4">
        <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
          Fard Prayer Times
        </h2>
      </div>

      <div className="space-y-3">
        {prayerDetails.map((prayer) => {
          const isActive =
            activePrayer?.toLowerCase() === prayer.name.toLowerCase();

          return (
            <motion.div
              key={prayer.id}
              className={`flex items-center justify-between p-3 rounded-md backdrop-blur-sm ${
                isActive
                  ? "bg-blue-50/70 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/50"
                  : "bg-white/40 dark:bg-slate-800/30 border border-blue-100/20 dark:border-blue-900/20"
              }`}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100/50 dark:bg-blue-900/20 mr-3">
                  {prayer.icon}
                </div>
                <div>
                  <h3 className="font-medium text-slate-800 dark:text-white">
                    {prayer.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {prayer.description}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="font-medium text-slate-800 dark:text-white">
                  {format12Hour(prayer.startTime)}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Until{" "}
                  {format12Hour(prayer.endTime)}
                </p>

                {isActive && remainingTime && (
                  <motion.div
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {formatTimeHumanReadable(remainingTime)}
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-slate-600 dark:text-slate-300 bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100/30 dark:border-blue-800/30">
        <p className="font-medium mb-1">Note:</p>
        <p>
          Times shown are for obligatory (Fard) prayers. Voluntary prayers can
          be performed at any time except during prohibited times.
        </p>
      </div>
    </motion.div>
  );
};

PrayerTimesSection.propTypes = {
  prayerTimes: PropTypes.object,
  isLoading: PropTypes.bool,
  activePrayer: PropTypes.string,
  nextPrayer: PropTypes.string,
  remainingTime: PropTypes.string,
  itemVariants: PropTypes.object,
};

// Export as memoized component to prevent re-renders unless props actually change
export default React.memo(PrayerTimesSection);
 