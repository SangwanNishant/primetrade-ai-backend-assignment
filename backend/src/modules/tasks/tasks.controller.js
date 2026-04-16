const tasksService = require('./tasks.service');
const { success, created } = require('../../utils/response');

/**
 * GET /api/v1/tasks
 * Returns all tasks for the user (or all tasks if admin).
 */
async function getTasks(req, res, next) {
  try {
    const tasks = await tasksService.getTasks(req.user.id, req.user.role, req.query);
    return success(res, { tasks, count: tasks.length }, 'Tasks retrieved.');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/tasks/:id
 * Returns a single task by ID.
 */
async function getTaskById(req, res, next) {
  try {
    const task = await tasksService.getTaskById(req.params.id, req.user.id, req.user.role);
    return success(res, { task }, 'Task retrieved.');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/tasks
 * Creates a new task for the authenticated user.
 */
async function createTask(req, res, next) {
  try {
    const task = await tasksService.createTask(req.user.id, req.body);
    return created(res, { task }, 'Task created successfully.');
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/v1/tasks/:id
 * Updates an existing task. Supports partial updates.
 */
async function updateTask(req, res, next) {
  try {
    const task = await tasksService.updateTask(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    return success(res, { task }, 'Task updated.');
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/tasks/:id
 * Deletes a task. Admins can delete any task.
 */
async function deleteTask(req, res, next) {
  try {
    await tasksService.deleteTask(req.params.id, req.user.id, req.user.role);
    return success(res, null, 'Task deleted successfully.');
  } catch (err) {
    next(err);
  }
}

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
