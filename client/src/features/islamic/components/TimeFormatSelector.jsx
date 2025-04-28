import React from "react";
import { Clock } from "lucide-react";

/**
 * Component for selecting the time format (12/24 hour)
 * @param {boolean} use12Hour - Whether to use 12-hour format
 * @param {function} onChange - Function called when format changes
 */
const TimeFormatSelector = ({ use12Hour, onChange }) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium flex items-center gap-1">
        <Clock size={16} /> Time Format
      </h3>
      <p className="text-xs text-muted-foreground mb-2">
        Choose how prayer times are displayed
      </p>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="12hour"
            name="timeFormat"
            checked={use12Hour === true}
            onChange={() => onChange(true)}
            className="h-4 w-4 text-primary"
          />
          <label htmlFor="12hour" className="text-sm">
            12-hour (e.g. 5:30 PM)
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="24hour"
            name="timeFormat"
            checked={use12Hour === false}
            onChange={() => onChange(false)}
            className="h-4 w-4 text-primary"
          />
          <label htmlFor="24hour" className="text-sm">
            24-hour (e.g. 17:30)
          </label>
        </div>
      </div>
    </div>
  );
};

export default TimeFormatSelector; 