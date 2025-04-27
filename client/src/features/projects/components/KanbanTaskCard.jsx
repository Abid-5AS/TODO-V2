// src/features/projects/components/KanbanTaskCard.jsx
// Renders a draggable task card for the Kanban board.

import React from "react";
import { Card, CardContent } from "../../../components/ui/card"; // Corrected path
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
    isDragging 
  } = useSortable({ 
      id: task._id, 
      data: { type: 'task', task } // Add type and potentially task data
  });

  // Style for dragging effect
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 250ms ease', // Add default transition
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 100 : 'auto', // Ensure dragged item is on top
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  if (!task) return null;

  // Base classes
  const cardClasses = "p-2 md:p-2.5 border rounded-lg shadow-sm transition-all duration-200 touch-none will-change-transform";
  // Specific styles for normal card
  const normalCardClasses = "bg-card/80 dark:bg-zinc-800/70 border-border/70 hover:shadow-md hover:scale-[1.03] hover:border-primary/50 hover:z-10 relative";
  // Specific styles for overlay (dragged) card
  const overlayCardClasses = "bg-card dark:bg-zinc-800 border-primary/50 shadow-xl scale-[1.05]";

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`${overlay ? 'kanban-overlay-card' : 'kanban-task-card'}`}
      {...attributes}
      {...listeners}
      // layout // Enable layout animation
    >
      <Card
        className={cn(
          cardClasses,
          overlay ? overlayCardClasses : normalCardClasses
        )}
      >
        <CardContent className="p-0">
          <h3 className="font-medium text-xs md:text-sm mb-1.5 line-clamp-2 break-words">
            {task.title}
          </h3>
          <div className="flex flex-wrap gap-1 items-center text-[10px] md:text-[11px]">
            {task.priority && (
              <Badge
                variant={getPriorityVariant(task.priority)}
                className="px-1.5 py-0 h-4 leading-tight"
              >
                {task.priority}
              </Badge>
            )}
            {task.dueDate && (
              <span className="text-muted-foreground flex items-center">
                 <Calendar className="h-3 w-3 mr-0.5" />
                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
             {task.labels && task.labels.length > 0 && (
                 <Badge variant="outline" className="px-1.5 py-0 h-4 leading-tight">
                   {task.labels[0]}
                   {task.labels.length > 1 ? ` +${task.labels.length - 1}` : ''}
                 </Badge>
             )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Helper cn function (if not globally available)
function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

export default KanbanTaskCard;
