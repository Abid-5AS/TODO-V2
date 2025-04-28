// src/features/stats/components/StatsEmpty.jsx
// Displays empty state when no tasks are available

import React from 'react';

const StatsEmpty = () => {
  return (
    <div className="py-6 md:py-8 px-4 text-center relative bg-theme">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/60">
        Task Statistics
      </h1>
      <div className="p-6 bg-muted/30 border rounded-lg text-muted-foreground">
        No tasks found. Add some tasks to generate statistics.
      </div>
    </div>
  );
};

export default StatsEmpty; 