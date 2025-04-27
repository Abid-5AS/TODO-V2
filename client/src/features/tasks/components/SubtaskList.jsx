// src/features/tasks/components/SubtaskList.jsx
// Manages the display and interaction for subtasks within a TaskItem.

import React, { useState } from "react";
import { Button } from "../../../components/ui/button"; // Corrected path
import { Input } from "../../../components/ui/input"; // Corrected path
// import { Checkbox } from "../../../components/ui/checkbox"; // Using icons instead
import { Trash2, CircleDashed, Check, Plus, Edit3, X } from "lucide-react"; // Added icons
import { useToast } from "../../../hooks/use-toast"; // Corrected path
import { motion, AnimatePresence } from "framer-motion";

const SubtaskList = ({
  taskId, // Parent task ID (though not strictly needed if using passed functions)
  subtasks = [],
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false); // Loading state for add
  const [isUpdating, setIsUpdating] = useState(null); // Loading state for toggle/delete (use subtask ID)
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!newSubtaskTitle.trim()) return;
    setIsAdding(true);
    try {
      // The passed function (onAddSubtask) should handle the API call and parent state update
      await onAddSubtask(taskId, {
        title: newSubtaskTitle.trim(),
        status: "pending",
      });
      setNewSubtaskTitle("");
      toast({ title: "Subtask added" });
    } catch (error) {
      console.error("Add subtask failed:", error);
      toast({
        title: "Error adding subtask",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggle = async (subtaskId, currentStatus) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    setIsUpdating(subtaskId);
    try {
      await onToggleSubtask(taskId, subtaskId, { status: newStatus });
      toast({
        title:
          newStatus === "completed"
            ? "Subtask completed"
            : "Subtask marked pending",
      });
    } catch (error) {
      console.error("Toggle subtask failed:", error);
      toast({
        title: "Error updating subtask",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const startEditing = (subtask) => {
    setEditingSubtaskId(subtask._id);
    setEditingSubtaskTitle(subtask.title);
  };

  const cancelEditing = () => {
    setEditingSubtaskId(null);
    setEditingSubtaskTitle("");
  };

  const handleUpdateTitle = async (subtaskId) => {
    if (!editingSubtaskTitle.trim() || !editingSubtaskId) return;
    // Check if title actually changed
    const originalSubtask = subtasks.find((st) => st._id === subtaskId);
    if (
      originalSubtask &&
      originalSubtask.title === editingSubtaskTitle.trim()
    ) {
      cancelEditing(); // No change, just cancel edit mode
      return;
    }

    setIsUpdating(subtaskId);
    try {
      await onUpdateSubtask(taskId, subtaskId, {
        title: editingSubtaskTitle.trim(),
      });
      cancelEditing();
      toast({ title: "Subtask updated" });
    } catch (error) {
      console.error("Update subtask title failed:", error);
      toast({
        title: "Error updating subtask",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (subtaskId) => {
    if (!window.confirm("Delete this subtask?")) return;
    setIsUpdating(subtaskId);
    try {
      await onDeleteSubtask(taskId, subtaskId);
      toast({ title: "Subtask deleted" });
    } catch (error) {
      console.error("Delete subtask failed:", error);
      toast({
        title: "Error deleting subtask",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      // Parent state update will remove the item, no need to setIsUpdating(null)
      // unless the delete fails, in which case it's handled in the catch.
      // If delete succeeds, the component might unmount or rerender without this ID.
      setIsUpdating(null); // Reset on error
    }
  };

  // Animation for list items
  const subtaskItemVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.15, ease: "easeOut" },
    },
    exit: { opacity: 0, height: 0, transition: { duration: 0.1 } },
  };

  return (
    <div className="space-y-2 mt-1">
      <AnimatePresence initial={false} mode="wait">
        {subtasks.map((st, idx) => (
          <motion.div
            key={st._id || `subtask-${idx}`}
            layout={false} // Disable layout animation
            variants={subtaskItemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex items-center space-x-2 group bg-muted/30 dark:bg-zinc-800/30 p-1.5 rounded-md"
          >
            <Button
              id={`subtask-toggle-${st._id}`}
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full flex-shrink-0 hover:bg-muted/50 dark:hover:bg-zinc-700/40"
              onClick={() => handleToggle(st._id, st.status || "pending")}
              disabled={isUpdating === st._id}
              aria-label={
                st.status === "completed"
                  ? "Mark as pending"
                  : "Mark as completed"
              }
            >
              {st.status === "completed" ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <CircleDashed className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>

            {editingSubtaskId === st._id ? (
              <Input
                type="text"
                value={editingSubtaskTitle}
                onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                onBlur={() => handleUpdateTitle(st._id)} // Save on blur
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdateTitle(st._id);
                  if (e.key === "Escape") cancelEditing();
                }}
                autoFocus
                className="flex-1 h-7 text-sm px-2 py-1 bg-background/70 dark:bg-input/50 rounded border border-transparent focus:border-primary focus:ring-1 focus:ring-primary"
                disabled={isUpdating === st._id}
              />
            ) : (
              <span
                className={`flex-1 text-sm cursor-pointer py-1 px-2 rounded ${
                  st.status === "completed"
                    ? "line-through text-muted-foreground/80"
                    : "text-foreground"
                }`}
                onClick={() => startEditing(st)}
                title="Click to edit"
              >
                {st.title}
              </span>
            )}

            {/* Edit/Delete Buttons */}
            <div className="flex items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
              {editingSubtaskId === st._id ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-primary hover:bg-primary/10"
                    onClick={() => handleUpdateTitle(st._id)}
                    disabled={isUpdating === st._id}
                  >
                    <Check size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:bg-muted/50"
                    onClick={cancelEditing}
                  >
                    <X size={16} />
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-primary"
                  onClick={() => startEditing(st)}
                >
                  <Edit3 size={14} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                onClick={() => handleDelete(st._id)}
                disabled={isUpdating === st._id}
                aria-label="Delete subtask"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add Subtask Input */}
      <div className="flex space-x-2 pt-1">
        <Input
          type="text"
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          placeholder="Add a subtask..."
          className="flex-1 h-8 text-sm bg-background/70 dark:bg-input/50 rounded-md border-dashed border-border focus:border-primary focus:ring-1 focus:ring-primary"
          onKeyDown={(e) => (e.key === "Enter" ? handleAdd() : null)}
          disabled={isAdding}
        />
        <Button
          type="button"
          onClick={handleAdd}
          disabled={!newSubtaskTitle.trim() || isAdding}
          size="sm"
          variant="outline"
          className="bg-background/70 hover:bg-muted"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
};

export default SubtaskList;
