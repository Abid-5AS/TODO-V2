import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/api/axiosInstance";
import { toast } from "sonner";
import { getLocalStorageItem, setLocalStorageItem } from "@/utils/localStorageUtils";
import { getTodayDateString } from "@/common/utils/dateUtils";

const DAILY_VERSE_CACHE_KEY = "dailyQuranVerseData";

// Helper function to fetch daily verse (kept internal to hook for now)
const fetchDailyQuranVerseAPI = async () => {
  try {
    const response = await axiosInstance.get(`/api/ai/quran/daily-verse`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching daily Quran verse:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const useDailyQuranVerse = () => {
  const [verseData, setVerseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadVerse = useCallback(async (isRefresh = false) => {
    console.log("[useDailyQuranVerse] loadVerse called", { isRefresh });
    const todayStr = getTodayDateString();
    const cachedData = getLocalStorageItem(DAILY_VERSE_CACHE_KEY);

    // Use cached data if available for today and not forcing refresh
    if (!isRefresh && cachedData && cachedData.date === todayStr && cachedData.data) {
      console.log("[useDailyQuranVerse] Using cached verse data for today.");
      setVerseData(cachedData.data);
      setIsLoading(false);
      setError(null);
      return; // Exit early, don't fetch from API
    }

    // Proceed to fetch from API
    console.log("[useDailyQuranVerse] Fetching new verse data from API.");
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const result = await fetchDailyQuranVerseAPI();
      console.log("[useDailyQuranVerse] API result:", result);
      if (result.success && result.data && result.data.data) {
        const newVerseData = result.data.data;
        setVerseData(newVerseData);
        setLocalStorageItem(DAILY_VERSE_CACHE_KEY, { date: todayStr, data: newVerseData });
        console.log("[useDailyQuranVerse] verseData state SET and cached.");
      } else {
        console.error("[useDailyQuranVerse] API fetch unsuccessful or data missing", result);
        throw new Error(result.error || "Failed to fetch verse");
      }
    } catch (err) {
      console.error("[useDailyQuranVerse] Error in loadVerse:", err);
      setError(err.message || "Could not load verse");
      toast.error("Failed to load daily verse.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      console.log("[useDailyQuranVerse] loadVerse finished");
    }
  }, []);

  useEffect(() => {
    console.log("[useDailyQuranVerse] useEffect triggered on mount");
    loadVerse();
  }, [loadVerse]);

  const handleRefresh = useCallback(() => {
    loadVerse(true);
  }, [loadVerse]);

  return {
    verseData,
    isLoading,
    error,
    isRefreshing,
    handleRefresh,
  };
}; 