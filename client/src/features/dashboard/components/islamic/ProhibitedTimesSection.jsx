import React from "react";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const ProhibitedTimesSection = ({ prohibitedTimes, itemVariants }) => {
  return (
    <motion.section variants={itemVariants}>
      <div className="glass-card p-5 rounded-lg shadow-md border border-red-300/20 bg-gradient-to-r from-red-50/10 to-orange-50/10 dark:from-red-950/20 dark:to-orange-950/20">
        <h2 className="text-lg font-semibold mb-4 flex items-center text-red-600 dark:text-red-400">
          <AlertTriangle size={18} className="mr-2" /> Prohibited Prayer Times
        </h2>

        <div className="space-y-3">
          {prohibitedTimes.map((time) => (
            <div
              key={time.name}
              className="flex justify-between items-center p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/50 dark:hover:bg-red-900/20 transition-colors"
            >
              <div className="flex items-center">
                {time.icon}
                <div>
                  <div className="text-sm">{time.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {time.reason}
                  </div>
                </div>
              </div>
              <span className="font-mono text-xs">{time.time}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-red-50/30 dark:bg-red-950/30 rounded-lg">
          <h3 className="text-sm font-medium mb-2 text-red-600 dark:text-red-400">
            Important Note
          </h3>
          <p className="text-xs text-muted-foreground">
            These prohibited times are calculated dynamically based on the daily
            prayer times. It is makruh (disliked) to offer voluntary prayers
            during these times. However, obligatory prayers that one has missed
            may be performed.
          </p>
        </div>
      </div>
    </motion.section>
  );
};

export default ProhibitedTimesSection;
