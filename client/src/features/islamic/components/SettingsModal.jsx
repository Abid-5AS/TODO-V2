import React, { useState, useRef, useEffect } from "react";
import { Settings, X, Check, Clock } from "lucide-react";
import { toast } from "sonner";

const SettingsModal = ({
  onClose,
  timeAdjustments,
  calculationMethod,
  use12HourFormat,
  savePrayerTimeAdjustments,
  saveCalculationMethod,
  saveTimeFormat,
}) => {
  const [adjustments, setAdjustments] = useState(timeAdjustments);
  const [method, setMethod] = useState(calculationMethod);
  const [timeFormat, setTimeFormat] = useState(use12HourFormat);
  const [hasChanges, setHasChanges] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    // Initialize state with props
    setAdjustments(timeAdjustments);
    setMethod(calculationMethod);
    setTimeFormat(use12HourFormat);
  }, [timeAdjustments, calculationMethod, use12HourFormat]);

  // Track changes
  useEffect(() => {
    const adjustmentsChanged =
      JSON.stringify(adjustments) !== JSON.stringify(timeAdjustments);
    const methodChanged = method !== calculationMethod;
    const formatChanged = timeFormat !== use12HourFormat;
    setHasChanges(adjustmentsChanged || methodChanged || formatChanged);
  }, [
    adjustments,
    method,
    timeFormat,
    timeAdjustments,
    calculationMethod,
    use12HourFormat,
  ]);

  useEffect(() => {
    // Handle escape key to close modal
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    // Handle click outside to close modal
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleAdjustmentChange = (prayer, value) => {
    setAdjustments((prev) => ({
      ...prev,
      [prayer]: parseInt(value) || 0,
    }));
  };

  const handleMethodChange = (value) => {
    setMethod(value);
  };

  const handleTimeFormatChange = (value) => {
    setTimeFormat(value);
  };

  const handleSave = () => {
    savePrayerTimeAdjustments(adjustments);
    saveCalculationMethod(method);

    if (saveTimeFormat) {
      saveTimeFormat(timeFormat);
    }

    onClose();
    toast.success("Prayer time settings updated");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-auto"
      >
        <div className="sticky top-0 p-4 border-b dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 z-10">
          <h2 className="text-lg font-semibold flex items-center">
            <Settings className="mr-2 h-5 w-5 text-primary" />
            Prayer Time Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Time Format */}
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
                  checked={timeFormat === true}
                  onChange={() => handleTimeFormatChange(true)}
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
                  checked={timeFormat === false}
                  onChange={() => handleTimeFormatChange(false)}
                  className="h-4 w-4 text-primary"
                />
                <label htmlFor="24hour" className="text-sm">
                  24-hour (e.g. 17:30)
                </label>
              </div>
            </div>
          </div>

          {/* Calculation method */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Calculation Method</h3>
            <p className="text-xs text-muted-foreground mb-2">
              Select the method for calculating prayer times based on your
              madhab or regional convention.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="standard"
                  name="calculationMethod"
                  checked={method === "standard"}
                  onChange={() => handleMethodChange("standard")}
                  className="h-4 w-4 text-primary"
                />
                <label htmlFor="standard" className="text-sm">
                  Standard - ISNA (North America)
                  <span className="block text-xs text-muted-foreground">
                    Islamic Society of North America - Fajr: 15°, Isha: 15°
                  </span>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="hanafi"
                  name="calculationMethod"
                  checked={method === "hanafi"}
                  onChange={() => handleMethodChange("hanafi")}
                  className="h-4 w-4 text-primary"
                />
                <label htmlFor="hanafi" className="text-sm">
                  Hanafi - Karachi (Pakistan, India, Bangladesh)
                  <span className="block text-xs text-muted-foreground">
                    University of Islamic Sciences, Karachi - Fajr: 18°, Isha: 18°
                  </span>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="mwl"
                  name="calculationMethod"
                  checked={method === "mwl"}
                  onChange={() => handleMethodChange("mwl")}
                  className="h-4 w-4 text-primary"
                />
                <label htmlFor="mwl" className="text-sm">
                  Muslim World League (Default on Google)
                  <span className="block text-xs text-muted-foreground">
                    Used in Europe, Far East - Fajr: 18°, Isha: 17°
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Time adjustments */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Prayer Time Adjustments</h3>
            <p className="text-xs text-muted-foreground mb-2">
              Adjust prayer times in minutes to account for local factors or
              personal preferences.
            </p>
            <div className="space-y-3">
              {/* Define the specific prayers to show adjustments for */}
              {["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"].map((prayer) => (
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
                      <span className="text-xs text-gray-500 ml-2">min</span>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>

          <div className="pt-2 border-t dark:border-gray-700 flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`px-4 py-2 text-sm rounded-md flex items-center ${
                hasChanges
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }`}
            >
              <Check className="h-4 w-4 mr-1" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
