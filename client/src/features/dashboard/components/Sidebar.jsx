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
import { motion } from "framer-motion";

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
    { id: "today", label: "Today", icon: Home, colorClass: "text-blue-500" },
    { id: "upcoming", label: "Upcoming", icon: Calendar, colorClass: "text-orange-500" },
    { id: "completed", label: "Completed", icon: CheckCircle, colorClass: "text-green-500" },
    { id: "overdue", label: "Overdue", icon: AlertTriangle, colorClass: "text-red-500" },
    { id: "all", label: "All Tasks", icon: ListTodo, colorClass: "text-gray-500" },
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
          className="w-full justify-start font-medium text-base hover:bg-primary/10 hover:text-primary transition-colors duration-150 h-10 group"
          onClick={() => handleActionClick("addTask")}
        >
          <FolderPlus className="mr-2 h-4 w-4 text-primary/80 group-hover:text-primary transition-colors duration-150" />
          Add Task
        </Button>
          <Button
            variant="ghost"
          className="w-full justify-start font-medium text-base hover:bg-primary/10 hover:text-primary transition-colors duration-150 h-10 group"
          onClick={() => handleActionClick("addProject")}
          >
          <FolderPlus className="mr-2 h-4 w-4 text-primary/80 group-hover:text-primary transition-colors duration-150" />
          Add Project
          </Button>
      </div>

      {/* === Special Feature Links === */}
      <div className="px-4 py-2 space-y-2">
        {[
          { id: "islamic", label: "Islamic Home", icon: Moon, iconColor: "text-purple-500" },
          { id: "prayers", label: "Prayer Tracking", icon: CheckSquare, iconColor: "text-green-500" },
          { id: "stats", label: "Stats", icon: BarChart2, iconColor: "text-blue-500" },
        ].map((link) => (
          <motion.div
            key={link.id}
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
          <Button
              variant={"ghost"}
          className={cn(
                "w-full justify-start font-semibold text-base transition-colors duration-150 h-11",
                selectedProject === link.id
                  ? "bg-primary/10 text-primary border-l-4 border-primary pl-4 font-semibold"
                  : "text-foreground/80 hover:bg-primary/5 hover:text-primary"
          )}
              onClick={() => handleProjectClick(link.id)}
            >
              <link.icon className={cn("mr-3 h-5 w-5", link.iconColor)} />
              {link.label}
              {selectedProject === link.id && (
            <ChevronRight className="ml-auto h-5 w-5" />
          )}
          </Button>
          </motion.div>
        ))}
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
                <motion.div
                  key={route.id}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Button
                    variant={"ghost"}
                    className={cn(
                      "w-full justify-start h-9 transition-colors duration-150",
                      selectedProject === route.id
                        ? "bg-primary/10 text-primary border-l-4 border-primary pl-4 font-medium"
                        : "text-foreground/80 hover:bg-primary/5 hover:text-primary"
                    )}
                  onClick={() => handleProjectClick(route.id)}
                  >
                    <route.icon className={cn("mr-2 h-4 w-4", route.colorClass)} />
                  {route.label}
                  {selectedProject === route.id && (
                    <ChevronRight className="ml-auto h-4 w-4" />
                  )}
                </Button>
                </motion.div>
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
                    <motion.div
                      key={project}
                      className="group flex items-center justify-between"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <Button
                        variant={"ghost"}
                        className={cn(
                          "w-full justify-start h-9 flex-1 mr-1 transition-colors duration-150",
                          selectedProject === project
                            ? "bg-primary/10 text-primary border-l-4 border-primary pl-4 font-medium"
                            : "text-foreground/80 hover:bg-primary/5 hover:text-primary"
                        )}
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
                    </motion.div>
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
