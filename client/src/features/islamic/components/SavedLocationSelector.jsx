import React from "react";
import { MapPin, ChevronRight } from "lucide-react";

/**
 * Component for displaying and selecting from saved locations
 * @param {Array} locations - Array of saved locations
 * @param {Function} onSelect - Function called when a location is selected
 * @param {Object} currentLocation - Currently selected location
 */
const SavedLocationSelector = ({ locations = [], onSelect, currentLocation }) => {
  if (!locations.length) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        No saved locations yet. Search for a location to save it.
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {locations.map((location) => {
        const isSelected = currentLocation?.id === location.id;
        return (
          <button
            key={location.id || location.name}
            onClick={() => onSelect(location)}
            className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between transition-colors ${
              isSelected
                ? "bg-primary/10 text-primary"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <div className="flex items-center">
              <MapPin
                size={16}
                className={`mr-2 ${
                  isSelected ? "text-primary" : "text-gray-400"
                }`}
              />
              <span className="font-medium">{location.name}</span>
            </div>
            {isSelected && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                Current
              </span>
            )}
            {!isSelected && <ChevronRight size={16} className="text-gray-400" />}
          </button>
        );
      })}
    </div>
  );
};

export default SavedLocationSelector; 