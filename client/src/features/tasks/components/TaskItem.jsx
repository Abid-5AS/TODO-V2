// src/features/tasks/components/TaskItem.jsx
// Represents a single task item, handling display, edit state, and subtasks.

import React, { useState, useCallback } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../../components/ui/accordion"; // Corrected path
import { useToast } from "../../../hooks/use-toast"; // Corrected path
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils"; // Import the cn utility function

import TaskDisplay from "./TaskDisplay";
import TaskEditForm from "./TaskEditForm";
import SubtaskList from "./SubtaskList";

const TaskItem = ({ 
  task, 
  onOptimisticUpdate, 
  onOptimisticDelete,
  onOptimisticAddSubtask,
  onOptimisticUpdateSubtask,
  onOptimisticDeleteSubtask,
  accordionOpen,
  setAccordionOpen, // Receive the specific setter for this item
  availableProjects,
  className,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // Tracks async operations
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const { toast } = useToast();

  // --- Handlers for TaskDisplay Actions --- 
  const handleToggleComplete = useCallback(async (e) => {
    e.stopPropagation(); // Prevent triggering accordion toggle
    const currentStatus = task.status || "todo";
    let newStatus, toastMessage;

    switch (currentStatus) {
      case "todo": newStatus = "doing"; toastMessage = "Task started"; break;
      case "doing": newStatus = "completed"; toastMessage = "Task completed"; break;
      case "completed": default: newStatus = "todo"; toastMessage = "Task reset to To Do"; break;
    }

    setIsUpdating(true);
    try {
      await onOptimisticUpdate(task._id, { status: newStatus });
      toast({ title: toastMessage });
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast({ title: "Error updating status", description: error.message, variant: "destructive" });
      // No revert needed as useTasks handles it implicitly
    } finally {
      setIsUpdating(false);
    }
  }, [task._id, task.status, onOptimisticUpdate, toast]);

  const handleEdit = useCallback((e) => {
    e.stopPropagation(); 
    setIsEditing(true);
    setEditError(null);
    // If accordion is open, keep it open; otherwise, open it for editing
    if (!accordionOpen) {
      setAccordionOpen(true); 
    }
  }, [accordionOpen, setAccordionOpen]);

  const handleDelete = useCallback(async (e) => {
    e.stopPropagation(); 
    if (!window.confirm("Are you sure you want to delete this task and its subtasks?")) return;
    
    setIsUpdating(true);
    try {
      await onOptimisticDelete(task._id);
      toast({ title: "Task deleted" });
      // TaskItem will unmount via parent state update
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast({ title: "Error deleting task", description: error.message, variant: "destructive" });
      setIsUpdating(false); // Only stop loading on error
    }
    // No finally block, let parent handle unmount
  }, [task._id, onOptimisticDelete, toast]);

  // --- Handlers for TaskEditForm Actions --- 
  const handleSaveEdit = useCallback(async (taskId, updatedFields) => {
    setEditLoading(true);
    setEditError(null);
    setIsUpdating(true);
    try {
      await onOptimisticUpdate(taskId, updatedFields);
      setIsEditing(false);
      toast({ title: "Task updated" });
    } catch (error) {
      console.error("Failed to save task edit:", error);
      setEditError(error.message || "Failed to save changes.");
      // Keep edit form open on error
    } finally {
      setEditLoading(false);
      setIsUpdating(false);
    }
  }, [onOptimisticUpdate, toast]);

  const handleCancelEdit = useCallback((e) => {
    if (e) e.stopPropagation();
    setIsEditing(false);
    setEditError(null);
  }, []);

  // Handler for clicking the main task area to toggle accordion (only if not editing)
  const handleAccordionToggle = useCallback(() => {
    if (!isEditing) {
      setAccordionOpen(!accordionOpen); 
    }
  }, [isEditing, accordionOpen, setAccordionOpen]);

  // Animation variants for edit form
  const editFormVariants = {
    hidden: { opacity: 0, height: 0, y: -10, marginBottom: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      y: 0,
      marginBottom: "1rem", // Maintain spacing
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    exit: {
      opacity: 0,
      height: 0,
      y: -10,
      marginBottom: 0,
      transition: { duration: 0.2, ease: "easeInOut" },
    },
  };

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  return (
    <motion.div 
      className={cn(
        className, // Pass className from TaskList
        isUpdating ? "opacity-60 pointer-events-none animate-pulse-fast" : "", // Visual feedback during updates
        "overflow-visible rounded-xl" // Ensure rounded corners apply
      )}
      layout // Enable layout animation for the entire item
    >
      <Accordion
        type="single"
        collapsible
        value={accordionOpen ? `item-${task._id}` : ""} // Control accordion state externally
        onValueChange={() => { /* State managed by handleAccordionToggle/handleEdit */ }}
        className="rounded-xl overflow-visible shadow-md hover:shadow-lg transition-shadow duration-300"
      >
        <AccordionItem value={`item-${task._id}`} className="border-none overflow-visible">
          {/* Use a div for the main clickable area, handle toggling */} 
          <div 
             className={`cursor-pointer rounded-t-xl ${accordionOpen && hasSubtasks && !isEditing ? 'rounded-b-none' : 'rounded-b-xl'}`} 
             onClick={handleAccordionToggle} 
          > 
            {/* Animate presence for switching between Display and Edit */} 
            <AnimatePresence mode="wait" initial={false}>
              {isEditing ? (
                <motion.div
                  key="edit-form"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={editFormVariants}
                  className="task-edit-container px-0 pt-0 pb-0" // No padding needed if TaskEditForm has it
                  onClick={(e) => e.stopPropagation()} // Prevent accordion toggle when clicking inside edit form
                >
                  <TaskEditForm
                    task={task}
                    onSave={handleSaveEdit}
                    onCancel={handleCancelEdit}
                    isLoading={editLoading}
                    error={editError}
                    availableProjects={availableProjects}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="task-display"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ scale: 1.005 }} // Subtle hover on display only
                  className="task-display-container"
                >
                  <TaskDisplay
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isAccordionOpen={accordionOpen} // Pass state to maybe change chevron
                    hasSubtasks={hasSubtasks}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Accordion Content for Subtasks - Render only if not editing and has subtasks */} 
          {hasSubtasks && !isEditing && (
            <AccordionContent 
              className="pt-3 pb-4 px-4 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border-t border-gray-200/40 dark:border-zinc-700/40 rounded-b-xl overflow-hidden"
              // Ensure content doesn't animate closed instantly when accordion is externally closed
              // Framer Motion's AnimatePresence on AccordionItem might be needed for smooth exit
            >
              <SubtaskList
                taskId={task._id}
                subtasks={task.subtasks}
                onAddSubtask={onOptimisticAddSubtask}
                onToggleSubtask={onOptimisticUpdateSubtask}
                onUpdateSubtask={onOptimisticUpdateSubtask}
                onDeleteSubtask={onOptimisticDeleteSubtask}
              />
            </AccordionContent>
          )}
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
};

export default TaskItem;
