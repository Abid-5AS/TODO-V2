// src/lib/utils.js
// General utility functions, including cn for merging class names.

import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Utility function to get Tailwind variant based on priority
export function getPriorityVariant(priority) {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'destructive'; // Red-like
    case 'medium':
      return 'warning'; // Yellow/Orange-like (Need to define this variant in badge.jsx or use existing like secondary)
    case 'low':
      return 'success'; // Green-like (Need to define this variant in badge.jsx or use existing like default/primary)
    default:
      return 'outline'; // Default outline style
  }
}

// Add other general utility functions here
