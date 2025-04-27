import React from "react";
import { Clock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// Helper function to format remaining time string "HH:MM:SS" into human-readable format
const formatRemainingTime = (remainingTimeStr) => {
  if (!remainingTimeStr || remainingTimeStr === "--:--:--") return "N/A";

  const [hours, minutes, seconds] = remainingTimeStr.split(":").map(Number);

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s remaining`;
  } else {
    return `${seconds}s remaining`;
  }
};

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
  loading,
  activePrayer,
  nextPrayer,
  remainingTime,
  formatTo12Hour,
  itemVariants,
}) => {
  if (!prayerTimes && loading) {
    return (
      <motion.div
        className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-lg flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center h-60">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500 dark:text-teal-400" />
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
      icon: "☀️",
      startTime: prayerTimes?.Fajr || "--:--",
      endTime: prayerTimes?.Sunrise || "--:--",
    },
    {
      id: "dhuhr",
      name: "Dhuhr",
      description: "Noon Prayer",
      icon: "☀️",
      startTime: prayerTimes?.Dhuhr || "--:--",
      endTime: prayerTimes?.Asr || "--:--",
    },
    {
      id: "asr",
      name: "Asr",
      description: "Afternoon Prayer",
      icon: "🌤️",
      startTime: prayerTimes?.Asr || "--:--",
      endTime: prayerTimes?.Maghrib || "--:--",
    },
    {
      id: "maghrib",
      name: "Maghrib",
      description: "Sunset Prayer",
      icon: "🌅",
      startTime: prayerTimes?.Maghrib || "--:--",
      endTime: prayerTimes?.Isha || "--:--",
    },
    {
      id: "isha",
      name: "Isha",
      description: "Night Prayer",
      icon: "🌙",
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
      className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-lg flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-4">
        <Clock className="h-5 w-5 text-teal-500 dark:text-teal-400 mr-2" />
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
              className={`flex items-center justify-between p-3 rounded-md ${
                isActive
                  ? "bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800"
                  : "bg-slate-50 dark:bg-slate-700/30"
              }`}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center">
                <span className="text-xl mr-3">{prayer.icon}</span>
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
                  {formatTo12Hour
                    ? formatTo12Hour(prayer.startTime)
                    : prayer.startTime}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Until{" "}
                  {formatTo12Hour
                    ? formatTo12Hour(prayer.endTime)
                    : prayer.endTime}
                </p>

                {isActive && remainingTime && (
                  <motion.div
                    className="text-xs font-medium text-teal-600 dark:text-teal-400 mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {remainingTime} remaining
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-md">
        <p className="font-medium mb-1">Note:</p>
        <p>
          Times shown are for obligatory (Fard) prayers. Voluntary prayers can
          be performed at any time except during prohibited times.
        </p>
      </div>
    </motion.div>
  );
};

export default PrayerTimesSection;
