const Task = require("../models/Task");
const asyncHandler = require("../utils/asyncHandler");
const {
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
} = require("../utils/errorHandler");

// Helper function for authorization check
const checkTaskAuthorization = (task, userId) => {
  if (!task) {
    throw new NotFoundError("Task not found");
  }
  if (task.user.toString() !== userId.toString()) {
    throw new UnauthorizedError("Not authorized to access this task");
  }
};

// @desc    Get all tasks for the logged-in user
// @route   GET /api/tasks
// @access  Private
exports.getTasks = asyncHandler(async (req, res, next) => {
  const query = { user: req.user._id };

  // Search Filter (remains the same)
  if (req.query.search) {
    const searchQuery = req.query.search;
    query.$or = [
      { title: { $regex: searchQuery, $options: "i" } },
      { description: { $regex: searchQuery, $options: "i" } },
      { project: { $regex: searchQuery, $options: "i" } },
    ];
  }

  // Project Filter (remains the same)
  if (req.query.project !== undefined) {
    query.project = req.query.project;
  }

  // Status Filter (Updated)
  if (req.query.status) {
    const validStatuses = ["todo", "doing", "completed"];
    if (validStatuses.includes(req.query.status)) {
      query.status = req.query.status;
    } // else: ignore invalid status query param, or could throw error
  }
  // Note: 'incomplete' is no longer a direct status, handled by default or 'todo'/'doing'

  // Execute Query
  // Determine sort order based on query params
  let sortOptions = {};

  // Default sort order if no sort parameter is provided
  if (!req.query.sort) {
    sortOptions = {
      status: 1,
      priority: -1, // Higher priority (High) first
      dueDate: 1, // Earlier due dates first
      createdAt: -1, // Newest first
    };
  } else {
    // Apply client-requested sort
    switch (req.query.sort) {
      case 'priority':
        sortOptions.priority = -1; // High to Low
        break;
      case 'priorityLow':
        sortOptions.priority = 1; // Low to High
        break;
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      case 'oldest':
        sortOptions.createdAt = 1;
        break;
      case 'dueSoon':
        sortOptions.dueDate = 1; // Earlier first
        break;
      case 'dueLate':
        sortOptions.dueDate = -1; // Later first
        break;
      default:
        // Default to newest if invalid sort option
        sortOptions.createdAt = -1;
    }
    
    // Always add status as secondary sort for consistency
    sortOptions.status = 1;
  }

  const tasks = await Task.find(query).sort(sortOptions);

  // Send Response
  res.status(200).json({ success: true, count: tasks.length, data: tasks });
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = asyncHandler(async (req, res, next) => {
  req.body.user = req.user._id;

  // Set default status if not provided, otherwise use provided status
  // The model now handles the default, so this line is likely redundant,
  // but kept for explicit clarity or if defaults were handled here previously.
  req.body.status = req.body.status || "todo";

  // Filter subtasks (remains the same)
  if (req.body.subtasks && Array.isArray(req.body.subtasks)) {
    req.body.subtasks = req.body.subtasks.filter(
      (st) => st.title && st.title.trim() !== ""
    );
  }

  // Remove isCompleted if sent from frontend
  delete req.body.isCompleted;

  const task = await Task.create(req.body);
  res.status(201).json({ success: true, data: task });
});

// @desc    Get a single task by ID (no change needed for status)
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  checkTaskAuthorization(task, req.user._id);
  res.status(200).json({ success: true, data: task });
});

// @desc    Update a task by ID
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);
  checkTaskAuthorization(task, req.user._id);

  // Remove isCompleted if sent from frontend during update
  if (req.body.hasOwnProperty("isCompleted")) {
    delete req.body.isCompleted;
  }

  // Ensure status is valid if provided
  if (
    req.body.status &&
    !["todo", "doing", "completed"].includes(req.body.status)
  ) {
    throw new BadRequestError(`Invalid status value: ${req.body.status}`);
  }

  // Filter subtasks (remains the same)
  if (req.body.subtasks && Array.isArray(req.body.subtasks)) {
    req.body.subtasks = req.body.subtasks.filter(
      (st) => st.title && st.title.trim() !== ""
    );
  }

  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!task) {
    throw new NotFoundError("Task not found or update failed");
  }

  res.status(200).json({ success: true, data: task });
});

// @desc    Delete a task by ID (no change needed for status)
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  checkTaskAuthorization(task, req.user._id);

  await task.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

// --- Subtask Controllers (no change needed for parent task status) ---

// @desc    Add a subtask to a task
// @route   POST /api/tasks/:taskId/subtasks
// @access  Private
exports.addSubtask = asyncHandler(async (req, res, next) => {
  const { title, status } = req.body;
  if (!title || title.trim() === "") {
    throw new BadRequestError("Subtask title is required.");
  }

  // Validate status, default to 'pending'
  const validStatuses = ["pending", "completed"];
  const subtaskStatus = validStatuses.includes(status) ? status : "pending";

  const task = await Task.findById(req.params.taskId);
  checkTaskAuthorization(task, req.user._id);

  const newSubtask = { title: title.trim(), status: subtaskStatus };
  task.subtasks.push(newSubtask);
  await task.save();
  // Mongoose assigns an _id when pushed, retrieve the last one
  const addedSubtask = task.subtasks[task.subtasks.length - 1];
  res.status(201).json({ success: true, data: addedSubtask });
});

// @desc    Update a subtask
// @route   PUT /api/tasks/:taskId/subtasks/:subtaskId
// @access  Private
exports.updateSubtask = asyncHandler(async (req, res, next) => {
  const { title, status } = req.body;

  // Check if at least one field is provided for update
  if (title === undefined && status === undefined) {
    throw new BadRequestError("No fields provided for update.");
  }
  if (title !== undefined && title.trim() === "") {
    throw new BadRequestError("Subtask title cannot be empty.");
  }

  // Validate status if provided
  if (status !== undefined && !["pending", "completed"].includes(status)) {
    throw new BadRequestError(`Invalid subtask status value: ${status}`);
  }

  const task = await Task.findById(req.params.taskId);
  checkTaskAuthorization(task, req.user._id);

  const subtask = task.subtasks.id(req.params.subtaskId);
  if (!subtask) {
    throw new NotFoundError("Subtask not found");
  }

  if (title !== undefined) subtask.title = title.trim();
  if (status !== undefined) subtask.status = status;

  await task.save();
  res.status(200).json({ success: true, data: subtask });
});

// @desc    Delete a subtask
// @route   DELETE /api/tasks/:taskId/subtasks/:subtaskId
// @access  Private
exports.deleteSubtask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.taskId);
  checkTaskAuthorization(task, req.user._id);

  const subtask = task.subtasks.id(req.params.subtaskId);
  if (!subtask) {
    throw new NotFoundError("Subtask not found");
  }

  await subtask.deleteOne();
  await task.save();
  res.status(200).json({ success: true, data: {} });
});
