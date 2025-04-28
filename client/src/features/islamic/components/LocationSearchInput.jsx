import React, { forwardRef } from 'react';
import { Search, X } from 'lucide-react';

/**
 * Reusable component for location search input
 * @param {Object} props
 * @param {string} props.searchQuery - Current search query
 * @param {Function} props.onSearchChange - Function to handle search changes
 * @param {Function} props.onClearSearch - Function to clear the search
 * @param {Function} props.onFocus - Optional function to handle input focus
 */
const LocationSearchInput = forwardRef(
  ({ searchQuery, onSearchChange, onClearSearch, onFocus, placeholder = "Search for city or area..." }, ref) => {
    return (
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={onSearchChange}
          onFocus={onFocus}
          className="pl-10 pr-10 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={onClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>
    );
  }
);

LocationSearchInput.displayName = 'LocationSearchInput';

export default LocationSearchInput; 