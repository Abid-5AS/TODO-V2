import React from "react";
import PropTypes from "prop-types";
import { AlertTriangle, Sunrise, Sun, Sunset } from "lucide-react";
import { motion } from "framer-motion";
import { formatTo12Hour } from "@/utils/timeUtils";

const ProhibitedTimesSection = ({ prohibitedTimes, itemVariants }) => {
  // Function to render the appropriate icon based on iconType
  const renderIcon = (iconType) => {
    switch (iconType) {
      case "sunrise":
        return (
          <Sunrise size={16} className="mr-2 text-red-500 dark:text-red-400" />
        );
      case "sun":
        return (
          <Sun size={16} className="mr-2 text-red-500 dark:text-red-400" />
        );
      case "sunset":
        return (
          <Sunset size={16} className="mr-2 text-red-500 dark:text-red-400" />
        );
      default:
        return (
          <AlertTriangle
            size={16}
            className="mr-2 text-red-500 dark:text-red-400"
          />
        );
    }
  };

  return (
    <motion.div
      className="glass-card p-5 rounded-lg shadow-md border border-blue-200/20 h-full"
      variants={itemVariants}
    >
      <div className="flex items-center mb-4">
        <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
          Prohibited Prayer Times
        </h2>
      </div>

      <div className="space-y-3">
        {prohibitedTimes.map((time) => (
          <div
            key={time.name}
            className="flex items-start p-3 rounded-md backdrop-blur-sm bg-red-50/50 dark:bg-red-900/10 border border-red-100/50 dark:border-red-800/30"
          >
            <div className="flex items-center mr-2">
              {renderIcon(time.iconType)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                {time.name}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {time.reason}
              </p>
            </div>
            <div className="text-xs font-mono font-medium bg-red-100/70 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded">
              {/* Directly display the pre-formatted time range string */}
              {time.time || "--:--"}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-red-700/70 dark:text-red-400/70 bg-red-50/50 dark:bg-red-900/20 p-3 rounded-md border border-red-100/50 dark:border-red-800/30 space-y-2">
        <p className="font-medium">Important Notes:</p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>
            These times are calculated based on your location's prayer times.
          </li>
          <li>
            <span className="font-medium">Forbidden Prayer Times</span>: It is
            makruh (disliked) to offer voluntary (nafl) prayers during these
            times.
          </li>
          <li>
            Obligatory (Fard) prayers can still be performed if you missed them
            earlier.
          </li>
          <li>
            The prohibition applies specifically to voluntary prayers, not to
            obligatory ones that were missed and need to be made up.
          </li>
        </ul>
      </div>
    </motion.div>
  );
};

ProhibitedTimesSection.propTypes = {
  prohibitedTimes: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      reason: PropTypes.string,
      time: PropTypes.string,
      iconType: PropTypes.string
    })
  ).isRequired,
  itemVariants: PropTypes.object
};

export default ProhibitedTimesSection;
