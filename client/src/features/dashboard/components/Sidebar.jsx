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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../components/ui/accordion";
import {
  FolderPlus, 
  Search, 
  Filter, 
  Trash2, 
  ChevronRight,
  Home,
  Calendar,
  CheckCircle,
  ListTodo,
  Moon,
  CheckSquare,
  BarChart2,
  AlertTriangle
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
    { id: "overdue", label: "Overdue", icon: AlertTriangle },
    { id: "all", label: "All Tasks", icon: ListTodo },
  ];

  const handleProjectClick = (projectId) => {
    if (projectId === "stats") {
      navigate("/dashboard/stats");
    } else {
      onSelectProject(projectId);
    }
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
      <div className="p-4 space-y-2 border-b border-border/20 pb-4 mb-2">
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

      {/* === Special Feature Links === */}
      <div className="px-4 py-2 space-y-2">
          <Button
          key="islamic"
          variant={selectedProject === "islamic" ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start font-medium text-base transition-all duration-200 hover:pl-5",
            selectedProject === "islamic" ?
              "bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-700 dark:text-purple-300 border-l-4 border-purple-500 pl-4" :
              "text-foreground/80 hover:text-purple-600 dark:hover:text-purple-400"
          )}
          onClick={() => handleProjectClick("islamic")}
            >
          <Moon className="mr-3 h-5 w-5 text-purple-500" />
          Islamic Home
          {selectedProject === "islamic" && (
            <ChevronRight className="ml-auto h-5 w-5" />
          )}
          </Button>
        <Button
          key="prayers"
          variant={selectedProject === "prayers" ? "secondary" : "ghost"}
                className={cn(
            "w-full justify-start font-medium text-base transition-all duration-200 hover:pl-5",
            selectedProject === "prayers" ?
              "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-300 border-l-4 border-green-500 pl-4" :
              "text-foreground/80 hover:text-green-600 dark:hover:text-green-400"
                )}
          onClick={() => handleProjectClick("prayers")}
              >
          <CheckSquare className="mr-3 h-5 w-5 text-green-500" />
          Prayer Tracking
          {selectedProject === "prayers" && (
            <ChevronRight className="ml-auto h-5 w-5" />
          )}
        </Button>
        <Button
          key="stats"
          variant={selectedProject === "stats" ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start font-medium text-base transition-all duration-200 hover:pl-5",
            selectedProject === "stats" ?
              "bg-gradient-to-r from-blue-500/20 to-sky-500/20 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500 pl-4" :
              "text-foreground/80 hover:text-blue-600 dark:hover:text-blue-400"
          )}
          onClick={() => handleProjectClick("stats")}
        >
          <BarChart2 className="mr-3 h-5 w-5 text-blue-500" />
          Stats
          {selectedProject === "stats" && (
            <ChevronRight className="ml-auto h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Accordion for Collapsible Sections */}
      <Accordion 
        type="multiple" 
        defaultValue={["quick-access", "my-projects"]}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-2"
      >
        {/* Quick Access Section */}
        <AccordionItem value="quick-access" className="border-b-0">
          <AccordionTrigger className="text-sm font-medium text-muted-foreground hover:no-underline py-2">
            Quick Access
          </AccordionTrigger>
          <AccordionContent className="pb-1">
            <div className="space-y-1 pl-2">
              {specialRoutes.map((route) => (
                <Button
                  key={route.id}
                  variant={selectedProject === route.id ? "secondary" : "ghost"}
                  className="w-full justify-start h-9"
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
          </AccordionContent>
        </AccordionItem>

        {/* Projects Section */}
        <AccordionItem value="my-projects" className="border-b-0">
          <AccordionTrigger className="text-sm font-medium text-muted-foreground hover:no-underline py-2">
            My Projects
          </AccordionTrigger>
          <AccordionContent className="pb-1">
            <ScrollArea className="h-[calc(100vh-550px)] pl-2">
              {loadingProjects ? (
                <div className="space-y-2 pr-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-9 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-1 pr-2">
                  {myProjects.map((project) => (
                    <div
                      key={project}
                      className="group flex items-center justify-between"
                    >
                      <Button
                        variant={selectedProject === project ? "secondary" : "ghost"}
                        className="w-full justify-start h-9 flex-1 mr-1"
                        onClick={() => handleProjectClick(project)}
                      >
                        <FolderPlus className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{project}</span>
                        {selectedProject === project && (
                          <ChevronRight className="ml-auto h-4 w-4 flex-shrink-0" />
                        )}
                      </Button>
                      {project !== "Inbox" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-9 w-9 flex-shrink-0"
                          onClick={(e) => { e.stopPropagation(); onDeleteProject(project);}}
                    >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                  </div>
                  ))}
                  </div>
                )}
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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
