// src/features/projects/components/KanbanTaskCard.jsx
// Renders a draggable task card for the Kanban board.

import React from "react";
import { Badge } from "../../../components/ui/badge"; // Corrected path
import { getPriorityVariant } from "../../../lib/utils"; // Corrected path
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";

const KanbanTaskCard = ({ task, overlay }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: { type: "task", task }, // Add type and potentially task data
  });

  // Style for dragging effect
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 250ms ease", // Add default transition
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 100 : "auto", // Ensure dragged item is on top
    cursor: isDragging ? "grabbing" : "grab",
  };

  if (!task) return null;

  // Base classes
  const cardClasses =
    "p-3 rounded-lg shadow-sm transition-all duration-200 touch-none will-change-transform";
  // Specific styles for normal card
  const normalCardClasses =
    "bg-blue-100/30 dark:bg-blue-900/20 backdrop-blur-sm border-0 hover:shadow-md hover:scale-[1.03] hover:bg-blue-100/40 dark:hover:bg-blue-900/30 hover:z-10 relative";
  // Specific styles for overlay (dragged) card
  const overlayCardClasses =
    "bg-blue-100/40 dark:bg-blue-900/30 backdrop-blur-sm border-0 shadow-md";

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`${overlay ? "kanban-overlay-card" : "kanban-task-card"}`}
      {...attributes}
      {...listeners}
    >
      <div
        className={cn(
          cardClasses,
          overlay ? overlayCardClasses : normalCardClasses
        )}
      >
        <h3 className="font-medium text-sm mb-2 line-clamp-2 break-words">
          {task.title}
        </h3>
        <div className="flex flex-wrap gap-1.5 items-center text-xs">
          {task.priority && (
            <Badge
              variant={getPriorityVariant(task.priority)}
              className="px-1.5 py-0 h-5 leading-tight opacity-90"
            >
              {task.priority}
            </Badge>
          )}
          {task.dueDate && (
            <span className="text-muted-foreground/80 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(task.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
          {task.labels && task.labels.length > 0 && (
            <Badge
              variant="outline"
              className="px-1.5 py-0 h-5 leading-tight opacity-90"
            >
              {task.labels[0]}
              {task.labels.length > 1 ? ` +${task.labels.length - 1}` : ""}
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Helper cn function (if not globally available)
function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

export default KanbanTaskCard;
