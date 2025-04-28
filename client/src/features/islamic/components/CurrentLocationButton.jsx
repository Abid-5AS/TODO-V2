import React from 'react';
import { LocateFixed, Loader2, AlertCircle } from 'lucide-react';

/**
 * Button component for getting current location
 * @param {Function} onGetCurrentLocation - Function to handle getting current location
 * @param {boolean} isLoading - Whether current location is being fetched
 * @param {string} error - Error message if getting location failed
 */
const CurrentLocationButton = ({ onGetCurrentLocation, isLoading, error }) => {
  return (
    <div>
      <button
        onClick={onGetCurrentLocation}
        disabled={isLoading}
        className="w-full inline-flex justify-center items-center rounded-md border border-transparent bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <LocateFixed className="mr-2 h-4 w-4" />
        )}
        Use Current Location
      </button>
      
      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center">
          <AlertCircle size={14} className="mr-1 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

export default CurrentLocationButton; 