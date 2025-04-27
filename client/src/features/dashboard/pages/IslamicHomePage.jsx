// src/features/dashboard/pages/IslamicHomePage.jsx
// Islamic home page featuring Quran verse, prayer times, and prayer tracking

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, RefreshCw, Settings, Bug, Download } from "lucide-react";
import { useTitle } from "../../../hooks/useTitle";
import { toast } from "sonner";

// Import custom hooks
import { useLocation } from "../hooks/useLocation";
import { useSettings } from "../hooks/useSettings";
import { usePrayerTimes } from "../hooks/usePrayerTimes";
import { useIslamicDate } from "../hooks/useIslamicDate";

// Import time utilities
import { formatTo12Hour } from "../utils/islamic/timeUtils";

// Import modular components
import LocationSelectionModal from "../components/islamic/LocationSelectionModal";
import SettingsModal from "../components/islamic/SettingsModal";
import DailyOverviewSection from "../components/islamic/DailyOverviewSection";
import PrayerTimesSection from "../components/islamic/PrayerTimesSection";
import ProhibitedTimesSection from "../components/islamic/ProhibitedTimesSection";
import IslamicCalendarSection from "../components/islamic/IslamicCalendarSection";
import DailyQuranVerse from "../components/islamic/DailyQuranVerse";
import DebugSection from "../components/islamic/DebugSection";

