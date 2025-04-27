// src/features/tasks/hooks/useTasks.js
// Custom hook to manage task fetching, filtering, sorting, and updates.

import { useState, useEffect, useCallback, useMemo, useTransition } from 'react';
import { 
    fetchTasks, 
    createTask, 
    updateTask as apiUpdateTask, 
    deleteTask as apiDeleteTask, 
    addSubtask as apiAddSubtask, 
    updateSubtask as apiUpdateSubtask, 
    deleteSubtask as apiDeleteSubtask
} from '../services/taskService';
import { useDebounce } from '../../../hooks/useDebounce'; // Assuming useDebounce hook exists
import { isToday, isUpcoming } from '../utils/taskUtils'; // Import utils
import { toast } from 'sonner';

const SORT_OPTIONS = [
  { value: 'default', label: 'Default Order' },
  { value: 'dueDateAsc', label: 'Due Date (Asc)' },
  { value: 'dueDateDesc', label: 'Due Date (Desc)' },
  { value: 'priority', label: 'Priority (High-Low)' },
  { value: 'title', label: 'Title (A-Z)' },
  { value: 'createdAtDesc', label: 'Created Date (Newest)' },
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'todo', label: 'To Do' },
  { value: 'doing', label: 'Doing' },
  { value: 'completed', label: 'Completed' },
];

