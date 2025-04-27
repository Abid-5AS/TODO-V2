// src/features/dashboard/components/Sidebar.jsx
// Renders the sidebar navigation for projects, views, settings, etc.

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Calendar,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  ClipboardList,
  Inbox,
  Plus,
  PlusCircle,
  Settings,
  LayoutGrid,
  FolderPlus,
  X,
  BarChart2,
  Trash2,
  HelpCircle, // Added Help icon
  Loader2,
  AlertCircle,
  Moon,
  Heart, // Import Heart icon for Prayer Dashboard (replaced Pray which doesn't exist)
} from "lucide-react";
import { ScrollArea } from "../../../components/ui/scroll-area"; // Corrected path
import { Button } from "../../../components/ui/button"; // Corrected path
import { Skeleton } from "../../../components/ui/skeleton"; // Corrected path
import { cn } from "../../../lib/utils"; // Corrected path
import { motion } from "framer-motion";
import { sidebarVariants } from "../../animations"; // Corrected path
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog"; // Corrected path

const SidebarLink = React.memo(
  ({
    to,
    icon: Icon,
    label,
    active = false,
    onClick,
    onAddClick,
    onDeleteClick,
    count,
    canDelete = false,
    className,
  }) => (
    <motion.div
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="relative group/item"
    >
      <Link
        to={to}
        className={cn(
          "flex items-center justify-between py-1.5 px-3 rounded-lg mb-0.5 text-sm group/link transition-all duration-200",
          active
            ? "backdrop-blur-sm text-primary font-medium shadow-sm glass-button"
            : "text-muted-foreground hover:bg-muted/60 dark:hover:bg-zinc-800/50 hover:text-foreground"
        )}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault(); // Prevent default Link navigation if onClick is provided
            onClick();
          }
          // Allow default Link navigation if no onClick is provided
        }}
      >
        <div className="flex items-center gap-2">
          {Icon && (
            <div
              className={cn("icon-animated", active && "animate-pulse-slow")}
            >
              <Icon
                size={16}
                className={cn(
                  active
                    ? "text-primary"
                    : "text-muted-foreground group-hover/link:text-foreground",
                  className
                )}
              />
            </div>
          )}
          <span className={className}>{label}</span>
        </div>
        <div className="flex items-center flex-shrink-0 pl-1">
          {onAddClick && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover/item:opacity-100 focus:opacity-100 text-muted-foreground hover:text-primary transition-opacity duration-150"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onAddClick();
              }}
              aria-label={`Add task to ${label}`}
            >
              <Plus size={14} />
            </Button>
          )}
          {canDelete && label !== "Inbox" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-red-500 opacity-0 group-hover/item:opacity-100 focus:opacity-100 transition-opacity duration-150"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (onDeleteClick) onDeleteClick(label);
              }}
              aria-label={`Delete project ${label}`}
            >
              <Trash2 size={14} />
            </Button>
          )}
          {/* Add count display if needed */}
        </div>
      </Link>
    </motion.div>
  )
);

SidebarLink.displayName = "SidebarLink";

