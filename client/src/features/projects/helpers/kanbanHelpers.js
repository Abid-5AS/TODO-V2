import { COLUMN_TODO, COLUMN_DOING, COLUMN_COMPLETED } from '../constants/kanbanConstants';

/**
 * Helper function to find column ID for a given task ID using the memoized groupedTasks.
 * @param {string} taskId - The ID of the task to find.
 * @param {object} groupedTasks - Object with tasks grouped by column ID (e.g., { todo: [], doing: [], completed: [] }).
 * @returns {string|null} - The column ID ('todo', 'doing', 'completed') or null if not found.
 */
export const findColumnForTask = (taskId, groupedTasks) => {
  if (!groupedTasks || !taskId) return null;

  if (groupedTasks[COLUMN_TODO]?.some((task) => task._id === taskId)) return COLUMN_TODO;
  if (groupedTasks[COLUMN_DOING]?.some((task) => task._id === taskId)) return COLUMN_DOING;
  if (groupedTasks[COLUMN_COMPLETED]?.some((task) => task._id === taskId)) return COLUMN_COMPLETED;
  
  return null;
};

// Add other Kanban-specific helpers here if needed 