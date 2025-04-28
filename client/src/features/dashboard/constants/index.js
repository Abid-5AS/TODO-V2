// src/features/dashboard/constants/index.js
// Constants used throughout the dashboard feature

// Special routes in the dashboard
export const SPECIAL_ROUTES = ["today", "upcoming", "completed", "all", "inbox", "overdue"];

// Display names for special routes
export const SPECIAL_ROUTE_DISPLAY_NAMES = {
  today: "Today",
  upcoming: "Upcoming",
  completed: "Completed",
  all: "All Tasks",
  inbox: "Inbox",
  overdue: "Overdue",
};

// Default appearance settings
export const DEFAULT_APPEARANCE_SETTINGS = {
  backgroundTheme: "default",
  uiDensity: "comfortable",
  reduceAnimations: false,
  darkMode: false,
};

// Animation variants for dashboard components
export const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  },
  sidebar: {
    closed: { x: -20, opacity: 0 },
    open: { x: 0, opacity: 1 },
  },
};

// Mobile breakpoint
export const MOBILE_BREAKPOINT = 768; 