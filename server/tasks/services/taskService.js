const Task = require("../models/Task");
const { NotFoundError } = require("../../utils/errorHandler");
const { ERROR_MESSAGES } = require("../constants");
const { addEventToCalendar } = require("../../calendar/services/calendarService");

exports.findTasks = async (query, sortOptions) => {
  return await Task.find(query).sort(sortOptions);
};

exports.createTask = async (taskData) => {
  const newTask = await Task.create(taskData);

  if (newTask && newTask.user) {
    addEventToCalendar(newTask.user.toString(), newTask.toObject())
      .catch(err => {
        console.error("[TaskService] Background calendar event creation failed:", err.message);
      });
  }

  return newTask;
};

exports.findTaskById = async (taskId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new NotFoundError(ERROR_MESSAGES.TASK_NOT_FOUND);
  }
  return task;
};

exports.updateTaskById = async (taskId, updateData) => {
  const task = await Task.findByIdAndUpdate(taskId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!task) {
    throw new NotFoundError(ERROR_MESSAGES.TASK_UPDATE_FAILED);
  }
  return task;
};

exports.deleteTask = async (task) => {
    await task.deleteOne();
};

exports.addSubtaskToTask = async (task, subtaskData) => {
    task.subtasks.push(subtaskData);
    await task.save();
    // Return the newly added subtask (Mongoose assigns _id)
    return task.subtasks[task.subtasks.length - 1];
};

exports.updateSubtaskInTask = async (task, subtaskId, updateData) => {
    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
        throw new NotFoundError(ERROR_MESSAGES.SUBTASK_NOT_FOUND);
    }
    if (updateData.title !== undefined) subtask.title = updateData.title.trim();
    if (updateData.status !== undefined) subtask.status = updateData.status;

    await task.save();
    return subtask;
};

exports.deleteSubtaskFromTask = async (task, subtaskId) => {
    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
        throw new NotFoundError(ERROR_MESSAGES.SUBTASK_NOT_FOUND);
    }
    await subtask.deleteOne(); // Mongoose v6+ recommended way
    await task.save();
}; 