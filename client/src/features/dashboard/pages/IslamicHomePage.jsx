// src/features/dashboard/pages/IslamicHomePage.jsx
// Islamic home page featuring Quran verse, prayer times, and prayer tracking

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, RefreshCw, Settings, Bug, Clock, AlertTriangle,
  Moon, Sun, ChevronDown, ChevronUp, Calendar, Loader2
} from "lucide-react";
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

// Accordion Component
const Accordion = ({ title, icon, children, defaultOpen = false, className = "" }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className={`glass-card rounded-lg shadow-md overflow-hidden ${className}`}>
      <div 
        className="flex justify-between items-center p-4 cursor-pointer bg-gradient-to-r from-slate-50/80 to-slate-100/80 dark:from-slate-800/80 dark:to-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          {icon}
          <h2 className="text-lg font-semibold ml-2 text-slate-800 dark:text-white">{title}</h2>
        </div>
        {isOpen ? 
          <ChevronUp className="h-5 w-5 text-slate-500 dark:text-slate-400" /> : 
          <ChevronDown className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        }
      </div>
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="p-4">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

// Tab interface component
const TabInterface = ({ tabs, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <div className="flex flex-col">
      <div className="flex overflow-x-auto no-scrollbar border-b border-slate-200/50 dark:border-slate-700/50 mb-4">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === idx 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <div className="flex items-center">
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </div>
          </button>
        ))}
      </div>
      
      <div>
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

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
  const [showDebug, setShowDebug] = useState(false); // Default to hidden
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

  // Secondary information tabs
  const secondaryTabs = [
    {
      label: "Calendar",
      icon: <Calendar size={16} className="text-violet-500" />,
      content: (
        <IslamicCalendarSection 
          islamicDate={islamicDate}
          itemVariants={itemVariants} 
          isLoading={isIslamicDateLoading} 
        />
      )
    },
    {
      label: "Prohibited Times",
      icon: <AlertTriangle size={16} className="text-red-500" />,
      content: (
        <ProhibitedTimesSection 
          prohibitedTimes={prohibitedTimes} 
          itemVariants={itemVariants} 
        />
      )
    }
  ];

  // Loading placeholder for main sections
  const LoadingPlaceholder = ({ text, color = "blue" }) => (
    <div className="glass-card p-5 rounded-lg shadow-md flex items-center justify-center h-[280px]">
      <Loader2 className={`h-6 w-6 animate-spin text-${color}-500`} />
      <span className="ml-2 text-muted-foreground">{text}</span>
    </div>
  );
  
  // Render the dashboard
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header with location and settings */}
      <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4 mb-2">
        <div
          className="flex items-center cursor-pointer hover:text-primary transition-colors"
          onClick={() => setShowLocationModal(true)}
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
            onClick={() => setShowSettingsModal(true)}
          >
            <Settings size={16} />
          </button>

          <button
            className={`p-2 rounded-md transition-colors ${
              showDebug
                ? "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300"
                : "hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Toggle Debug Panel"
            onClick={() => setShowDebug(!showDebug)}
          >
            <Bug size={16} />
          </button>
        </div>
      </div>

      {/* Debug Accordion - Only shown when toggled */}
      {showDebug && (
        <Accordion 
          title="Debug Information" 
          icon={<Bug size={18} className="text-amber-500" />}
          defaultOpen={false}
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
        {/* Daily Quran Verse - Always full width */}
        <motion.div
          className="mb-4"
          variants={itemVariants}
        >
          <Accordion 
            title="Daily Quran Verse" 
            icon={<Moon size={18} className="text-blue-500" />}
            defaultOpen={true}
          >
            <DailyQuranVerse />
          </Accordion>
        </motion.div>

        {/* Grid View Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Daily Prayer Overview Section */}
          <motion.div
            className="md:col-span-2"
            variants={itemVariants}
          >
            {prayerTimes && !isPrayerTimesLoading ? (
              <DailyOverviewSection
                prayerTimes={prayerTimes}
                location={location}
                formatTo12Hour={(time) =>
                  formatTo12Hour(time, settings?.use12HourFormat)
                }
                itemVariants={itemVariants}
              />
            ) : (
              <LoadingPlaceholder text="Loading Overview..." color="emerald" />
            )}
          </motion.div>

          {/* Prayer Times Section */}
          <motion.div 
            className="md:row-span-2"
            variants={itemVariants}
          >
            {prayerTimes && !isPrayerTimesLoading ? (
              <PrayerTimesSection
                prayerTimes={prayerTimes}
                activePrayer={activePrayer}
                remainingTime={remainingTime}
                isLoading={false}
                itemVariants={itemVariants}
              />
            ) : (
              <LoadingPlaceholder text="Loading Prayer Times..." color="blue" />
            )}
          </motion.div>

          {/* Secondary Information Tabs */}
          <motion.div 
            className="md:col-span-2"
            variants={itemVariants}
          >
            <div className="glass-card p-4 rounded-lg shadow-md border border-blue-200/20">
              <TabInterface tabs={secondaryTabs} />
            </div>
          </motion.div>
        </div>
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
