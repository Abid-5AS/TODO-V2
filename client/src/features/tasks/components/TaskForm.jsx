// src/features/tasks/components/TaskForm.jsx
// Provides the form for creating new tasks, including AI suggestions.

import React, { useState, useEffect } from "react";
import { useTasks } from "../hooks/useTasks"; // Import useTasks hook
import {
  getAISubtaskSuggestions,
  getAIDescriptionSuggestion,
} from "../services/aiService"; // Corrected path
import { Button } from "../../../components/ui/button"; // Corrected path
import { Input } from "../../../components/ui/input"; // Corrected path
import { Label } from "../../../components/ui/label"; // Corrected path
import { Textarea } from "../../../components/ui/textarea"; // Corrected path
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"; // Corrected path
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover"; // Corrected path
import { Calendar } from "../../../components/ui/calendar"; // Corrected path
import { format, isValid } from "date-fns";
import {
  CalendarIcon,
  Brain,
  Sparkles,
  X,
  PlusCircle,
  Check,
  ListPlus,
  Loader2,
} from "lucide-react";
import { cn } from "../../../lib/utils"; // Corrected path
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog"; // Corrected path
import { Badge } from "../../../components/ui/badge"; // Corrected path
import { Switch } from "../../../components/ui/switch"; // Corrected path
import { useToast } from "../../../hooks/use-toast"; // Corrected path
import { motion } from "framer-motion";

const defaultForm = {
  title: "",
  description: "",
  dueDate: "",
  priority: "Medium",
  labels: "",
  project: "Inbox",
};

