import React, { useState } from 'react';
import { toast } from "sonner";
import { CalendarClock, Trash2, RefreshCw } from "lucide-react";

/**
 * Component to manage the holiday data cache
 */
const HolidayCacheManager = () => {
  // Always show in development mode
  const [isVisible, setIsVisible] = useState(true);
  
  // Constants for local storage
  const HOLIDAY_STORAGE_KEY = "islamic_holiday_data";
  
  // Only show this component in development mode or when explicitly visible
  if (import.meta.env.PROD && !isVisible) {
    return null;
  }
  
  const getHolidayCacheInfo = () => {
    try {
      const storedData = localStorage.getItem(HOLIDAY_STORAGE_KEY);
      
      if (!storedData) {
        return {
          status: "⚠️ No holiday data cached - click Refresh",
          timestamp: null,
          age: null,
          size: 0,
          hasData: false
        };
      }
      
      const parsedData = JSON.parse(storedData);
      const timestamp = new Date(parsedData.timestamp);
      const now = new Date();
      const ageInMs = now - timestamp;
      const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
      const ageInHours = Math.floor((ageInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      // Calculate storage size (approximate)
      const dataSizeBytes = storedData.length;
      const dataSizeKB = (dataSizeBytes / 1024).toFixed(2);
      
      const holidaysCount = parsedData.data?.holidays?.length || 0;
      
      return {
        status: holidaysCount > 0 ? "Holiday data cached" : "⚠️ No holidays found in cache - click Refresh",
        timestamp: timestamp.toLocaleString(),
        age: `${ageInDays} days, ${ageInHours} hours ago`,
        size: `${dataSizeKB} KB`,
        holidays: holidaysCount,
        willExpireIn: `${30 - ageInDays} days`,
        hasData: true
      };
    } catch (error) {
      return {
        status: "⚠️ Error parsing holiday cache",
        error: String(error),
        hasData: false
      };
    }
  };
  
  const clearHolidayCache = () => {
    try {
      localStorage.removeItem(HOLIDAY_STORAGE_KEY);
      toast.success("Holiday cache cleared");
      // Force refresh to show updated state
      window.location.reload();
    } catch (error) {
      console.error("Error clearing holiday cache:", error);
      toast.error("Failed to clear cache");
    }
  };
  
  const refreshHolidayCache = () => {
    try {
      localStorage.removeItem(HOLIDAY_STORAGE_KEY);
      toast.success("Refreshing holiday data...");
      // Force refresh to regenerate cache
      window.location.reload();
    } catch (error) {
      console.error("Error refreshing holiday cache:", error);
      toast.error("Failed to refresh cache");
    }
  };
  
  // Get current cache info
  const cacheInfo = getHolidayCacheInfo();
  
  return (
    <div className="mt-4 pt-3 border-t border-blue-100/30 text-xs">
      <div className="flex justify-between items-center mb-2">
        <span className={`text-xs ${!cacheInfo.hasData || cacheInfo.holidays === 0 ? "text-amber-500 font-bold" : "text-slate-500 font-medium"}`}>Cache Status</span>
        <div className="flex space-x-2">
          <button 
            onClick={refreshHolidayCache}
            className="p-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
            title="Refresh holiday cache"
          >
            <RefreshCw size={12} />
          </button>
          <button 
            onClick={clearHolidayCache}
            className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
            title="Clear holiday cache"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      
      <div className={!cacheInfo.hasData || cacheInfo.holidays === 0 ? "text-amber-500" : "text-slate-500"}>
        <p>{cacheInfo.status}</p>
        {cacheInfo.timestamp && (
          <>
            <p>Last updated: {cacheInfo.timestamp}</p>
            <p>Age: {cacheInfo.age}</p>
            <p>Holidays: {cacheInfo.holidays} items</p>
            <p>Size: {cacheInfo.size}</p>
            <p>Will expire in: {cacheInfo.willExpireIn}</p>
          </>
        )}
        {cacheInfo.error && (
          <p className="text-red-500">{cacheInfo.error}</p>
        )}
      </div>
    </div>
  );
};

export default HolidayCacheManager; 