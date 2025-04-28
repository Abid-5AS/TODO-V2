// src/features/tasks/hooks/useTaskActions.js
// Custom hook for task and subtask Create, Update, Delete (CUD) operations, including optimistic updates.

import { useCallback } from 'react';
import {
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
  addSubtask as apiAddSubtask,
  updateSubtask as apiUpdateSubtask,
  deleteSubtask as apiDeleteSubtask,
} from '../services/taskService';
import { toast } from 'sonner'; // Assuming sonner is used via a hook or context is not necessary here
import { isToday, isUpcoming, isOverdue } from '../utils/taskUtils';

export const useTaskActions = ({
  tasks, // Current tasks array
  setTasks, // Setter for tasks array
  projectContext, // Current project/view context
  loadTasks, // Function to reload tasks (for reverting or refreshing)
}) => {
  // --- Task CUD Operations (Optimistic Updates) ---

  // Add Task
  const addTask = useCallback(
    async (taskData) => {
      // Generate a temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`;
      const newTask = {
        _id: tempId,
        ...taskData,
        status: taskData.status || 'todo',
        subtasks: taskData.subtasks || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Determine if the task should be added to the current view optimistically
      const shouldAddToCurrentView =
        // If we're in a specific project view and the task belongs to that project
        (projectContext !== 'all' &&
          projectContext !== 'today' &&
          projectContext !== 'upcoming' &&
          projectContext !== 'overdue' &&
          projectContext !== 'completed' &&
          projectContext !== 'Inbox' &&
          taskData.project === projectContext) ||
        // Or if we're in Inbox and the task is for Inbox
        (projectContext === 'Inbox' &&
          (!taskData.project || taskData.project === 'Inbox')) ||
        // Or if we're in Today/Upcoming/Overdue view and the task has a matching due date
        (projectContext === 'today' && isToday(taskData.dueDate)) ||
        (projectContext === 'upcoming' && isUpcoming(taskData.dueDate)) ||
        (projectContext === 'overdue' && isOverdue(taskData.dueDate)) ||
        // Or if we're in All Tasks view
        projectContext === 'all';

      if (shouldAddToCurrentView) {
        // Optimistically add the task to the list
        setTasks((prevTasks) => [newTask, ...prevTasks]);
      }

      try {
        const result = await apiCreateTask(taskData);
        if (!result.success || !result.data)
          throw new Error(result.message || 'Failed to create task');

        if (shouldAddToCurrentView) {
          // Replace the temporary task with the actual one from the server
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task._id === tempId
                ? { ...result.data, subtasks: result.data.subtasks || [] }
                : task
            )
          );
        } else {
          // If the task was created for a different project/view than the current one,
          // we might not need to reload immediately if the source hook handles context changes.
          // However, it could be safer to trigger a reload if the contexts are complex.
          // Consider if loadTasks(projectContext) is needed here based on overall app flow.
          // For now, we assume the main hook handles reloads on projectContext change.
        }
        toast('Task Created', { description: `Task "${result.data.title}" created successfully.` });
        return result.data;
      } catch (err) {
        console.error('Create Task Error:', err);
        toast('Create Task Failed', {
          description: err.message,
          variant: 'destructive',
        });
        // Remove the temporary task on failure
        if (shouldAddToCurrentView) {
          setTasks((prevTasks) =>
            prevTasks.filter((task) => task._id !== tempId)
          );
        }
        throw err; // Re-throw for component-level handling if needed
      }
    },
    [projectContext, setTasks, loadTasks] // Dependencies for addTask
  );

  // Update Task
  const updateTask = useCallback(
    async (taskId, updates) => {
      const originalTasks = [...tasks]; // Capture original state for potential revert
      let originalTask = null;

      // Optimistic update
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task._id === taskId) {
            originalTask = { ...task }; // Store the original task being updated
            return { ...task, ...updates, subtasks: task.subtasks || [] };
          }
          return task;
        })
      );

      try {
        const result = await apiUpdateTask(taskId, updates);
        if (!result.success)
          throw new Error(result.message || 'Failed to update task');
        // Optional: update task with response data if needed (e.g., updatedAt)
        // setTasks(prevTasks => prevTasks.map(t => t._id === taskId ? {...result.data, subtasks: result.data.subtasks || [] } : t));
        toast('Task Updated', { description: `Task "${updates.title || originalTask?.title}" updated.` });
      } catch (err) {
        console.error('Update Task Error:', err);
        toast('Update Failed', {
          description: err.message,
          variant: 'destructive',
        });
        // Revert optimistic update on failure
        setTasks(originalTasks);
        throw err; // Re-throw to allow UI component to handle state (e.g., stop editing)
      }
    },
    [tasks, setTasks] // Dependencies for updateTask
  );

  // Delete Task
  const deleteTask = useCallback(
    async (taskId) => {
      const originalTasks = [...tasks];
      const taskToDelete = originalTasks.find(task => task._id === taskId);

      // Optimistic delete
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));

      try {
        const result = await apiDeleteTask(taskId);
        if (!result.success)
          throw new Error(result.message || 'Failed to delete task');
        toast('Task Deleted', { description: `Task "${taskToDelete?.title}" deleted.` });
        // No need to update state further, removal is done
      } catch (err) {
        console.error('Delete Task Error:', err);
        toast('Delete Failed', {
          description: err.message,
          variant: 'destructive',
        });
        // Revert optimistic update on failure
        setTasks(originalTasks);
        throw err; // Re-throw for UI handling if needed
      }
    },
    [tasks, setTasks] // Dependencies for deleteTask
  );

  // --- Subtask CUD Operations (Optimistic Updates) ---

  // Add Subtask
  const addSubtask = useCallback(
    async (taskId, subtaskData) => {
      const originalTasks = [...tasks];
      const tempSubtaskId = `temp-${Date.now()}`;
      const optimisticSubtask = {
        ...subtaskData,
        _id: tempSubtaskId,
        status: 'pending', // Default status
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      let parentTaskTitle = '';

      // Optimistic update
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task._id === taskId) {
            parentTaskTitle = task.title; // Store parent title for toast message
            return {
              ...task,
              subtasks: [...(task.subtasks || []), optimisticSubtask],
            };
          }
          return task;
        })
      );

      try {
        const result = await apiAddSubtask(taskId, subtaskData);
        if (!result.success || !result.data)
          throw new Error(result.message || 'Failed to add subtask');

        // Replace temporary subtask with actual data from backend
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId
              ? {
                  ...task,
                  subtasks: (task.subtasks || []).map((st) =>
                    st._id === tempSubtaskId ? result.data : st
                  ),
                }
              : task
          )
        );
         toast('Subtask Added', { description: `Subtask "${result.data.title}" added to "${parentTaskTitle}".` });
      } catch (err) {
        console.error('Add Subtask Error:', err);
        toast('Failed to Add Subtask', {
          description: err.message,
          variant: 'destructive',
        });
        setTasks(originalTasks); // Revert
        throw err; // Re-throw for UI handling
      }
    },
    [tasks, setTasks] // Dependencies for addSubtask
  );

  // Update Subtask
  const updateSubtask = useCallback(
    async (taskId, subtaskId, updates) => {
      const originalTasks = [...tasks];
      let subtaskTitle = '';
      let parentTaskTitle = '';

      // Optimistic update
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task._id === taskId) {
            parentTaskTitle = task.title;
            return {
              ...task,
              subtasks: (task.subtasks || []).map((st) => {
                if (st._id === subtaskId) {
                  subtaskTitle = st.title; // Store original title for toast
                  return { ...st, ...updates };
                }
                return st;
              }),
            };
          }
          return task;
        })
      );

      try {
        const result = await apiUpdateSubtask(taskId, subtaskId, updates);
        if (!result.success)
          throw new Error(result.message || 'Failed to update subtask');
        toast('Subtask Updated', { description: `Subtask "${updates.title || subtaskTitle}" in "${parentTaskTitle}" updated.` });
        // Optional: update with response data if needed
      } catch (err) {
        console.error('Update Subtask Error:', err);
        toast('Failed to Update Subtask', {
          description: err.message,
          variant: 'destructive',
        });
        setTasks(originalTasks); // Revert
        throw err; // Re-throw for UI handling
      }
    },
    [tasks, setTasks] // Dependencies for updateSubtask
  );

  // Delete Subtask
  const deleteSubtask = useCallback(
    async (taskId, subtaskId) => {
      const originalTasks = [...tasks];
      let subtaskTitle = '';
      let parentTaskTitle = '';

      // Optimistic update
       setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task._id === taskId) {
             parentTaskTitle = task.title;
             const subtaskToDelete = (task.subtasks || []).find(st => st._id === subtaskId);
             subtaskTitle = subtaskToDelete?.title || '';
            return {
              ...task,
              subtasks: (task.subtasks || []).filter(
                (st) => st._id !== subtaskId
              ),
            };
          }
          return task;
        })
      );

      try {
        const result = await apiDeleteSubtask(taskId, subtaskId);
        if (!result.success)
          throw new Error(result.message || 'Failed to delete subtask');
        toast('Subtask Deleted', { description: `Subtask "${subtaskTitle}" from "${parentTaskTitle}" deleted.` });
        // Removal done
      } catch (err) {
        console.error('Delete Subtask Error:', err);
        toast('Failed to Delete Subtask', {
          description: err.message,
          variant: 'destructive',
        });
        setTasks(originalTasks); // Revert
        throw err; // Re-throw for UI handling
      }
    },
    [tasks, setTasks] // Dependencies for deleteSubtask
  );

  return {
    addTask,
    updateTask,
    deleteTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
  };
};

export default useTaskActions; 