const TaskForm = ({
  onTaskCreated,
  availableProjects = [],
  initialProject,
}) => {
  // Use the useTasks hook to get the addTask function for optimistic updates
  const { addTask } = useTasks(initialProject, availableProjects);
  const { toast } = useToast();
  const [form, setForm] = useState({
    ...defaultForm,
    project: availableProjects.includes(initialProject)
      ? initialProject
      : "Inbox",
  });
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiSubtasksLoading, setAiSubtasksLoading] = useState(false);
  const [aiDescriptionLoading, setAiDescriptionLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiDescription, setAiDescription] = useState("");
  const [error, setError] = useState(null);
  const [useDueDate, setUseDueDate] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [newLabel, setNewLabel] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Update project in form if initialProject changes or availableProjects loads
  useEffect(() => {
    setForm((f) => ({
      ...f,
      project: availableProjects.includes(initialProject)
        ? initialProject
        : "Inbox",
    }));
  }, [initialProject, availableProjects]);

  // Handle form field changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  // Handle date change
  const handleDateChange = (date) => {
    if (date && isValid(date)) {
      const formattedDate = format(date, "yyyy-MM-dd");
      setForm({ ...form, dueDate: formattedDate });
      setUseDueDate(true);
      setCalendarOpen(false); // Close popover after selection
    } else {
      setForm({ ...form, dueDate: "" });
      setUseDueDate(false);
    }
  };

  // Handle adding labels
  const handleAddLabel = () => {
    const trimmedLabel = newLabel.trim();
    if (trimmedLabel && !selectedLabels.includes(trimmedLabel)) {
      setSelectedLabels([...selectedLabels, trimmedLabel]);
      setNewLabel("");
    }
  };

  const handleRemoveLabel = (labelToRemove) => {
    setSelectedLabels(selectedLabels.filter((l) => l !== labelToRemove));
  };

  // Update form.labels when selectedLabels changes
  useEffect(() => {
    setForm((prev) => ({ ...prev, labels: selectedLabels.join(",") }));
  }, [selectedLabels]);

  // Subtask management
  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([
        ...subtasks,
        { title: newSubtask.trim(), status: "pending" },
      ]);
      setNewSubtask("");
    }
  };
  const handleRemoveSubtask = (idx) => {
    setSubtasks(subtasks.filter((_, i) => i !== idx));
  };
  const handleEditSubtask = (idx, value) => {
    setSubtasks(
      subtasks.map((st, i) => (i === idx ? { ...st, title: value } : st))
    );
  };

  // Add AI-suggested subtasks
  const handleAddAISubtasks = () => {
    const newAISubtasks = aiSuggestions.map((title) => ({
      title,
      status: "pending",
    }));
    // Avoid adding duplicates
    const currentTitles = new Set(subtasks.map((st) => st.title));
    const uniqueNewSubtasks = newAISubtasks.filter(
      (nst) => !currentTitles.has(nst.title)
    );
    setSubtasks([...subtasks, ...uniqueNewSubtasks]);
    setAiSuggestions([]); // Clear suggestions after adding
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast({ title: "Task title is required", variant: "destructive" });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const taskData = {
        ...form,
        labels: selectedLabels, // Send array directly
        subtasks,
        dueDate: form.dueDate || null, // Ensure null if empty
        project: form.project || "Inbox", // Ensure default
      };

      // Use the addTask function from useTasks for optimistic updates
      await addTask(taskData);

      toast({ title: "Task Created Successfully" });
      // Reset form state
      setForm({ ...defaultForm, project: initialProject || "Inbox" });
      setSubtasks([]);
      setAiSuggestions([]);
      setAiDescription("");
      setSelectedLabels([]);
      setUseDueDate(false);
      if (onTaskCreated) onTaskCreated(); // Close dialog/sheet
    } catch (err) {
      console.error("Create task error:", err);
      const message =
        err.response?.data?.message || err.message || "Failed to create task";
      setError(message);
      toast({
        title: "Error Creating Task",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // AI suggestions
  const handleAISuggest = async () => {
    if (!form.title.trim()) return;
    setAiSubtasksLoading(true);
    setAiSuggestions([]);
    try {
      const data = await getAISubtaskSuggestions(form.title);
      const suggestions = (data.suggestion || "")
        .split(/\n|\r/)
        .map((s) => s.replace(/^[-•*\d.\s]+/, "").trim())
        .filter(Boolean)
        .slice(0, 5);
      setAiSuggestions(suggestions);
      if (!suggestions.length)
        toast({
          title: "AI couldn't suggest subtasks",
          description: "Try refining the task title.",
          variant: "default",
        });
    } catch (err) {
      console.error("AI Subtask suggestion error:", err);
      toast({
        title: "AI Suggestion Failed",
        description: err.message,
        variant: "destructive",
      });
      setAiSuggestions([]);
    } finally {
      setAiSubtasksLoading(false);
    }
  };

  const handleAIDescription = async () => {
    if (!form.title.trim()) return;
    setAiDescriptionLoading(true);
    setAiDescription("");
    try {
      const data = await getAIDescriptionSuggestion(form.title);
      setAiDescription(data.description || "");
      if (!data.description)
        toast({
          title: "AI couldn't generate description",
          description: "Try refining the task title.",
          variant: "default",
        });
    } catch (err) {
      console.error("AI Description suggestion error:", err);
      toast({
        title: "AI Description Failed",
        description: err.message,
        variant: "destructive",
      });
      setAiDescription("");
    } finally {
      setAiDescriptionLoading(false);
    }
  };

  // Add AI description to form
  const handleAddAIDescription = () => {
    setForm({ ...form, description: aiDescription });
    setAiDescription("");
  };

  return (
    <div className="p-5 md:p-6 max-h-[85vh] overflow-y-auto">
      <DialogHeader className="pb-4 border-b mb-5">
        <DialogTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Add New Task
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <Label htmlFor="title" className="font-medium text-sm mb-1 block">
            Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="mt-1 bg-background/70 dark:bg-input/50"
            placeholder="e.g., Plan project kickoff meeting"
          />
        </div>

        {/* AI Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={handleAIDescription}
            disabled={
              aiDescriptionLoading || aiSubtasksLoading || !form.title.trim()
            }
            size="sm"
            variant="outline"
            className="bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300 hover:bg-green-500/20"
          >
            {aiDescriptionLoading ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-1 h-4 w-4" />
            )}
            AI Description
          </Button>
          <Button
            type="button"
            onClick={handleAISuggest}
            disabled={
              aiSubtasksLoading || aiDescriptionLoading || !form.title.trim()
            }
            size="sm"
            variant="outline"
            className="bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20"
          >
            {aiSubtasksLoading ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Brain className="mr-1 h-4 w-4" />
            )}
            AI Subtasks
          </Button>
        </div>

        {/* AI Description Suggestion Area */}
        {aiDescription && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 space-y-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800"
          >
            <p className="text-sm text-green-800 dark:text-green-200">
              {aiDescription}
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setAiDescription("")}
                className="text-muted-foreground hover:text-foreground"
              >
                Discard
              </Button>
              <Button
                type="button"
                onClick={handleAddAIDescription}
                size="sm"
                variant="outline"
                className="bg-green-500/10 border-green-500/30 text-green-700 hover:bg-green-500/20"
              >
                <Check className="mr-1 h-4 w-4" /> Use This
              </Button>
            </div>
          </motion.div>
        )}

        {/* Description Input */}
        <div>
          <Label
            htmlFor="description"
            className="font-medium text-sm mb-1 block"
          >
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="mt-1 resize-none bg-background/70 dark:bg-input/50"
            placeholder="Add details, notes, or links..."
          />
        </div>

        {/* Date & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Due Date */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="dueDate" className="font-medium text-sm">
                Due Date
              </Label>
              <div className="flex items-center space-x-2">
                <Label
                  htmlFor="use-due-date"
                  className="text-xs text-muted-foreground"
                >
                  {useDueDate ? "Enabled" : "Disabled"}
                </Label>
                <Switch
                  id="use-due-date"
                  checked={useDueDate}
                  onCheckedChange={(checked) => {
                    setUseDueDate(checked);
                    if (!checked) setForm({ ...form, dueDate: "" });
                    // If enabling, maybe open the calendar?
                    // if (checked) setCalendarOpen(true);
                  }}
                  className="data-[state=checked]:bg-primary"
                  size="sm"
                />
              </div>
            </div>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-9",
                    "bg-background/70 dark:bg-input/50",
                    !useDueDate &&
                      "text-muted-foreground opacity-50 cursor-not-allowed",
                    form.dueDate && useDueDate && "text-foreground"
                  )}
                  disabled={!useDueDate}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.dueDate && useDueDate ? (
                    format(new Date(form.dueDate), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    form.dueDate && isValid(new Date(form.dueDate))
                      ? new Date(form.dueDate)
                      : undefined
                  }
                  onSelect={handleDateChange}
                  initialFocus
                  disabled={!useDueDate}
                />
              </PopoverContent>
            </Popover>
          </div>
          {/* Priority Select */}
          <div className="space-y-1.5">
            <Label htmlFor="priority" className="font-medium text-sm">
              Priority
            </Label>
            <Select
              value={form.priority}
              onValueChange={(value) => handleSelectChange("priority", value)}
            >
              <SelectTrigger className="w-full bg-background/70 dark:bg-input/50 h-9">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Project Select */}
        <div className="space-y-1.5">
          <Label htmlFor="project" className="font-medium text-sm">
            Project
          </Label>
          <Select
            value={form.project}
            onValueChange={(value) => handleSelectChange("project", value)}
          >
            <SelectTrigger className="w-full bg-background/70 dark:bg-input/50 h-9">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Projects</SelectLabel>
                {availableProjects.map((project) => (
                  <SelectItem key={project} value={project}>
                    {project}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Labels Input */}
        <div className="space-y-1.5">
          <Label className="font-medium text-sm">Labels</Label>
          <div className="flex flex-wrap gap-1.5 mb-2 min-h-[20px]">
            {selectedLabels.map((label) => (
              <Badge
                key={label}
                variant="secondary"
                className="px-2 py-0.5 text-xs bg-muted hover:bg-muted/80"
              >
                {label}
                <button
                  type="button"
                  onClick={() => handleRemoveLabel(label)}
                  className="ml-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-background/50 p-px"
                  aria-label={`Remove label ${label}`}
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex space-x-2">
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Add a label..."
              className="bg-background/70 dark:bg-input/50 h-9"
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleAddLabel())
              }
            />
            <Button
              type="button"
              onClick={handleAddLabel}
              disabled={!newLabel.trim()}
              variant="outline"
              size="sm"
              className="flex-shrink-0 bg-background/70 hover:bg-muted"
            >
              Add Label
            </Button>
          </div>
        </div>

        {/* Subtasks Section */}
        <div className="space-y-1.5">
          <Label htmlFor="subtasks" className="font-medium text-sm">
            Subtasks
          </Label>
          {/* AI Suggestion Area for Subtasks */}
          {aiSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 space-y-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800"
            >
              <ul className="pl-4 list-disc text-sm space-y-1 text-blue-800 dark:text-blue-200">
                {aiSuggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setAiSuggestions([])}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Discard All
                </Button>
                <Button
                  type="button"
                  onClick={handleAddAISubtasks}
                  size="sm"
                  variant="outline"
                  className="bg-blue-500/10 border-blue-500/30 text-blue-700 hover:bg-blue-500/20"
                >
                  <ListPlus className="mr-1 h-4 w-4" /> Add These
                </Button>
              </div>
            </motion.div>
          )}
          {/* Subtask List */}
          {subtasks.length > 0 && (
            <ul className="space-y-1.5 mt-2">
              {subtasks.map((st, idx) => (
                <li
                  key={`sub-${idx}`}
                  className="flex items-center space-x-2 p-1 bg-muted/40 dark:bg-zinc-800/40 rounded-md"
                >
                  <span className="text-xs pl-1 text-muted-foreground">•</span>
                  <Input
                    value={st.title}
                    onChange={(e) => handleEditSubtask(idx, e.target.value)}
                    className="text-sm bg-transparent border-0 focus:ring-0 flex-1 h-7 py-0"
                    placeholder={`Subtask ${idx + 1}`}
                  />
                  <Button
                    type="button"
                    onClick={() => handleRemoveSubtask(idx)}
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 flex-shrink-0"
                    aria-label={`Remove subtask ${idx + 1}`}
                  >
                    <X size={14} />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {/* Add Subtask Input */}
          <div className="flex space-x-2 pt-1">
            <Input
              id="subtasks"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              placeholder="Add a subtask item..."
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleAddSubtask())
              }
              className="bg-background/70 dark:bg-input/50 h-9"
            />
            <Button
              type="button"
              onClick={handleAddSubtask}
              disabled={!newSubtask.trim()}
              variant="outline"
              size="sm"
              className="flex-shrink-0 bg-background/70 hover:bg-muted"
            >
              <PlusCircle size={16} className="mr-1" /> Add
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {/* Footer Buttons */}
        <DialogFooter className="pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Task
              </span>
            )}
          </Button>
        </DialogFooter>
      </form>
    </div>
  );
};

export default TaskForm;