const Sidebar = ({
  myProjects = [],
  selectedProject,
  onSelectProject,
  onAddTask,
  onSidebarAction,
  onDeleteProject,
  username,
  isOpen, // For mobile sheet control
  onClose, // For mobile sheet control
  isMobile, // To conditionally render structure
  loadingProjects, // Loading state for projects
  className, // Allow passing additional classes
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    views: true,
    projects: true,
  });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleProjectSelect = (projectId) => {
    console.log(`[Sidebar] Project selected: ${projectId}`);
    onSelectProject(projectId);
    if (isMobile && onClose) {
      onClose(); // Close sheet on mobile after selection
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleDeleteRequest = (projectName) => {
    setProjectToDelete(projectName);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteProject = () => {
    if (projectToDelete && onDeleteProject) {
      onDeleteProject(projectToDelete);
    }
    setDeleteConfirmOpen(false);
    setProjectToDelete(null);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full glass-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border backdrop-blur-md">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <LayoutGrid
            size={20}
            className="text-primary group-hover:animate-spin-slow icon-animated"
          />
          <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            Task Tree
          </h2>
        </Link>
        {isMobile && onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="-mr-2 icon-animated"
          >
            <X size={20} />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="px-3 py-4 space-y-4">
          {/* Add Task Button */}
          <Button
            onClick={() => onAddTask()}
            variant="outline"
            size="sm"
            className="w-full justify-center gap-2 glass-button text-primary hover:text-primary font-medium glow-effect"
          >
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <PlusCircle size={16} />
            </motion.div>
            Add Task
          </Button>

          {/* Standard Views Section */}
          <div className="space-y-0.5">
            {/* Enhanced Islamic Home link with special green styling */}
            <motion.div
              whileHover={{
                x: 5,
                transition: { type: "spring", stiffness: 400, damping: 10 },
              }}
              whileTap={{ scale: 0.98 }}
              className="relative group/item mb-3"
              initial={{ scale: 0.97 }}
              animate={{
                scale: [0.97, 1.02, 1],
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                },
              }}
            >
              <Link
                to="/dashboard/islamic"
                className={cn(
                  "flex items-center justify-between py-2 px-3 rounded-lg text-sm group/link transition-all duration-200 relative overflow-hidden",
                  location.pathname === "/dashboard/islamic"
                    ? "text-white font-medium shadow-lg shadow-green-500/20 bg-gradient-to-r from-green-500 to-emerald-600"
                    : "text-emerald-600 hover:text-emerald-700 bg-gradient-to-r from-green-100/60 to-emerald-50/60 dark:from-green-900/20 dark:to-emerald-800/20 dark:text-emerald-400 hover:bg-green-100/80 dark:hover:bg-green-900/30 border border-green-200/50 dark:border-green-800/30"
                )}
                onClick={() => handleNavigation("/dashboard/islamic")}
              >
                <div className="flex items-center gap-2 z-10">
                  <div
                    className={cn(
                      "icon-animated",
                      location.pathname === "/dashboard/islamic"
                        ? "animate-pulse"
                        : "group-hover/link:animate-pulse"
                    )}
                  >
                    <Moon
                      size={18}
                      className={
                        location.pathname === "/dashboard/islamic"
                          ? "text-white"
                          : "text-emerald-600 dark:text-emerald-400"
                      }
                    />
                  </div>
                  <span className="font-medium">Islamic Home</span>
                </div>
                {/* Animated particles for active state */}
                {location.pathname === "/dashboard/islamic" && (
                  <>
                    <div className="absolute -top-1 -right-1 w-12 h-12 bg-white/20 rounded-full blur-xl animate-pulse-slow"></div>
                    <div className="absolute -bottom-2 -left-1 w-10 h-10 bg-white/10 rounded-full blur-lg animate-pulse-slow"></div>
                  </>
                )}
                {/* Sparkle effect on hover for inactive state */}
                {location.pathname !== "/dashboard/islamic" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-green-200/0 via-green-200/30 to-green-200/0 -translate-x-full group-hover/link:translate-x-full transition-transform duration-1000"></div>
                )}
              </Link>
            </motion.div>

            <motion.div
              whileHover={{
                x: 5,
                transition: { type: "spring", stiffness: 400, damping: 10 },
              }}
              whileTap={{ scale: 0.98 }}
              className="relative group/item mb-3"
            >
              <Link
                to="/dashboard/prayers"
                className={cn(
                  "flex items-center py-1.5 px-3 rounded-lg text-sm transition-all duration-200",
                  location.pathname === "/dashboard/prayers"
                    ? "backdrop-blur-sm font-medium shadow-sm glass-button text-emerald-500 dark:text-emerald-400"
                    : "text-muted-foreground hover:bg-muted/60 dark:hover:bg-zinc-800/50 hover:text-emerald-500 dark:hover:text-emerald-400"
                )}
                onClick={() => isMobile && onClose && onClose()}
              >
                <div className="flex gap-2 items-center">
                  <Heart
                    size={16}
                    className={cn(
                      location.pathname === "/dashboard/prayers"
                        ? "text-emerald-500 dark:text-emerald-400"
                        : "text-muted-foreground group-hover:text-emerald-500 dark:group-hover:text-emerald-400"
                    )}
                  />
                  <span>Prayer Tracker</span>
                </div>
              </Link>
            </motion.div>

            <SidebarLink
              to="/dashboard/today"
              icon={CheckCircle}
              label="Today"
              active={selectedProject === "today"}
              onClick={() => handleProjectSelect("today")}
            />
            <SidebarLink
              to="/dashboard/overdue"
              icon={AlertCircle}
              label="Overdue"
              active={selectedProject === "overdue"}
              onClick={() => handleProjectSelect("overdue")}
              className="text-red-500"
            />
            <SidebarLink
              to="/dashboard/upcoming"
              icon={Calendar}
              label="Upcoming"
              active={selectedProject === "upcoming"}
              onClick={() => handleProjectSelect("upcoming")}
            />
            <SidebarLink
              to="/dashboard/completed"
              icon={CheckCircle}
              label="Completed"
              active={selectedProject === "completed"}
              onClick={() => handleProjectSelect("completed")}
            />
            <SidebarLink
              to="/dashboard/all"
              icon={ClipboardList}
              label="All Tasks"
              active={selectedProject === "all"}
              onClick={() => handleProjectSelect("all")}
            />
          </div>

          {/* Projects Section */}
          <div>
            <div
              className="flex items-center justify-between py-2 cursor-pointer text-sm font-semibold text-muted-foreground hover:text-foreground pr-1 pl-1 transition-colors duration-200"
              onClick={() => toggleSection("projects")}
            >
              <span>Projects</span>
              <div className="flex items-center gap-1">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-6 w-6 glass-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSidebarAction("addProject");
                    }}
                  >
                    <FolderPlus size={14} />
                  </Button>
                </motion.div>
                <motion.div
                  animate={{ rotate: expandedSections.projects ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown size={16} />
                </motion.div>
              </div>
            </div>
            {expandedSections.projects && (
              <div className="space-y-0.5 mt-1 pl-1">
                {loadingProjects ? (
                  <div className="space-y-1.5 pl-1">
                    <Skeleton className="h-7 w-full rounded-md" />
                    <Skeleton className="h-7 w-4/5 rounded-md" />
                  </div>
                ) : (
                  myProjects.map((project) => (
                    <SidebarLink
                      key={project}
                      to={`/dashboard/project/${encodeURIComponent(project)}`}
                      icon={project === "Inbox" ? Inbox : ClipboardList}
                      label={project}
                      active={selectedProject === project}
                      onClick={() => handleProjectSelect(project)}
                      onAddClick={() => onAddTask(project)}
                      onDeleteClick={handleDeleteRequest}
                      canDelete={project !== "Inbox"}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Footer Links */}
      <div className="mt-auto space-y-0.5 px-3 py-3 border-t border-border">
        <SidebarLink
          to="/dashboard/stats"
          icon={BarChart2}
          label="Stats"
          active={location.pathname.startsWith("/dashboard/stats")}
          onClick={() => handleNavigation("/dashboard/stats")}
        />
        <SidebarLink
          to="/dashboard/settings"
          icon={Settings}
          label="Settings"
          active={location.pathname.startsWith("/dashboard/settings")}
          onClick={() => handleNavigation("/dashboard/settings")}
        />
        {/* <SidebarLink
            to="/dashboard/help"
            icon={HelpCircle}
            label="Help & Support"
            active={location.pathname.startsWith("/dashboard/help")}
            onClick={() => handleNavigation("/dashboard/help")}
          /> */}
        {username && (
          <div className="px-3 py-2 mt-2 text-xs text-muted-foreground truncate">
            Logged in as: {username}
          </div>
        )}
      </div>

      {/* Delete Project Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the project "{projectToDelete}"?
              This action cannot be undone. All tasks in this project will also
              be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteProject}>
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Render logic for mobile vs desktop
  if (isMobile) {
    // Mobile renders as a sheet (controlled by DashboardLayout)
    return (
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-background dark:bg-zinc-950 border-r border-border shadow-lg transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className // Allow external classes
        )}
      >
        {sidebarContent}
      </div>
    );
  }

  // Desktop renders as a fixed element
  return (
    <motion.div
      className={cn(
        "flex-shrink-0 flex flex-col h-full bg-background dark:bg-zinc-950 border-r border-border shadow-lg",
        className // Typically includes width like 'w-64'
      )}
      variants={sidebarVariants} // Optional: add animation
      initial="closed"
      animate="open"
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
    >
      {sidebarContent}
    </motion.div>
  );
};

export default Sidebar;
