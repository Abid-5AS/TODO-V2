// src/features/dashboard/helpers/index.js
// Helper functions for the dashboard feature

import { SPECIAL_ROUTES } from '../constants';

/**
 * Extracts the project name from the current URL path
 * @param {string} path - The current URL path
 * @returns {string} - The project name or special route
 */
export const getProjectFromPath = (path) => {
  const parts = path.split('/');

  if (parts.length >= 4 && parts[1] === 'dashboard' && parts[2] === 'project') {
    const potentialProject = decodeURIComponent(parts[3]);
    if (potentialProject) {
      return potentialProject;
    }
  }

  if (parts.length >= 3 && parts[1] === 'dashboard') {
    const currentRoute = parts[2];
    if (SPECIAL_ROUTES.includes(currentRoute)) {
      return currentRoute;
    }
  }

  return "today"; // Default view
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