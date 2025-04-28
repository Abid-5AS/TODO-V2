import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast"; // Updated path
import {
  getAppearanceSettings,
  updateAppearanceSettings,
  resetAppearanceSettings,
} from '../services/appearanceSettingsService'; // Relative path OK
import { DEFAULT_SETTINGS } from '../constants/appearanceConstants'; // Relative path OK

export const useAppearanceSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings on hook initialization
  useEffect(() => {
    let isMounted = true; // Prevent state updates on unmounted component
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const response = await getAppearanceSettings();
        if (isMounted) {
            if (response.success) {
              setSettings((prev) => ({
                ...prev,
                ...response.settings,
              }));
            } else {
              throw new Error(
                response.error || "Failed to load appearance settings"
              );
            }
        }
      } catch (error) {
        console.error("Error loading appearance settings:", error);
        // Only toast if still mounted
        if (isMounted) {
            toast({
                title: "Error Loading Settings",
                description: error.message,
                variant: "destructive",
            });
        }
      } finally {
        if (isMounted) {
            setIsLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      isMounted = false; // Cleanup function to set isMounted to false
    };
  }, [toast]); // toast is generally stable, but include if linting requires

  // --- Update Handlers ---

  // Generic update handler
  const handleUpdateSetting = useCallback(async (updateData) => {
      setIsSaving(true);
      let success = false;
      try {
          const response = await updateAppearanceSettings(updateData);
          if (response.success) {
              setSettings(prev => ({ ...prev, ...updateData }));
              // No toast here, let specific handlers add context
              success = true;
          } else {
              throw new Error(response.error || `Failed to update setting: ${Object.keys(updateData).join(', ')}`);
          }
      } catch (error) {
          console.error("Error updating setting:", error);
          toast({
              title: "Update Failed",
              description: error.message,
              variant: "destructive",
          });
      } finally {
          setIsSaving(false);
      }
      return success;
  }, [toast]); // Added toast dependency

  // Specific handler for dark mode toggle
  const handleDarkModeChange = useCallback(async (newDarkModeState) => {
      const success = await handleUpdateSetting({ darkMode: newDarkModeState });
      if (success) {
          toast({ title: `Dark Mode ${newDarkModeState ? 'Enabled' : 'Disabled'}` });
      }
  }, [handleUpdateSetting, toast]); // Added toast dependency

  // Specific handler for color preset selection
  const handleColorPresetSelect = useCallback(async (hue) => {
    const success = await handleUpdateSetting({ hue });
    if (success) {
        toast({ title: "Accent Color Preset Updated" });
    }
  }, [handleUpdateSetting, toast]); // Added toast dependency

  // Handle internal state change for hue slider AND apply CSS variable live
  const handleHueSliderChange = useCallback((value) => {
    const newHue = value[0];
    setSettings((prev) => ({ ...prev, hue: newHue }));
    
    // Apply CSS variable change live
    document.documentElement.style.setProperty('--primary-hue', `${newHue}`);
    // Note: Ensure your global CSS uses var(--primary-hue) 
    // e.g., --primary: hsl(var(--primary-hue) 90% 50%); 
    // Adjust saturation/lightness (90%, 50%) if needed based on your theme definition.
  }, []);

  // Handle applying the hue change after slider interaction is complete
  const handleHueChangeComplete = useCallback(async () => {
    const success = await handleUpdateSetting({ hue: settings.hue });
    if (success) {
        toast({ title: "Accent Hue Updated" });
    }
  }, [settings.hue, handleUpdateSetting, toast]); // Added dependencies

  // Reset all appearance settings to defaults
  const handleReset = useCallback(async () => {
    setIsSaving(true);
    try {
      const response = await resetAppearanceSettings();
      if (response.success) {
        setSettings(response.settings || DEFAULT_SETTINGS); // Ensure settings object is valid
        toast({ title: "Settings Reset to Defaults" });
      } else {
        throw new Error(response.error || "Failed to reset settings");
      }
    } catch (error) {
      console.error("Error resetting settings:", error);
      toast({
        title: "Error Resetting Settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [toast]); // Added toast dependency

  // --- Return Values --- 
  return {
    settings,
    isLoading,
    isSaving,
    handleDarkModeChange,
    handleColorPresetSelect,
    handleHueSliderChange, // Renamed from handleHueChange for clarity
    handleHueChangeComplete,
    handleReset,
  };
}; 