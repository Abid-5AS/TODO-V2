import React from 'react';
import { History, MapPin, ChevronRight } from 'lucide-react';

const RecentLocations = ({ locations = [], onSelect }) => {
  if (!locations || locations.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center">
        <History className="h-4 w-4 mr-1" />
        Recent Locations
      </h4>
      <ul className="space-y-2">
        {locations.map((location, index) => (
          <li key={`recent-${index}`}>
            <button
              onClick={() => onSelect(location)}
              className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center overflow-hidden">
                  <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {location.name ||
                        location.address?.city ||
                        location.address?.town ||
                        location.address?.village ||
                        location.address?.county ||
                        (location.display_name
                          ? location.display_name.split(',')[0]
                          : 'Saved Location')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {location.display_name ||
                        `${location.lat?.toFixed(4)}, ${(
                          location.lon || location.lng
                        )?.toFixed(4)}`}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentLocations; 