export const useTasks = (initialProject, allProjects = []) => {
  const [tasks, setTasks] = useState([]);
  const [projectContext, setProjectContext] = useState(initialProject);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');
  const [filter, setFilter] = useState('all'); 
  const [isPending, startTransition] = useTransition(); // For non-urgent updates

  const debouncedSearch = useDebounce(search, 300);

  // --- Data Fetching --- 
  const loadTasks = useCallback(async (currentProject) => {
    console.log(`[useTasks] Loading tasks for project: ${currentProject}`);
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTasks({ project: currentProject });
      if (data.success) {
        // Ensure subtasks is always an array
        const tasksWithValidatedSubtasks = data.data.map(task => ({
          ...task,
          subtasks: Array.isArray(task.subtasks) ? task.subtasks : []
        }));
        setTasks(tasksWithValidatedSubtasks);
      } else {
        throw new Error(data.message || 'Failed to fetch tasks');
      }
    } catch (err) {
      console.error(`[useTasks] Error loading tasks for ${currentProject}:`, err);
      setError(err.message || 'Could not load tasks.');
      setTasks([]); // Clear tasks on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load and reload when project context changes
  useEffect(() => {
    loadTasks(projectContext);
  }, [projectContext, loadTasks]);

  // Function to update the project context (called from TaskList)
  const updateProjectContext = useCallback((newProject) => {
    setProjectContext(newProject);
  }, []);

  // --- Filtering and Sorting --- 
  const filteredAndSortedTasks = useMemo(() => {
    let result = tasks;

    // Filter by project/view (already handled by fetch, but apply specific filters like 'today')
    if (projectContext === 'today') {
      result = result.filter(task => isToday(task.dueDate));
    } else if (projectContext === 'upcoming') {
      result = result.filter(task => isUpcoming(task.dueDate));
    } else if (projectContext === 'completed') {
        result = result.filter(task => task.status === 'completed');
    } else if (projectContext !== 'all' && projectContext !== 'Inbox' && !allProjects.includes(projectContext)) {
       // If it's a specific project filter, ensure tasks belong to it
       // (This might be redundant if fetchTasks already filters by project)
       // result = result.filter(task => task.project === projectContext);
    } else if (projectContext === 'Inbox') {
        result = result.filter(task => !task.project || task.project === 'Inbox');
    }

    // Filter by status (todo, doing, completed)
    if (filter !== 'all') {
      result = result.filter(task => task.status === filter);
    }

    // Filter by search term (debounced)
    if (debouncedSearch) {
      const searchTerm = debouncedSearch.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        (task.description && task.description.toLowerCase().includes(searchTerm)) ||
        (task.labels && task.labels.some(label => label.toLowerCase().includes(searchTerm))) ||
        (task.subtasks && task.subtasks.some(sub => sub.title.toLowerCase().includes(searchTerm)))
      );
    }

    // Sort
    switch (sort) {
      case 'dueDateAsc':
        result.sort((a, b) => (a.dueDate && b.dueDate ? new Date(a.dueDate) - new Date(b.dueDate) : a.dueDate ? -1 : b.dueDate ? 1 : 0));
        break;
      case 'dueDateDesc':
        result.sort((a, b) => (a.dueDate && b.dueDate ? new Date(b.dueDate) - new Date(a.dueDate) : a.dueDate ? -1 : b.dueDate ? 1 : 0));
        break;
      case 'priority':
        const priorityMap = { High: 3, Medium: 2, Low: 1 };
        result.sort((a, b) => (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0));
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'createdAtDesc':
         result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
         break;
      case 'default':
      default:
        // Keep original order (usually from backend, often createdAt or manual order)
        break;
    }

    return result;
  }, [tasks, projectContext, filter, debouncedSearch, sort, allProjects]);

  // --- Task CUD Operations (Optimistic Updates) --- 

  // Update Task
  const updateTask = useCallback(async (taskId, updates) => {
    const originalTasks = [...tasks];
    // Optimistic update
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task._id === taskId ? { ...task, ...updates, subtasks: task.subtasks || [] } : task
      )
    );
    try {
      const result = await apiUpdateTask(taskId, updates);
      if (!result.success) throw new Error(result.message || 'Failed to update task');
      // Optionally update task with response data if needed (e.g., updated timestamps)
      // setTasks(prevTasks => prevTasks.map(t => t._id === taskId ? {...result.data, subtasks: result.data.subtasks || [] } : t));
    } catch (err) {
      console.error("Update Task Error:", err);
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
      // Revert optimistic update on failure
      setTasks(originalTasks);
      throw err; // Re-throw to allow TaskItem to handle UI state
    }
  }, [tasks]);

  // Delete Task
  const deleteTask = useCallback(async (taskId) => {
    const originalTasks = [...tasks];
    // Optimistic delete
    setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
    try {
      const result = await apiDeleteTask(taskId);
      if (!result.success) throw new Error(result.message || 'Failed to delete task');
      // No need to update state further, removal is done
    } catch (err) {
      console.error("Delete Task Error:", err);
      toast({ title: "Delete Failed", description: err.message, variant: "destructive" });
      // Revert optimistic update on failure
      setTasks(originalTasks);
       throw err; // Re-throw for TaskItem
    }
  }, [tasks]);

  // --- Subtask CUD Operations (Optimistic Updates) --- 

  // Add Subtask
  const addSubtask = useCallback(async (taskId, subtaskData) => {
    const originalTasks = [...tasks];
    // Find the parent task and create a temporary subtask ID for optimistic UI
    const tempSubtaskId = `temp-${Date.now()}`;
    const optimisticSubtask = { ...subtaskData, _id: tempSubtaskId, status: 'pending' };

    setTasks(prevTasks => 
      prevTasks.map(task => 
        task._id === taskId 
          ? { ...task, subtasks: [...(task.subtasks || []), optimisticSubtask] } 
          : task
      )
    );
    try {
      const result = await apiAddSubtask(taskId, subtaskData);
      if (!result.success || !result.data) throw new Error(result.message || 'Failed to add subtask');
      // Replace temporary subtask with actual data from backend
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === taskId
            ? { ...task, subtasks: (task.subtasks || []).map(st => st._id === tempSubtaskId ? result.data : st) }
            : task
        )
      );
    } catch (err) {
      console.error("Add Subtask Error:", err);
      toast({ title: "Failed to Add Subtask", description: err.message, variant: "destructive" });
      setTasks(originalTasks); // Revert
      throw err; // Re-throw for SubtaskList
    }
  }, [tasks]);

  // Update Subtask
  const updateSubtask = useCallback(async (taskId, subtaskId, updates) => {
    const originalTasks = [...tasks];
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task._id === taskId 
          ? { ...task, subtasks: (task.subtasks || []).map(st => st._id === subtaskId ? { ...st, ...updates } : st) }
          : task
      )
    );
    try {
      const result = await apiUpdateSubtask(taskId, subtaskId, updates);
      if (!result.success) throw new Error(result.message || 'Failed to update subtask');
       // Optional: update with response data
       // setTasks(prevTasks => prevTasks.map(task => task._id === taskId ? {...task, subtasks: (task.subtasks || []).map(st => st._id === subtaskId ? result.data : st)} : task));
    } catch (err) {
      console.error("Update Subtask Error:", err);
      toast({ title: "Failed to Update Subtask", description: err.message, variant: "destructive" });
      setTasks(originalTasks); // Revert
      throw err; // Re-throw for SubtaskList
    }
  }, [tasks]);

  // Delete Subtask
  const deleteSubtask = useCallback(async (taskId, subtaskId) => {
    const originalTasks = [...tasks];
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task._id === taskId 
          ? { ...task, subtasks: (task.subtasks || []).filter(st => st._id !== subtaskId) }
          : task
      )
    );
    try {
      const result = await apiDeleteSubtask(taskId, subtaskId);
      if (!result.success) throw new Error(result.message || 'Failed to delete subtask');
      // Removal done
    } catch (err) {
      console.error("Delete Subtask Error:", err);
      toast({ title: "Failed to Delete Subtask", description: err.message, variant: "destructive" });
      setTasks(originalTasks); // Revert
      throw err; // Re-throw for SubtaskList
    }
  }, [tasks]);

  return {
    tasks: filteredAndSortedTasks,
    count: filteredAndSortedTasks.length, // Count based on filtered tasks
    loading,
    error,
    isPending,
    search,
    setSearch: (value) => startTransition(() => setSearch(value)), // Wrap setters in transition
    sort,
    setSort: (value) => startTransition(() => setSort(value)),
    filter,
    setFilter: (value) => startTransition(() => setFilter(value)),
    updateProjectContext,
    updateTask,
    deleteTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    SORT_OPTIONS,
    FILTER_OPTIONS,
  };
};
