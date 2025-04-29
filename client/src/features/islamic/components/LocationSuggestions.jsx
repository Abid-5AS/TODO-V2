import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, MapPin } from 'lucide-react';

const LocationSuggestions = ({
  suggestions,
  isLoading,
  error,
  onSelect,
  isVisible = true, // Control visibility from parent
}) => {
  // Add console logs for debugging
  console.log("LocationSuggestions rendering with:", { 
    suggestionsCount: suggestions?.length || 0, 
    isLoading, 
    error, 
    isVisible
  });
  
  if (!isVisible) {
    return null;
  }
  
  // Always show something when we're supposed to be visible
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-56 overflow-y-auto location-suggestions-container"
    >
      {isLoading ? (
        <div className="p-3 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Searching...
        </div>
      ) : error ? (
        <div className="p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : suggestions && suggestions.length > 0 ? (
        <ul>
          {suggestions.map((location, index) => (
            <li key={`${location.display_name || index}-${index}`}>
              <button
                type="button"
                onClick={() => {
                  console.log('[LocationSuggestions] Clicked on:', location);
                  onSelect(location);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
              >
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {location.name || 'Unknown location'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {location.display_name || ''}
                    </p>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
          No locations found. Try a different search.
        </div>
      )}
    </motion.div>
  );
};

export default LocationSuggestions; 