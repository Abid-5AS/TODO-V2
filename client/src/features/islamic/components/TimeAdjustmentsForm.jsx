import React from "react";

/**
 * Component for adjusting prayer times
 * @param {Object} adjustments - Current prayer time adjustments
 * @param {function} onChange - Function called when an adjustment changes
 */
const TimeAdjustmentsForm = ({ adjustments, onChange }) => {
  const handleAdjustmentChange = (prayer, value) => {
    onChange(prayer, parseInt(value) || 0);
  };

  // Define the prayers to show adjustments for
  const prayers = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Prayer Time Adjustments</h3>
      <p className="text-xs text-muted-foreground mb-2">
        Adjust prayer times in minutes to account for local factors or
        personal preferences.
      </p>
      <div className="space-y-3">
        {prayers.map((prayer) => (
          adjustments.hasOwnProperty(prayer) && (
            <div key={prayer} className="flex items-center justify-between">
              <label
                htmlFor={`adjust-${prayer}`}
                className="text-sm capitalize"
              >
                {prayer}:
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() =>
                    handleAdjustmentChange(prayer, (adjustments[prayer] || 0) - 1)
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-l-md bg-gray-100 dark:bg-gray-700"
                >
                  -
                </button>
                <input
                  id={`adjust-${prayer}`}
                  type="number"
                  value={adjustments[prayer] || 0}
                  onChange={(e) =>
                    handleAdjustmentChange(prayer, e.target.value)
                  }
                  className="w-12 h-8 text-center border-y dark:border-gray-600 bg-transparent"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleAdjustmentChange(prayer, (adjustments[prayer] || 0) + 1)
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-r-md bg-gray-100 dark:bg-gray-700"
                >
                  +
                </button>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default TimeAdjustmentsForm; 