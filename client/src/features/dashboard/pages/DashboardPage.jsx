// src/features/dashboard/pages/DashboardPage.jsx
// Main page for displaying tasks, either as a list or Kanban board, based on the selected project/view.

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import TaskList from "../../tasks/components/TaskList"; // Corrected path
import ProjectKanbanBoard from "../../projects/components/ProjectKanbanBoard"; // Corrected path
// import ProjectInfo from "../../projects/components/ProjectInfo"; // Optional: If needed
import ViewToggle from "../../projects/components/ViewToggle"; // Corrected path
import { getProjectFromPath } from "../utils/dashboardUtils"; // Helper function
import { useTitle } from "../../../hooks/useTitle"; // Corrected path
import { motion } from "framer-motion";

const DashboardPage = () => {
  const {
    allProjects = [],
    projectObjects = [],
    lastTaskUpdate,
  } = useOutletContext() || {}; // Get projects and lastTaskUpdate from layout context
  const location = useLocation();
  const navigate = useNavigate();

  // State for view mode (list or board)
  const [viewMode, setViewMode] = useState(() => {
    const savedViewMode = localStorage.getItem("viewMode");
    // Default to 'list' if not a specific project route or if saved mode is invalid
    const isProjectRoute = location.pathname.includes("/dashboard/project/");
    return savedViewMode === "board" && isProjectRoute ? "board" : "list";
  });

  // State for tracking task count (relevant for potential redirects)
  const [taskCount, setTaskCount] = useState(null);

  // Derive the current project/view from the URL
  const projectKey = useMemo(() => {
    const project = getProjectFromPath(location.pathname);
    console.log(`[DashboardPage] Derived project key from URL: ${project}`);
    return project;
  }, [location.pathname]);

  // Update title based on the derived project key
  const getDisplayName = useCallback(() => {
    const specialRoutes = {
      today: "Today",
      upcoming: "Upcoming",
      completed: "Completed",
      all: "All Tasks",
      inbox: "Inbox",
    };
    if (specialRoutes[projectKey]) {
      return specialRoutes[projectKey];
    }
    // Find project name from objects for custom projects
    const projectObj = projectObjects.find((p) => p.name === projectKey);
    return projectObj?.name || projectKey || "Tasks"; // Fallback
  }, [projectKey, projectObjects]);

  useTitle(`${getDisplayName()} - Task Tree`);

  // Ensure view mode resets to 'list' if not on a specific project page
  useEffect(() => {
    const isProjectRoute = location.pathname.includes("/dashboard/project/");
    if (!isProjectRoute && viewMode === "board") {
      console.log(
        "[DashboardPage Effect] Not a project route, resetting viewMode to list."
      );
      setViewMode("list");
      localStorage.setItem("viewMode", "list");
    }
  }, [location.pathname, viewMode]);

  // Validate project existence when projects are loaded
  useEffect(() => {
    const isProjectRoute = location.pathname.includes("/dashboard/project/");
    // Check only if projects are loaded, it's a project route, and the project isn't in the list
    if (
      isProjectRoute &&
      allProjects.length > 0 &&
      !allProjects.includes(projectKey) &&
      !["today", "upcoming", "completed", "all", "inbox"].includes(projectKey) // Exclude special views
    ) {
      console.warn(
        `[DashboardPage Effect] Project "${projectKey}" not found in loaded projects (${allProjects.join(
          ", "
        )}). Redirecting...`
      );
      toast.error(`Project "${projectKey}" not found or has been deleted.`);
      navigate("/dashboard/today", { replace: true });
    }
  }, [allProjects, projectKey, location.pathname, navigate]);

  const handleViewModeChange = (mode) => {
    const isProjectRoute = location.pathname.includes("/dashboard/project/");
    if (mode === "board" && !isProjectRoute) {
      toast.info("Board view is only available for specific projects.");
      return;
    }
    console.log(`[DashboardPage] Changing view mode to: ${mode}`);
    setViewMode(mode);
    localStorage.setItem("viewMode", mode);
  };

  const handleTaskCountChange = useCallback(
    (count) => {
      // This function is called by TaskList/Board to report the current task count
      setTaskCount(count);
      console.log(`[DashboardPage] Task count for ${projectKey}: ${count}`);
    },
    [projectKey]
  );

  const handleTaskMoved = useCallback((task, oldProject, newProject) => {
    // This function could be called by TaskItem/TaskList if a task's project changes
    // Relevant if we need to trigger actions when a task leaves the current view
    console.log(
      `[DashboardPage] Task ${task._id} moved from ${oldProject} to ${newProject}`
    );
    // Potentially update counts or trigger redirects if the current project becomes empty
  }, []);

  // Prepare props for child components
  const commonProps = {
    selectedProject: projectKey,
    allProjects: allProjects,
    projectObjects: projectObjects,
    onTaskMoved: handleTaskMoved, // Pass down if needed
    onTaskCountChange: handleTaskCountChange,
    lastTaskUpdate, // Pass the lastTaskUpdate timestamp to trigger refreshes
  };

  // Animation for the page content container
  const pageContentVariants = {
    hidden: { opacity: 0, y: 3 }, // Even smaller offset for smoother animation
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.15, // Even faster animation
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="py-4 px-2 sm:py-6 sm:px-4 glass-morphism rounded-xl shadow-md"
      initial="hidden"
      animate="visible"
      variants={pageContentVariants}
      key={projectKey} // Add key to force re-render on project change
    >
      <motion.h1
        className="text-2xl md:text-3xl font-bold mb-4 text-center bg-gradient-to-r from-primary/90 via-purple-500/90 to-pink-500/90 bg-clip-text text-transparent animate-gradient-x"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {getDisplayName()}
      </motion.h1>

      {/* Show ViewToggle only for project routes */}
      {location.pathname.includes("/dashboard/project/") && (
        <div className="flex justify-center mb-4">
          <motion.div
            className="glass-card inline-block p-1 rounded-lg"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <ViewToggle
              viewMode={viewMode}
              setViewMode={handleViewModeChange}
            />
          </motion.div>
        </div>
      )}

      <motion.div
        className="mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        {viewMode === "list" ? (
          <TaskList key={`list-${projectKey}`} {...commonProps} />
        ) : (
          // Board view is implicitly selected if not list
          <ProjectKanbanBoard key={`board-${projectKey}`} {...commonProps} />
        )}
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
