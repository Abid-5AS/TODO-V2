// src/features/projects/components/ProjectInfo.jsx
// Displays basic information about the current project.

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"; // Corrected path
import { Badge } from "../../../components/ui/badge"; // Corrected path

const ProjectInfo = ({ project, taskCount }) => {
  // Project might be a string (like 'today') or an object from projectObjects
  const projectName = typeof project === 'string' ? project : project?.name;
  const projectData = typeof project === 'object' ? project : null;

  if (!projectName) return null;

  // Format display name for special views
  const getDisplayName = () => {
    switch (projectName) {
      case "today": return "Today's Tasks";
      case "upcoming": return "Upcoming Tasks";
      case "completed": return "Completed Tasks";
      case "all": return "All Tasks";
      case "inbox": return "Inbox";
      default: return projectName;
    }
  };

  return (
    <Card className="mb-4 bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
      <CardContent className="p-4">
        <h2 className="text-xl font-semibold mb-1 capitalize">
          {getDisplayName()}
        </h2>
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Total Tasks: {taskCount ?? <span className="text-xs">Loading...</span>}</span>
          {/* Display creation date only if it's a real project object */}
          {projectData?.createdAt && (
            <span>
              Created: {new Date(projectData.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
         {/* Add other project details here if needed, e.g., description */}
         {/* {projectData?.description && <p className="text-xs mt-2 text-muted-foreground">{projectData.description}</p>} */}
      </CardContent>
    </Card>
  );
};

export default ProjectInfo;
