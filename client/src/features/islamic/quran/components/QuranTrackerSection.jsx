import React from "react";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Circle, BarChart2, Settings } from "lucide-react";
import { useQuranTracker } from "../hooks"; // Updated import path

const QuranTrackerSection = () => {
  const { progress, updateProgress, markSurahComplete, setDailyTarget, resetProgress } = useQuranTracker();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-5 rounded-lg shadow-md relative border border-primary/20"
    >
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-primary"></div>

      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BookOpen size={20} className="mr-2 text-primary" />
          <h2 className="text-lg font-semibold">Quran Reading Tracker</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center text-sm text-primary/80">
            <BarChart2 size={16} className="mr-1" />
            <span>Streak: {progress.streakDays} days</span>
          </div>
          <button
            onClick={() => {
              const pages = window.prompt("Enter daily target (pages):", progress.dailyTarget);
              if (pages && !isNaN(pages)) {
                setDailyTarget(parseInt(pages));
              }
            }}
            className="p-2 hover:bg-primary/10 rounded-full transition-colors"
            title="Set Daily Target"
          >
            <Settings size={16} className="text-primary/80" />
          </button>
        </div>
      </div>

      {/* Current Progress */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Current Progress</h3>
        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Last Read:</p>
            <p className="font-medium">
              Surah {progress.lastReadSurah}, Ayah {progress.lastReadAyah}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Completed Surahs:</p>
            <p className="font-medium">{progress.completedSurahs.length} / 114</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Daily Target:</p>
            <p className="font-medium">{progress.dailyTarget} pages</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <button
          onClick={() => updateProgress(progress.lastReadSurah, progress.lastReadAyah + 1)}
          className="w-full p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors flex items-center justify-between"
        >
          <span>Update Current Progress</span>
          <Circle size={16} />
        </button>

        <button
          onClick={() => markSurahComplete(progress.lastReadSurah)}
          className="w-full p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors flex items-center justify-between"
        >
          <span>Mark Current Surah Complete</span>
          <CheckCircle size={16} />
        </button>
      </div>

      {/* Last Read Date */}
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        {progress.lastReadDate && (
          <p>Last read: {new Date(progress.lastReadDate).toLocaleDateString()}</p>
        )}
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to reset all progress?")) {
              resetProgress();
            }
          }}
          className="text-red-500 hover:text-red-600 transition-colors"
        >
          Reset Progress
        </button>
      </div>
    </motion.div>
  );
};

export default QuranTrackerSection; 