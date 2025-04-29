const asyncHandler = require("../../utils/asyncHandler");
const { BadRequestError } = require("../../utils/errorHandler");
const taskService = require("../services/taskService");
const { 
    checkTaskAuthorization,
    buildTaskQuery,
    buildSortOptions,
    prepareTaskData,
    prepareTaskUpdateData
} = require("../helpers/taskHelpers");
const {
    VALID_TASK_STATUSES, 
    VALID_SUBTASK_STATUSES, 
    DEFAULT_SUBTASK_STATUS, 
    ERROR_MESSAGES 
} = require("../constants");

// @desc    Get all tasks for the logged-in user
// @route   GET /api/tasks
// @access  Private
exports.getTasks = asyncHandler(async (req, res, next) => {
  const query = buildTaskQuery(req.query, req.user._id);
  const sortOptions = buildSortOptions(req.query.sort);
  const tasks = await taskService.findTasks(query, sortOptions);
  res.status(200).json({ success: true, count: tasks.length, data: tasks });
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = asyncHandler(async (req, res, next) => {
  const taskData = prepareTaskData(req.body, req.user._id);
  const task = await taskService.createTask(taskData);
  res.status(201).json({ success: true, data: task });
});

// @desc    Get a single task by ID (no change needed for status)
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = asyncHandler(async (req, res, next) => {
  const task = await taskService.findTaskById(req.params.id);
  checkTaskAuthorization(task, req.user._id);
  res.status(200).json({ success: true, data: task });
});

// @desc    Update a task by ID
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = asyncHandler(async (req, res, next) => {
  let task = await taskService.findTaskById(req.params.id);
  checkTaskAuthorization(task, req.user._id);

  const updateData = prepareTaskUpdateData(req.body);

  if (updateData.status && !VALID_TASK_STATUSES.includes(updateData.status)) {
    throw new BadRequestError(ERROR_MESSAGES.INVALID_TASK_STATUS(updateData.status));
  }

  task = await taskService.updateTaskById(req.params.id, updateData);
  res.status(200).json({ success: true, data: task });
});

// @desc    Delete a task by ID (no change needed for status)
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = asyncHandler(async (req, res, next) => {
  const task = await taskService.findTaskById(req.params.id);
  checkTaskAuthorization(task, req.user._id);
  await taskService.deleteTask(task);
  res.status(200).json({ success: true, data: {} });
});

// --- Subtask Controllers (no change needed for parent task status) ---

// @desc    Add a subtask to a task
// @route   POST /api/tasks/:taskId/subtasks
// @access  Private
exports.addSubtask = asyncHandler(async (req, res, next) => {
  const { title, status } = req.body;
  if (!title || title.trim() === "") {
    throw new BadRequestError(ERROR_MESSAGES.SUBTASK_TITLE_REQUIRED);
  }

  const subtaskStatus = VALID_SUBTASK_STATUSES.includes(status) ? status : DEFAULT_SUBTASK_STATUS;

  const task = await taskService.findTaskById(req.params.taskId);
  checkTaskAuthorization(task, req.user._id);

  const newSubtask = { title: title.trim(), status: subtaskStatus };
  const addedSubtask = await taskService.addSubtaskToTask(task, newSubtask);
  res.status(201).json({ success: true, data: addedSubtask });
});

// @desc    Update a subtask
// @route   PUT /api/tasks/:taskId/subtasks/:subtaskId
// @access  Private
exports.updateSubtask = asyncHandler(async (req, res, next) => {
  const { title, status } = req.body;
  const { taskId, subtaskId } = req.params;

  if (title === undefined && status === undefined) {
    throw new BadRequestError(ERROR_MESSAGES.SUBTASK_UPDATE_NO_FIELDS);
  }
  if (title !== undefined && title.trim() === "") {
    throw new BadRequestError(ERROR_MESSAGES.SUBTASK_TITLE_EMPTY);
  }
  if (status !== undefined && !VALID_SUBTASK_STATUSES.includes(status)) {
    throw new BadRequestError(ERROR_MESSAGES.INVALID_SUBTASK_STATUS(status));
  }

  const task = await taskService.findTaskById(taskId);
  checkTaskAuthorization(task, req.user._id);

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (status !== undefined) updateData.status = status;

  const updatedSubtask = await taskService.updateSubtaskInTask(task, subtaskId, updateData);
  res.status(200).json({ success: true, data: updatedSubtask });
});

// @desc    Delete a subtask
// @route   DELETE /api/tasks/:taskId/subtasks/:subtaskId
// @access  Private
exports.deleteSubtask = asyncHandler(async (req, res, next) => {
  const { taskId, subtaskId } = req.params;

  const task = await taskService.findTaskById(taskId);
  checkTaskAuthorization(task, req.user._id);

  await taskService.deleteSubtaskFromTask(task, subtaskId);
  res.status(200).json({ success: true, data: {} });
});
