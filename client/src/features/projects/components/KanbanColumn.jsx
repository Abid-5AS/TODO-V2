// src/features/projects/components/KanbanColumn.jsx
// Renders a single column in the Kanban board.

import React from "react";
import KanbanTaskCard from "./KanbanTaskCard";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const KanbanColumn = ({ id, title, tasks = [] }) => {
  // Set up droppable area for the column
  const { setNodeRef, isOver } = useDroppable({
    id: id, // Use the column id ('todo', 'doing', 'completed')
    data: {
      type: "column",
      accepts: ["task"], // Define what type of draggable this droppable accepts
    },
  });

  const columnVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
  };

  // Determine index based on ID for staggered animation
  const columnIndex = ["todo", "doing", "completed"].indexOf(id);

  return (
    <motion.div
      ref={setNodeRef}
      variants={columnVariants}
      initial="hidden"
      animate="visible"
      custom={columnIndex}
      className={cn(
        "w-full md:w-[280px] lg:w-[320px] flex-shrink-0 rounded-xl flex flex-col h-full",
        isOver ? "ring-2 ring-primary/40" : "",
        "transition-all duration-300 bg-transparent"
      )}
      style={{ minHeight: "400px" }}
      whileHover={{
        scale: 1.01,
        boxShadow: "0 4px 20px 0 rgba(80,80,180,0.08)",
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-3 border-0 sticky top-0 bg-white/40 dark:bg-zinc-800/30 backdrop-blur-sm rounded-t-xl z-10">
        <h2 className="font-semibold text-sm text-center capitalize">
          {title} ({tasks.length})
        </h2>
      </div>
      <SortableContext
        items={tasks.map((t) => t._id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          className={cn(
            "flex-grow overflow-y-auto p-2 space-y-2.5 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent rounded-b-xl",
            isOver
              ? "bg-primary/5"
              : "bg-white/10 dark:bg-zinc-900/20 backdrop-blur-sm"
          )}
        >
          {tasks.map((task) => (
            <KanbanTaskCard key={task._id} task={task} />
          ))}
          {tasks.length === 0 && !isOver && (
            <p className="text-xs text-muted-foreground text-center pt-4 px-2">
              Drag tasks here or add new ones.
            </p>
          )}
          {isOver && (
            <div className="border-2 border-dashed border-primary/40 rounded-lg p-4 mt-2 bg-primary/5 transition-all duration-200">
              <p className="text-xs text-center text-primary/80">
                Drop task here
              </p>
            </div>
          )}
        </div>
      </SortableContext>
    </motion.div>
  );
};

export default KanbanColumn;
