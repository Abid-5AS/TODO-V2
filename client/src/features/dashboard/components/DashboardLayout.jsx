// src/features/dashboard/components/DashboardLayout.jsx
// Provides the main layout structure for the authenticated dashboard area, including Navbar and Sidebar.

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Outlet,
  useNavigate,
  useLocation,
  useOutletContext,
} from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Sheet, SheetContent } from "../../../components/ui/sheet"; // Corrected path
import TaskForm from "../../tasks/components/TaskForm"; // Corrected path
import { Button } from "../../../components/ui/button"; // Corrected path
import { useAuth } from "../../auth/contexts/AuthContext"; // Corrected path
import { Input } from "../../../components/ui/input"; // Corrected path
import { useToast } from "../../../hooks/use-toast"; // Corrected path
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog"; // Corrected path
import {
  getProjects,
  createProject,
  deleteProject as apiDeleteProject, // Renamed to avoid conflict
  deleteProjectByName,
  initializeProjects,
} from "../../projects/services/projectService"; // Corrected path
import { FolderPlus, X, Check } from "lucide-react";
import { Label } from "../../../components/ui/label"; // Corrected path
import { getProjectFromPath } from "../utils/dashboardUtils"; // Helper function
import { getAppearanceSettings } from "../../settings/services/appearanceSettingsService"; // Import appearance service

const DashboardLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [allProjects, setAllProjects] = useState([]);
  const [projectObjects, setProjectObjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [taskFormProject, setTaskFormProject] = useState(null);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastTaskUpdate, setLastTaskUpdate] = useState(Date.now());
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [appearanceSettings, setAppearanceSettings] = useState({
    backgroundTheme: "default",
    uiDensity: "comfortable",
    reduceAnimations: false,
  });
  const [selectedProject, setSelectedProject] = useState("");

  // Apply appearance settings when component mounts
  useEffect(() => {
    const loadAppearanceSettings = async () => {
      try {
        const { settings } = await getAppearanceSettings();
        setAppearanceSettings(settings);
        
        // We're no longer applying these settings
        console.log("Appearance settings loaded but backgroundTheme, uiDensity, and reduceAnimations are no longer applied");
      } catch (error) {
        console.error("Error loading appearance settings:", error);
      }
    };

    loadAppearanceSettings();
  }, []);

  // Derive selectedProject directly from URL using the utility function
  const selectedProjectMemo = React.useMemo(() => {
    const projectFromUrl = getProjectFromPath(location.pathname);
    console.log(
      `[DashboardLayout] Current Path: ${location.pathname}, Derived Project: ${projectFromUrl}`
    );
    // Update localStorage whenever the derived project changes
    localStorage.setItem("selectedProject", projectFromUrl);
    return projectFromUrl;
  }, [location.pathname]);

  // Effect to load projects
  useEffect(() => {
    let isMounted = true;
    const loadProjects = async () => {
      setLoadingProjects(true);
      try {
        let response = await getProjects();

        if (
          !response ||
          !response.success ||
          (response.success && response.data.length === 0)
        ) {
          console.log(
            "No projects found or fetch failed, attempting initialization..."
          );
          const initResponse = await initializeProjects();
          if (initResponse.success) {
            toast({
              title: "Projects Initialized",
              description:
                initResponse.data.message || "Default projects created.",
            });
            response = await getProjects(); // Re-fetch after initialization
          } else {
            throw new Error(
              initResponse.error || "Failed to initialize projects"
            );
          }
        }

        if (isMounted && response.success) {
          const fetchedProjects = response.data || [];
          setProjectObjects(fetchedProjects);
          const projectNames = fetchedProjects.map((p) => p.name);
          const projectsWithInbox = [
            "Inbox",
            ...projectNames.filter((p) => p !== "Inbox").sort(), // Sort other projects alphabetically
          ];
          setAllProjects(projectsWithInbox);
        } else if (isMounted && !response.success) {
            console.error("Failed to load projects:", response.error);
            setAllProjects(["Inbox"]); // Fallback
        }
      } catch (error) {
        console.error("Error loading or initializing projects:", error);
        if (isMounted) {
           setAllProjects(["Inbox"]); // Fallback on error
        }
      } finally {
        if (isMounted) {
          setLoadingProjects(false);
        }
      }
    };

    loadProjects();

    // Resize listener
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false); // Close mobile sidebar on resize to desktop
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener("resize", handleResize);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]); // Removed dependency on 'navigate'

  // Navigate based on selected project
  const handleSelectProject = (projectId) => {
    console.log(`[DashboardLayout] Navigating to project: ${projectId}`);
    const specialRoutes = ["today", "upcoming", "completed", "all", "inbox"];
    if (specialRoutes.includes(projectId)) {
      navigate(`/dashboard/${projectId}`);
    } else {
      navigate(`/dashboard/project/${encodeURIComponent(projectId)}`);
    }
    if (isMobile) {
      setSidebarOpen(false); // Close sidebar on mobile after selection
    }
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  const handleOpenTaskForm = (project = null) => {
    // Use the *currently selected* project if no specific one is passed
    setTaskFormProject(
      project ||
        projectObjects.find((p) => p.name === selectedProjectMemo)?.name ||
        "Inbox"
    );
    setTaskFormOpen(true);
  };
  
  // Close the task form and force a re-render of the task list
  const handleCloseTaskForm = () => {
    setTaskFormOpen(false);
    
    // Force a re-render of the task list by updating a timestamp
    // This will ensure the task list is refreshed after a new task is added
    setLastTaskUpdate(Date.now());
  };

  const handleSidebarAction = (action) => {
    if (action === "addProject") setAddProjectOpen(true);
    // Removed Search/Filter actions as they are now handled in TaskList
  };

  // Add Project
  const handleAddProject = async () => {
    const trimmedName = newProjectName.trim();
    if (!trimmedName || trimmedName === "Inbox") return;

    if (allProjects.includes(trimmedName)) {
      toast({
        title: "Project Already Exists",
        description: `A project named "${trimmedName}" already exists.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await createProject({ name: trimmedName });
      if (response.success) {
        const newProject = response.data;
        setProjectObjects((prev) => [...prev, newProject]);
        setAllProjects((prev) =>
          [...prev, newProject.name].sort((a, b) =>
            a === "Inbox" ? -1 : b === "Inbox" ? 1 : a.localeCompare(b)
          )
        ); // Keep Inbox first, sort others
        toast({ title: "Project Created" });
        setNewProjectName("");
        setAddProjectOpen(false);
      } else {
        throw new Error(response.error || "Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error Creating Project",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Delete Project
  const handleDeleteProject = async (projectName) => {
    if (projectName === "Inbox") {
      toast({ title: "Cannot Delete Inbox", variant: "destructive" });
      return;
    }

    const project = projectObjects.find((p) => p.name === projectName);
    if (!project?._id) {
      toast({
        title: "Project not found",
        description: `Could not find project ID for ${projectName}`,
        variant: "destructive",
      });
        // Attempt deletion by name as a fallback? Risky.
        // console.warn(`Attempting to delete project ${projectName} by name as ID was not found.`);
        // const fallbackResponse = await deleteProjectByName(projectName);
        return; 
    }

    try {
      const response = await apiDeleteProject(project._id);
      if (response.success) {
        setProjectObjects((prev) => prev.filter((p) => p._id !== project._id));
        setAllProjects((prev) => prev.filter((p) => p !== projectName));
        toast({ title: "Project Deleted", description: response.data.message });
        if (selectedProjectMemo === projectName) {
          handleSelectProject("today"); // Navigate away if deleted project was selected
        }
      } else {
        throw new Error(response.error || "Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error Deleting Project",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 dark:from-zinc-950 dark:to-indigo-950">
      {/* Mobile Only: Sidebar as Sheet - Pass isOpen and onClose */} 
      {isMobile && (
        <Sidebar
          selectedProject={selectedProjectMemo}
          onSelectProject={handleSelectProject}
          myProjects={allProjects}
          onAddTask={handleOpenTaskForm}
          onSidebarAction={handleSidebarAction}
          onDeleteProject={handleDeleteProject}
          username={user?.name || "User"}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          isMobile={isMobile} // Pass isMobile prop
          loadingProjects={loadingProjects}
        />
      )}

      {/* Navbar - Always visible, pass toggle function */}
      <Navbar
        onSidebarToggle={toggleSidebar}
        onAddTask={handleOpenTaskForm}
        selectedProject={selectedProjectMemo} // Pass selectedProject for context if needed
        className="glass-navbar border-b border-gray-200/40 dark:border-zinc-700/40 shadow-sm"
      />

      {/* Main Content Area */} 
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Only: Permanent Sidebar */} 
        {!isMobile && (
          <Sidebar
            selectedProject={selectedProjectMemo}
            onSelectProject={handleSelectProject}
            myProjects={allProjects}
            onAddTask={handleOpenTaskForm}
            onSidebarAction={handleSidebarAction}
            onDeleteProject={handleDeleteProject}
            username={user?.name || "User"}
            loadingProjects={loadingProjects}
            className="w-64 flex-shrink-0" // Fixed width for desktop sidebar
          />
        )}

        {/* Content Outlet */} 
        <main className="flex-1 overflow-auto backdrop-blur-sm paper-texture">
          {/* Pass projects data and lastTaskUpdate timestamp down via context */}
          <Outlet
            context={{
              allProjects,
              projectObjects,
              selectedProject: selectedProjectMemo,
              lastTaskUpdate,
            }}
          />
        </main>
      </div>

      {/* TaskForm Dialog */} 
      <Dialog open={taskFormOpen} onOpenChange={setTaskFormOpen}>
        <DialogContent className="sm:max-w-[550px] glass-card relative shadow-lg p-0">
          <TaskForm
            availableProjects={allProjects}
            onTaskCreated={handleCloseTaskForm}
            initialProject={taskFormProject}
          />
        </DialogContent>
      </Dialog>

      {/* Add Project Dialog */} 
      <Dialog open={addProjectOpen} onOpenChange={setAddProjectOpen}>
        <DialogContent className="glass-card relative shadow-lg sm:max-w-[450px] p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FolderPlus
                size={18}
                className="text-primary animate-pulse-slow"
              />
              Add New Project
            </DialogTitle>
          </DialogHeader>
          
          <div className="px-6 py-4">
            <Label
              htmlFor="project-name"
              className="mb-2 block text-sm font-medium"
            >
                Project Name
              </Label>
              <Input
                id="project-name"
              placeholder="Enter project name..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              className="glass-input"
              autoFocus
              />
            </div>
            
          <DialogFooter className="border-t border-border/20 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => setAddProjectOpen(false)}
              className="glass-button"
            >
              <X size={16} className="mr-2" /> Cancel
            </Button>
              <Button 
                onClick={handleAddProject} 
              className="glass-button glow-effect"
              >
              <Check size={16} className="mr-2" /> Create
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile Sidebar Backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-md transition-all duration-300"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
