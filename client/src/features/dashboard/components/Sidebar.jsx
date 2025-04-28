// src/features/dashboard/components/Sidebar.jsx
// Provides the sidebar navigation for the dashboard, including project list and actions.

import React from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../contexts/DashboardContext";
import { useDashboardState } from "../hooks/useDashboardState";
import { Button } from "../../../components/ui/button";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Sheet, SheetContent } from "../../../components/ui/sheet";
import { Skeleton } from "../../../components/ui/skeleton";
import { 
  FolderPlus, 
  Search, 
  Filter, 
  Trash2, 
  ChevronRight,
  Home,
  Calendar,
  CheckCircle,
  ListTodo
} from "lucide-react";
import { cn } from "../../../lib/utils";

const Sidebar = ({
  selectedProject,
  onSelectProject,
  myProjects,
  onAddTask,
  onSidebarAction,
  onDeleteProject,
  username,
  isOpen,
  onClose,
  isMobile,
  loadingProjects,
  className
}) => {
  const navigate = useNavigate();
  const { projectObjects } = useDashboard();

  const specialRoutes = [
    { id: "today", label: "Today", icon: Home },
    { id: "upcoming", label: "Upcoming", icon: Calendar },
    { id: "completed", label: "Completed", icon: CheckCircle },
    { id: "all", label: "All Tasks", icon: ListTodo },
  ];

  const handleProjectClick = (projectId) => {
    onSelectProject(projectId);
    if (isMobile) {
      onClose();
    }
  };

  const handleActionClick = (action) => {
    if (onSidebarAction) onSidebarAction(action);
    if (isMobile) {
      onClose();
    }
  };

  const SidebarContent = () => (
    <div className={cn("flex flex-col h-full", className)}>
      {/* User Section */}
      <div className="p-4 border-b border-border/20">
        <h2 className="text-lg font-semibold mb-2">Welcome, {username}</h2>
        <p className="text-sm text-muted-foreground">
          Manage your tasks and projects
        </p>
      </div>

      {/* Quick Actions */}
      <div className="p-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => handleActionClick("addTask")}
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => handleActionClick("addProject")}
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      {/* Special Routes */}
      <div className="px-4 py-2">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          Quick Access
        </h3>
        <div className="space-y-1">
          {specialRoutes.map((route) => (
            <Button
              key={route.id}
              variant={selectedProject === route.id ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleProjectClick(route.id)}
            >
              <route.icon className="mr-2 h-4 w-4" />
              {route.label}
              {selectedProject === route.id && (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Projects Section */}
      <div className="flex-1 px-4 py-2">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          My Projects
        </h3>
        <ScrollArea className="h-[calc(100vh-400px)]">
          {loadingProjects ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {myProjects.map((project) => (
                <div
                  key={project}
                  className="group flex items-center justify-between"
                >
                  <Button
                    variant={selectedProject === project ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleProjectClick(project)}
                  >
                    <FolderPlus className="mr-2 h-4 w-4" />
                    {project}
                    {selectedProject === project && (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </Button>
                  {project !== "Inbox" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onDeleteProject(project)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );

  // Mobile: Render as Sheet
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="p-0 w-80">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Render as permanent sidebar
  return <SidebarContent />;
};

export default Sidebar;
