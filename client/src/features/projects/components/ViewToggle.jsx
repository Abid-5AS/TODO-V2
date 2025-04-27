// src/features/projects/components/ViewToggle.jsx
// Provides buttons to switch between List and Board views.

import React from "react";
import { Button } from "../../../components/ui/button"; // Corrected path
import { List, Kanban } from "lucide-react";
import { cn } from "../../../lib/utils"; // Corrected path
import { motion } from "framer-motion";

const ViewToggle = ({ viewMode, setViewMode, className }) => {
  const handleViewChange = (mode) => {
    console.log(`[ViewToggle] Setting view mode to: ${mode}`);
    setViewMode(mode);
  };

  return (
    <div className={cn("flex justify-center gap-2", className)}>
      {" "}
      {/* Allow passing classes */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant={viewMode === "list" ? "secondary" : "ghost"} // Use secondary for active
          size="sm"
          onClick={() => handleViewChange("list")}
          className={cn(
            "transition-all duration-200 glass-button",
            viewMode === "list"
              ? "bg-primary/10 text-primary glow-effect"
              : "text-muted-foreground"
          )}
        >
          <List className="mr-2 h-4 w-4 icon-animated" /> List
        </Button>
      </motion.div>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant={viewMode === "board" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => handleViewChange("board")}
          className={cn(
            "transition-all duration-200 glass-button",
            viewMode === "board"
              ? "bg-primary/10 text-primary glow-effect"
              : "text-muted-foreground"
          )}
        >
          <Kanban className="mr-2 h-4 w-4 icon-animated" /> Board
        </Button>
      </motion.div>
    </div>
  );
};

export default ViewToggle;
