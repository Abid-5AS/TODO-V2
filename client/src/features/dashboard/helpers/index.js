// src/features/dashboard/helpers/index.js
// Helper functions for the dashboard feature

import { SPECIAL_ROUTES } from '../constants';

/**
 * Extracts the project name or special route identifier from the current URL path
 * @param {string} path - The current URL path
 * @returns {string|null} - The project name, special route ID, or null if not a dashboard route
 */
export const getProjectFromPath = (path) => {
  const parts = path.split('/');

  // Ensure it's a dashboard path
  if (parts.length < 3 || parts[1] !== 'dashboard') {
    return null; // Not a dashboard route
  }

  // Check for specific project: /dashboard/project/projectName
  if (parts.length >= 4 && parts[2] === 'project') {
    const potentialProject = decodeURIComponent(parts[3]);
    return potentialProject || null; // Return project name or null if empty
  }

  // Check for special routes like /dashboard/today, /dashboard/upcoming, /dashboard/islamic, /dashboard/prayers
  const currentRoute = parts[2];
  const knownSpecialRoutes = ['today', 'upcoming', 'completed', 'all', 'inbox', 'overdue', 'islamic', 'prayers'];

  if (knownSpecialRoutes.includes(currentRoute)) {
    return currentRoute;
  }

  // If it's /dashboard but not recognized, maybe default or return null?
  // Returning null might be safer than defaulting to 'today' here.
  return null; 
};

/**
 * Gets the display name for a project or special route
 * @param {string} projectKey - The project key or special route
 * @param {Array} projectObjects - Array of project objects
 * @param {Object} specialRouteNames - Mapping of special routes to display names
 * @returns {string} - The display name
 */
export const getProjectDisplayName = (projectKey, projectObjects = [], specialRouteNames = {}) => {
  if (specialRouteNames[projectKey]) {
    return specialRouteNames[projectKey];
  }
  
  // Find project name from objects for custom projects
  const projectObj = projectObjects.find((p) => p.name === projectKey);
  return projectObj?.name || projectKey || "Tasks"; // Fallback
};

/**
 * Checks if the current route is a project route
 * @param {string} path - The current URL path
 * @returns {boolean} - Whether the current route is a project route
 */
export const isProjectRoute = (path) => {
  return path.includes("/dashboard/project/");
};

/**
 * Gets user initials from name
 * @param {string} name - The user's name
 * @returns {string} - The user's initials
 */
export const getUserInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}; 