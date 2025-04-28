// src/features/settings/constants/appearanceConstants.js

// Color presets with their respective hue values
export const COLOR_PRESETS = [
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

// Default appearance settings used on initial load or reset
export const DEFAULT_SETTINGS = {
  darkMode: false,
  hue: 260, // Default to Indigo hue from presets
};

// Add other appearance-related constants here if needed
// e.g., export const DEFAULT_HUE = 260; 