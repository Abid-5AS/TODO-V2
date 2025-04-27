// src/features/tasks/utils/taskUtils.js
// Utility functions specific to tasks.

export const isToday = (dateStr) => {
  if (!dateStr) return false;
  try {
    const today = new Date();
    const d = new Date(dateStr);
    // Compare year, month, and day, ignoring time
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  } catch (error) {
    console.error("Error parsing date for isToday check:", dateStr, error);
    return false;
  }
};

export const isUpcoming = (dateStr) => {
  if (!dateStr) return false;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set today to the beginning of the day
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0); // Set task due date to the beginning of the day
    return d > today;
  } catch (error) {
    console.error("Error parsing date for isUpcoming check:", dateStr, error);
    return false;
  }
};

export const isOverdue = (dateStr) => {
  if (!dateStr) return false;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set today to the beginning of the day
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0); // Set task due date to the beginning of the day

    return d < today;
  } catch (error) {
    console.error("Error parsing date for isOverdue check:", dateStr, error);
    return false;
  }
};
