// src/features/tasks/components/TaskEditForm.jsx
// Provides the form for editing an existing task's details.

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "../../../components/ui/card"; // Corrected path
import { Button } from "../../../components/ui/button"; // Corrected path
import { Input } from "../../../components/ui/input"; // Corrected path
import { Textarea } from "../../../components/ui/textarea"; // Corrected path
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"; // Corrected path
import { Label } from "../../../components/ui/label"; // Corrected path
import { AlertCircle, Loader2 } from 'lucide-react';

const TaskEditForm = ({ 
  task, 
  onSave, 
  onCancel, 
  isLoading, 
  error, 
  availableProjects = [] 
}) => {
  // Initialize form state based on the task prop
  const [editForm, setEditForm] = useState(() => ({
    title: task.title || "",
    description: task.description || "",
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "", // Format for date input
    priority: task.priority || "Medium",
    labels: task.labels?.join(", ") || "", // Join labels into a string for input
    project: task.project || "Inbox",
    // Subtasks are handled by SubtaskList component
  }));

  // Update form state if the task prop changes externally
  useEffect(() => {
    setEditForm({
      title: task.title || "",
      description: task.description || "",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      priority: task.priority || "Medium",
      labels: task.labels?.join(", ") || "",
      project: task.project || "Inbox",
    });
  }, [task]);

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handlePriorityChange = (value) => {
    setEditForm({ ...editForm, priority: value });
  };

  const handleProjectChange = (value) => {
    setEditForm({ ...editForm, project: value || "Inbox" }); // Use Select's onValueChange
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) {
        // Basic validation (could add more robust validation)
        alert("Task title cannot be empty.");
        return;
    }
    const updatedFields = {
      ...editForm,
      // Convert labels string back to array, filter empty strings
      labels: editForm.labels.split(",").map((l) => l.trim()).filter(Boolean),
      // Ensure dueDate is null if empty string, otherwise keep the date string
      dueDate: editForm.dueDate || null,
      project: editForm.project.trim() || "Inbox", // Ensure project defaults to Inbox if empty
    };
    // Remove fields that haven't changed compared to the original task?
    // This can prevent unnecessary updates, but requires comparing `editForm` with `task`.
    // For simplicity, we send all fields for now.
    onSave(task._id, updatedFields);
  };

  return (
    // Use specific CSS classes defined in card-theme.css or Tailwind directly
    <Card className="task-edit-form rounded-lg shadow-lg mb-0 p-0 border border-border">
      <CardHeader className="pb-3 pt-5 px-5 border-b border-border">
        <h3 className="text-lg font-semibold">Edit Task</h3>
      </CardHeader>
      <CardContent className="px-5 py-5">
        <form 
          id={`edit-form-${task._id}`} 
          onSubmit={handleSubmit} 
          className="space-y-4"
        >
          <div>
            <Label htmlFor={`title-${task._id}`} className="block mb-1.5 text-sm font-medium">
              Title
            </Label>
            <Input
              id={`title-${task._id}`}
              type="text"
              name="title"
              value={editForm.title}
              onChange={handleChange}
              required
              className="w-full bg-background/70 dark:bg-input/50"
              placeholder="Task title"
            />
          </div>

          <div>
            <Label htmlFor={`description-${task._id}`} className="block mb-1.5 text-sm font-medium">
              Description
            </Label>
            <Textarea
              id={`description-${task._id}`}
              name="description"
              value={editForm.description}
              onChange={handleChange}
              rows={2}
              className="w-full bg-background/70 dark:bg-input/50 resize-none"
              placeholder="Add more details (optional)"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <div className="flex-1">
              <Label htmlFor={`dueDate-${task._id}`} className="block mb-1.5 text-sm font-medium">
                Due Date
              </Label>
              <Input
                id={`dueDate-${task._id}`}
                type="date"
                name="dueDate"
                value={editForm.dueDate}
                onChange={handleChange}
                className="w-full bg-background/70 dark:bg-input/50"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor={`priority-${task._id}`} className="block mb-1.5 text-sm font-medium">
                Priority
              </Label>
              <Select
                name="priority"
                value={editForm.priority}
                onValueChange={handlePriorityChange}
              >
                <SelectTrigger id={`priority-${task._id}`} className="w-full bg-background/70 dark:bg-input/50">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <div className="flex-1">
               <Label htmlFor={`project-${task._id}`} className="block mb-1.5 text-sm font-medium">
                 Project
               </Label>
               <Select
                  name="project"
                  value={editForm.project}
                  onValueChange={handleProjectChange}
               >
                   <SelectTrigger id={`project-${task._id}`} className="w-full bg-background/70 dark:bg-input/50">
                       <SelectValue placeholder="Select Project" />
                   </SelectTrigger>
                   <SelectContent>
                       {availableProjects.map((p) => (
                           <SelectItem key={p} value={p}>{p}</SelectItem>
                       ))}
                   </SelectContent>
               </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor={`labels-${task._id}`} className="block mb-1.5 text-sm font-medium">
                Labels <span className="text-xs text-muted-foreground">(comma-separated)</span>
              </Label>
              <Input
                id={`labels-${task._id}`}
                type="text"
                name="labels"
                value={editForm.labels}
                onChange={handleChange}
                placeholder="urgent, client-a, ..."
                className="w-full bg-background/70 dark:bg-input/50"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
              <AlertCircle size={16} /> Error: {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="bg-background/80 hover:bg-muted"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                  <span className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Saving...</span>
              ) : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TaskEditForm;
