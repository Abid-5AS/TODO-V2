// src/features/dashboard/hooks/useDashboardState.js
// Custom hook for managing dashboard state

import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../../../hooks/use-toast';
import { useDashboard } from '../contexts/DashboardContext';
import { createNewProject, deleteProjectById } from '../services/dashboardService';
import { isProjectRoute } from '../helpers';
import { MOBILE_BREAKPOINT } from '../constants';

/**
 * Custom hook for managing dashboard state
 * @returns {Object} - Dashboard state and functions
 */
export const useDashboardState = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    allProjects, 
    projectObjects, 
    loadingProjects, 
    selectedProject,
    refreshTasks,
    refreshProjects
  } = useDashboard();
  
  // UI state
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [taskFormProject, setTaskFormProject] = useState(null);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );
  
  // View mode state
  const [viewMode, setViewMode] = useState(() => {
    const savedViewMode = localStorage.getItem('viewMode');
    return savedViewMode === 'board' && isProjectRoute(location.pathname) ? 'board' : 'list';
  });
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      if (window.innerWidth >= MOBILE_BREAKPOINT) {
        setSidebarOpen(false); // Close mobile sidebar on resize to desktop
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Ensure view mode resets to 'list' if not on a specific project page
  useEffect(() => {
    if (!isProjectRoute(location.pathname) && viewMode === 'board') {
      setViewMode('list');
      localStorage.setItem('viewMode', 'list');
    }
  }, [location.pathname, viewMode]);
  
  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);
  
  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);
  
  // Handle project selection
  const handleSelectProject = useCallback((projectId) => {
    const specialRoutes = ['today', 'upcoming', 'completed', 'all', 'inbox', 'overdue'];
    if (projectId === 'islamic') {
      navigate(`/dashboard/islamic`);
    } else if (projectId === 'prayers') {
      navigate(`/dashboard/prayers`);
    } else if (specialRoutes.includes(projectId)) {
      navigate(`/dashboard/${projectId}`);
    } else {
      navigate(`/dashboard/project/${encodeURIComponent(projectId)}`);
    }
    if (isMobile) {
      setSidebarOpen(false); // Close sidebar on mobile after selection
    }
  }, [navigate, isMobile, setSidebarOpen]);
  
  // Handle task form
  const handleOpenTaskForm = useCallback((project = null) => {
    setTaskFormProject(
      project ||
      projectObjects.find((p) => p.name === selectedProject)?.name ||
      'Inbox'
    );
    setTaskFormOpen(true);
  }, [projectObjects, selectedProject]);
  
  const handleCloseTaskForm = useCallback(() => {
    setTaskFormOpen(false);
    refreshTasks();
  }, [refreshTasks]);
  
  // Handle sidebar actions - Removed Search/Filter handlers
  const handleSidebarAction = useCallback((action) => {
    if (action === 'addProject') setAddProjectOpen(true);
    else if (action === 'addTask') setTaskFormOpen(true);
    // Search and Filter handlers removed
  }, [setAddProjectOpen, setTaskFormOpen]);
  
  // Handle project creation
  const handleAddProject = useCallback(async () => {
    const trimmedName = newProjectName.trim();
    if (!trimmedName || trimmedName === 'Inbox') return;
    
    if (allProjects.includes(trimmedName)) {
      toast({
        title: 'Project Already Exists',
        description: `A project named "${trimmedName}" already exists.`,
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const response = await createNewProject({ name: trimmedName });
      if (response.success) {
        const newProject = response.data;
        toast({ title: 'Project Created' });
        setNewProjectName('');
        setAddProjectOpen(false);
        if (refreshProjects) refreshProjects();
        return newProject;
      } else {
        throw new Error(response.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error Creating Project',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  }, [allProjects, newProjectName, toast, refreshProjects, setAddProjectOpen, setNewProjectName]);
  
  // Handle project deletion
  const handleDeleteProject = useCallback(async (projectName) => {
    if (projectName === 'Inbox') {
      toast({ title: 'Cannot Delete Inbox', variant: 'destructive' });
      return;
    }
    
    const project = projectObjects.find((p) => p.name === projectName);
    if (!project?._id) {
      toast({
        title: 'Project not found',
        description: `Could not find project ID for ${projectName}`,
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const response = await deleteProjectById(project._id);

      if (response.success) {
        toast({ title: 'Project Deleted', description: response.message });
        if (refreshProjects) {
          refreshProjects();
        }
        // Optionally, navigate away if the deleted project was selected
        if (selectedProject === projectName) {
          navigate('/dashboard/all'); // Navigate to a safe default view
        }
        return true;
      } else {
        throw new Error(response.error || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error Deleting Project',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  }, [projectObjects, toast, refreshProjects, selectedProject, navigate]);
  
  // Handle view mode change
  const handleViewModeChange = useCallback((mode) => {
    if (mode === 'board' && !isProjectRoute(location.pathname)) {
      toast.info('Board view is only available for specific projects.');
      return;
    }
    setViewMode(mode);
    localStorage.setItem('viewMode', mode);
  }, [location.pathname, toast]);
  
  return {
    // State
    taskFormOpen,
    taskFormProject,
    addProjectOpen,
    newProjectName,
    sidebarOpen,
    isMobile,
    viewMode,
    
    // Setters
    setTaskFormOpen,
    setTaskFormProject,
    setAddProjectOpen,
    setNewProjectName,
    setSidebarOpen,
    setViewMode,
    
    // Handlers
    toggleSidebar,
    closeSidebar,
    handleSelectProject,
    handleOpenTaskForm,
    handleCloseTaskForm,
    handleSidebarAction,
    handleAddProject,
    handleDeleteProject,
    handleViewModeChange,
  };
};

export default useDashboardState; 