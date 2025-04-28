import React from "react";

/**
 * Component for selecting the prayer time calculation method
 * @param {string} method - The current calculation method
 * @param {function} onChange - Function called when method changes
 */
const CalculationMethodSelector = ({ method, onChange }) => {
  return (
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
            onChange={() => onChange("standard")}
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
            onChange={() => onChange("hanafi")}
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
            onChange={() => onChange("mwl")}
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
  );
};

export default CalculationMethodSelector; 