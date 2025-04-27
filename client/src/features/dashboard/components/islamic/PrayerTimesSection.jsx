import React from "react";
import { Coffee, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const PrayerTimesSection = ({
  isLoadingPrayerTimes,
  fardPrayers,
  activePrayer,
  remainingTime,
  itemVariants,
}) => {
  return (
    <motion.section variants={itemVariants}>
      <div className="glass-card h-full p-5 rounded-lg shadow-md border border-emerald-300/20">
        <h2 className="text-lg font-semibold mb-4 flex items-center text-emerald-700 dark:text-emerald-400">
          <Coffee size={18} className="mr-2" /> Fard Prayer Times
        </h2>

        {isLoadingPrayerTimes ? (
          <div className="flex items-center justify-center h-52">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="space-y-3">
            {fardPrayers.map((prayer, index) => (
              <div
                key={prayer.name}
                className={`flex justify-between items-center p-3 rounded-lg transition-all duration-300 ${
                  activePrayer === index
                    ? "bg-emerald-100/70 dark:bg-emerald-900/30 border-l-4 border-emerald-500 shadow-md"
                    : "bg-primary/5 hover:bg-primary/10"
                }`}
              >
                <div className="flex items-center">
                  {prayer.icon}
                  <div className="ml-2">
                    <div
                      className={activePrayer === index ? "font-medium" : ""}
                    >
                      {prayer.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {prayer.description}
                    </div>
                  </div>
                  {activePrayer === index && (
                    <span className="ml-2 px-2 py-0.5 text-[10px] font-semibold bg-emerald-500 text-white rounded-full animate-pulse">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-mono text-sm">{prayer.time}</span>
                  {activePrayer === index && remainingTime && (
                    <motion.span
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-emerald-600 dark:text-emerald-400 font-medium"
                    >
                      Remaining: {remainingTime}
                    </motion.span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default PrayerTimesSection;
