// src/features/projects/constants/kanbanConstants.js

// Define Kanban column IDs/statuses
export const COLUMN_TODO = 'todo';
export const COLUMN_DOING = 'doing';
export const COLUMN_COMPLETED = 'completed';

// Array of column IDs for easy iteration or validation
export const KANBAN_COLUMN_IDS = [
  COLUMN_TODO,
  COLUMN_DOING,
  COLUMN_COMPLETED,
];

// Optional: Map column IDs to display names if needed elsewhere
export const KANBAN_COLUMN_NAMES = {
  [COLUMN_TODO]: 'To Do',
  [COLUMN_DOING]: 'In Progress',
  [COLUMN_COMPLETED]: 'Completed',
}; 