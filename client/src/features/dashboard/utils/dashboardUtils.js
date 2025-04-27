// src/features/dashboard/utils/dashboardUtils.js
// Utility functions specific to the dashboard feature.

export const getProjectFromPath = (path) => {
  const specialRoutes = ["today", "upcoming", "completed", "all", "inbox"];
  const parts = path.split('/');

  if (parts.length >= 4 && parts[1] === 'dashboard' && parts[2] === 'project') {
    const potentialProject = decodeURIComponent(parts[3]);
    if (potentialProject) {
      // console.log(`[getProjectFromPath] Found project in path: ${potentialProject}`);
      return potentialProject;
    }
  }

  if (parts.length >= 3 && parts[1] === 'dashboard') {
    const currentRoute = parts[2];
    if (specialRoutes.includes(currentRoute)) {
      // console.log(`[getProjectFromPath] Found special route: ${currentRoute}`);
      return currentRoute;
    }
  }

  // console.log(`[getProjectFromPath] Path ${path} did not match project or special route, defaulting to 'today'.`);
  return "today"; // Default view
};
