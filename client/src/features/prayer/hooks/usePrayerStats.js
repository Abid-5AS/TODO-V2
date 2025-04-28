import { useState, useCallback, useEffect } from 'react';
import { getPrayerStatsAPI } from '../services/prayerLogService';
import { initialStats } from '../constants'; // Corrected path

/**
 * Custom hook to manage prayer statistics.
 * @param {any} trigger - A value that changes when stats should be refreshed (e.g., lastUpdated timestamp).
 * @returns {object} Stats data, loading state, error state, and fetch function.
 */
export const usePrayerStats = (trigger) => {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPrayerStatsAPI();
      if (response.success) {
        setStats(response.data || initialStats);
      } else {
        throw new Error(response.message || 'Failed to fetch stats');
      }
    } catch (err) {
      console.error('fetchStats Error:', err);
      setError(err.message);
      // Optionally reset stats on error
      // setStats(initialStats);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch stats initially and whenever the trigger changes
  useEffect(() => {
    console.log("[usePrayerStats] Trigger changed, fetching stats...");
    fetchStats();
  }, [trigger, fetchStats]); // Depend on the trigger

  return {
    stats,
    setStats, // Expose setter for optimistic updates
    loadingStats: loading,
    errorStats: error,
    fetchStats, // Expose fetch function for manual refresh
  };
};

export default usePrayerStats; 