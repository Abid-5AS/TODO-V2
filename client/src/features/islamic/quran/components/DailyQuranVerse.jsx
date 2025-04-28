import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { BookText, RefreshCw, Loader2, Copy, Check, Share2 } from "lucide-react";
import { fetchDailyQuranVerse } from "../../services"; // Updated import path relative to new location
import { toast } from "sonner";
import { Button } from "@/components/ui/button"; // Using absolute path
import { Skeleton } from "@/components/ui/skeleton"; // Using absolute path
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; // Using absolute path
import { Separator } from "@/components/ui/separator"; // Using absolute path
import { getLocalStorageItem, setLocalStorageItem } from "@/utils/localStorageUtils"; // Assuming you have localStorage helpers

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const DAILY_VERSE_CACHE_KEY = "dailyQuranVerseData";

// Helper to extract Surah and Ayah number from "S:A" format
const parseVerseReference = (reference) => {
  if (!reference || typeof reference !== 'string') {
    return { surahNum: "1", ayahNum: "1" }; // Default to Al-Fatiha:1 if invalid
  }
  const parts = reference.split(':');
  if (parts.length !== 2 || isNaN(parseInt(parts[0])) || isNaN(parseInt(parts[1]))) {
    console.warn(`Unexpected verse reference format: ${reference}`);
    // Attempt fallback for potential "Surah Name Ayah" format (less likely now)
    const spaceParts = reference.split(" ");
    if (spaceParts.length >= 2 && !isNaN(parseInt(spaceParts[spaceParts.length - 1]))) {
      return { 
        surahNum: "1", // Default to Al-Fatiha if parsing fails
        ayahNum: spaceParts[spaceParts.length - 1] 
      };
    }
    return { surahNum: "1", ayahNum: "1" }; // Default to Al-Fatiha:1 if all parsing fails
  }
  return { 
    surahNum: parts[0].trim(), 
    ayahNum: parts[1].trim() 
  };
};

