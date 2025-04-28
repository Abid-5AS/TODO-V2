import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const useQuranTracker = () => {
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem("quranProgress");
    return saved ? JSON.parse(saved) : {
      lastReadSurah: 1,
      lastReadAyah: 1,
      completedSurahs: [],
      dailyTarget: 2, // pages per day
      streakDays: 0,
      lastReadDate: null
    };
  });

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("quranProgress", JSON.stringify(progress));
  }, [progress]);

  // Check and update streak
  useEffect(() => {
    const today = new Date().toDateString();
    if (progress.lastReadDate) {
      const lastRead = new Date(progress.lastReadDate);
      const daysDiff = Math.floor((new Date() - lastRead) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 1) {
        // Reset streak if more than a day has passed
        setProgress(prev => ({
          ...prev,
          streakDays: 0
        }));
      }
    }
  }, [progress.lastReadDate]);

  const updateProgress = (surah, ayah) => {
    const today = new Date().toDateString();
    
    setProgress(prev => {
      const newProgress = {
        ...prev,
        lastReadSurah: surah,
        lastReadAyah: ayah,
        lastReadDate: today
      };

      // Update streak if it's a new day
      if (prev.lastReadDate !== today) {
        newProgress.streakDays = prev.streakDays + 1;
      }

      return newProgress;
    });

    toast.success("Reading progress updated!");
  };

  const markSurahComplete = (surahNum) => {
    setProgress(prev => ({
      ...prev,
      completedSurahs: [...new Set([...prev.completedSurahs, surahNum])]
    }));
    toast.success(`Surah ${surahNum} marked as completed!`);
  };

  const setDailyTarget = (pages) => {
    setProgress(prev => ({
      ...prev,
      dailyTarget: pages
    }));
    toast.success(`Daily target updated to ${pages} pages`);
  };

  const resetProgress = () => {
    const defaultProgress = {
      lastReadSurah: 1,
      lastReadAyah: 1,
      completedSurahs: [],
      dailyTarget: 2,
      streakDays: 0,
      lastReadDate: null
    };
    setProgress(defaultProgress);
    localStorage.setItem("quranProgress", JSON.stringify(defaultProgress));
    toast.success("Progress reset successfully");
  };

  return {
    progress,
    updateProgress,
    markSurahComplete,
    setDailyTarget,
    resetProgress
  };
};

export default useQuranTracker; 