// src/features/stats/components/StatsLoading.jsx
// Displays loading state while stats data is being fetched

import React from 'react';
import { Skeleton } from '../../../components/ui/skeleton';

const StatsLoading = () => {
  return (
    <div className="py-6 md:py-8 px-4 space-y-8 relative bg-theme">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/60">
        Task Statistics
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
};

export default StatsLoading; 