const DailyQuranVerse = () => {
  const [verseData, setVerseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadVerse = useCallback(async (isRefresh = false) => {
    console.log("DailyQuranVerse: loadVerse called", { isRefresh });
    const todayStr = getTodayDateString();
    const cachedData = getLocalStorageItem(DAILY_VERSE_CACHE_KEY);

    // Use cached data if available for today and not forcing refresh
    if (!isRefresh && cachedData && cachedData.date === todayStr && cachedData.data) {
      console.log("DailyQuranVerse: Using cached verse data for today.");
      setVerseData(cachedData.data);
      setIsLoading(false);
      setError(null);
      return; // Exit early, don't fetch from API
    }

    // Proceed to fetch from API if no valid cache or if refreshing
    console.log("DailyQuranVerse: Fetching new verse data from API.");
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const result = await fetchDailyQuranVerse();
      console.log("DailyQuranVerse: API result:", result);
      if (result.success && result.data && result.data.data) {
        const newVerseData = result.data.data;
        setVerseData(newVerseData);
        // Cache the newly fetched data with today's date
        setLocalStorageItem(DAILY_VERSE_CACHE_KEY, { date: todayStr, data: newVerseData });
        console.log("DailyQuranVerse: verseData state SET and cached with:", newVerseData);
      } else {
        console.error("DailyQuranVerse: API fetch unsuccessful or data missing", result);
        throw new Error(result.error || "Failed to fetch verse");
      }
    } catch (err) {
      console.error("DailyQuranVerse: Error in loadVerse catch block:", err);
      setError(err.message || "Could not load verse");
      toast.error("Failed to load daily verse.");
      // Optional: Clear cache on error?
      // localStorage.removeItem(DAILY_VERSE_CACHE_KEY);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      console.log("DailyQuranVerse: loadVerse finished");
    }
  }, []);

  useEffect(() => {
    console.log("DailyQuranVerse: useEffect triggered on mount");
    loadVerse(); // loadVerse will now handle cache logic
  }, [loadVerse]); // Keep loadVerse dependency for correctness with useCallback

  const handleCopy = () => {
    if (!verseData) return;
    const textToCopy = `${verseData.text}\n${verseData.translation}\n- Quran ${verseData.reference}`;
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setIsCopied(true);
        toast.success("Verse copied to clipboard!");
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy verse.");
      });
  };

  const handleShare = () => {
    if (!verseData || !navigator.share) {
      toast.error("Web Share API not supported or no verse data.");
      return;
    }
    const shareData = {
      title: `Daily Quran Verse: ${verseData.reference}`,
      text: `${verseData.text}\n${verseData.translation}\n- Quran ${verseData.reference}`,
      // url: window.location.href, 
    };
    navigator
      .share(shareData)
      .then(() => console.log("Verse shared successfully"))
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Error sharing verse:", error);
          toast.error("Failed to share verse.");
        }
      });
  };

  const handleRefresh = () => {
    loadVerse(true); // Pass true to indicate a refresh action (will bypass cache)
  };

  // Motion variants for animations
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  console.log(`DailyQuranVerse: Rendering - isLoading=${isLoading}, error=${error}, verseData exists=${!!verseData}`);

  if (isLoading) {
    console.log("DailyQuranVerse: Rendering Skeleton");
    return (
      <Card className="glass-card border-purple-300/20">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-600 dark:text-purple-400">
            <BookText size={20} className="mr-2" />
            Daily Quran Verse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-1/4 mb-4" />
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Skeleton className="h-8 w-20" />
        </CardFooter>
      </Card>
    );
  }

  if (error) {
    console.log("DailyQuranVerse: Rendering Error Message");
    return (
      <Card className="glass-card border-red-400/30 bg-red-50/50 dark:bg-red-900/10">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600 dark:text-red-400">
            <BookText size={20} className="mr-2" />
            Daily Quran Verse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 dark:text-red-300">
            Error loading verse: {error}
          </p>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!verseData) {
    console.error("DailyQuranVerse: Rendering - verseData is unexpectedly null/undefined after load!");
    return null; // Should not happen if loading/error states are handled
  }

  console.log("DailyQuranVerse - verseData before parse:", verseData);
  
  // Use the updated parsing logic
  const { surahNum, ayahNum } = parseVerseReference(verseData.reference);
  
  console.log(`DailyQuranVerse - Parsed Reference: Surah=${surahNum}, Ayah=${ayahNum}`);

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
      <Card className="glass-card border-purple-300/20 bg-gradient-to-br from-purple-50/20 to-indigo-50/10 dark:from-purple-950/20 dark:to-indigo-950/10 overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-purple-600 dark:text-purple-400">
            <div className="flex items-center">
              <BookText size={20} className="mr-2" />
              Daily Quran Verse
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-purple-500 hover:bg-purple-100/50 dark:hover:bg-purple-900/30"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh Verse"
            >
              {isRefreshing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
            </Button>
          </CardTitle>
          {/* Display Surah:Ayah format */}
          <div className="text-sm text-muted-foreground pt-1">
            Surah <span className="font-semibold">{surahNum}</span> : Ayah <span className="font-semibold">{ayahNum}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p
            className="text-lg leading-relaxed text-right font-arabic text-gray-800 dark:text-gray-200"
            dir="rtl"
          >
            {verseData.text}
          </p>
          <Separator className="bg-purple-200/50 dark:bg-purple-800/30" />
          <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
            {verseData.translation}
          </p>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2 bg-black/5 dark:bg-white/5 py-3 px-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://quran.com/${surahNum}/${ayahNum}`, '_blank')}
            className="border-purple-200 hover:bg-purple-100/50 dark:border-purple-800 dark:hover:bg-purple-900/30"
          >
            <BookText size={16} className="mr-1" />
            Read on Quran.com
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="border-purple-200 hover:bg-purple-100/50 dark:border-purple-800 dark:hover:bg-purple-900/30"
          >
            {isCopied ? (
              <Check size={16} className="mr-1 text-green-500" />
            ) : (
              <Copy size={16} className="mr-1" />
            )}
            Copy
          </Button>
          {navigator.share && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="border-purple-200 hover:bg-purple-100/50 dark:border-purple-800 dark:hover:bg-purple-900/30"
            >
              <Share2 size={16} className="mr-1" />
              Share
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default DailyQuranVerse; 