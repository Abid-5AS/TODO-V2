const VALID_TASK_STATUSES = ["todo", "doing", "completed"];
const DEFAULT_TASK_STATUS = "todo";

const VALID_SUBTASK_STATUSES = ["pending", "completed"];
const DEFAULT_SUBTASK_STATUS = "pending";

const ERROR_MESSAGES = {
  TASK_NOT_FOUND: "Task not found",
  NOT_AUTHORIZED: "Not authorized to access this task",
  INVALID_TASK_STATUS: (status) => `Invalid status value: ${status}`,
  SUBTASK_TITLE_REQUIRED: "Subtask title is required.",
  SUBTASK_TITLE_EMPTY: "Subtask title cannot be empty.",
  INVALID_SUBTASK_STATUS: (status) => `Invalid subtask status value: ${status}`,
  SUBTASK_UPDATE_NO_FIELDS: "No fields provided for update.",
  SUBTASK_NOT_FOUND: "Subtask not found",
  TASK_UPDATE_FAILED: "Task not found or update failed",
};

module.exports = {
  VALID_TASK_STATUSES,
  DEFAULT_TASK_STATUS,
  VALID_SUBTASK_STATUSES,
  DEFAULT_SUBTASK_STATUS,
  ERROR_MESSAGES,
};
