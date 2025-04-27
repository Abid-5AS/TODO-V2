import React, { useState } from "react";
import { Bug, ChevronDown, ChevronUp, CalendarClock } from "lucide-react";
import { motion } from "framer-motion";

const DebugSection = ({
  location,
  prayerTimes,
  islamicDate,
  timezone,
  settings,
  onRefresh,
  itemVariants,
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // Constants for local storage
  const HOLIDAY_STORAGE_KEY = "islamic_holiday_data";

  // Function to get holiday cache information
  const getHolidayCacheInfo = () => {
    try {
      const storedData = localStorage.getItem(HOLIDAY_STORAGE_KEY);
      
      if (!storedData) {
        return {
          status: "No holiday data cached",
          timestamp: null,
          age: null,
          size: 0
        };
      }
      
      const parsedData = JSON.parse(storedData);
      const timestamp = new Date(parsedData.timestamp);
      const now = new Date();
      const ageInMs = now - timestamp;
      const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
      const ageInHours = Math.floor((ageInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      // Calculate storage size (approximate)
      const dataSizeBytes = storedData.length;
      const dataSizeKB = (dataSizeBytes / 1024).toFixed(2);
      
      return {
        status: "Holiday data cached",
        timestamp: timestamp.toLocaleString(),
        age: `${ageInDays} days, ${ageInHours} hours ago`,
        size: `${dataSizeKB} KB`,
        holidays: parsedData.data.holidays.length,
        willExpireIn: `${30 - ageInDays} days`
      };
    } catch (error) {
      return {
        status: "Error parsing holiday cache",
        error: String(error)
      };
    }
  };

  // Function to safely format timezone information
  const formatTimezone = (timezone) => {
    if (!timezone) return null;

    try {
      // If timezone is an object, extract key information
      if (typeof timezone === "object") {
        return (
          timezone.zoneName ||
          (timezone.gmtOffset !== undefined
            ? `GMT${timezone.gmtOffset >= 0 ? "+" : ""}${
                timezone.gmtOffset / 3600
              }`
            : "Unknown timezone")
        );
      }
      // If timezone is a string, just return it
      if (typeof timezone === "string") {
        return timezone;
      }
      // Default fallback
      return JSON.stringify(timezone).substring(0, 30);
    } catch (error) {
      return "Invalid timezone data";
    }
  };

  // Format the timezone for display
  const timezoneDisplay = formatTimezone(timezone);

  // Helper function to format JSON properly
  const formatValue = (value) => {
    if (value === null || value === undefined) return "null";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return value.toString();
  };

  const methodInfo = {
    standard: "Islamic Society of North America (ISNA) - Fajr: 15°, Isha: 15°",
    hanafi: "University of Islamic Sciences, Karachi - Fajr: 18°, Isha: 18°",
    mwl: "Muslim World League (Google Default) - Fajr: 18°, Isha: 17°",
  };

  // Get holiday cache information
  const holidayCacheInfo = getHolidayCacheInfo();

  return (
    <motion.div className="glass-card p-4 rounded-lg" variants={itemVariants}>
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <Bug className="w-5 h-5 mr-2 text-amber-500" />
          <h2 className="text-lg font-semibold">Debug Information</h2>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          {/* Current Settings */}
          <div>
            <h3 className="font-medium text-amber-600 dark:text-amber-400 mb-1">
              Current Settings
            </h3>
            <div className="text-xs bg-amber-50/50 dark:bg-amber-900/20 p-3 rounded border border-amber-200/50 dark:border-amber-800/30">
              <p>
                <span className="font-medium">Calculation Method:</span>{" "}
                {settings?.calculationMethod || "Not set"} (
                {methodInfo[settings?.calculationMethod] || "Unknown"})
              </p>
              <p>
                <span className="font-medium">Madhab:</span>{" "}
                {settings?.madhab === 1 ? "Hanafi" : "Shafi/Maliki/Hanbali"}
              </p>
              <p>
                <span className="font-medium">Time Format:</span>{" "}
                {settings?.use12HourFormat ? "12-hour" : "24-hour"}
              </p>
              <p className="font-medium mt-2">Time Adjustments:</p>
              <ul className="ml-2 grid grid-cols-2 gap-x-2 gap-y-1">
                {settings?.timeAdjustments &&
                  Object.entries(settings.timeAdjustments).map(
                    ([prayer, adjustment]) => (
                      <li key={prayer}>
                        {prayer}: {adjustment > 0 ? "+" : ""}
                        {adjustment} min
                      </li>
                    )
                  )}
              </ul>
            </div>
          </div>

          {/* Holiday Cache Information */}
          <div>
            <h3 className="font-medium text-amber-600 dark:text-amber-400 mb-1 flex items-center">
              <CalendarClock className="w-4 h-4 mr-1 text-amber-500" />
              Holiday Cache Information
            </h3>
            <div className="text-xs bg-amber-50/50 dark:bg-amber-900/20 p-3 rounded border border-amber-200/50 dark:border-amber-800/30">
              <p>
                <span className="font-medium">Status:</span> {holidayCacheInfo.status}
              </p>
              {holidayCacheInfo.timestamp && (
                <>
                  <p>
                    <span className="font-medium">Created on:</span> {holidayCacheInfo.timestamp}
                  </p>
                  <p>
                    <span className="font-medium">Age:</span> {holidayCacheInfo.age}
                  </p>
                  <p>
                    <span className="font-medium">Size:</span> {holidayCacheInfo.size}
                  </p>
                  {holidayCacheInfo.holidays && (
                    <p>
                      <span className="font-medium">Holidays stored:</span> {holidayCacheInfo.holidays}
                    </p>
                  )}
                  {holidayCacheInfo.willExpireIn && (
                    <p>
                      <span className="font-medium">Will expire in:</span> {holidayCacheInfo.willExpireIn}
                    </p>
                  )}
                </>
              )}
              {holidayCacheInfo.error && (
                <p className="text-red-500">
                  <span className="font-medium">Error:</span> {holidayCacheInfo.error}
                </p>
              )}
              <div className="mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    localStorage.removeItem(HOLIDAY_STORAGE_KEY);
                    onRefresh();
                  }}
                  className="text-xs py-1 px-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  Clear Holiday Cache
                </button>
              </div>
            </div>
          </div>

          {/* Prayer Time Calculation Information */}
          <div>
            <h3 className="font-medium text-amber-600 dark:text-amber-400 mb-1">
              Prayer Time Calculation Info
            </h3>
            <div className="text-xs bg-amber-50/50 dark:bg-amber-900/20 p-3 rounded border border-amber-200/50 dark:border-amber-800/30">
              <p className="font-medium mb-1">Calculation Angles:</p>
              <ul className="ml-2 mb-2">
                <li>
                  Fajr: {settings?.calculationMethod === "standard" 
                    ? "15°" 
                    : settings?.calculationMethod === "mwl" 
                      ? "18°" 
                      : "18°"} below horizon (begins true dawn)
                </li>
                <li>Sunrise: Sun appears at the horizon</li>
                <li>Dhuhr: Sun passes meridian (zenith)</li>
                <li>
                  Asr: Object shadow length = object height{" "}
                  {settings?.madhab === 1 ? "(Hanafi: twice height)" : "(Shafi/Maliki/Hanbali)"}
                </li>
                <li>Maghrib: Sun disappears below horizon</li>
                <li>
                  Isha: {settings?.calculationMethod === "standard" 
                    ? "15°" 
                    : settings?.calculationMethod === "mwl" 
                      ? "17°" 
                      : "18°"} below horizon (complete darkness)
                </li>
              </ul>

              <p className="font-medium mb-1">Prohibited Prayer Times:</p>
              <ul className="ml-2">
                <li>After Fajr until sunrise</li>
                <li>During sunrise (approx. 15-20 min)</li>
                <li>At zenith (when sun is at highest point)</li>
                <li>After Asr until Maghrib</li>
                <li>During sunset (approx. 15 min)</li>
              </ul>
            </div>
          </div>

          {/* Location Information */}
          <div>
            <h3 className="font-medium text-amber-600 dark:text-amber-400 mb-1">
              Location
            </h3>
            <pre className="text-xs bg-amber-50/50 dark:bg-amber-900/20 p-3 rounded border border-amber-200/50 dark:border-amber-800/30 overflow-auto">
              {formatValue(location)}
            </pre>
          </div>

          {/* Prayer Times Object */}
          <div>
            <h3 className="font-medium text-amber-600 dark:text-amber-400 mb-1">
              Prayer Times
            </h3>
            <pre className="text-xs bg-amber-50/50 dark:bg-amber-900/20 p-3 rounded border border-amber-200/50 dark:border-amber-800/30 overflow-auto">
              {formatValue(prayerTimes)}
            </pre>
          </div>

          {/* Islamic Date Information */}
          <div>
            <h3 className="font-medium text-amber-600 dark:text-amber-400 mb-1">
              Islamic Date
            </h3>
            <pre className="text-xs bg-amber-50/50 dark:bg-amber-900/20 p-3 rounded border border-amber-200/50 dark:border-amber-800/30 overflow-auto">
              {formatValue(islamicDate)}
            </pre>
          </div>

          <button
            onClick={onRefresh}
            className="w-full py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-sm font-medium transition-colors"
          >
            Refresh Data
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default DebugSection;
