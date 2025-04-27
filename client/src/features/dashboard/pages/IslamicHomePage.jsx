// src/features/dashboard/pages/IslamicHomePage.jsx
// Islamic home page featuring Quran verse, prayer times, and prayer tracking

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Calendar,
  PieChart,
  MapPin,
  Sunrise,
  Sunset,
  AlertTriangle,
  Moon,
  Star,
  Sun,
  Loader2,
  Search,
  Navigation,
  Save,
  RefreshCw,
  Settings,
  Coffee,
  CloudMoon,
  Droplets,
  X,
} from "lucide-react";
import axios from "axios";
import { useTitle } from "../../../hooks/useTitle";
import { toast } from "sonner";

// Import modular components
import LocationSelectionModal from "../components/islamic/LocationSelectionModal";
import SettingsModal from "../components/islamic/SettingsModal";
import DailyOverviewSection from "../components/islamic/DailyOverviewSection";
import PrayerTimesSection from "../components/islamic/PrayerTimesSection";
import ProhibitedTimesSection from "../components/islamic/ProhibitedTimesSection";
import IslamicCalendarSection from "../components/islamic/IslamicCalendarSection";
import DailyQuranVerse from "../components/islamic/DailyQuranVerse";

const IslamicHomePage = () => {
  useTitle("Islamic Home");

  // Location state
  const [location, setLocation] = useState(null);
  const [isLoadingPrayerTimes, setIsLoadingPrayerTimes] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [savedLocations, setSavedLocations] = useState([]);

  // Prayer calculation settings
  const [madhab, setMadhab] = useState(1); // 0 for Shafi, 1 for Hanafi
  const [timeAdjustments, setTimeAdjustments] = useState({
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0, // Adjusting Maghrib time to match Google data
    isha: 0, // Adjusting Isha time to match Google data
  });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Time states
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activePrayer, setActivePrayer] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);

  // Prayer times data
  const [prayerTimes, setPrayerTimes] = useState({
    fajr: "04:07",
    dhuhr: "11:57",
    asr: "16:32",
    maghrib: "18:26",
    isha: "19:45",
    sunrise: "05:27",
    sunset: "18:25",
    midnight: "00:00",
    imsak: "03:50",
  });

  // Islamic calendar data
  const [islamicDate, setIslamicDate] = useState({
    date: "15 Ramadan 1445",
    gregorian: "April 27, 2024",
    hijriYear: 1445,
    upcomingEvents: [
      { name: "Laylat al-Qadr", date: "27 Ramadan", daysLeft: 12 },
      { name: "Eid al-Fitr", date: "1 Shawwal", daysLeft: 16 },
    ],
  });

  // Load saved settings and location from localStorage on component mount
  useEffect(() => {
    const savedLocationData = localStorage.getItem("islamicDashboardLocation");
    const savedLocationsList =
      JSON.parse(localStorage.getItem("savedIslamicLocations")) || [];
    const savedMadhab = localStorage.getItem("islamicDashboardMadhab");
    const savedAdjustments = JSON.parse(
      localStorage.getItem("islamicDashboardAdjustments")
    );

    setSavedLocations(savedLocationsList);

    if (savedMadhab) {
      setMadhab(parseInt(savedMadhab));
    }

    if (savedAdjustments) {
      setTimeAdjustments(savedAdjustments);
    }

    if (savedLocationData) {
      setLocation(JSON.parse(savedLocationData));
    } else {
      // Prompt user to select location if none is saved
      setIsLocationModalOpen(true);
    }
  }, []);

  // Function to convert time string to Date object
  const timeStringToDate = (timeStr) => {
    const now = new Date();
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date(now);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Helper function to add minutes to a time string (HH:MM format)
  const addMinutesToTimeString = (timeStr, minutes) => {
    if (!minutes || minutes === 0) return timeStr;

    const [hours, mins] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, mins + minutes, 0, 0);

    return `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`;
  };

  // Helper function to subtract minutes from a time string (HH:MM format)
  const subtractMinutesToTimeString = (timeStr, minutes) => {
    if (!minutes || minutes === 0) return timeStr;

    const [hours, mins] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, mins - minutes, 0, 0);

    return `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`;
  };

  // Function to calculate time difference in HH:MM:SS format
  const calculateTimeDifference = (endTime) => {
    const now = new Date();
    const end = timeStringToDate(endTime);

    // Handle time crossing midnight
    if (end < now) {
      end.setDate(end.getDate() + 1);
    }

    let diff = Math.floor((end - now) / 1000); // difference in seconds

    const hours = Math.floor(diff / 3600);
    diff %= 3600;
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      updateActivePrayer();
    }, 1000);

    return () => clearInterval(timer);
  }, [prayerTimes]);

  // Fetch prayer times when location changes
  useEffect(() => {
    if (location) {
      fetchPrayerTimes();
      fetchIslamicDate();
      // Save location to localStorage
      localStorage.setItem(
        "islamicDashboardLocation",
        JSON.stringify(location)
      );
    }
  }, [location]);

  // Handle selecting a location
  const handleLocationSelect = (locationData) => {
    setLocation(locationData);
    setIsLocationModalOpen(false);

    // Add to saved locations if not already present
    if (
      !savedLocations.some(
        (loc) => loc.displayName === locationData.displayName
      )
    ) {
      const updatedLocations = [...savedLocations, locationData].slice(-5); // Keep last 5 locations
      setSavedLocations(updatedLocations);
      localStorage.setItem(
        "savedIslamicLocations",
        JSON.stringify(updatedLocations)
      );
    }
  };

  // Fetch prayer times based on location
  const fetchPrayerTimes = async () => {
    if (!location) return;

    setIsLoadingPrayerTimes(true);

    try {
      // Get today's date
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const day = today.getDate();

      // Use Aladhan API to get prayer times
      const response = await axios.get(
        `https://api.aladhan.com/v1/timings/${day}-${month}-${year}`,
        {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            method: 5, // Egyptian General Authority of Survey - matches Google data better
            school: madhab, // 0 for Shafi, 1 for Hanafi
            adjustment: 0,
            tune: `0,0,0,0,${timeAdjustments.maghrib},${timeAdjustments.isha},0`, // Fine-tune Maghrib and Isha specifically
          },
        }
      );

      if (response.data && response.data.data && response.data.data.timings) {
        const timings = response.data.data.timings;

        // Apply any manual adjustments if needed
        const adjustedTimings = {
          fajr: addMinutesToTimeString(timings.Fajr, timeAdjustments.fajr),
          dhuhr: addMinutesToTimeString(timings.Dhuhr, timeAdjustments.dhuhr),
          asr: addMinutesToTimeString(timings.Asr, timeAdjustments.asr),
          maghrib: addMinutesToTimeString(
            timings.Maghrib,
            timeAdjustments.maghrib
          ),
          isha: addMinutesToTimeString(timings.Isha, timeAdjustments.isha),
          sunrise: timings.Sunrise,
          sunset: timings.Sunset,
          midnight: timings.Midnight,
          imsak: timings.Imsak,
        };

        // Update prayer times
        setPrayerTimes(adjustedTimings);

        // Log for debugging
        console.log(
          "Google times: Fajr 04:07, Dhuhr 11:56, Asr 16:32, Maghrib 18:25, Isha 19:41"
        );
        console.log("API times before adjustment:", timings);
        console.log("Adjusted times:", adjustedTimings);
      }
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      toast.error("Failed to fetch prayer times. Using default times.");
    } finally {
      setIsLoadingPrayerTimes(false);
    }
  };

  // Fetch Islamic date
  const fetchIslamicDate = async () => {
    try {
      // Get current date
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const day = today.getDate();

      // Use Aladhan API to get Hijri date
      const response = await axios.get(
        `https://api.aladhan.com/v1/gToH/${day}-${month}-${year}`
      );

      if (response.data && response.data.data && response.data.data.hijri) {
        const hijri = response.data.data.hijri;

        // Calculate days until Laylat al-Qadr (27th of Ramadan) if in Ramadan
        let laylatalQadrDaysLeft = null;
        let eidDaysLeft = null;

        if (hijri.month.number === 9) {
          // Ramadan
          laylatalQadrDaysLeft = 27 - parseInt(hijri.day);
          eidDaysLeft = 30 - parseInt(hijri.day) + 1; // 1st of Shawwal
        } else if (hijri.month.number === 8) {
          // Sha'ban
          laylatalQadrDaysLeft = 30 - parseInt(hijri.day) + 27; // days left in Sha'ban + 27 days of Ramadan
          eidDaysLeft = 30 - parseInt(hijri.day) + 30 + 1; // days left in Sha'ban + 30 days of Ramadan + 1st of Shawwal
        }

        const upcomingEvents = [];

        if (laylatalQadrDaysLeft && laylatalQadrDaysLeft > 0) {
          upcomingEvents.push({
            name: "Laylat al-Qadr",
            date: "27 Ramadan",
            daysLeft: laylatalQadrDaysLeft,
          });
        }

        if (eidDaysLeft && eidDaysLeft > 0) {
          upcomingEvents.push({
            name: "Eid al-Fitr",
            date: "1 Shawwal",
            daysLeft: eidDaysLeft,
          });
        }

        // Update Islamic date
        setIslamicDate({
          date: `${hijri.day} ${hijri.month.en} ${hijri.year}`,
          gregorian: `${today.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}`,
          hijriYear: parseInt(hijri.year),
          upcomingEvents:
            upcomingEvents.length > 0
              ? upcomingEvents
              : [
                  {
                    name: "Coming Soon",
                    date: "Check back later",
                    daysLeft: "-",
                  },
                ],
        });
      }
    } catch (error) {
      console.error("Error fetching Islamic date:", error);
    }
  };

  // Add a helper function to convert 24h to 12h format
  const formatTo12Hour = (timeStr) => {
    if (!timeStr) return "";

    const [hours, minutes] = timeStr.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM

    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Prepare formatted fard prayers array with appropriate icons
  const fardPrayers = [
    {
      name: "Fajr",
      time: `${formatTo12Hour(prayerTimes.fajr)} - ${formatTo12Hour(
        prayerTimes.sunrise
      )}`,
      icon: <Droplets size={18} className="text-blue-400" />,
      description: "Dawn Prayer",
      timeRange: { start: prayerTimes.fajr, end: prayerTimes.sunrise },
    },
    {
      name: "Dhuhr",
      time: `${formatTo12Hour(prayerTimes.dhuhr)} - ${formatTo12Hour(
        prayerTimes.asr
      )}`,
      icon: <Sun size={18} className="text-amber-500" />,
      description: "Noon Prayer",
      timeRange: { start: prayerTimes.dhuhr, end: prayerTimes.asr },
    },
    {
      name: "Asr",
      time: `${formatTo12Hour(prayerTimes.asr)} - ${formatTo12Hour(
        prayerTimes.maghrib
      )}`,
      icon: <Clock size={18} className="text-orange-400" />,
      description: "Afternoon Prayer",
      timeRange: { start: prayerTimes.asr, end: prayerTimes.maghrib },
    },
    {
      name: "Maghrib",
      time: `${formatTo12Hour(prayerTimes.maghrib)} - ${formatTo12Hour(
        prayerTimes.isha
      )}`,
      icon: <Sunset size={18} className="text-red-400" />,
      description: "Sunset Prayer",
      timeRange: { start: prayerTimes.maghrib, end: prayerTimes.isha },
    },
    {
      name: "Isha",
      time: `${formatTo12Hour(prayerTimes.isha)} - ${formatTo12Hour(
        prayerTimes.fajr
      )}`,
      icon: <CloudMoon size={18} className="text-indigo-400" />,
      description: "Night Prayer",
      timeRange: { start: prayerTimes.isha, end: prayerTimes.fajr },
    },
  ];

  // Update the prohibited times calculation to be more dynamic
  const calculateProhibitedTimes = () => {
    return [
      {
        name: "Sunrise",
        time: `${formatTo12Hour(prayerTimes.sunrise)} - ${formatTo12Hour(
          addMinutesToTimeString(prayerTimes.sunrise, 15)
        )}`,
        icon: <Sunrise size={14} className="mr-1 text-red-500" />,
        reason: "Prohibited after Fajr until the sun rises completely",
      },
      {
        name: "Zawal (Noon)",
        time: `${formatTo12Hour(
          subtractMinutesToTimeString(prayerTimes.dhuhr, 5)
        )} - ${formatTo12Hour(prayerTimes.dhuhr)}`,
        icon: <Sun size={14} className="mr-1 text-red-500" />,
        reason: "Prohibited when the sun is at its zenith",
      },
      {
        name: "Sunset",
        time: `${formatTo12Hour(
          subtractMinutesToTimeString(prayerTimes.maghrib, 15)
        )} - ${formatTo12Hour(prayerTimes.maghrib)}`,
        icon: <Sunset size={14} className="mr-1 text-red-500" />,
        reason: "Prohibited when the sun is setting",
      },
    ];
  };

  // Calculate prohibited times dynamically
  const prohibitedTimes = calculateProhibitedTimes();

  // Update active prayer based on current time
  const updateActivePrayer = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${String(currentHour).padStart(2, "0")}:${String(
      currentMinute
    ).padStart(2, "0")}`;

    let activePrayerFound = null;

    for (let i = 0; i < fardPrayers.length; i++) {
      const prayer = fardPrayers[i];
      const { start, end } = prayer.timeRange;

      // Handle time periods that cross midnight
      if (end < start) {
        if (currentTimeStr >= start || currentTimeStr < end) {
          activePrayerFound = i;
          setRemainingTime(calculateTimeDifference(end));
          break;
        }
      } else {
        if (currentTimeStr >= start && currentTimeStr < end) {
          activePrayerFound = i;
          setRemainingTime(calculateTimeDifference(end));
          break;
        }
      }
    }

    setActivePrayer(activePrayerFound);
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

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="py-4 px-2 sm:py-6 sm:px-4 bg-theme relative rounded-xl shadow-md">
      {/* Modals */}
      <LocationSelectionModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSelect={handleLocationSelect}
        savedLocations={savedLocations}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        madhab={madhab}
        setMadhab={setMadhab}
        timeAdjustments={timeAdjustments}
        setTimeAdjustments={setTimeAdjustments}
        onApplySettings={fetchPrayerTimes}
      />

      <div className="flex justify-between items-center mb-4">
        <motion.h1
          className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent animate-gradient-x drop-shadow-sm"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          Islamic Dashboard
        </motion.h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchPrayerTimes();
              fetchIslamicDate();
              toast.success("Prayer times updated");
            }}
            className="p-2 text-xs bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
            title="Refresh Prayer Times"
          >
            <RefreshCw size={14} />
          </button>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 text-xs bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
            title="Prayer Time Settings"
          >
            <Settings size={14} />
          </button>

          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="p-2 text-xs flex items-center gap-1 bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
            title="Change Location"
          >
            <MapPin size={14} /> {location?.city || "Set Location"}
          </button>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2"
      >
        {/* Quran Verse Section */}
        <motion.section variants={itemVariants} className="md:col-span-2">
          <DailyQuranVerse />
        </motion.section>

        {/* Daily Prayer Overview Section */}
        <DailyOverviewSection
          prayerTimes={prayerTimes}
          currentTime={currentTime}
          location={location}
          formatTo12Hour={formatTo12Hour}
          itemVariants={itemVariants}
        />

        {/* Fard Prayer Times Section */}
        <PrayerTimesSection
          isLoadingPrayerTimes={isLoadingPrayerTimes}
          fardPrayers={fardPrayers}
          activePrayer={activePrayer}
          remainingTime={remainingTime}
          itemVariants={itemVariants}
        />

        {/* Islamic Calendar Section */}
        <IslamicCalendarSection
          islamicDate={islamicDate}
          itemVariants={itemVariants}
        />

        {/* Prohibited Prayer Times Section */}
        <ProhibitedTimesSection
          prohibitedTimes={prohibitedTimes}
          itemVariants={itemVariants}
        />

        {/* Prayer Tracking Section */}
        <motion.section variants={itemVariants} className="md:col-span-2">
          <div className="glass-card p-5 rounded-lg shadow-md border border-primary/20">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar size={18} className="mr-2" /> Prayer Tracking
            </h2>

            <div className="flex flex-wrap gap-2 mb-4">
              <button className="px-3 py-1 rounded-full bg-primary/10 text-sm hover:bg-primary/20 transition-colors">
                Today
              </button>
              <button className="px-3 py-1 rounded-full bg-primary/5 text-sm hover:bg-primary/20 transition-colors">
                Week
              </button>
              <button className="px-3 py-1 rounded-full bg-primary/5 text-sm hover:bg-primary/20 transition-colors">
                Month
              </button>
            </div>

            <div className="space-y-2">
              {fardPrayers.map((prayer, index) => (
                <div key={prayer.name} className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      activePrayer === index
                        ? "bg-emerald-500"
                        : "bg-primary/20"
                    } mr-2`}
                  ></div>
                  <span className="text-sm">{prayer.name}</span>
                  <div className="ml-auto flex items-center space-x-1">
                    <span className="text-sm font-medium">--</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <div className="inline-block p-4 rounded-full bg-primary/5 mb-2">
                <PieChart size={32} className="text-primary/60" />
              </div>
              <p className="text-xs text-muted-foreground">
                Prayer tracking will be enabled in a future update
              </p>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default IslamicHomePage;
