// src/features/islamic/pages/IslamicHomePage.jsx
// Islamic home page featuring Quran verse, prayer times, and prayer tracking

import React, { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, RefreshCw, Settings, Bug, Loader2 
} from "lucide-react";
import { useTitle } from "@/hooks/useTitle";
import { toast } from "sonner";

// Import custom hooks
import { 
    useLocation, 
    useSettings, 
    usePrayerTimes, 
    useIslamicDate,
    useIslamicPageUIState
} from "@/features/islamic/hooks";

// Import time utilities
import { formatTo12Hour } from "@/features/islamic/utils/timeUtils";

// Import modular components
import {
  LocationSelectionModal,
  SettingsModal,
  DailyOverviewSection,
  PrayerTimesSection,
  ProhibitedTimesSection,
  IslamicCalendarSection,
  DebugSection,
  Accordion,      
  TabInterface      
} from '@/features/islamic/components';

// Import Quran components
import { DailyQuranVerse } from '@/features/islamic/quran/components';


const IslamicHomePage = () => {
  useTitle("Islamic Home");

  // --- Data Hooks ---
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
    error: prayerTimesError, // Consider handling this error display
    activePrayer,
    remainingTime,
    refreshPrayerTimes,
  } = usePrayerTimes(location, settings);
  const {
    islamicDate,
    isLoading: isIslamicDateLoading,
    error: islamicDateError, // Consider handling this error display
    refreshIslamicDate,
  } = useIslamicDate(location);

  // --- UI State Hook ---
  const {
    showDebug,
    showLocationModal,
    showSettingsModal,
    toggleDebug,
    openLocationModal,
    closeLocationModal,
    openSettingsModal,
    closeSettingsModal,
  } = useIslamicPageUIState();

  // Handle dashboard refresh (updated)
  const handleRefreshDashboard = () => {
    if (location) {
      toast.info("Refreshing dashboard data...");
      refreshPrayerTimes();
      refreshIslamicDate();
      // Consider refreshing holidays too if needed: refreshHolidays();
      
      if (settings?.calculationMethod === "mwl") {
        toast.success("Using Muslim World League method");
      } else {
        toast.info(
          "Tip: Use Muslim World League method in settings for times matching Google."
        );
      }
    } else {
      toast.warning("Please select a location first");
      openLocationModal(); // Use handler from hook
    }
  };

  // --- Animation Variants (Unchanged) ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = useMemo(() => ({
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 20 } },
  }), []);

  // --- Settings Handlers (Updated) ---
  const savePrayerTimeAdjustments = (adjustments) => {
    updateTimeAdjustments(adjustments);
    refreshPrayerTimes(); 
  };
  const saveCalculationMethod = (method) => {
    updateCalculationMethod(method);
    refreshPrayerTimes();
  };

  // --- Secondary Tabs Definition ---
  const secondaryTabs = [
    {
      label: "Calendar",
      icon: null,
      content: (
        <IslamicCalendarSection
          islamicDate={islamicDate}
          isLoading={isIslamicDateLoading}
          error={islamicDateError}
          itemVariants={itemVariants}
        />
      )
    },
    {
      label: "Prohibited Times",
      icon: null,
      content: (
        <ProhibitedTimesSection
          prohibitedTimes={prohibitedTimes}
          isLoading={isPrayerTimesLoading}
          itemVariants={itemVariants}
        />
      )
    }
  ];

  // --- Loading Placeholder (Restored) ---
  const LoadingPlaceholder = ({ text, color = "blue" }) => (
    <div className="glass-card p-5 rounded-lg shadow-md flex items-center justify-center h-[280px]">
      <Loader2 className={`h-6 w-6 animate-spin text-${color}-500`} />
      <span className="ml-2 text-muted-foreground">{text}</span>
    </div>
  );
  
  // --- Render Logic ---
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header with location and settings */}
      <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4 mb-2">
        <div
          className="flex items-center cursor-pointer hover:text-primary transition-colors"
          onClick={openLocationModal} // Use handler from hook
        >
          <MapPin size={18} className="mr-2 text-primary" />
          <h1 className="text-xl font-semibold">
            {location
              ? `${location.name}, ${location.country}`
              : "Select Location"}
          </h1>
        </div>

        <div className="flex space-x-2 ml-auto">
          <button
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh Data"
            onClick={handleRefreshDashboard}
          >
            <RefreshCw size={16} />
          </button>

          <button
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Prayer Time Settings"
            onClick={openSettingsModal} // Use handler from hook
          >
            <Settings size={16} />
          </button>

          <button
            className={`p-2 rounded-md transition-colors ${showDebug ? "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
            title="Toggle Debug Panel"
            onClick={toggleDebug} // Use handler from hook
          >
            <Bug size={16} />
          </button>
        </div>
      </div>

      {/* Debug Accordion */}
      {showDebug && (
        <Accordion 
          title="Debug Information" 
          icon={<Bug size={18} className="text-amber-500" />}
          defaultOpen={false} // Accordion handles its own open state
        >
          <DebugSection
            location={location}
            prayerTimes={prayerTimes}
            islamicDate={islamicDate}
            settings={settings}
            onRefresh={handleRefreshDashboard}
            itemVariants={itemVariants}
          />
        </Accordion>
      )}

      {/* Main dashboard content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Daily Quran Verse */}
        <motion.div className="mb-4" variants={itemVariants}>
          <DailyQuranVerse /> 
        </motion.div>

        {/* Grid View Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Daily Prayer Overview Section */}
          <motion.div className="md:col-span-2" variants={itemVariants}>
            {prayerTimes && !isPrayerTimesLoading ? (
              <DailyOverviewSection
                prayerTimes={prayerTimes}
                location={location}
                formatTo12Hour={(time) => formatTo12Hour(time, settings?.use12HourFormat)}
                itemVariants={itemVariants}
              />
            ) : (
              <LoadingPlaceholder text="Loading Overview..." color="emerald" />
            )}
          </motion.div>

          {/* Prayer Times Section */}
          <motion.div className="md:row-span-2" variants={itemVariants}>
            {prayerTimes && !isPrayerTimesLoading ? (
              <PrayerTimesSection
                prayerTimes={prayerTimes}
                activePrayer={activePrayer}
                remainingTime={remainingTime}
                isLoading={false} // Loading state now handled by the presence of prayerTimes
                itemVariants={itemVariants}
              />
            ) : (
              <LoadingPlaceholder text="Loading Prayer Times..." color="blue" />
            )}
          </motion.div>

          {/* Secondary Information Tabs */}
          <motion.div className="md:col-span-2" variants={itemVariants}>
            <div className="glass-card p-4 rounded-lg shadow-md border border-blue-200/20">
              <TabInterface tabs={secondaryTabs} />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Location Selection Modal */}
      {showLocationModal && (
        <LocationSelectionModal
          isOpen={showLocationModal} // Controlled by hook state
          onClose={closeLocationModal} // Use handler from hook
          onSelectLocation={(loc) => {
            selectLocation(loc);
            closeLocationModal(); // Close after selection
          }}
          savedLocations={savedLocations}
          isGettingLocation={isLocationLoading} // This state comes from useLocation
          onGetCurrentLocation={getCurrentLocation} // This function comes from useLocation
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          onClose={closeSettingsModal} // Use handler from hook
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