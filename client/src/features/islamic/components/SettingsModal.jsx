import React, { useState, useEffect } from "react";
import { Settings, Check } from "lucide-react";
import { toast } from "sonner";

// Import extracted components
import ModalContainer from "./ModalContainer";
import TimeFormatSelector from "./TimeFormatSelector";
import CalculationMethodSelector from "./CalculationMethodSelector";
import TimeAdjustmentsForm from "./TimeAdjustmentsForm";

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

  const modalTitle = (
    <>
      <Settings className="mr-2 h-5 w-5 text-primary" />
      Prayer Time Settings
    </>
  );

  return (
    <ModalContainer onClose={onClose} title={modalTitle}>
      {/* Time Format - Using extracted component */}
      <TimeFormatSelector 
        use12Hour={timeFormat} 
        onChange={handleTimeFormatChange} 
      />

      {/* Calculation Method - Using extracted component */}
      <CalculationMethodSelector 
        method={method} 
        onChange={handleMethodChange} 
      />

      {/* Time Adjustments - Using extracted component */}
      <TimeAdjustmentsForm 
        adjustments={adjustments} 
        onChange={handleAdjustmentChange} 
      />

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
    </ModalContainer>
  );
};

export default SettingsModal;
