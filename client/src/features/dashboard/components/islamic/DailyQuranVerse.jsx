import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarIcon, RefreshCw, BookOpen } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const DailyQuranVerse = () => {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fallback verses in case API fails
  const fallbackVerses = [
    {
      text: "And We have certainly made the Quran easy to remember. So is there anyone who will be mindful?",
      arabicText:
        "وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ",
      surah: "Al-Qamar",
      ayah: 17,
      surahNum: 54,
    },
    {
      text: "Indeed, Allah is with those who are patient.",
      arabicText: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
      surah: "Al-Baqarah",
      ayah: 153,
      surahNum: 2,
    },
    {
      text: "So verily, with hardship, there is ease.",
      arabicText: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
      surah: "Ash-Sharh",
      ayah: 5,
      surahNum: 94,
    },
    {
      text: "And He found you lost and guided you.",
      arabicText: "وَوَجَدَكَ ضَالًّا فَهَدَىٰ",
      surah: "Ad-Duha",
      ayah: 7,
      surahNum: 93,
    },
  ];

  const fetchDailyVerse = async (forceRefresh = false) => {
    // Check if we already have a verse for today in localStorage
    const today = new Date().toDateString();
    const savedVerse = localStorage.getItem("quranVerse");
    const savedDate = localStorage.getItem("quranVerseDate");

    // If we have a cached verse from today and not forcing refresh, use it
    if (savedVerse && savedDate === today && !forceRefresh) {
      setVerse(JSON.parse(savedVerse));
      setLoading(false);
      return;
    }

    // Otherwise fetch a new verse
    try {
      setLoading(true);
      if (forceRefresh) {
        setRefreshing(true);
      }

      // Get a random surah (1-114) and ayah
      const surahNum = Math.floor(Math.random() * 114) + 1;

      // Fetch the surah to determine number of ayahs
      const surahResponse = await axios.get(
        `https://api.alquran.cloud/v1/surah/${surahNum}/en.asad`
      );

      const numberOfAyahs = surahResponse.data.data.numberOfAyahs;
      const ayahNum = Math.floor(Math.random() * numberOfAyahs) + 1;

      // Now fetch the specific verse
      const verseResponse = await axios.get(
        `https://api.alquran.cloud/v1/ayah/${surahNum}:${ayahNum}/en.asad`
      );

      // Get Arabic version too
      const arabicResponse = await axios.get(
        `https://api.alquran.cloud/v1/ayah/${surahNum}:${ayahNum}/ar.alafasy`
      );

      const verseData = {
        text: verseResponse.data.data.text,
        arabicText: arabicResponse.data.data.text,
        surah: verseResponse.data.data.surah.englishName,
        ayah: verseResponse.data.data.numberInSurah,
        surahNum: surahNum,
      };

      // Save to state and localStorage
      setVerse(verseData);
      localStorage.setItem("quranVerse", JSON.stringify(verseData));
      localStorage.setItem("quranVerseDate", today);

      if (forceRefresh) {
        toast.success("Quran verse refreshed successfully");
      }
    } catch (err) {
      console.error("Error fetching Quran verse:", err);

      // Use fallback verses if API fails
      const randomIndex = Math.floor(Math.random() * fallbackVerses.length);
      const fallbackVerse = fallbackVerses[randomIndex];

      setVerse(fallbackVerse);
      localStorage.setItem("quranVerse", JSON.stringify(fallbackVerse));
      localStorage.setItem("quranVerseDate", today);

      if (forceRefresh) {
        toast.error("Could not refresh verse. Using fallback verse.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle manual refresh of the verse
  const handleRefreshVerse = () => {
    fetchDailyVerse(true);
  };

  useEffect(() => {
    fetchDailyVerse();
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-5 rounded-lg shadow-md animate-pulse flex flex-col items-center justify-center min-h-[200px]">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-1"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-1"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-3"></div>
        <div className="mt-4 h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-5 rounded-lg shadow-md text-red-500 dark:text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  // Generate the Quran.com URL for the specific verse
  const quranComUrl = `https://quran.com/${verse?.surahNum}/${verse?.ayah}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-5 rounded-lg shadow-md overflow-hidden relative border border-primary/20"
    >
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-primary"></div>

      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/40"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/40"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary/40"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/40"></div>

      {/* Title with icon inside the container */}
      <div className="flex items-center mb-4">
        <BookOpen size={20} className="mr-2 text-primary" />
        <h2 className="text-lg font-semibold">Daily Quran Verse</h2>
      </div>

      {/* Refresh button */}
      <button
        onClick={handleRefreshVerse}
        disabled={refreshing}
        className="absolute top-2 right-2 p-2 text-xs bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
        title="Get new verse"
      >
        <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
      </button>

      {/* Arabic text with staggered animation */}
      <motion.h3
        className="font-arabic text-lg md:text-xl text-right leading-loose mb-4 text-primary/90 dark:text-primary/80"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        {verse?.arabicText}
      </motion.h3>

      {/* English translation with staggered animation */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-sm md:text-base text-muted-foreground/80 italic mb-4"
      >
        "{verse?.text}"
      </motion.p>

      {/* Clickable Reference with hover animation */}
      <motion.a
        href={quranComUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-end text-xs text-primary/80 font-medium group hover:text-primary transition-colors duration-200"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <CalendarIcon size={12} className="mr-1 animate-pulse-slow" />
        <span>
          Quran {verse?.surahNum}:{verse?.ayah} (Surah {verse?.surah})
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-1 opacity-70 group-hover:opacity-100"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </motion.a>
    </motion.div>
  );
};

export default DailyQuranVerse;
