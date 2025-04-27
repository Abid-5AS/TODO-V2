import React, { useState } from 'react';
import { toast } from "sonner";
import { CalendarClock, Trash2, RefreshCw } from "lucide-react";

/**
 * Component to manage the holiday data cache
 */
const HolidayCacheManager = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Constants for local storage
  const HOLIDAY_STORAGE_KEY = "islamic_holiday_data";
  
  // Only show this component in development mode
  if (import.meta.env.PROD && !isVisible) {
    return null;
  }
  
  const getHolidayCacheInfo = () => {
    try {
      const storedData = localStorage.getItem(HOLIDAY_STORAGE_KEY);
      
      if (!storedData) {
        return {
          status: "No holiday data cached",
          timestamp: null,
          age: null,
          size: 0
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
      
      return {
        status: "Holiday data cached",
        timestamp: timestamp.toLocaleString(),
        age: `${ageInDays} days, ${ageInHours} hours ago`,
        size: `${dataSizeKB} KB`,
        holidays: parsedData.data.holidays.length,
        willExpireIn: `${30 - ageInDays} days`
      };
    } catch (error) {
      return {
        status: "Error parsing holiday cache",
        error: String(error)
      };
    }
  };
  
  const clearHolidayCache = () => {
    try {
      localStorage.removeItem(HOLIDAY_STORAGE_KEY);
      // Force refresh to show updated state
      window.location.reload();
    } catch (error) {
      console.error("Error clearing holiday cache:", error);
    }
  };
  
  const refreshHolidayCache = () => {
    try {
      localStorage.removeItem(HOLIDAY_STORAGE_KEY);
      // Force refresh to regenerate cache
      window.location.reload();
    } catch (error) {
      console.error("Error refreshing holiday cache:", error);
    }
  };
  
  // Get current cache info
  const cacheInfo = getHolidayCacheInfo();
  
  return (
    <div className="mt-4 pt-3 border-t border-blue-100/30 text-xs">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-slate-500 font-medium">Cache Status</span>
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
      
      <div className="text-slate-500">
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