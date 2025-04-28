// src/features/settings/components/AppearanceSettings.jsx
// Component for managing application appearance settings.

import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Moon, Sun, Palette, RotateCcw } from "lucide-react";
import { useAppearanceSettings } from '../hooks/useAppearanceSettings';
import { COLOR_PRESETS } from '../constants/appearanceConstants';

const AppearanceSettings = () => {
  const {
    settings,
    isLoading,
    isSaving,
    handleDarkModeChange,
    handleColorPresetSelect,
    handleHueSliderChange,
    handleHueChangeComplete,
    handleReset,
  } = useAppearanceSettings();

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
          <div className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode" className="text-base font-medium">
                Dark Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark themes.
              </p>
            </div>
            <Switch
               id="dark-mode"
               checked={settings.darkMode}
               onCheckedChange={handleDarkModeChange}
               disabled={isLoading || isSaving}
               aria-label="Toggle dark mode"
             />
          </div>

          <div className="space-y-4 p-4 border rounded-lg bg-background/50">
            <div>
              <Label className="text-base font-medium">Accent Color</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a color theme for the application
              </p>
            </div>

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
                onValueChange={handleHueSliderChange}
                onValueCommit={handleHueChangeComplete}
                className="mt-1"
                disabled={isLoading || isSaving}
                aria-label="Custom hue slider"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading || isSaving}
            className="ml-auto"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Appearance
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default AppearanceSettings;