const IslamicHomePage = () => {
  useTitle("Islamic Home");

  // Use custom hooks
  const {
    settings,
    updateCalculationMethod,
    updateTimeAdjustments,
    updateTimeFormat,
  } = useSettings();
  const {
    location,
    savedLocations,
    isLoading: isLocationLoading,
    getCurrentLocation,
    selectLocation,
  } = useLocation();
  const {
    prayerTimes,
    prohibitedTimes,
    isLoading: isPrayerTimesLoading,
    error: prayerTimesError,
    activePrayer,
    remainingTime,
    updateActivePrayer,
    refreshPrayerTimes,
  } = usePrayerTimes(location, settings);
  const {
    islamicDate,
    isLoading: isIslamicDateLoading,
    error: islamicDateError,
    refreshIslamicDate,
  } = useIslamicDate(location);

  // UI state
  const [showDebug, setShowDebug] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time for display purposes only (e.g., clock component if added)
  useEffect(() => {
    // Set up interval for continuous updates
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute instead of every second

    // Immediately update time when location changes
    setCurrentTime(new Date());

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [location]); // Add location as a dependency to refresh when location changes

  // Handle dashboard refresh
  const handleRefreshDashboard = () => {
    if (location) {
      toast.info("Refreshing dashboard data...");
      refreshPrayerTimes();
      refreshIslamicDate();
      
      // Show information about calculation method
      if (settings?.calculationMethod === "mwl") {
        toast.success("Using Muslim World League method (Same as Google)");
      } else {
        toast.info(
          "For times matching Google search, switch to Muslim World League method in settings"
        );
      }
    } else {
      toast.warning("Please select a location first");
      setShowLocationModal(true);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Memoize animation variants to prevent unnecessary re-renders
  const itemVariants = useMemo(() => ({
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  }), []);

  // Handler for saving user preferences
  const savePrayerTimeAdjustments = (adjustments) => {
    updateTimeAdjustments(adjustments);
    // Refresh prayer times with new adjustments
    refreshPrayerTimes();
  };

  // Handler for saving calculation method
  const saveCalculationMethod = (method) => {
    updateCalculationMethod(method);
    // Refresh prayer times with new method
    refreshPrayerTimes();
  };

  // Render the dashboard
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header with location and settings */}
      <div className="flex justify-between items-center mb-6">
        <div
          className="flex items-center cursor-pointer hover:text-primary transition-colors"
          onClick={() => setShowLocationModal(true)}
        >
          <MapPin size={18} className="mr-2" />
          <h1 className="text-xl font-semibold">
            {location
              ? `${location.name}, ${location.country}`
              : "Select Location"}
          </h1>
        </div>

        <div className="flex space-x-2">
          <button
            className="p-2 rounded-full hover:bg-muted/50 transition-colors"
            title="Refresh Data"
            onClick={handleRefreshDashboard}
          >
            <RefreshCw size={18} />
          </button>

          <button
            className="p-2 rounded-full hover:bg-muted/50 transition-colors"
            title="Prayer Time Settings"
            onClick={() => setShowSettingsModal(true)}
          >
            <Settings size={18} />
          </button>

          <button
            className={`p-2 rounded-full transition-colors ${
              showDebug
                ? "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300"
                : "hover:bg-muted/50"
            }`}
            title="Toggle Debug Panel"
            onClick={() => setShowDebug(!showDebug)}
          >
            <Bug size={18} />
          </button>
        </div>
      </div>

      {/* Debug Section - Only shown when toggled */}
      {showDebug && (
        <DebugSection
          location={location}
          prayerTimes={prayerTimes}
          islamicDate={islamicDate}
          settings={settings}
          onRefresh={handleRefreshDashboard}
          itemVariants={itemVariants}
        />
      )}

      {/* Main dashboard content */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Daily Quran Verse */}
        <motion.div
          className="col-span-1 md:col-span-3"
          variants={itemVariants}
        >
          <DailyQuranVerse />
        </motion.div>

        {/* Daily Prayer Overview Section */}
        <motion.div
          className="col-span-1 md:col-span-2"
          variants={itemVariants}
        >
          <DailyOverviewSection
            prayerTimes={prayerTimes}
            currentTime={currentTime}
            location={location}
            formatTo12Hour={(time) =>
              formatTo12Hour(time, settings?.use12HourFormat)
            }
            itemVariants={itemVariants}
          />
        </motion.div>

        {/* Prayer Times Section */}
        <motion.div 
          className="col-span-1 row-span-2"
          variants={itemVariants}
        >
          <PrayerTimesSection
            prayerTimes={prayerTimes}
            activePrayer={activePrayer}
            remainingTime={remainingTime}
            isLoading={isPrayerTimesLoading}
            itemVariants={itemVariants}
          />
        </motion.div>

        {/* Islamic Calendar Section */}
        <motion.div 
          className="col-span-1"
          variants={itemVariants}
        >
          <IslamicCalendarSection
            itemVariants={itemVariants}
            isLoading={isIslamicDateLoading}
          />
        </motion.div>

        {/* Prohibited Prayer Times Section */}
        <motion.div 
          className="col-span-1"
          variants={itemVariants}
        >
          <ProhibitedTimesSection
            prohibitedTimes={prohibitedTimes}
            itemVariants={itemVariants}
          />
        </motion.div>

        {/* Prayer Tracking Section - Placeholder */}
        <motion.div 
          className="col-span-1 md:col-span-3"
          variants={itemVariants}
        >
          <div className="glass-card p-5 rounded-lg shadow-md border border-blue-200/20">
            <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white flex items-center">
              <Download className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-2" />
              Prayer Tracking
            </h2>
            <div className="flex items-center justify-center h-[180px] text-gray-500 dark:text-gray-400 text-center">
              Coming soon - Track your prayer activities
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Location Selection Modal */}
      {showLocationModal && (
        <LocationSelectionModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          onSelectLocation={(loc) => {
            selectLocation(loc);
            setShowLocationModal(false);
          }}
          savedLocations={savedLocations}
          isGettingLocation={isLocationLoading}
          onGetCurrentLocation={getCurrentLocation}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          timeAdjustments={settings?.timeAdjustments}
          calculationMethod={settings?.calculationMethod}
          use12HourFormat={settings?.use12HourFormat}
          savePrayerTimeAdjustments={savePrayerTimeAdjustments}
          saveCalculationMethod={saveCalculationMethod}
          saveTimeFormat={updateTimeFormat}
        />
      )}
    </div>
  );
};

export default IslamicHomePage;
