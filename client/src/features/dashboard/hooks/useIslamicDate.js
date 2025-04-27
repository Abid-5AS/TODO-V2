// Custom hook for fetching and managing Islamic date
import { useState, useEffect, useCallback } from "react";
import {
  fetchIslamicDateFromApi,
  formatIslamicDate,
} from "../utils/islamic/dateUtils";

export const useIslamicDate = () => {
  const [islamicDate, setIslamicDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch Islamic date from API
  const fetchIslamicDate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1; // JavaScript months are 0-indexed
      const year = today.getFullYear();

      const hijri = await fetchIslamicDateFromApi(year, month, day);
      const formattedDate = formatIslamicDate(hijri, today);

      setIslamicDate(formattedDate);
    } catch (error) {
      console.error("Error fetching Islamic date:", error);
      setError("Could not fetch Islamic date. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Islamic date on component mount
  useEffect(() => {
    fetchIslamicDate();

    // Refresh Islamic date at midnight
    const checkDate = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        fetchIslamicDate();
      }
    };

    const intervalId = setInterval(checkDate, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [fetchIslamicDate]);

  return {
    islamicDate,
    isLoading,
    error,
    refreshIslamicDate: fetchIslamicDate,
  };
};
