import React from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

const SettingsModal = ({
  isOpen,
  onClose,
  madhab,
  setMadhab,
  timeAdjustments,
  setTimeAdjustments,
  onApplySettings,
}) => {
  if (!isOpen) return null;

  const handleAdjustmentChange = (prayer, value) => {
    const newAdjustments = {
      ...timeAdjustments,
      [prayer]: parseInt(value) || 0,
    };
    setTimeAdjustments(newAdjustments);
    localStorage.setItem(
      "islamicDashboardAdjustments",
      JSON.stringify(newAdjustments)
    );
  };

  const handleMadhabChange = (value) => {
    setMadhab(value);
    localStorage.setItem("islamicDashboardMadhab", value.toString());
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white/20 dark:bg-zinc-900/50 backdrop-blur-lg rounded-lg shadow-xl max-w-md w-full p-6 border border-white/20 dark:border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Prayer Time Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Calculation Method</h3>
          <div className="flex gap-2">
            <button
              className={`flex-1 p-2 rounded-md text-sm ${
                madhab === 0
                  ? "bg-primary text-white"
                  : "bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20"
              }`}
              onClick={() => handleMadhabChange(0)}
            >
              Shafi'i
            </button>
            <button
              className={`flex-1 p-2 rounded-md text-sm ${
                madhab === 1
                  ? "bg-primary text-white"
                  : "bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20"
              }`}
              onClick={() => handleMadhabChange(1)}
            >
              Hanafi
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">
            Time Adjustments (minutes)
          </h3>
          <div className="space-y-2">
            {Object.entries(timeAdjustments).map(([prayer, adjustment]) => (
              <div key={prayer} className="flex items-center justify-between">
                <span className="text-sm capitalize">{prayer}</span>
                <div className="flex items-center">
                  <button
                    className="w-8 h-8 rounded-l-md bg-black/10 dark:bg-white/10 flex items-center justify-center"
                    onClick={() =>
                      handleAdjustmentChange(prayer, adjustment - 1)
                    }
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="w-12 h-8 text-center bg-black/5 dark:bg-white/5 border-x border-black/20 dark:border-white/20"
                    value={adjustment}
                    onChange={(e) =>
                      handleAdjustmentChange(prayer, e.target.value)
                    }
                  />
                  <button
                    className="w-8 h-8 rounded-r-md bg-black/10 dark:bg-white/10 flex items-center justify-center"
                    onClick={() =>
                      handleAdjustmentChange(prayer, adjustment + 1)
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            className="px-4 py-2 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 rounded-md text-sm"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm"
            onClick={() => {
              onApplySettings();
              onClose();
              toast.success("Prayer time settings updated");
            }}
          >
            Apply & Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
