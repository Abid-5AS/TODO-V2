// src/features/stats/components/StatsError.jsx
// Displays error state when stats data fails to load

import React from 'react';
import { AlertCircle } from 'lucide-react';

const StatsError = ({ error }) => {
  return (
    <div className="py-6 md:py-8 px-4 text-center relative bg-theme">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/60">
        Task Statistics
      </h1>
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-300">
        <AlertCircle className="inline-block h-5 w-5 mr-2" />
        Error loading statistics: {error}
      </div>
    </div>
  );
};

export default StatsError; 