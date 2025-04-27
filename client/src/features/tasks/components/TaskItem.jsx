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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { Button } from "../../../components/ui/button";
import {
  CircleDashed,
  CircleDotDashed,
  Check,
  Edit,
  Trash2,
} from "lucide-react";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // --- Handlers for TaskDisplay Actions ---
  const handleToggleComplete = useCallback(
    async (e) => {
      e.stopPropagation(); // Prevent triggering accordion toggle
      const currentStatus = task.status || "todo";
      let newStatus, toastMessage;

      switch (currentStatus) {
        case "todo":
          newStatus = "doing";
          toastMessage = "Task started";
          break;
        case "doing":
          newStatus = "completed";
          toastMessage = "Task completed";
          break;
        case "completed":
        default:
          newStatus = "todo";
          toastMessage = "Task reset to To Do";
          break;
      }

      setIsUpdating(true);
      try {
        await onOptimisticUpdate(task._id, { status: newStatus });
        toast({ title: toastMessage });
      } catch (error) {
        console.error("Failed to update task status:", error);
        toast({
          title: "Error updating status",
          description: error.message,
          variant: "destructive",
        });
        // No revert needed as useTasks handles it implicitly
      } finally {
        setIsUpdating(false);
      }
    },
    [task._id, task.status, onOptimisticUpdate, toast]
  );

  const handleEdit = useCallback(
    (e) => {
      e.stopPropagation();
      setIsEditing(true);
      setEditError(null);
      // If accordion is open, keep it open; otherwise, open it for editing
      if (!accordionOpen) {
        setAccordionOpen(true);
      }
    },
    [accordionOpen, setAccordionOpen]
  );

  const handleDeleteClick = useCallback((e) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    setIsUpdating(true);
    try {
      await onOptimisticDelete(task._id);
      toast({ title: "Task deleted" });
      // TaskItem will unmount via parent state update
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast({
        title: "Error deleting task",
        description: error.message,
        variant: "destructive",
      });
      setIsUpdating(false); // Only stop loading on error
    }
    // No finally block, let parent handle unmount
  }, [task._id, onOptimisticDelete, toast]);

  // --- Handlers for TaskEditForm Actions ---
  const handleSaveEdit = useCallback(
    async (taskId, updatedFields) => {
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
    },
    [onOptimisticUpdate, toast]
  );

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

  // Animation variants for edit form - simplified to avoid layout constraints
  const editFormVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  return (
    <>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task and its subtasks? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <motion.div
        layout
        layoutId={`task-${task._id}`}
        className={cn(
          "w-full mb-4 rounded-xl overflow-visible transition-shadow duration-200",
          "shadow-sm hover:shadow-md",
          "glass-card relative", // Added relative positioning
          "border-0",
          "px-0 py-0",
          className
        )}
        initial={{ opacity: 0, y: 5, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -5, scale: 0.99 }}
        whileHover={{
          scale: 1.005,
          boxShadow: "0 4px 10px 0 rgba(80,80,180,0.03)",
        }}
        transition={{
          duration: 0.15,
          layout: {
            duration: 0.15,
            ease: "easeOut",
            type: "tween",
          },
        }}
        style={{
          willChange: "transform, opacity",
          transformOrigin: "center",
          position: "relative",
        }}
      >
        <Accordion
          type="single"
          collapsible
          value={accordionOpen ? `item-${task._id}` : ""} // Control accordion state externally
          onValueChange={() => {
            /* State managed by handleAccordionToggle/handleEdit */
          }}
          className="w-full"
        >
          <AccordionItem
            value={`item-${task._id}`}
            className="border-0 rounded-xl overflow-hidden"
            style={{ transformOrigin: "center" }}
          >
            {/* Use a div for the main clickable area, handle toggling */}
            <div
              className={`cursor-pointer p-1`}
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
                    className="task-edit-container w-full" // Add w-full to ensure full width
                    onClick={(e) => e.stopPropagation()} // Prevent accordion toggle when clicking inside edit form
                    layout="position" // Use position-only layout for better animation
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
                    className="task-display-container w-full overflow-visible"
                    layout="preserve-aspect" // Better layout animation that preserves aspect ratio
                  >
                    <TaskDisplay
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                      isAccordionOpen={accordionOpen}
                      hasSubtasks={hasSubtasks}
                      className="w-full overflow-visible" // Add width and overflow classes
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Accordion Content for Subtasks - Render only if not editing and has subtasks */}
            {hasSubtasks && !isEditing && (
              <AccordionContent className="pt-2 pb-3 px-4 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-b-xl overflow-hidden">
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
    </>
  );
};

export default TaskItem;
