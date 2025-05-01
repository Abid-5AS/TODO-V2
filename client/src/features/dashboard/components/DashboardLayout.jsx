// src/features/dashboard/components/DashboardLayout.jsx
// Provides the main layout structure for the authenticated dashboard area, including Navbar and Sidebar.

import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../auth/contexts/AuthContext";
import { useDashboard } from "../contexts/DashboardContext";
import { useDashboardState } from "../hooks/useDashboardState";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import TaskForm from "../../tasks/components/TaskForm";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { FolderPlus, X, Check } from "lucide-react";

const DashboardLayout = () => {
  const { user } = useAuth();
  const { 
    allProjects, 
    projectObjects, 
    loadingProjects, 
    selectedProject,
    lastTaskUpdate
  } = useDashboard();
  
  const {
    taskFormOpen,
    taskFormProject,
    addProjectOpen,
    newProjectName,
    sidebarOpen,
    isMobile,
    setTaskFormOpen,
    setNewProjectName,
    setAddProjectOpen,
    toggleSidebar,
    closeSidebar,
    handleSelectProject,
    handleOpenTaskForm,
    handleCloseTaskForm,
    handleSidebarAction,
    handleAddProject,
    handleDeleteProject
  } = useDashboardState();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 dark:from-zinc-950 dark:to-indigo-950">
      {/* Mobile Only: Sidebar as Sheet - Pass isOpen and onClose */} 
      {isMobile && (
        <Sidebar
          selectedProject={selectedProject}
          onSelectProject={handleSelectProject}
          myProjects={allProjects}
          onAddTask={handleOpenTaskForm}
          onSidebarAction={handleSidebarAction}
          onDeleteProject={handleDeleteProject}
          username={user?.name || "User"}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          isMobile={isMobile}
          loadingProjects={loadingProjects}
        />
      )}

      {/* Navbar - Always visible, pass toggle function */}
      <Navbar
        onSidebarToggle={toggleSidebar}
        onAddTask={handleOpenTaskForm}
        selectedProject={selectedProject}
        className="glass-navbar border-b border-gray-200/40 dark:border-zinc-700/40 shadow-sm"
      />

      {/* Main Content Area */} 
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Only: Permanent Sidebar */} 
        {!isMobile && (
          <Sidebar
            selectedProject={selectedProject}
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
              selectedProject,
              lastTaskUpdate,
            }}
          />
        </main>
      </div>

      {/* TaskForm Dialog */} 
      <Dialog open={taskFormOpen} onOpenChange={setTaskFormOpen}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl glass-card relative shadow-lg p-0">
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
