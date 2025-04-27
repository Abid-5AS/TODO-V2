// src/features/dashboard/pages/IslamicHomePage.jsx
// Islamic home page featuring Quran verse, prayer times, and prayer tracking

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, PieChart, MapPin } from "lucide-react";
import DailyQuranVerse from "../components/DailyQuranVerse";
import { useTitle } from "../../../hooks/useTitle";

const IslamicHomePage = () => {
  useTitle("Islamic Home");
  const [location, setLocation] = useState(null);

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
      <motion.h1
        className="text-2xl md:text-3xl font-bold mb-4 text-center bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent animate-gradient-x drop-shadow-sm"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        Islamic Dashboard
      </motion.h1>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2"
      >
        {/* Quran Verse Section */}
        <motion.section variants={itemVariants} className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-2 flex items-center">
            <span className="mr-2">☪</span> Daily Quran Verse
          </h2>
          <DailyQuranVerse />
        </motion.section>

        {/* Prayer Times Section */}
        <motion.section variants={itemVariants}>
          <div className="glass-card p-5 rounded-lg shadow-md border border-primary/20">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Clock size={18} className="mr-2" /> Prayer Times
            </h2>

            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Location:</span>
              <div className="flex items-center text-sm">
                <MapPin size={14} className="mr-1" />
                <span>Detecting location...</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded bg-primary/5 hover:bg-primary/10 transition-colors">
                <span>Fajr</span>
                <span className="font-mono">--:--</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-primary/5 hover:bg-primary/10 transition-colors">
                <span>Dhuhr</span>
                <span className="font-mono">--:--</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-primary/5 hover:bg-primary/10 transition-colors">
                <span>Asr</span>
                <span className="font-mono">--:--</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-primary/5 hover:bg-primary/10 transition-colors">
                <span>Maghrib</span>
                <span className="font-mono">--:--</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-primary/5 hover:bg-primary/10 transition-colors">
                <span>Isha</span>
                <span className="font-mono">--:--</span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                Prayer times will be enabled in a future update
              </p>
            </div>
          </div>
        </motion.section>

        {/* Prayer Tracking Section */}
        <motion.section variants={itemVariants}>
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
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-primary/20 mr-2"></div>
                <span className="text-sm">Fajr</span>
                <div className="ml-auto flex items-center space-x-1">
                  <span className="text-sm font-medium">--</span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-primary/20 mr-2"></div>
                <span className="text-sm">Dhuhr</span>
                <div className="ml-auto flex items-center space-x-1">
                  <span className="text-sm font-medium">--</span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-primary/20 mr-2"></div>
                <span className="text-sm">Asr</span>
                <div className="ml-auto flex items-center space-x-1">
                  <span className="text-sm font-medium">--</span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-primary/20 mr-2"></div>
                <span className="text-sm">Maghrib</span>
                <div className="ml-auto flex items-center space-x-1">
                  <span className="text-sm font-medium">--</span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-primary/20 mr-2"></div>
                <span className="text-sm">Isha</span>
                <div className="ml-auto flex items-center space-x-1">
                  <span className="text-sm font-medium">--</span>
                </div>
              </div>
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
