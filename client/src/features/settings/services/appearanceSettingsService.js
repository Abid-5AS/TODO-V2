// src/features/settings/services/appearanceSettingsService.js
// Service for managing appearance settings, including theme and colors.

// Constants
const STORAGE_KEY = "task-tree-appearance-settings";

// Default values
const DEFAULT_SETTINGS = {
  accentColor: "indigo", // Default accent color
  backgroundTheme: "default", // Default background theme
  hue: 260, // Default hue value
  customColors: {}, // For future use with fully custom colors
  darkMode: window.matchMedia("(prefers-color-scheme: dark)").matches, // Default to system preference
  uiDensity: "comfortable", // Default UI density
  reduceAnimations: false, // Default animation setting
};

// Get current appearance settings
export const getAppearanceSettings = async () => {
  try {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      return {
        success: true,
        settings: { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) },
      };
    }
    return { success: true, settings: DEFAULT_SETTINGS };
  } catch (error) {
    console.error("Failed to get appearance settings:", error);
    return { success: false, error: error.message, settings: DEFAULT_SETTINGS };
  }
};

// Update appearance settings
export const updateAppearanceSettings = async (newSettings) => {
  try {
    // Get current settings first
    const { settings: currentSettings } = await getAppearanceSettings();

    // Merge with new settings
    const updatedSettings = { ...currentSettings, ...newSettings };

    // Save to local storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));

    // Apply the settings (this applies CSS variables)
    applyAppearanceSettings(updatedSettings);

    return { success: true, settings: updatedSettings };
  } catch (error) {
    console.error("Failed to update appearance settings:", error);
    return { success: false, error: error.message };
  }
};

// Reset appearance settings to defaults
export const resetAppearanceSettings = async () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    applyAppearanceSettings(DEFAULT_SETTINGS);
    return { success: true, settings: DEFAULT_SETTINGS };
  } catch (error) {
    console.error("Failed to reset appearance settings:", error);
    return { success: false, error: error.message };
  }
};

// Apply settings by updating CSS variables
export const applyAppearanceSettings = (settings) => {
  const root = document.documentElement;

  // Apply dark mode
  if (settings.darkMode) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  // Apply accent color (hue)
  if (settings.hue !== undefined) {
    const hue = settings.hue;
    root.style.setProperty("--hue", hue);

    // Calculate and set dynamic primary colors based on hue
    // Light mode primary
    root.style.setProperty("--primary", `oklch(0.623 0.214 ${hue})`);
    root.style.setProperty("--primary-foreground", `oklch(0.97 0.014 ${hue})`);
    root.style.setProperty("--ring", `oklch(0.623 0.214 ${hue})`);

    // Dark mode has different lightness/chroma
    const darkPrimary = `oklch(0.546 0.245 ${hue})`;
    const darkPrimaryForeground = `oklch(0.379 0.146 ${hue})`;
    const darkRing = `oklch(0.488 0.243 ${hue})`;

    // Create a style element for dark mode colors
    let styleEl = document.getElementById("theme-color-styles");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "theme-color-styles";
      document.head.appendChild(styleEl);
    }

    // Update dark mode colors with CSS that overrides the default variables
    styleEl.textContent = `
      .dark {
        --primary: ${darkPrimary};
        --primary-foreground: ${darkPrimaryForeground};
        --ring: ${darkRing};
        --sidebar-primary: ${darkPrimary};
        --sidebar-primary-foreground: ${darkPrimaryForeground};
        --sidebar-ring: ${darkRing};
      }
    `;

    // Update sidebar colors as well
    root.style.setProperty("--sidebar-primary", `oklch(0.623 0.214 ${hue})`);
    root.style.setProperty(
      "--sidebar-primary-foreground",
      `oklch(0.97 0.014 ${hue})`
    );
    root.style.setProperty("--sidebar-ring", `oklch(0.623 0.214 ${hue})`);
  }

  // Apply background theme
  if (settings.backgroundTheme !== undefined) {
    const bgTheme = settings.backgroundTheme || "default";

    // First remove ALL theme-related classes to avoid conflicts
    const bgClasses = [
      "bg-theme-waves",
      "bg-theme-dots",
      "bg-theme-gradient-soft",
      "bg-theme-gradient-vibrant",
    ];

    // Apply to root, html, and body elements for maximum compatibility
    [document.documentElement, document.body].forEach((element) => {
      // Remove existing classes
      bgClasses.forEach((className) => {
        element.classList.remove(className);
      });

      // Add new class if not default
      if (bgTheme !== "default") {
        element.classList.add(`bg-theme-${bgTheme}`);
      }
    });

    console.log(`Applied background theme: ${bgTheme}`);
  }

  // Apply UI density setting
  if (settings.uiDensity) {
    const densityClasses = ["ui-compact", "ui-comfortable", "ui-spacious"];

    // Apply to body to ensure it cascades to all content
    document.body.classList.remove(...densityClasses);
    document.body.classList.add(`ui-${settings.uiDensity}`);

    console.log(`Applied UI density: ${settings.uiDensity}`);
  }

  // Apply animation preferences
  if (settings.reduceAnimations !== undefined) {
    document.body.classList.toggle(
      "reduce-animations",
      settings.reduceAnimations
    );
    console.log(`Applied reduced animations: ${settings.reduceAnimations}`);
  }

  // Apply any custom colors if they exist
  if (settings.customColors) {
    Object.entries(settings.customColors).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(`--${key}`, value);
      }
    });
  }
};

// Initialize appearance settings on app start
export const initializeAppearanceSettings = async () => {
  const { settings } = await getAppearanceSettings();
  applyAppearanceSettings(settings);
  return settings;
};
