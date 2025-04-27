// src/features/settings/components/AppearanceSettings.jsx
// Component for managing application appearance settings.

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Switch } from "../../../components/ui/switch"; // Corrected path
import { Label } from "../../../components/ui/label"; // Corrected path
import { Slider } from "../../../components/ui/slider"; // Corrected path
import { Button } from "../../../components/ui/button"; // Corrected path
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../../components/ui/card"; // Corrected path
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip"; // Corrected path
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Loader2, Moon, Sun, Palette, RotateCcw } from "lucide-react";
import { useToast } from "../../../hooks/use-toast"; // Corrected path
import {
  getAppearanceSettings,
  updateAppearanceSettings,
  resetAppearanceSettings,
} from "../services/appearanceSettingsService";

// Color presets with their respective hue values
const COLOR_PRESETS = [
  { name: "Indigo", value: 260, class: "bg-indigo-500" },
  { name: "Blue", value: 220, class: "bg-blue-500" },
  { name: "Teal", value: 180, class: "bg-teal-500" },
  { name: "Green", value: 140, class: "bg-green-500" },
  { name: "Amber", value: 45, class: "bg-amber-500" },
  { name: "Orange", value: 30, class: "bg-orange-500" },
  { name: "Red", value: 0, class: "bg-red-500" },
  { name: "Pink", value: 330, class: "bg-pink-500" },
  { name: "Purple", value: 280, class: "bg-purple-500" },
];

const AppearanceSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    darkMode: false,
    hue: 260,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await getAppearanceSettings();
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
      } catch (error) {
        console.error("Error loading appearance settings:", error);
        toast({
          title: "Error Loading Settings",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  // Handle color preset selection
  const handleColorPresetSelect = async (hue) => {
    try {
      setIsSaving(true);
      const response = await updateAppearanceSettings({ hue });

      if (response.success) {
        setSettings((prev) => ({ ...prev, hue }));
        toast({
          title: "Accent Color Updated",
          variant: "default",
        });
      } else {
        throw new Error(response.error || "Failed to update accent color");
      }
    } catch (error) {
      console.error("Error updating accent color:", error);
      toast({
        title: "Error Updating Color",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle hue slider change
  const handleHueChange = async (value) => {
    setSettings((prev) => ({ ...prev, hue: value[0] }));
  };

  // Apply the hue change only after slider interaction is complete
  const handleHueChangeComplete = async () => {
    try {
      setIsSaving(true);
      const response = await updateAppearanceSettings({ hue: settings.hue });

      if (response.success) {
        toast({
          title: "Accent Color Updated",
          variant: "default",
        });
      } else {
        throw new Error(response.error || "Failed to update accent color");
      }
    } catch (error) {
      console.error("Error updating accent color:", error);
      toast({
        title: "Error Updating Color",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset all appearance settings to defaults
  const handleReset = async () => {
    try {
      setIsSaving(true);
      const response = await resetAppearanceSettings();

      if (response.success) {
        setSettings(response.settings);
        toast({
          title: "Settings Reset to Defaults",
          variant: "default",
        });
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
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={cardVariants}>
      <Card className="w-full bg-card/70 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            Appearance Settings
            {(isLoading || isSaving) && (
              <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </CardTitle>
          <CardDescription>
            Customize the look and feel of your Task Tree application.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Accent Color Selection */}
          <div className="space-y-4 p-4 border rounded-lg bg-background/50">
            <div>
              <Label className="text-base font-medium">Accent Color</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a color theme for the application
              </p>
            </div>

            {/* Color Presets */}
            <div className="flex flex-wrap gap-2 mt-2">
              {COLOR_PRESETS.map((color) => (
                <TooltipProvider key={color.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleColorPresetSelect(color.value)}
                        className={`w-8 h-8 rounded-full ${color.class} ${
                          settings.hue === color.value
                            ? "ring-2 ring-primary ring-offset-2"
                            : ""
                        }`}
                        aria-label={`Select ${color.name} theme`}
                        disabled={isLoading || isSaving}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{color.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>

            {/* Custom Hue Slider */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="hue-slider" className="text-sm font-medium">
                  Custom Hue: {settings.hue}°
                </Label>
              </div>
              <Slider
                id="hue-slider"
                min={0}
                max={359}
                step={1}
                value={[settings.hue]}
                onValueChange={handleHueChange}
                onValueCommit={handleHueChangeComplete}
                disabled={isLoading || isSaving}
                className="mt-2"
              />
              {/* Preview swatch showing full hue spectrum */}
              <div
                className="w-full h-6 mt-2 rounded-md"
                style={{
                  background: `linear-gradient(to right, 
                    hsl(0, 100%, 50%), 
                    hsl(60, 100%, 50%), 
                    hsl(120, 100%, 50%), 
                    hsl(180, 100%, 50%), 
                    hsl(240, 100%, 50%), 
                    hsl(300, 100%, 50%), 
                    hsl(360, 100%, 50%))`,
                }}
              />
              {/* Current selection indicator */}
              <div
                className="relative h-2"
                style={{
                  marginTop: "-4px",
                }}
              >
                <div
                  className="absolute w-3 h-3 bg-white border border-gray-400 rounded-full transform -translate-y-1/2"
                  style={{
                    left: `calc(${(settings.hue / 359) * 100}% - 6px)`,
                    top: "0",
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-between border-t p-4">
          <p className="text-xs text-muted-foreground">
            Changes are applied immediately
          </p>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading || isSaving}
            className="text-sm"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Reset to Defaults
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default AppearanceSettings;
