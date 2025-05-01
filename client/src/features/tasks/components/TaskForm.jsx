// src/features/tasks/components/TaskForm.jsx
// Provides the form for creating new tasks, including AI suggestions.

import React, { useState, useEffect, useRef } from "react";
import { useTasks } from "../hooks/useTasks"; // Import useTasks hook
import {
  getAISubtaskSuggestions,
  getAIDescriptionSuggestion,
  suggestTaskFromImage,
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
  ImageIcon,
  FileText,
  ClipboardList,
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

const TASK_TITLE_LIMIT = 250;
const SUBTASK_TITLE_LIMIT = 250;
const DESCRIPTION_LIMIT = 1000;

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
  const [aiSubtaskSuggestions, setAiSubtaskSuggestions] = useState([]);
  const [aiDescriptionSuggestion, setAiDescriptionSuggestion] = useState("");
  const [error, setError] = useState(null);
  const [useDueDate, setUseDueDate] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [newLabel, setNewLabel] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  // New state for image handling
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [aiImageSuggestions, setAiImageSuggestions] = useState([]);
  const [aiImageLoading, setAiImageLoading] = useState(false);
  const [aiImageError, setAiImageError] = useState(null);
  const imageInputRef = useRef(null); // Ref for hidden file input

  // New state for AI Subtask Suggestions
  const [showAllSubtaskSuggestions, setShowAllSubtaskSuggestions] = useState(false);

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

  // Handle image selection
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setAiImageError(null); // Clear previous errors
      setAiImageSuggestions([]); // Clear previous suggestions
      // Create image preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setImagePreviewUrl(null);
    }
  };

  // Trigger hidden file input
  const handleImageUploadClick = () => {
    imageInputRef.current?.click();
  };

  // Remove selected image
  const handleRemoveImage = () => {
      setSelectedImage(null);
      setImagePreviewUrl(null);
      setAiImageSuggestions([]);
      setAiImageError(null);
       if (imageInputRef.current) {
            imageInputRef.current.value = ""; // Reset file input
        }
  }

  // AI Image Suggestions
  const handleAIImageSuggest = async () => {
    if (!selectedImage) {
      toast({
        title: "No Image Selected",
        description: "Please select an image first to get suggestions.",
        variant: "destructive",
      });
      return;
    }
    setAiImageLoading(true);
    setAiImageSuggestions([]);
    setAiImageError(null);
    try {
      const data = await suggestTaskFromImage(selectedImage);
      const suggestions = (data.suggestions || "")
        .split(/\n|\r/)
        .map((s) => s.replace(/^[-•*\d.\s]+/, "").trim()) // Basic cleaning
        .filter(Boolean)
        .slice(0, 5); // Limit suggestions

      setAiImageSuggestions(suggestions);

      if (!suggestions.length) {
        toast({
          title: "No tasks found in image",
          description: data.suggestions || "The AI could not identify specific tasks.",
          variant: "default",
        });
      } else {
         toast({ title: "AI suggested tasks based on image" });
      }
    } catch (err) {
      console.error("AI Image Suggestion error:", err);
      const errorMsg = err.message || "Failed to get suggestions from image.";
      setAiImageError(errorMsg);
      toast({
        title: "AI Image Suggestion Failed",
        description: errorMsg,
        variant: "destructive",
      });
      setAiImageSuggestions([]);
    } finally {
      setAiImageLoading(false);
    }
  };

  // Function to apply an AI suggestion to the title
  const applyImageSuggestionToTitle = (suggestion) => {
    setForm((prev) => ({ ...prev, title: suggestion }));
    setAiImageSuggestions([]); // Clear suggestions after applying one
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
    const newSubtasksFromAI = aiSubtaskSuggestions.map((title) => ({
      title,
      status: "pending",
    }));
    setSubtasks([...subtasks, ...newSubtasksFromAI]);
    setAiSubtaskSuggestions([]); // Clear suggestions after adding
  };

  // Add individual AI-suggested subtask
  const handleAddIndividualAISubtask = (suggestion) => {
    if (suggestion.length > SUBTASK_TITLE_LIMIT) {
      toast({
        title: "Subtask Too Long",
        description: `AI suggestion is ${suggestion.length} characters, exceeding the ${SUBTASK_TITLE_LIMIT} character limit. Please shorten it manually.`, 
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    if (suggestion.trim()) {
      setSubtasks([
        ...subtasks,
        { title: suggestion.trim(), status: "pending" },
      ]);
      // Optionally remove the added suggestion from the list
      setAiSubtaskSuggestions(aiSubtaskSuggestions.filter(s => s !== suggestion)); 
    }
  };

  // Discard all AI subtask suggestions
  const handleDiscardAISubtasks = () => {
    setAiSubtaskSuggestions([]);
  };

  // AI Subtask Suggestions
  const handleAISubtaskSuggest = async () => {
    if (!form.title) {
      toast({
        title: "Task Title Required",
        description: "Please enter a task title first to generate subtasks.",
        variant: "destructive",
      });
      return;
    }
    setAiSubtasksLoading(true);
    setAiSubtaskSuggestions([]); // Clear previous suggestions if any
    setError(null);
    try {
      const data = await getAISubtaskSuggestions(form.title);
      const suggestions = (data.suggestion || "")
        .split(/\n|\r/)
        .map((s) => s.replace(/^[-•*\d.\s]+/, "").trim())
        .filter(Boolean)
        .slice(0, 5); // Limit suggestions
      
      setAiSubtaskSuggestions(suggestions);
      
      if (!suggestions.length) {
        toast({
          title: "No subtasks suggested",
          description: data.suggestion || "The AI could not identify specific subtasks.",
          variant: "default",
        });
      } else {
         toast({ title: "AI suggested subtasks" });
      }
    } catch (err) {
      console.error("AI Subtask Suggestion error:", err);
      const errorMsg = err.message || "Failed to get subtask suggestions.";
      setError(errorMsg);
      toast({
        title: "AI Subtask Suggestion Failed",
        description: errorMsg,
        variant: "destructive",
      });
      setAiSubtaskSuggestions([]); // Clear on error
    } finally {
      setAiSubtasksLoading(false);
    }
  };

  // Add AI description to the form
  const handleAddAIDescription = () => {
    if (aiDescriptionSuggestion) {
        if (aiDescriptionSuggestion.length > DESCRIPTION_LIMIT) {
             toast({
                title: "Description Too Long",
                description: `AI suggestion is ${aiDescriptionSuggestion.length} characters, exceeding the ${DESCRIPTION_LIMIT} character limit. Please shorten it manually.`, 
                variant: "destructive",
                duration: 5000,
             });
             return;
        }
      setForm({ ...form, description: aiDescriptionSuggestion });
      setAiDescriptionSuggestion(""); // Clear suggestion after adding
    }
  };
  
  // Discard AI description suggestion
  const handleDiscardAIDescription = () => {
      setAiDescriptionSuggestion("");
  };

  // AI Description Suggestion
  const handleAIDescription = async () => {
    if (!form.title) {
      toast({
        title: "Task Title Required",
        description: "Please enter a task title first to generate a description.",
        variant: "destructive",
      });
      return;
    }
    setAiDescriptionLoading(true);
    setAiDescriptionSuggestion("");
    setError(null);
    try {
      const data = await getAIDescriptionSuggestion(form.title);
      setAiDescriptionSuggestion(data.description || "");
       if (data.description) {
         toast({ title: "AI suggested a description" });
       } else {
         toast({ title: "AI couldn't suggest a description", variant: "default" });
       }
    } catch (err) {
      console.error("AI Description Suggestion error:", err);
      const errorMsg = err.message || "Failed to get description suggestion.";
      setError(errorMsg);
      toast({
        title: "AI Description Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setAiDescriptionLoading(false);
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) {
      toast({ title: "Task title is required", variant: "destructive" });
      return;
    }

    setLoading(true);
    setError(null);

    const taskData = {
      ...form,
      dueDate: useDueDate ? form.dueDate : null, // Only send date if toggle is on
      subtasks,
      // image handling needs server implementation
    };

    try {
      await addTask(taskData); // Use addTask from the hook
      toast({ title: "Task Created Successfully!" });
      // Reset form state after successful creation
      setForm({
        ...defaultForm,
        project: availableProjects.includes(initialProject)
          ? initialProject
          : "Inbox",
      });
      setSubtasks([]);
      setSelectedLabels([]);
      setNewSubtask("");
      setNewLabel("");
      setUseDueDate(false);
      setSelectedImage(null);
      setImagePreviewUrl(null);
      setAiImageSuggestions([]);
      setAiImageError(null);
      if (imageInputRef.current) {
          imageInputRef.current.value = ""; // Reset file input
      }
      // Optionally call a callback to close the modal/form
      if (onTaskCreated) {
        onTaskCreated();
      }
    } catch (err) {
      console.error("Error creating task:", err);
      const errMsg = err.response?.data?.message || err.message || "Failed to create task";
      setError(errMsg);
      toast({ title: "Error Creating Task", description: errMsg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <DialogHeader>
        <DialogTitle>Add New Task</DialogTitle>
      </DialogHeader>
      {/* Adjust padding and spacing for mobile */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Title and AI Buttons */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-right">
            Task Title *
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="What needs to be done?"
              required
              maxLength={TASK_TITLE_LIMIT}
              className="flex-grow"
            />
            {/* Generate Subtasks Button - Restored */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleAISubtaskSuggest}
              disabled={aiSubtasksLoading || !form.title}
              title="Generate Subtasks with AI"
            >
              {aiSubtasksLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ClipboardList className="h-4 w-4" />
              )}
            </Button>
             {/* Generate Description Button - Restored/Moved */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleAIDescription}
              disabled={aiDescriptionLoading || !form.title}
              title="Generate Description with AI"
            >
              {aiDescriptionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* AI Subtask Suggestions - Updated with Show More/Less and Scroll */}
        {aiSubtaskSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-4 border rounded-md bg-muted/40 space-y-3 relative"
          >
            <div className="flex justify-between items-center mb-2">
                <Label className="font-medium">AI Suggested Subtasks:</Label>
                <Button 
                    type="button" 
                    variant="ghost"
                    size="icon"
                    onClick={handleDiscardAISubtasks}
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    title="Discard all suggestions"
                 >
                    <X className="h-4 w-4" />
                </Button>
            </div>
            {/* Scrollable container with reduced max height */}
            <div className="max-h-28 overflow-y-auto pr-2"> {/* Reduced max-h to 28 (7rem) */} 
                <ul className="space-y-2"> 
                  {(showAllSubtaskSuggestions
                      ? aiSubtaskSuggestions 
                      : aiSubtaskSuggestions.slice(0, 3) // Show first 3 initially
                  ).map((suggestion, idx) => (
                    <li key={idx} className="flex items-center justify-between gap-2 text-sm">
                        <span className="flex-grow truncate" title={suggestion}>{suggestion}</span>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleAddIndividualAISubtask(suggestion)}
                            className="h-6 w-6 flex-shrink-0"
                            title={`Add subtask: ${suggestion}`}
                        >
                            <PlusCircle className="h-4 w-4" />
                        </Button>
                    </li>
                  ))}
                </ul>
            </div>
            {/* Show More/Less Button */}
            {aiSubtaskSuggestions.length > 3 && (
                <Button 
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => setShowAllSubtaskSuggestions(!showAllSubtaskSuggestions)}
                    className="p-0 h-auto text-xs"
                >
                    {showAllSubtaskSuggestions ? "Show Less" : `Show ${aiSubtaskSuggestions.length - 3} More...`}
                </Button>
            )}
          </motion.div>
        )}
        
        {/* Image Upload Section */}
        <div className="space-y-3">
          <Label>Image Attachment (Optional)</Label>
          <div className="flex items-center space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleImageUploadClick}
              disabled={aiImageLoading}
            >
              <ImageIcon className="mr-2 h-4 w-4" /> 
              {selectedImage ? "Change Image" : "Upload Image"}
            </Button>
            {selectedImage && (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={handleRemoveImage}
                title="Remove Image"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
             {/* AI Suggestion from Image Button */}
             {selectedImage && (
               <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAIImageSuggest}
                  disabled={aiImageLoading}
                  title="Suggest Task from Image"
                >
                  {aiImageLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-purple-500" />
                  )}
                </Button>
             )}
          </div>
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
          {imagePreviewUrl && (
            <div className="mt-2 border rounded-md p-2 max-w-[200px]">
              <img src={imagePreviewUrl} alt="Preview" className="rounded-md object-cover"/>
            </div>
          )}
          {/* Display AI image suggestions */} 
          {aiImageSuggestions.length > 0 && (
             <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 border rounded-md bg-muted/40 space-y-2"
             >
                <Label>AI Suggested Task Titles (from Image):</Label>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {aiImageSuggestions.map((sug, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                        <span>{sug}</span>
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => applyImageSuggestionToTitle(sug)}
                            title="Use this title"
                        >
                            <Check className="h-4 w-4 text-green-600"/>
                        </Button>
                    </li>
                  ))}
                </ul>
             </motion.div>
          )}
          {aiImageError && <p className="text-sm text-red-500">{aiImageError}</p>}
        </div>

        {/* Description and AI Button */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <div className="relative">
             <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Add more details..."
                maxLength={DESCRIPTION_LIMIT}
                className="pr-10"
             />
          </div>
        </div>

        {/* AI Description Suggestion */}
        {aiDescriptionSuggestion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-4 border rounded-md bg-muted/40 space-y-2"
          >
            <Label className="font-medium">AI Suggested Description:</Label>
            <p className="text-sm italic">{aiDescriptionSuggestion}</p>
            <div className="flex justify-end gap-2 mt-2">
              <Button
                  type="button"
                  variant="ghost" 
                  size="sm"
                  onClick={handleDiscardAIDescription}
                  title="Discard suggestion"
              >
                  Discard
              </Button>
              <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddAIDescription}
                  title="Use this description"
              >
                  <Check className="mr-2 h-4 w-4" /> Use Suggestion
              </Button>
            </div>
          </motion.div>
        )}

        {/* Due Date & Priority - Adjust grid for better spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-start">
          {/* Due Date Column */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <div className="flex items-center space-x-2">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "flex-grow justify-start text-left font-normal", // Use flex-grow
                      !form.dueDate && "text-muted-foreground"
                    )}
                    disabled={!useDueDate}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.dueDate ? format(new Date(form.dueDate), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.dueDate ? new Date(form.dueDate) : undefined}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Switch
                checked={useDueDate}
                onCheckedChange={setUseDueDate}
                aria-label="Toggle Due Date"
              />
            </div>
          </div>
          {/* Priority Column */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              name="priority"
              value={form.priority}
              onValueChange={(value) => handleSelectChange("priority", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Project & Labels - Increased spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-start">
           {/* Project Column */}
           <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select
                name="project"
                value={form.project}
                onValueChange={(value) => handleSelectChange("project", value)}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Projects</SelectLabel>
                    {/* Ensure Inbox is always an option */}
                    {availableProjects.includes("Inbox") || (
                       <SelectItem value="Inbox">Inbox</SelectItem>
                    )}
                    {availableProjects
                        .filter(p => p !== "Inbox") // Exclude Inbox if already added
                        .map((proj) => (
                           <SelectItem key={proj} value={proj}>{proj}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
           </div>
           {/* Labels Column */}
           <div className="space-y-2">
            <Label htmlFor="labels">Labels</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="newLabel"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Add a label..."
                className="flex-grow" // Allow input to grow
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLabel();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddLabel} className="flex-shrink-0">Add Label</Button> {/* Prevent button shrink */}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedLabels.map((label) => (
                <Badge key={label} variant="secondary" className="flex items-center">
                  {label}
                  <button
                    type="button"
                    className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={() => handleRemoveLabel(label)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Subtasks Section - Increased spacing */}
        <div className="space-y-4">
          <Label>Subtasks</Label>
          {subtasks.map((sub, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <Input
                value={sub.title}
                onChange={(e) => handleEditSubtask(idx, e.target.value)}
                placeholder="Subtask description"
                maxLength={SUBTASK_TITLE_LIMIT}
                className="flex-grow"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveSubtask(idx)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <Input
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              placeholder="Add new subtask..."
              maxLength={SUBTASK_TITLE_LIMIT}
              className="flex-grow"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault(); 
                  handleAddSubtask();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={handleAddSubtask}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Subtask
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">Error: {error}</p>}

        <DialogFooter>
          <Button type="submit" disabled={loading || !form.title}>
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
            ) : (
              "Add Task"
            )}
          </Button>
        </DialogFooter>
      </form>
    </motion.div>
  );
};

export default TaskForm;
