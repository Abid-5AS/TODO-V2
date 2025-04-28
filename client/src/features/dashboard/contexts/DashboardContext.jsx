// src/features/dashboard/contexts/DashboardContext.jsx
// Context for managing dashboard state

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '../../../hooks/use-toast';
import { fetchProjects, fetchAppearanceSettings } from '../services/dashboardService';
import { getProjectFromPath } from '../helpers';
import { DEFAULT_APPEARANCE_SETTINGS } from '../constants';

// Create the context
const DashboardContext = createContext();

// Custom hook to use the dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

// Provider component
export const DashboardProvider = ({ children }) => {
  const location = useLocation();
  const { toast } = useToast();
  
  // State
  const [allProjects, setAllProjects] = useState([]);
  const [projectObjects, setProjectObjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [lastTaskUpdate, setLastTaskUpdate] = useState(Date.now());
  const [appearanceSettings, setAppearanceSettings] = useState(DEFAULT_APPEARANCE_SETTINGS);
  const [projectRefreshKey, setProjectRefreshKey] = useState(0);
  
  // Derive selectedProject from URL
  const selectedProject = getProjectFromPath(location.pathname);
  
  // Function to trigger project refresh
  const refreshProjects = () => {
    setProjectRefreshKey(prevKey => prevKey + 1);
  };
  
  // Load projects - now depends on projectRefreshKey
  useEffect(() => {
    let isMounted = true;
    
    const loadProjects = async () => {
      setLoadingProjects(true);
      try {
        const response = await fetchProjects();
        
        if (isMounted && response.success) {
          const fetchedProjects = response.data || [];
          setProjectObjects(fetchedProjects);
          const projectNames = fetchedProjects.map((p) => p.name);
          const projectsWithInbox = [
            "Inbox",
            ...projectNames.filter((p) => p !== "Inbox").sort(),
          ];
          setAllProjects(projectsWithInbox);
        } else if (isMounted && !response.success) {
          console.error("Failed to load projects:", response.error);
          setAllProjects(["Inbox"]);
        } 
      } catch (error) {
        console.error("Error loading projects:", error);
        if (isMounted) {
          setAllProjects(["Inbox"]);
        }
      } finally {
        if (isMounted) {
          setLoadingProjects(false);
        }
      }
    };
    
    loadProjects();
    
    return () => {
      isMounted = false;
    };
  }, [projectRefreshKey]);
  
  // Load appearance settings
  useEffect(() => {
    const loadAppearanceSettings = async () => {
      try {
        const response = await fetchAppearanceSettings();
        if (response.success) {
          setAppearanceSettings(response.data);
        }
      } catch (error) {
        console.error("Error loading appearance settings:", error);
      }
    };
    
    loadAppearanceSettings();
  }, []);
  
  // Update lastTaskUpdate timestamp
  const refreshTasks = () => {
    setLastTaskUpdate(Date.now());
  };
  
  // Context value - Add refreshProjects
  const value = {
    allProjects,
    projectObjects,
    loadingProjects,
    selectedProject,
    lastTaskUpdate,
    refreshTasks,
    appearanceSettings,
    setAppearanceSettings,
    refreshProjects,
  };
  
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardContext; 