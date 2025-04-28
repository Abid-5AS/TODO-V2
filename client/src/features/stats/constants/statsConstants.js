// src/features/stats/constants/statsConstants.js
// Contains constants used in stats feature components and hooks.

// Animation variants for statistics cards
export const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
      delay: i * 0.05, // Faster stagger
    },
  }),
  hover: {
    scale: 1.02,
    y: -2,
    boxShadow:
      "0 10px 20px -5px rgba(0, 0, 0, 0.1), 0 5px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: { type: "spring", stiffness: 350, damping: 15 },
  },
};

// Colors for priority chart
export const priorityColors = {
  High: "#e11d48", // Red
  Medium: "#f59e0b", // Amber
  Low: "#3b82f6", // Blue
};

export const defaultChartColor = "#8b5cf6"; // Purple - Default color

// Colors for project chart (generate dynamically later if needed)
export const projectChartColors = [
  "#e11d48", // Red
  "#f59e0b", // Amber
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#ec4899", // Pink
]; 