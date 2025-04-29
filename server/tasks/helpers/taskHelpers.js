const { NotFoundError, UnauthorizedError } = require("../../utils/errorHandler");
const { VALID_TASK_STATUSES, DEFAULT_TASK_STATUS, ERROR_MESSAGES } = require("../constants");

exports.checkTaskAuthorization = (task, userId) => {
  if (!task) {
    throw new NotFoundError(ERROR_MESSAGES.TASK_NOT_FOUND);
  }
  if (task.user.toString() !== userId.toString()) {
    throw new UnauthorizedError(ERROR_MESSAGES.NOT_AUTHORIZED);
  }
};

exports.buildTaskQuery = (queryParams, userId) => {
  const query = { user: userId };

  if (queryParams.search) {
    const searchQuery = queryParams.search;
    query.$or = [
      { title: { $regex: searchQuery, $options: "i" } },
      { description: { $regex: searchQuery, $options: "i" } },
      { project: { $regex: searchQuery, $options: "i" } },
    ];
  }

  // Handle project filtering first - either through view or direct project parameter
  const projectFilter = queryParams.project || queryParams.view;
  
  if (projectFilter) {
    switch (projectFilter.toLowerCase()) {
      case "today":
        // Get tasks due today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        query.dueDate = { $gte: today, $lt: tomorrow };
        break;
      case "upcoming":
        // Get tasks due in the future
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        query.dueDate = { $gte: startOfToday };
        break;
      case "completed":
        // Get completed tasks
        query.status = "completed";
        break;
      case "inbox":
        // Get tasks without a project or with project="Inbox"
        query.$or = [
          { project: { $exists: false } },
          { project: "" },
          { project: "Inbox" }
        ];
        break;
      case "overdue":
        // Get overdue tasks (due date in the past and not completed)
        const now = new Date();
        query.dueDate = { $lt: now };
        query.status = { $ne: "completed" };
        break;
      case "all":
        // No additional filtering for "all" view
        break;
      default:
        // Any other value is treated as a project name
        query.project = projectFilter;
    }
  }

  if (queryParams.status && VALID_TASK_STATUSES.includes(queryParams.status)) {
      query.status = queryParams.status;
  }

  return query;
};

exports.buildSortOptions = (sortParam) => {
  let sortOptions = {};
  if (!sortParam) {
    sortOptions = {
      status: 1,
      priority: -1,
      dueDate: 1,
      createdAt: -1,
    };
  } else {
    switch (sortParam) {
      case "priority": sortOptions.priority = -1; break;
      case "priorityLow": sortOptions.priority = 1; break;
      case "newest": sortOptions.createdAt = -1; break;
      case "oldest": sortOptions.createdAt = 1; break;
      case "dueSoon": sortOptions.dueDate = 1; break;
      case "dueLate": sortOptions.dueDate = -1; break;
      default: sortOptions.createdAt = -1; break;
    }
    sortOptions.status = 1; // Always secondary sort by status
  }
  return sortOptions;
};

exports.filterSubtasks = (subtasks) => {
    if (!subtasks || !Array.isArray(subtasks)) {
        return [];
    }
    return subtasks.filter(st => st.title && st.title.trim() !== "");
};

exports.prepareTaskData = (body, userId) => {
    const taskData = { ...body, user: userId };

    taskData.status = taskData.status || DEFAULT_TASK_STATUS;

    taskData.subtasks = exports.filterSubtasks(taskData.subtasks);
    delete taskData.isCompleted;

    return taskData;
};

exports.prepareTaskUpdateData = (body) => {
    const updateData = { ...body };

    // Remove isCompleted (now derived from status)
    delete updateData.isCompleted;

    // Filter subtasks
    updateData.subtasks = exports.filterSubtasks(updateData.subtasks);

    return updateData;
}; 